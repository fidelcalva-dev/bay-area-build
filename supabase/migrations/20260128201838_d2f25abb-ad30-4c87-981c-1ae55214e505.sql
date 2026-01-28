-- =====================================================
-- GHL MESSAGING BRIDGE - CONFIG & ENHANCEMENTS
-- =====================================================

-- Add GHL messaging config settings
INSERT INTO public.config_settings (category, key, value, description, is_locked)
VALUES 
  ('messaging', 'ghl.messaging_mode', '"DRY_RUN"', 'GHL messaging mode: DRY_RUN (log only) or LIVE (actually send)', false),
  ('messaging', 'ghl.sms_enabled', 'true', 'Enable SMS sending via GHL', false),
  ('messaging', 'ghl.email_enabled', 'true', 'Enable Email sending via GHL', false),
  ('messaging', 'ghl.default_sender', '"Calsan Dumpsters Pro"', 'Default sender name for messages', false),
  ('messaging', 'ghl.rate_limit_per_phone_per_day', '6', 'Max SMS per phone number per day', false)
ON CONFLICT (category, key) DO NOTHING;

-- Add provider column to message_queue if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_queue' AND column_name = 'provider') THEN
    ALTER TABLE public.message_queue ADD COLUMN provider TEXT DEFAULT 'GHL';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_queue' AND column_name = 'max_attempts') THEN
    ALTER TABLE public.message_queue ADD COLUMN max_attempts INTEGER DEFAULT 5;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_queue' AND column_name = 'last_attempt_at') THEN
    ALTER TABLE public.message_queue ADD COLUMN last_attempt_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_queue' AND column_name = 'provider_message_id') THEN
    ALTER TABLE public.message_queue ADD COLUMN provider_message_id TEXT;
  END IF;
END $$;

-- Add sms_opt_out to customers for compliance
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'sms_opt_out') THEN
    ALTER TABLE public.customers ADD COLUMN sms_opt_out BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'sms_opt_out_at') THEN
    ALTER TABLE public.customers ADD COLUMN sms_opt_out_at TIMESTAMPTZ;
  END IF;
END $$;

