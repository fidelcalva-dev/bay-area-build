
-- ============================================================
-- LOGISTICS CONTROL TOWER — New tables + RLS
-- ============================================================

-- 1) driver_locations — real-time driver GPS pings
CREATE TABLE public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  truck_id UUID NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  heading NUMERIC NULL,
  speed_mph NUMERIC NULL,
  accuracy_m NUMERIC NULL,
  source TEXT NOT NULL DEFAULT 'MOBILE_GPS' CHECK (source IN ('MOBILE_GPS','MANUAL','TWILIO','OTHER')),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_driver_locations_driver ON public.driver_locations(driver_id, recorded_at DESC);
CREATE INDEX idx_driver_locations_recent ON public.driver_locations(recorded_at DESC);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Staff can view all
CREATE POLICY "Staff can view driver locations"
  ON public.driver_locations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher'));

-- Drivers can view own
CREATE POLICY "Drivers can view own location"
  ON public.driver_locations FOR SELECT
  TO authenticated
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Drivers can insert own
CREATE POLICY "Drivers can insert own location"
  ON public.driver_locations FOR INSERT
  TO authenticated
  WITH CHECK (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- 2) run_routes — stored route geometry per run leg
CREATE TABLE public.run_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  route_type TEXT NOT NULL CHECK (route_type IN ('YARD_TO_SITE','SITE_TO_FACILITY','FACILITY_TO_YARD','FULL_CYCLE')),
  polyline TEXT NULL,
  geojson JSONB NULL,
  distance_miles NUMERIC NULL,
  duration_minutes NUMERIC NULL,
  duration_traffic_minutes NUMERIC NULL,
  origin_lat NUMERIC,
  origin_lng NUMERIC,
  dest_lat NUMERIC,
  dest_lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_run_routes_run ON public.run_routes(run_id);

ALTER TABLE public.run_routes ENABLE ROW LEVEL SECURITY;

-- Staff can view all routes
CREATE POLICY "Staff can view run routes"
  ON public.run_routes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher'));

-- Drivers can view routes for their runs
CREATE POLICY "Drivers can view own run routes"
  ON public.run_routes FOR SELECT
  TO authenticated
  USING (run_id IN (SELECT id FROM public.runs WHERE assigned_driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())));

-- Staff can insert/update routes
CREATE POLICY "Staff can manage run routes"
  ON public.run_routes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher'));

-- 3) run_route_points — optional breadcrumb trail
CREATE TABLE public.run_route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_run_route_points_run ON public.run_route_points(run_id, recorded_at);

ALTER TABLE public.run_route_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view route points"
  ON public.run_route_points FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher'));

CREATE POLICY "Drivers can insert own route points"
  ON public.run_route_points FOR INSERT
  TO authenticated
  WITH CHECK (run_id IN (SELECT id FROM public.runs WHERE assigned_driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())));
