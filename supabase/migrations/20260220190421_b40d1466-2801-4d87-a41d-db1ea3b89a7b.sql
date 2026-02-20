
-- =====================================================
-- FLEET CAMERA + GPS INTEGRATION (complete)
-- =====================================================

-- Camera providers table
CREATE TABLE public.camera_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  api_base_url text,
  webhook_secret text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.camera_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/dispatch can manage camera providers" ON public.camera_providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher'));

-- Camera events table
CREATE TABLE public.camera_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.runs(id),
  truck_id uuid REFERENCES public.trucks(id) NOT NULL,
  driver_id uuid REFERENCES public.drivers(id),
  provider_id uuid REFERENCES public.camera_providers(id),
  event_type text NOT NULL DEFAULT 'UNKNOWN',
  gps_lat double precision,
  gps_lng double precision,
  speed_mph double precision,
  heading double precision,
  video_url text,
  thumbnail_url text,
  severity text DEFAULT 'INFO',
  metadata jsonb DEFAULT '{}',
  event_timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.camera_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see own camera events" ON public.camera_events FOR SELECT TO authenticated
  USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));
CREATE POLICY "Staff see all camera events" ON public.camera_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher') OR public.has_role(auth.uid(), 'ops_admin'));
CREATE POLICY "Service can insert camera events" ON public.camera_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anon insert camera events" ON public.camera_events FOR INSERT TO anon WITH CHECK (true);

-- Camera clips table
CREATE TABLE public.camera_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.camera_events(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  duration_seconds integer,
  file_size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.camera_clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see own clips" ON public.camera_clips FOR SELECT TO authenticated
  USING (event_id IN (SELECT id FROM public.camera_events WHERE driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid())));
CREATE POLICY "Staff see all clips" ON public.camera_clips FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'dispatcher') OR public.has_role(auth.uid(), 'ops_admin'));
CREATE POLICY "Insert clips" ON public.camera_clips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anon insert clips" ON public.camera_clips FOR INSERT TO anon WITH CHECK (true);

-- Camera safety alert config table
CREATE TABLE public.camera_alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'HIGH',
  notify_dispatch boolean NOT NULL DEFAULT true,
  notify_safety boolean NOT NULL DEFAULT true,
  auto_create_issue boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.camera_alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage alert rules" ON public.camera_alert_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff read alert rules" ON public.camera_alert_rules FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'dispatcher') OR public.has_role(auth.uid(), 'ops_admin'));

-- Seed default safety alert rules
INSERT INTO public.camera_alert_rules (event_type, severity, notify_dispatch, notify_safety, auto_create_issue) VALUES
  ('COLLISION', 'CRITICAL', true, true, true),
  ('HARSH_BRAKE', 'HIGH', true, true, false),
  ('HARSH_ACCEL', 'MEDIUM', true, false, false),
  ('LANE_DEPARTURE', 'MEDIUM', true, false, false),
  ('DISTRACTED_DRIVING', 'HIGH', true, true, false),
  ('SPEEDING', 'MEDIUM', true, false, false),
  ('ROLLING_STOP', 'LOW', false, false, false),
  ('TAILGATING', 'MEDIUM', true, false, false);

-- Indexes
CREATE INDEX idx_camera_events_truck ON public.camera_events(truck_id, event_timestamp DESC);
CREATE INDEX idx_camera_events_run ON public.camera_events(run_id) WHERE run_id IS NOT NULL;
CREATE INDEX idx_camera_events_driver ON public.camera_events(driver_id) WHERE driver_id IS NOT NULL;
CREATE INDEX idx_camera_events_type ON public.camera_events(event_type);

-- Storage bucket for camera videos (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('camera-videos', 'camera-videos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Staff view camera videos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'camera-videos' AND (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher') OR 
    public.has_role(auth.uid(), 'ops_admin')
  ));

CREATE POLICY "Upload camera videos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'camera-videos');