-- Seed GHL message templates (lowercase channel values)
INSERT INTO public.message_templates (key, channel, name, subject, body, variables, category, is_active, language)
VALUES
  -- SMS Templates
  ('QUOTE_LINK_SMS', 'sms', 'Quote Link', NULL, 
   'Hi {first_name}! Your dumpster rental quote is ready: {quote_link} - Total: ${quote_total}. Reply STOP to opt out. - Calsan Dumpsters Pro {support_phone}',
   '["first_name", "quote_link", "quote_total", "support_phone"]'::jsonb, 'sales', true, 'en'),
  
  ('SCHEDULE_CONFIRM_SMS', 'sms', 'Schedule Confirmation', NULL,
   'Hi {first_name}! Your {size}yd dumpster delivery is confirmed for {scheduled_date} ({scheduled_window}). Questions? Call {support_phone}. Reply STOP to opt out.',
   '["first_name", "size", "scheduled_date", "scheduled_window", "support_phone"]'::jsonb, 'operations', true, 'en'),
  
  ('DELIVERY_COMPLETE_SMS', 'sms', 'Delivery Complete', NULL,
   'Hi {first_name}! Your dumpster has been delivered to {city}. Call {support_phone} when ready for pickup. Reply STOP to opt out.',
   '["first_name", "city", "support_phone"]'::jsonb, 'operations', true, 'en'),
  
  ('PICKUP_REMINDER_SMS', 'sms', 'Pickup Reminder', NULL,
   'Hi {first_name}! Your scheduled pickup is tomorrow ({scheduled_date}). Please ensure the dumpster is accessible. Questions? {support_phone}. Reply STOP to opt out.',
   '["first_name", "scheduled_date", "support_phone"]'::jsonb, 'operations', true, 'en'),
  
  ('PAYMENT_REQUEST_SMS', 'sms', 'Payment Request', NULL,
   'Hi {first_name}! Balance due for order #{order_id}: ${balance_due}. Pay now: {payment_link}. Questions? {support_phone}. Reply STOP to opt out.',
   '["first_name", "order_id", "balance_due", "payment_link", "support_phone"]'::jsonb, 'billing', true, 'en'),
  
  ('OVERDUE_NOTICE_SMS', 'sms', 'Overdue Notice', NULL,
   'Hi {first_name}, your invoice #{invoice_number} is past due. Balance: ${balance_due}. Please pay ASAP to avoid late fees. Call {support_phone}. Reply STOP to opt out.',
   '["first_name", "invoice_number", "balance_due", "support_phone"]'::jsonb, 'billing', true, 'en'),
  
  ('REVIEW_REQUEST_SMS', 'sms', 'Review Request', NULL,
   'Hi {first_name}! Thank you for choosing Calsan Dumpsters Pro! We''d love a review: {review_link}. Reply STOP to opt out.',
   '["first_name", "review_link"]'::jsonb, 'marketing', true, 'en'),

  -- Email Templates
  ('QUOTE_LINK_EMAIL', 'email', 'Quote Ready', 'Your Dumpster Rental Quote is Ready - Calsan Dumpsters Pro',
   E'Hi {first_name},\n\nThank you for requesting a quote from Calsan Dumpsters Pro!\n\nYour Quote Details:\n- Size: {size}yd Dumpster\n- Delivery Address: {address}, {city} {zip}\n- Total: ${quote_total}\n\nView and accept your quote here: {quote_link}\n\nThis quote is valid for 7 days. Questions? Call us at {support_phone}.\n\nBest regards,\nCalsan Dumpsters Pro Team',
   '["first_name", "size", "address", "city", "zip", "quote_total", "quote_link", "support_phone"]'::jsonb, 'sales', true, 'en'),
  
  ('SCHEDULE_CONFIRM_EMAIL', 'email', 'Delivery Scheduled', 'Your Dumpster Delivery is Confirmed - Calsan Dumpsters Pro',
   E'Hi {first_name},\n\nGreat news! Your dumpster delivery has been scheduled.\n\nDelivery Details:\n- Size: {size}yd Dumpster\n- Date: {scheduled_date}\n- Window: {scheduled_window}\n- Address: {address}, {city} {zip}\n\nPlease ensure the delivery area is clear and accessible.\n\nQuestions? Call {support_phone}.\n\nBest regards,\nCalsan Dumpsters Pro Team',
   '["first_name", "size", "scheduled_date", "scheduled_window", "address", "city", "zip", "support_phone"]'::jsonb, 'operations', true, 'en'),
  
  ('PAYMENT_CONFIRM_EMAIL', 'email', 'Payment Received', 'Payment Confirmation - Calsan Dumpsters Pro',
   E'Hi {first_name},\n\nThank you! We''ve received your payment.\n\nPayment Details:\n- Amount: ${amount_paid}\n- Order: #{order_id}\n- Date: {payment_date}\n\nYour remaining balance: ${balance_due}\n\nQuestions? Call {support_phone}.\n\nBest regards,\nCalsan Dumpsters Pro Team',
   '["first_name", "amount_paid", "order_id", "payment_date", "balance_due", "support_phone"]'::jsonb, 'billing', true, 'en'),
  
  ('OVERDUE_NOTICE_EMAIL', 'email', 'Invoice Past Due', 'Action Required: Invoice #{invoice_number} Past Due - Calsan Dumpsters Pro',
   E'Hi {first_name},\n\nThis is a reminder that invoice #{invoice_number} is past due.\n\nInvoice Details:\n- Invoice Number: {invoice_number}\n- Original Amount: ${invoice_total}\n- Balance Due: ${balance_due}\n- Days Overdue: {days_overdue}\n\nPlease pay immediately to avoid additional late fees.\n\nPay Now: {payment_link}\n\nQuestions? Call {support_phone}.\n\nBest regards,\nCalsan Dumpsters Pro Billing Team',
   '["first_name", "invoice_number", "invoice_total", "balance_due", "days_overdue", "payment_link", "support_phone"]'::jsonb, 'billing', true, 'en')
  
