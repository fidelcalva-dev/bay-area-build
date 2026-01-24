
-- PHASE 1: Config settings for overdue billing
INSERT INTO config_settings (category, key, value, description, is_locked)
VALUES 
  ('overdue', 'daily_rate_default', '35', 'Default daily rate for overdue rentals', false),
  ('overdue', 'warning_days_over_included', '1', 'Days past included to start warnings', false),
  ('overdue', 'task_escalation_days', '3', 'Days overdue before creating dispatch task', false),
  ('overdue', 'auto_bill_max_amount', '250', 'Max amount for auto-billing (higher requires approval)', false),
  ('messaging', 'mode', '"DRY_RUN"', 'Messaging mode: DRY_RUN or LIVE', false)
ON CONFLICT (category, key) DO UPDATE SET value = EXCLUDED.value;

-- PHASE 3: Overdue billing state tracking table
CREATE TABLE IF NOT EXISTS public.overdue_billing_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES assets_dumpsters(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  billed_overdue_days_total INTEGER NOT NULL DEFAULT 0,
  last_billed_at TIMESTAMPTZ,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(asset_id, order_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_overdue_billing_state_updated_at
  BEFORE UPDATE ON overdue_billing_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on overdue_billing_state
ALTER TABLE overdue_billing_state ENABLE ROW LEVEL SECURITY;

-- Admin read/write policy
CREATE POLICY "Admin can manage overdue billing state"
  ON overdue_billing_state
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'finance_admin', 'ops_admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'finance_admin', 'ops_admin']::app_role[]));

-- Service role bypass
CREATE POLICY "Service role bypass overdue billing state"
  ON overdue_billing_state
  FOR ALL
  USING (auth.role() = 'service_role');

-- PHASE 2: Overdue assets view with billing info
CREATE OR REPLACE VIEW public.overdue_assets_billing_vw AS
SELECT 
  ad.id as asset_id,
  ad.asset_code,
  ad.days_out,
  ad.asset_status,
  ad.deployed_at,
  ad.overdue_notified,
  o.id as order_id,
  o.status as order_status,
  o.included_days,
  GREATEST(ad.days_out - o.included_days, 0) as overdue_days,
  o.customer_id,
  c.company_name as customer_name,
  COALESCE(c.billing_phone, c.phone) as customer_phone,
  c.billing_email as customer_email,
  COALESCE(obs.billed_overdue_days_total, 0) as billed_overdue_days_total,
  obs.last_billed_at,
  obs.last_notified_at,
  GREATEST(ad.days_out - o.included_days - COALESCE(obs.billed_overdue_days_total, 0), 0) as billable_days,
  i.id as invoice_id,
  i.invoice_number
FROM assets_dumpsters ad
JOIN orders o ON ad.current_order_id = o.id
JOIN customers c ON o.customer_id = c.id
LEFT JOIN overdue_billing_state obs ON obs.asset_id = ad.id AND obs.order_id = o.id
LEFT JOIN invoices i ON i.order_id = o.id
WHERE ad.asset_status = 'deployed'
  AND ad.days_out > o.included_days;

-- Add messaging_mode column to message_history if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'message_history' AND column_name = 'mode'
  ) THEN
    ALTER TABLE message_history ADD COLUMN mode TEXT DEFAULT 'LIVE';
  END IF;
END $$;

-- Add overdue-related template keys to sms_templates
INSERT INTO sms_templates (template_key, template_name, template_body, variables, category, is_active)
VALUES 
  ('OVERDUE_NOTICE_1', 'Overdue Rental Notice', 
   'Hi {{customer_name}}, your dumpster rental has exceeded the included rental period. As of today it is {{overdue_days}} day(s) overdue. The additional rental charge for {{billable_days}} day(s) is ${{amount}}. Please reply to schedule pickup or to extend the rental. Thank you - Calsan Dumpsters', 
   ARRAY['customer_name', 'overdue_days', 'billable_days', 'amount'], 
   'billing', true),
  ('OVERDUE_NOTICE_ESCALATION', 'Overdue Escalation Notice',
   'Hi {{customer_name}}, your dumpster has been on-site for {{days_out}} days ({{overdue_days}} days past the included period). Total overdue charges are now ${{total_amount}}. We need to schedule pickup immediately. Please reply or call us. Thank you - Calsan Dumpsters',
   ARRAY['customer_name', 'days_out', 'overdue_days', 'total_amount'],
   'billing', true),
  ('PICKUP_REQUEST_OVERDUE', 'Pickup Request for Overdue',
   'Hi {{customer_name}}, we are scheduling pickup of your dumpster for {{pickup_date}}. Final charges including {{overdue_days}} overdue days: ${{total_amount}}. Reply to confirm or reschedule. - Calsan Dumpsters',
   ARRAY['customer_name', 'pickup_date', 'overdue_days', 'total_amount'],
   'billing', true)
ON CONFLICT (template_key) DO NOTHING;

-- Add index for faster overdue queries
CREATE INDEX IF NOT EXISTS idx_assets_deployed_overdue 
  ON assets_dumpsters(asset_status, days_out) 
  WHERE asset_status = 'deployed';

CREATE INDEX IF NOT EXISTS idx_overdue_billing_state_asset_order 
  ON overdue_billing_state(asset_id, order_id);
