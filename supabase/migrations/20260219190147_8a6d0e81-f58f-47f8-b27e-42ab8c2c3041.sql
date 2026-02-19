
-- =============================================
-- SLA + OWNERSHIP AUTOPILOT - Database Schema
-- =============================================

-- 1) Add SLA columns to sales_leads (only ones that don't exist yet)
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS owner_user_id UUID,
  ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escalation_level INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_sla_breached BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Create lead_activity_log table
CREATE TABLE IF NOT EXISTS public.lead_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  user_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_sales_leads_sla_due_at ON public.sales_leads(sla_due_at);
CREATE INDEX IF NOT EXISTS idx_sales_leads_owner_user_id ON public.sales_leads(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_lead_status ON public.sales_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_sales_leads_escalation ON public.sales_leads(escalation_level) WHERE escalation_level > 0;
CREATE INDEX IF NOT EXISTS idx_lead_activity_log_lead_id ON public.lead_activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activity_log_action_type ON public.lead_activity_log(action_type);

-- 4) Enable RLS on lead_activity_log
ALTER TABLE public.lead_activity_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read activity logs
CREATE POLICY "Authenticated users can read lead activity logs"
  ON public.lead_activity_log FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert activity logs
CREATE POLICY "Authenticated users can insert lead activity logs"
  ON public.lead_activity_log FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access on lead_activity_log"
  ON public.lead_activity_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5) Backfill: Set sla_due_at for existing NEW leads that don't have one
UPDATE public.sales_leads
SET sla_due_at = created_at + (sla_minutes || ' minutes')::interval
WHERE sla_due_at IS NULL AND lead_status = 'new';

-- 6) Backfill: Copy assigned_to to owner_user_id where available
UPDATE public.sales_leads
SET owner_user_id = assigned_to::uuid
WHERE assigned_to IS NOT NULL AND owner_user_id IS NULL;

-- 7) Trigger: Auto-set first_contact_at when lead status changes to contacted
CREATE OR REPLACE FUNCTION public.set_first_contact_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_status IN ('contacted', 'qualified', 'quoted', 'converted')
     AND OLD.lead_status = 'new'
     AND NEW.first_contact_at IS NULL THEN
    NEW.first_contact_at = now();
    NEW.last_activity_at = now();
  END IF;
  -- Stop SLA monitoring on terminal statuses
  IF NEW.lead_status IN ('converted', 'lost') THEN
    NEW.is_sla_breached = COALESCE(NEW.is_sla_breached, FALSE);
    NEW.escalation_level = COALESCE(NEW.escalation_level, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_set_first_contact ON public.sales_leads;
CREATE TRIGGER trg_set_first_contact
  BEFORE UPDATE ON public.sales_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_first_contact_on_status_change();

-- 8) Trigger: Auto-set sla_due_at on new lead insert
CREATE OR REPLACE FUNCTION public.set_sla_due_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sla_due_at IS NULL THEN
    NEW.sla_due_at = NEW.created_at + (COALESCE(NEW.sla_minutes, 15) || ' minutes')::interval;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_set_sla_due_on_insert ON public.sales_leads;
CREATE TRIGGER trg_set_sla_due_on_insert
  BEFORE INSERT ON public.sales_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_sla_due_on_insert();

-- 9) Enable realtime for lead_activity_log
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_activity_log;