ON CONFLICT (key) DO UPDATE SET
  body = EXCLUDED.body,
  variables = EXCLUDED.variables,
  updated_at = now();

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_message_queue_rate_limit 
ON public.message_queue (to_address, created_at) 
WHERE channel = 'sms';

-- Create index for pending messages worker
CREATE INDEX IF NOT EXISTS idx_message_queue_pending 
ON public.message_queue (status, scheduled_for) 
WHERE status IN ('PENDING', 'RETRYING');

-- Function to check SMS rate limit
CREATE OR REPLACE FUNCTION public.check_sms_rate_limit(p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 6;
BEGIN
  SELECT COALESCE((value::text)::integer, 6) INTO v_limit
  FROM config_settings 
  WHERE key = 'ghl.rate_limit_per_phone_per_day';
  
  SELECT COUNT(*) INTO v_count
  FROM message_queue
  WHERE to_address = p_phone
    AND channel = 'sms'
    AND created_at > now() - INTERVAL '24 hours'
    AND status IN ('SENT', 'PENDING', 'RETRYING');
  
  RETURN v_count < v_limit;
END;
$$;

-- Function to enqueue message
CREATE OR REPLACE FUNCTION public.enqueue_ghl_message(
  p_channel TEXT,
  p_to_address TEXT,
  p_template_key TEXT,
  p_variables JSONB DEFAULT '{}'::jsonb,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_contact_id UUID DEFAULT NULL,
  p_scheduled_for TIMESTAMPTZ DEFAULT now()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_queue_id UUID;
  v_template RECORD;
  v_rendered_body TEXT;
  v_rendered_subject TEXT;
  v_mode TEXT;
  v_opt_out BOOLEAN := FALSE;
  var_key TEXT;
BEGIN
  SELECT COALESCE(REPLACE(value::text, '"', ''), 'DRY_RUN') INTO v_mode
  FROM config_settings WHERE key = 'ghl.messaging_mode';
  
  IF p_channel = 'sms' AND p_contact_id IS NOT NULL THEN
    SELECT sms_opt_out INTO v_opt_out FROM customers WHERE id = p_contact_id;
    IF v_opt_out THEN
      RAISE EXCEPTION 'Contact has opted out of SMS';
    END IF;
  END IF;
  
  IF p_channel = 'sms' THEN
    IF NOT check_sms_rate_limit(p_to_address) THEN
      RAISE EXCEPTION 'SMS rate limit exceeded for this number';
    END IF;
  END IF;
  
  SELECT * INTO v_template FROM message_templates WHERE key = p_template_key AND is_active = true;
  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_key;
  END IF;
  
  v_rendered_body := v_template.body;
  v_rendered_subject := v_template.subject;
  
  FOR var_key IN SELECT jsonb_object_keys(p_variables) LOOP
    v_rendered_body := REPLACE(v_rendered_body, '{' || var_key || '}', COALESCE(p_variables->>var_key, ''));
    IF v_rendered_subject IS NOT NULL THEN
      v_rendered_subject := REPLACE(v_rendered_subject, '{' || var_key || '}', COALESCE(p_variables->>var_key, ''));
    END IF;
  END LOOP;
  
  INSERT INTO message_queue (
    channel, to_address, template_key, subject, body,
    contact_id, entity_type, entity_id,
    provider, mode, status, scheduled_for, created_by, payload
  ) VALUES (
    p_channel, p_to_address, p_template_key, v_rendered_subject, v_rendered_body,
    p_contact_id, p_entity_type, p_entity_id,
    'GHL', v_mode, 'PENDING', p_scheduled_for, auth.uid(),
    jsonb_build_object('variables', p_variables, 'template', p_template_key)
  )
  RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$;

-- RLS for message_queue (staff access)
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view message queue" ON public.message_queue;
CREATE POLICY "Staff can view message queue"
ON public.message_queue FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'executive']::app_role[]));

DROP POLICY IF EXISTS "Staff can insert to message queue" ON public.message_queue;
CREATE POLICY "Staff can insert to message queue"
ON public.message_queue FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'executive']::app_role[]));

DROP POLICY IF EXISTS "Staff can update message queue" ON public.message_queue;
CREATE POLICY "Staff can update message queue"
ON public.message_queue FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'executive']::app_role[]));