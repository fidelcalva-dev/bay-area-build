
-- camera_devices: maps physical camera hardware to trucks
CREATE TABLE public.camera_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.camera_providers(id),
  truck_id uuid REFERENCES public.trucks(id) NOT NULL,
  device_serial text NOT NULL,
  device_model text,
  mount_position text DEFAULT 'FRONT',
  firmware_version text,
  is_active boolean DEFAULT true,
  last_heartbeat_at timestamptz,
  installed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(device_serial)
);

ALTER TABLE public.camera_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff see camera devices" ON public.camera_devices
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'dispatcher') OR
    public.has_role(auth.uid(), 'ops_admin')
  );

CREATE POLICY "Admin manages camera devices" ON public.camera_devices
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'ops_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'ops_admin')
  );

-- Add device_id reference to camera_events
ALTER TABLE public.camera_events ADD COLUMN IF NOT EXISTS device_id uuid REFERENCES public.camera_devices(id);

-- Index for fast lookups
CREATE INDEX idx_camera_devices_truck ON public.camera_devices(truck_id) WHERE is_active = true;
CREATE INDEX idx_camera_events_device ON public.camera_events(device_id);
CREATE INDEX idx_camera_events_timestamp ON public.camera_events(event_timestamp DESC);
