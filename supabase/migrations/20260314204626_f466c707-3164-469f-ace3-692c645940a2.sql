
CREATE TABLE public.city_display_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_slug TEXT NOT NULL UNIQUE,
  city_name TEXT NOT NULL,
  primary_zip TEXT NOT NULL,
  fallback_zip TEXT,
  assigned_market_id TEXT,
  preferred_yard_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.city_display_pricing ENABLE ROW LEVEL SECURITY;

-- Public read access (needed for city pages)
CREATE POLICY "Anyone can read city display pricing"
  ON public.city_display_pricing
  FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Admins can manage city display pricing"
  ON public.city_display_pricing
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_city_display_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER city_display_pricing_updated_at
  BEFORE UPDATE ON public.city_display_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_city_display_pricing_updated_at();
