
-- ============================================================
-- FULL LIFECYCLE PIPELINE: Lead → Quote → Contract → Verification → 
-- Payment → Scheduled → Delivered → Pickup → Dump Ticket → Final Bill → Closed
-- ============================================================

-- 1) lifecycle_stages: canonical stage definitions
CREATE TABLE IF NOT EXISTS public.lifecycle_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_key TEXT UNIQUE NOT NULL,
  stage_name TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('SALES','BILLING','LOGISTICS','DRIVER','ADMIN','VERIFICATION')),
  stage_order INT NOT NULL,
  auto_trigger BOOLEAN DEFAULT false,
  sla_minutes INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lifecycle_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lifecycle_stages"
  ON public.lifecycle_stages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage lifecycle_stages"
  ON public.lifecycle_stages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) lifecycle_entities: current stage per entity
CREATE TABLE IF NOT EXISTS public.lifecycle_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('LEAD','QUOTE','ORDER')),
  entity_id UUID NOT NULL,
  current_stage_key TEXT NOT NULL REFERENCES public.lifecycle_stages(stage_key),
  current_department TEXT NOT NULL,
  owner_user_id UUID,
  entered_stage_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

ALTER TABLE public.lifecycle_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lifecycle_entities"
  ON public.lifecycle_entities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lifecycle_entities"
  ON public.lifecycle_entities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update lifecycle_entities"
  ON public.lifecycle_entities FOR UPDATE TO authenticated USING (true);

-- 3) lifecycle_events: append-only audit trail
CREATE TABLE IF NOT EXISTS public.lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('LEAD','QUOTE','ORDER')),
  entity_id UUID NOT NULL,
  stage_key TEXT NOT NULL,
  department TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('ENTER_STAGE','EXIT_STAGE','NOTE','AUTO_TRIGGER','MANUAL_MOVE','SLA_BREACH')),
  performed_by_user_id UUID,
  performed_by_role TEXT,
  notes TEXT,
  meta_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lifecycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lifecycle_events"
  ON public.lifecycle_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lifecycle_events"
  ON public.lifecycle_events FOR INSERT TO authenticated WITH CHECK (true);

-- 4) lifecycle_alerts: SLA breaches and stuck detection
CREATE TABLE IF NOT EXISTS public.lifecycle_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  stage_key TEXT NOT NULL,
  department TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('SLA_BREACH','STUCK','MISSING_DOC','PAYMENT_BLOCK')),
  severity TEXT NOT NULL DEFAULT 'MED' CHECK (severity IN ('LOW','MED','HIGH')),
  assigned_to_user_id UUID,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lifecycle_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lifecycle_alerts"
  ON public.lifecycle_alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert lifecycle_alerts"
  ON public.lifecycle_alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update lifecycle_alerts"
  ON public.lifecycle_alerts FOR UPDATE TO authenticated USING (true);

-- 5) Indexes for performance
CREATE INDEX idx_lifecycle_entities_type_id ON public.lifecycle_entities(entity_type, entity_id);
CREATE INDEX idx_lifecycle_entities_stage ON public.lifecycle_entities(current_stage_key);
CREATE INDEX idx_lifecycle_entities_dept ON public.lifecycle_entities(current_department);
CREATE INDEX idx_lifecycle_events_entity ON public.lifecycle_events(entity_type, entity_id);
CREATE INDEX idx_lifecycle_events_stage ON public.lifecycle_events(stage_key);
CREATE INDEX idx_lifecycle_events_created ON public.lifecycle_events(created_at DESC);
CREATE INDEX idx_lifecycle_alerts_unresolved ON public.lifecycle_alerts(is_resolved, department) WHERE NOT is_resolved;
CREATE INDEX idx_lifecycle_alerts_entity ON public.lifecycle_alerts(entity_type, entity_id);

-- 6) DB function to advance stage (atomic transition)
CREATE OR REPLACE FUNCTION public.lifecycle_advance_stage(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_to_stage_key TEXT,
  p_performed_by_user_id UUID DEFAULT NULL,
  p_performed_by_role TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_event_type TEXT DEFAULT 'MANUAL_MOVE',
  p_meta JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current RECORD;
  v_stage RECORD;
  v_event_id UUID;
BEGIN
  -- Validate target stage
  SELECT * INTO v_stage FROM public.lifecycle_stages WHERE stage_key = p_to_stage_key AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive stage: %', p_to_stage_key;
  END IF;

  -- Get current entity record
  SELECT * INTO v_current FROM public.lifecycle_entities 
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id;

  IF FOUND THEN
    -- Log EXIT event for previous stage
    INSERT INTO public.lifecycle_events (entity_type, entity_id, stage_key, department, event_type, performed_by_user_id, performed_by_role, notes, meta_json)
    VALUES (p_entity_type, p_entity_id, v_current.current_stage_key, v_current.current_department, 'EXIT_STAGE', p_performed_by_user_id, p_performed_by_role, p_notes, p_meta);

    -- Update entity to new stage
    UPDATE public.lifecycle_entities
    SET current_stage_key = p_to_stage_key,
        current_department = v_stage.department,
        entered_stage_at = now(),
        updated_at = now()
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
  ELSE
    -- Create new entity record
    INSERT INTO public.lifecycle_entities (entity_type, entity_id, current_stage_key, current_department)
    VALUES (p_entity_type, p_entity_id, p_to_stage_key, v_stage.department);
  END IF;

  -- Log ENTER event for new stage
  INSERT INTO public.lifecycle_events (entity_type, entity_id, stage_key, department, event_type, performed_by_user_id, performed_by_role, notes, meta_json)
  VALUES (p_entity_type, p_entity_id, p_to_stage_key, v_stage.department, 
          CASE WHEN p_event_type = 'AUTO_TRIGGER' THEN 'AUTO_TRIGGER' ELSE 'ENTER_STAGE' END,
          p_performed_by_user_id, p_performed_by_role, p_notes, p_meta)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- 7) Seed all lifecycle stages
