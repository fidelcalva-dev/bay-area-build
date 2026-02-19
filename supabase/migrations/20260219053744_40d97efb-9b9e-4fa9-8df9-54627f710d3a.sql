
-- ============================================================
-- ENTITY LIFECYCLE STAGE HISTORY
-- Tracks every stage transition across Lead → Quote → Order → Job → Billing
-- ============================================================

-- Lifecycle entity types
DO $$ BEGIN
  CREATE TYPE public.lifecycle_entity_type AS ENUM (
    'LEAD', 'QUOTE', 'ORDER', 'JOB', 'INVOICE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Department ownership
DO $$ BEGIN
  CREATE TYPE public.lifecycle_department AS ENUM (
    'SALES', 'BILLING', 'LOGISTICS', 'DISPATCH', 'CS', 'ADMIN'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Transition trigger source
DO $$ BEGIN
  CREATE TYPE public.lifecycle_trigger AS ENUM (
    'MANUAL', 'SYSTEM', 'AUTOMATION', 'WEBHOOK', 'CRON'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.entity_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What entity
  entity_type public.lifecycle_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Cross-references for the full lifecycle chain
  lead_id UUID,
  quote_id UUID,
  order_id UUID,
  customer_id UUID,
  
  -- Stage info
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  department public.lifecycle_department NOT NULL,
  
  -- Ownership
  assigned_user_id UUID,
  assigned_user_email TEXT,
  
  -- Transition metadata
  trigger_type public.lifecycle_trigger NOT NULL DEFAULT 'MANUAL',
  triggered_by_user_id UUID,
  notes TEXT,
  details_json JSONB DEFAULT '{}',
  
  -- SLA tracking
  sla_deadline_at TIMESTAMPTZ,
  is_sla_breached BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE WHEN exited_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (exited_at - entered_at)) / 60 
      ELSE NULL 
    END
  ) STORED,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_esh_entity ON public.entity_stage_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_esh_lead ON public.entity_stage_history(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_esh_order ON public.entity_stage_history(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_esh_customer ON public.entity_stage_history(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_esh_sla_breach ON public.entity_stage_history(is_sla_breached) WHERE is_sla_breached = true;
CREATE INDEX IF NOT EXISTS idx_esh_active ON public.entity_stage_history(entity_type, entity_id) WHERE exited_at IS NULL;

-- RLS
ALTER TABLE public.entity_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stage history"
  ON public.entity_stage_history FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert stage history"
  ON public.entity_stage_history FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update stage history"
  ON public.entity_stage_history FOR UPDATE
  TO authenticated USING (true);

-- SLA config table for defining expected durations per stage
CREATE TABLE IF NOT EXISTS public.lifecycle_sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type public.lifecycle_entity_type NOT NULL,
  stage TEXT NOT NULL,
  department public.lifecycle_department NOT NULL,
  max_duration_minutes INTEGER NOT NULL,
  warning_at_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, stage)
);

ALTER TABLE public.lifecycle_sla_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view SLA config"
  ON public.lifecycle_sla_config FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can manage SLA config"
  ON public.lifecycle_sla_config FOR ALL
  TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to close previous stage and open new one
CREATE OR REPLACE FUNCTION public.transition_entity_stage(
  p_entity_type public.lifecycle_entity_type,
  p_entity_id UUID,
  p_to_stage TEXT,
  p_department public.lifecycle_department,
  p_trigger public.lifecycle_trigger DEFAULT 'MANUAL',
  p_assigned_user_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_lead_id UUID DEFAULT NULL,
  p_quote_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_customer_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_id UUID;
  v_from_stage TEXT;
  v_sla_minutes INTEGER;
  v_sla_deadline TIMESTAMPTZ;
BEGIN
  -- Close the current active stage
  UPDATE entity_stage_history 
  SET exited_at = now()
  WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id 
    AND exited_at IS NULL
  RETURNING to_stage INTO v_from_stage;
  
  -- Look up SLA config
  SELECT max_duration_minutes INTO v_sla_minutes
  FROM lifecycle_sla_config
  WHERE entity_type = p_entity_type
    AND stage = p_to_stage
    AND is_active = true;
  
  IF v_sla_minutes IS NOT NULL THEN
    v_sla_deadline := now() + (v_sla_minutes || ' minutes')::interval;
  END IF;
  
  -- Insert the new stage
  INSERT INTO entity_stage_history (
    entity_type, entity_id, from_stage, to_stage, department,
    assigned_user_id, trigger_type, triggered_by_user_id, notes,
    lead_id, quote_id, order_id, customer_id,
    sla_deadline_at, entered_at
  ) VALUES (
    p_entity_type, p_entity_id, v_from_stage, p_to_stage, p_department,
    p_assigned_user_id, p_trigger, auth.uid(), p_notes,
    p_lead_id, p_quote_id, p_order_id, p_customer_id,
    v_sla_deadline, now()
  )
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;

-- Insert default SLA configs
INSERT INTO public.lifecycle_sla_config (entity_type, stage, department, max_duration_minutes, warning_at_minutes) VALUES
  ('LEAD', 'new', 'SALES', 30, 15),
  ('LEAD', 'contacted', 'SALES', 1440, 720),
  ('LEAD', 'qualified', 'SALES', 2880, 1440),
  ('LEAD', 'quoted', 'SALES', 4320, 2880),
  ('QUOTE', 'draft', 'SALES', 60, 30),
  ('QUOTE', 'sent', 'SALES', 4320, 2880),
  ('QUOTE', 'accepted', 'SALES', 120, 60),
  ('ORDER', 'pending', 'LOGISTICS', 60, 30),
  ('ORDER', 'scheduled', 'DISPATCH', 1440, 720),
  ('ORDER', 'in_progress', 'LOGISTICS', 480, 240),
  ('ORDER', 'delivered', 'LOGISTICS', 20160, 14400),
  ('JOB', 'assigned', 'DISPATCH', 120, 60),
  ('JOB', 'en_route', 'DISPATCH', 120, 90),
  ('JOB', 'completed', 'DISPATCH', 60, 30),
  ('INVOICE', 'draft', 'BILLING', 1440, 720),
  ('INVOICE', 'sent', 'BILLING', 4320, 2880),
  ('INVOICE', 'overdue', 'BILLING', 10080, 7200)
ON CONFLICT (entity_type, stage) DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.entity_stage_history;
