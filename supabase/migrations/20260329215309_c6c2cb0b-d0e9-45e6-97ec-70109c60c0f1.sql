
-- Add priority and loss_reason columns to sales_leads
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS lead_priority TEXT DEFAULT 'normal';
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS loss_reason TEXT;

-- Add follow-up tasks table
CREATE TABLE IF NOT EXISTS public.lead_follow_up_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL DEFAULT 'follow_up',
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE public.lead_follow_up_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage follow-up tasks"
  ON public.lead_follow_up_tasks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_lead_follow_up_tasks_lead ON public.lead_follow_up_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_follow_up_tasks_due ON public.lead_follow_up_tasks(due_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sales_leads_priority ON public.sales_leads(lead_priority) WHERE lead_priority IN ('hot', 'high');

-- Trigger: auto-boost priority on same_day, contractor, high-value city
CREATE OR REPLACE FUNCTION public.trg_auto_boost_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- Same-day flag
  IF NEW.same_day = true THEN
    NEW.lead_priority := 'hot';
  END IF;
  -- Contractor / commercial / property manager
  IF NEW.lead_type IN ('contractor', 'commercial', 'property_manager') AND (NEW.lead_priority IS NULL OR NEW.lead_priority = 'normal') THEN
    NEW.lead_priority := 'high';
  END IF;
  IF NEW.customer_type_detected IN ('contractor', 'commercial') AND (NEW.lead_priority IS NULL OR NEW.lead_priority = 'normal') THEN
    NEW.lead_priority := 'high';
  END IF;
  -- High-value cities
  IF LOWER(COALESCE(NEW.city, '')) IN ('oakland', 'san jose', 'san francisco', 'berkeley', 'fremont', 'walnut creek', 'san mateo', 'palo alto', 'redwood city') AND (NEW.lead_priority IS NULL OR NEW.lead_priority = 'normal') THEN
    NEW.lead_priority := 'high';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_priority_boost ON public.sales_leads;
CREATE TRIGGER trg_lead_priority_boost
  BEFORE INSERT OR UPDATE ON public.sales_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_auto_boost_priority();

-- Trigger: require loss_reason when moving to lost
CREATE OR REPLACE FUNCTION public.trg_require_loss_reason()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_status = 'lost' AND (NEW.loss_reason IS NULL OR TRIM(NEW.loss_reason) = '') THEN
    -- Set a default rather than blocking (UI will prompt for details)
    NEW.loss_reason := COALESCE(NEW.loss_reason, 'not_specified');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_loss_reason ON public.sales_leads;
CREATE TRIGGER trg_lead_loss_reason
  BEFORE UPDATE ON public.sales_leads
  FOR EACH ROW
  WHEN (NEW.lead_status = 'lost' AND OLD.lead_status IS DISTINCT FROM 'lost')
  EXECUTE FUNCTION public.trg_require_loss_reason();
