
-- ============================================================
-- PHASE 1: Extend sales_leads with intelligence fields
-- ============================================================

-- Add new columns to sales_leads (only those missing)
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS landing_url text,
  ADD COLUMN IF NOT EXISTS referrer_url text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS company_domain text,
  ADD COLUMN IF NOT EXISTS lead_quality_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_risk_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_quality_label text DEFAULT 'GREEN',
  ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_contacted_by_user_id uuid;

-- ============================================================
-- lead_source_metadata (sensitive, staff-only)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_source_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  ip_address text,
  ip_hash text,
  user_agent text,
  device_type text,
  os text,
  browser text,
  approx_city text,
  approx_region text,
  approx_zip text,
  approx_lat numeric,
  approx_lng numeric,
  timezone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_source_metadata ENABLE ROW LEVEL SECURITY;

-- Only admin and sales can read metadata
CREATE POLICY "Staff can view lead source metadata"
  ON public.lead_source_metadata FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'sales')
  );

CREATE POLICY "Service role can insert lead source metadata"
  ON public.lead_source_metadata FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

-- ============================================================
-- lead_actions (append-only action log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_status text DEFAULT 'SUCCESS',
  performed_by_user_id uuid,
  provider text,
  related_entity_type text,
  related_entity_id uuid,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lead actions"
  ON public.lead_actions FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'sales') OR
    public.has_role(auth.uid(), 'cs')
  );

CREATE POLICY "Staff can insert lead actions"
  ON public.lead_actions FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'sales') OR
    public.has_role(auth.uid(), 'cs')
  );

CREATE INDEX idx_lead_actions_lead_id ON public.lead_actions(lead_id);
CREATE INDEX idx_lead_actions_type ON public.lead_actions(action_type);

-- ============================================================
-- lead_sla_rules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_sla_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  customer_type text,
  source_channel text,
  response_minutes integer NOT NULL DEFAULT 15,
  escalation_minutes integer NOT NULL DEFAULT 60,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_sla_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view SLA rules"
  ON public.lead_sla_rules FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'sales') OR
    public.has_role(auth.uid(), 'cs')
  );

CREATE POLICY "Admins can manage SLA rules"
  ON public.lead_sla_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- lead_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'MED',
  assigned_team text,
  message text,
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lead alerts"
  ON public.lead_alerts FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'sales') OR
    public.has_role(auth.uid(), 'cs')
  );

CREATE POLICY "Staff can manage lead alerts"
  ON public.lead_alerts FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'sales')
  );

CREATE INDEX idx_lead_alerts_lead_id ON public.lead_alerts(lead_id);
CREATE INDEX idx_lead_alerts_unresolved ON public.lead_alerts(is_resolved) WHERE is_resolved = false;

-- ============================================================
-- Trigger: auto-update last_activity_at on lead_actions insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_lead_activity_on_action()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sales_leads
  SET last_activity_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.lead_id;

  -- If this is an outbound action, update contacted fields
  IF NEW.action_type IN ('CALL_OUT', 'SMS_OUT', 'EMAIL_OUT') THEN
    UPDATE public.sales_leads
    SET last_contacted_at = NEW.created_at,
        last_contacted_by_user_id = NEW.performed_by_user_id,
        first_response_at = COALESCE(first_response_at, NEW.created_at)
    WHERE id = NEW.lead_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_lead_action_update_activity
  AFTER INSERT ON public.lead_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_activity_on_action();

-- ============================================================
-- Insert default SLA rules
-- ============================================================
INSERT INTO public.lead_sla_rules (rule_name, customer_type, source_channel, response_minutes, escalation_minutes)
VALUES
  ('Default SLA', NULL, NULL, 15, 60),
  ('Contractor Priority', 'contractor', NULL, 10, 30),
  ('Google Ads SLA', NULL, 'GOOGLE_ADS', 5, 15),
  ('Website SLA', NULL, 'WEBSITE', 15, 60);

-- Enable realtime for lead_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_alerts;