INSERT INTO public.lifecycle_stages (stage_key, stage_name, department, stage_order, auto_trigger, sla_minutes) VALUES
  -- SALES
  ('LEAD_NEW', 'New Lead', 'SALES', 10, true, 15),
  ('LEAD_CONTACTED', 'Lead Contacted', 'SALES', 20, true, 60),
  ('QUALIFIED', 'Qualified', 'SALES', 30, false, 240),
  ('QUOTE_SENT', 'Quote Sent', 'SALES', 40, true, 1440),
  ('FOLLOW_UP_PENDING', 'Follow-Up Pending', 'SALES', 50, false, 1440),
  ('QUOTE_ACCEPTED', 'Quote Accepted', 'SALES', 60, true, 720),
  ('CONTRACT_SENT', 'Contract Sent', 'SALES', 70, true, 720),
  ('CONTRACT_SIGNED', 'Contract Signed', 'SALES', 80, true, 1440),
  -- VERIFICATION
  ('ID_VERIFICATION_PENDING', 'ID Verification Pending', 'VERIFICATION', 90, true, 720),
  ('ID_VERIFIED', 'ID Verified', 'VERIFICATION', 100, true, NULL),
  ('FRAUD_REVIEW', 'Fraud Review', 'VERIFICATION', 110, false, 720),
  ('CUSTOMER_APPROVED', 'Customer Approved', 'VERIFICATION', 120, true, NULL),
  -- BILLING
  ('PAYMENT_METHOD_COLLECTED', 'Payment Method Collected', 'BILLING', 130, true, 720),
  ('DEPOSIT_REQUESTED', 'Deposit Requested', 'BILLING', 140, true, 360),
  ('DEPOSIT_PAID', 'Deposit Paid', 'BILLING', 150, true, NULL),
  ('PAYMENT_RECEIVED', 'Payment Received', 'BILLING', 160, true, NULL),
  ('PAYMENT_FAILED', 'Payment Failed', 'BILLING', 170, false, 120),
  ('PAYMENT_OVERDUE', 'Payment Overdue', 'BILLING', 180, false, 720),
  ('FINAL_PAYMENT_REQUIRED', 'Final Payment Required', 'BILLING', 190, false, 360),
  ('FINAL_PAYMENT_COLLECTED', 'Final Payment Collected', 'BILLING', 200, true, NULL),
  -- LOGISTICS
  ('JOB_CONFIRMED', 'Job Confirmed', 'LOGISTICS', 210, true, 360),
  ('SCHEDULED', 'Scheduled', 'LOGISTICS', 220, true, 720),
  ('DELIVERY_EN_ROUTE', 'Delivery En Route', 'LOGISTICS', 230, true, NULL),
  ('DELIVERED', 'Delivered', 'LOGISTICS', 240, true, NULL),
  ('IN_USE', 'In Use', 'LOGISTICS', 250, false, NULL),
  ('SWAP_REQUESTED', 'Swap Requested', 'LOGISTICS', 260, false, 720),
  ('SWAP_SCHEDULED', 'Swap Scheduled', 'LOGISTICS', 270, false, 720),
  ('SWAP_COMPLETED', 'Swap Completed', 'LOGISTICS', 280, true, NULL),
  ('PICKUP_SCHEDULED', 'Pickup Scheduled', 'LOGISTICS', 290, true, 1440),
  ('PICKUP_REMINDER_SENT', 'Pickup Reminder Sent', 'LOGISTICS', 300, true, NULL),
  ('PICKUP_EN_ROUTE', 'Pickup En Route', 'LOGISTICS', 310, true, NULL),
  ('PICKED_UP', 'Picked Up', 'LOGISTICS', 320, true, NULL),
  -- DRIVER / DUMP / DISPOSAL
  ('AT_DISPOSAL_SITE', 'At Disposal Site', 'DRIVER', 330, true, 240),
  ('DUMP_TICKET_UPLOADED', 'Dump Ticket Uploaded', 'DRIVER', 340, true, 360),
  ('DUMP_WEIGHT_VERIFIED', 'Dump Weight Verified', 'ADMIN', 350, false, 720),
  ('FINAL_BILL_CALCULATED', 'Final Bill Calculated', 'BILLING', 360, true, 720),
  -- CLOSING
  ('JOB_COMPLETED', 'Job Completed', 'ADMIN', 370, true, NULL),
  ('REVIEW_REQUEST_SENT', 'Review Request Sent', 'SALES', 380, true, 1440),
  ('REVIEW_RECEIVED', 'Review Received', 'SALES', 390, true, NULL)
ON CONFLICT (stage_key) DO NOTHING;

-- 8) Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.lifecycle_entities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lifecycle_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lifecycle_alerts;
