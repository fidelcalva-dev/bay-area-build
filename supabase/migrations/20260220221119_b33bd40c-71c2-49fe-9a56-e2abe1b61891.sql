-- Push notification device tokens
CREATE TABLE public.push_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_token text NOT NULL,
  enabled boolean DEFAULT true,
  app_version text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_token)
);

ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;

-- Users can manage their own devices
CREATE POLICY "Users manage own push devices"
  ON public.push_devices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin/dispatch can read all for sending notifications
CREATE POLICY "Admin can read all push devices"
  ON public.push_devices
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'dispatcher')
  );

CREATE INDEX idx_push_devices_user ON public.push_devices(user_id);
CREATE INDEX idx_push_devices_token ON public.push_devices(device_token);

-- Timestamp trigger
CREATE TRIGGER update_push_devices_updated_at
  BEFORE UPDATE ON public.push_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();