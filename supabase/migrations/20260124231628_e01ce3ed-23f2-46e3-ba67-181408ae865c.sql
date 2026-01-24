-- =====================================================
-- RUNS DISPATCH SYSTEM - Phase 1: Data Model
-- =====================================================

-- Create run_type enum
CREATE TYPE public.run_type AS ENUM ('DELIVERY', 'PICKUP', 'HAUL', 'SWAP');

-- Create run_status enum
CREATE TYPE public.run_status AS ENUM ('DRAFT', 'SCHEDULED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'COMPLETED', 'CANCELLED');

-- Create location_type enum
CREATE TYPE public.location_type AS ENUM ('yard', 'customer', 'facility');

-- Create assignment_type enum
CREATE TYPE public.assignment_type AS ENUM ('IN_HOUSE', 'CARRIER');

-- Create checkpoint_type enum
CREATE TYPE public.checkpoint_type AS ENUM ('PICKUP_POD', 'DELIVERY_POD', 'DUMP_TICKET');

-- =====================================================
-- RUNS TABLE - Core work unit for dispatch
-- =====================================================
CREATE TABLE public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Run classification
  run_type public.run_type NOT NULL,
  run_number TEXT GENERATED ALWAYS AS ('RUN-' || SUBSTRING(id::TEXT, 1, 8)) STORED,
  
  -- Linked entities
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets_dumpsters(id) ON DELETE SET NULL,
  
  -- Origin location
  origin_type public.location_type NOT NULL DEFAULT 'yard',
  origin_yard_id UUID REFERENCES public.yards(id) ON DELETE SET NULL,
  origin_facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  origin_address TEXT,
  origin_lat NUMERIC,
  origin_lng NUMERIC,
  
  -- Destination location
  destination_type public.location_type NOT NULL DEFAULT 'customer',
  destination_yard_id UUID REFERENCES public.yards(id) ON DELETE SET NULL,
  destination_facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  destination_address TEXT,
  destination_lat NUMERIC,
  destination_lng NUMERIC,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_window TEXT, -- 'morning', 'midday', 'afternoon'
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  estimated_duration_mins INTEGER DEFAULT 60,
  
  -- Assignment
  assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  assigned_truck_id UUID REFERENCES public.trucks(id) ON DELETE SET NULL,
  assignment_type public.assignment_type NOT NULL DEFAULT 'IN_HOUSE',
  
  -- Status tracking
  status public.run_status NOT NULL DEFAULT 'DRAFT',
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  
  -- Execution timestamps
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Customer info (denormalized for quick access)
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Notes and metadata
  notes TEXT,
  dispatcher_notes TEXT,
  driver_notes TEXT,
  cancellation_reason TEXT,
  
  -- Payout tracking (prep for Phase 4: Payouts)
  estimated_miles NUMERIC,
  actual_miles NUMERIC,
  base_payout NUMERIC DEFAULT 0,
  mileage_payout NUMERIC DEFAULT 0,
  bonus_payout NUMERIC DEFAULT 0,
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'calculated', 'approved', 'paid')),
  
  -- Audit
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- RUN CHECKPOINTS TABLE - POD enforcement
-- =====================================================
CREATE TABLE public.run_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  
  checkpoint_type public.checkpoint_type NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  
  -- Completion tracking
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Evidence
  photo_urls JSONB DEFAULT '[]'::jsonb,
  document_urls JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(run_id, checkpoint_type)
);

-- =====================================================
-- RUN EVENTS TABLE - Audit trail for status changes
-- =====================================================
CREATE TABLE public.run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT,
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_runs_scheduled_date ON public.runs(scheduled_date);
CREATE INDEX idx_runs_status ON public.runs(status);
CREATE INDEX idx_runs_assigned_driver ON public.runs(assigned_driver_id);
CREATE INDEX idx_runs_order_id ON public.runs(order_id);
CREATE INDEX idx_runs_asset_id ON public.runs(asset_id);
CREATE INDEX idx_runs_scheduled_window ON public.runs(scheduled_date, scheduled_window);
CREATE INDEX idx_run_checkpoints_run_id ON public.run_checkpoints(run_id);
CREATE INDEX idx_run_events_run_id ON public.run_events(run_id);

-- =====================================================
-- TRIGGERS - Auto-update updated_at
-- =====================================================
CREATE TRIGGER update_runs_updated_at
  BEFORE UPDATE ON public.runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_run_checkpoints_updated_at
  BEFORE UPDATE ON public.run_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.run_events ENABLE ROW LEVEL SECURITY;

-- Runs policies
CREATE POLICY "Staff can manage runs"
  ON public.runs FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'ops_admin'::app_role, 'dispatcher'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'ops_admin'::app_role, 'dispatcher'::app_role]));

CREATE POLICY "Drivers can view assigned runs"
  ON public.runs FOR SELECT
  USING (
    assigned_driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
    OR has_any_role(auth.uid(), ARRAY['driver'::app_role, 'owner_operator'::app_role])
  );

CREATE POLICY "Drivers can update assigned runs"
  ON public.runs FOR UPDATE
  USING (
    assigned_driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

-- Run checkpoints policies
CREATE POLICY "Staff can manage run checkpoints"
  ON public.run_checkpoints FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'ops_admin'::app_role, 'dispatcher'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'ops_admin'::app_role, 'dispatcher'::app_role]));

CREATE POLICY "Drivers can view run checkpoints"
  ON public.run_checkpoints FOR SELECT
  USING (
    run_id IN (
      SELECT id FROM public.runs WHERE assigned_driver_id IN (
        SELECT id FROM public.drivers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Drivers can update run checkpoints"
  ON public.run_checkpoints FOR UPDATE
  USING (
    run_id IN (
      SELECT id FROM public.runs WHERE assigned_driver_id IN (
        SELECT id FROM public.drivers WHERE user_id = auth.uid()
      )
    )
  );

-- Run events policies
CREATE POLICY "Staff can view run events"
  ON public.run_events FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'ops_admin'::app_role, 'dispatcher'::app_role, 'driver'::app_role, 'owner_operator'::app_role]));

CREATE POLICY "Staff and drivers can create run events"
  ON public.run_events FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'ops_admin'::app_role, 'dispatcher'::app_role, 'driver'::app_role, 'owner_operator'::app_role]));