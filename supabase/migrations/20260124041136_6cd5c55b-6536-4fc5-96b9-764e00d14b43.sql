-- =====================================================
-- DISPOSAL FACILITY SELECTION MODES MIGRATION
-- Adds driver_facility_preferences, disposal_requests tables
-- Updates order_disposal_plans with mode fields
-- =====================================================

-- 1) Add new columns to order_disposal_plans
ALTER TABLE public.order_disposal_plans 
  ADD COLUMN IF NOT EXISTS facility_selection_mode TEXT DEFAULT 'auto' 
    CHECK (facility_selection_mode IN ('auto', 'customer_requested', 'driver_preferred', 'dispatch_override')),
  ADD COLUMN IF NOT EXISTS requested_by TEXT DEFAULT 'system' 
    CHECK (requested_by IN ('customer', 'driver', 'dispatch', 'system')),
  ADD COLUMN IF NOT EXISTS request_reason TEXT,
  ADD COLUMN IF NOT EXISTS dump_fee_at_cost BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS handling_fee_possible BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS market TEXT;

-- 2) Create driver_facility_preferences table
CREATE TABLE IF NOT EXISTS public.driver_facility_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  market TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 1 CHECK (rank BETWEEN 1 AND 5),
  is_default BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, facility_id)
);

-- 3) Create disposal_requests table
CREATE TABLE IF NOT EXISTS public.disposal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL CHECK (requested_by IN ('customer', 'driver')),
  requested_facility_id UUID REFERENCES public.facilities(id),
  requested_facility_name_text TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'denied')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Enable RLS on new tables
ALTER TABLE public.driver_facility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disposal_requests ENABLE ROW LEVEL SECURITY;

-- 5) RLS policies for driver_facility_preferences
CREATE POLICY "Staff can view driver preferences"
  ON public.driver_facility_preferences
  FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'dispatcher']::app_role[]));

CREATE POLICY "Drivers can view own preferences"
  ON public.driver_facility_preferences
  FOR SELECT
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can manage own preferences"
  ON public.driver_facility_preferences
  FOR ALL
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage driver preferences"
  ON public.driver_facility_preferences
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin']::app_role[]));

-- 6) RLS policies for disposal_requests
CREATE POLICY "Staff can view disposal requests"
  ON public.disposal_requests
  FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'dispatcher']::app_role[]));

CREATE POLICY "Staff can manage disposal requests"
  ON public.disposal_requests
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'dispatcher']::app_role[]));

CREATE POLICY "Customers can view own disposal requests"
  ON public.disposal_requests
  FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- 7) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_facility_prefs_driver 
  ON public.driver_facility_preferences(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_facility_prefs_market 
  ON public.driver_facility_preferences(market);
CREATE INDEX IF NOT EXISTS idx_disposal_requests_order 
  ON public.disposal_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_disposal_requests_status 
  ON public.disposal_requests(status);
CREATE INDEX IF NOT EXISTS idx_order_disposal_plans_mode 
  ON public.order_disposal_plans(facility_selection_mode);

-- 8) Add updated_at triggers
CREATE TRIGGER update_driver_facility_preferences_updated_at
  BEFORE UPDATE ON public.driver_facility_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Add market column to facilities if not exists
ALTER TABLE public.facilities 
  ADD COLUMN IF NOT EXISTS market TEXT;