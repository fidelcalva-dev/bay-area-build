
-- SEO Internal Linking: Location Registry
CREATE TABLE public.seo_locations_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  priority INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  anchor_variants TEXT[] NOT NULL DEFAULT '{}',
  page_exists BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_locations_registry ENABLE ROW LEVEL SECURITY;

-- Public read access (SEO components need this on frontend)
CREATE POLICY "Anyone can read active locations"
  ON public.seo_locations_registry
  FOR SELECT
  USING (true);

-- Only authenticated users can modify
CREATE POLICY "Authenticated users can manage locations"
  ON public.seo_locations_registry
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seed data with anchor variants
INSERT INTO public.seo_locations_registry (city_name, slug, priority, is_active, anchor_variants, page_exists) VALUES
  ('Oakland', 'oakland-ca', 10, true, 
   ARRAY['Dumpster Rental Oakland', 'Oakland Roll Off Dumpster', 'Dumpster Service in Oakland', 'Oakland CA Dumpster Rental'], true),
  ('San Jose', 'san-jose-ca', 10, true,
   ARRAY['Dumpster Rental San Jose', 'San Jose Roll Off Dumpster', 'Dumpster Service in San Jose', 'San Jose CA Dumpster Rental'], true),
  ('San Francisco', 'san-francisco-ca', 15, true,
   ARRAY['Dumpster Rental San Francisco', 'San Francisco Roll Off Dumpster', 'Dumpster Service in SF', 'SF Dumpster Rental'], false),
  ('Berkeley', 'berkeley-ca', 30, true,
   ARRAY['Dumpster Rental Berkeley', 'Berkeley Roll Off Dumpster', 'Dumpster Service in Berkeley', 'Berkeley CA Dumpster Rental'], true),
  ('Fremont', 'fremont-ca', 30, true,
   ARRAY['Dumpster Rental Fremont', 'Fremont Roll Off Dumpster', 'Dumpster Service in Fremont', 'Fremont CA Dumpster Rental'], true),
  ('Hayward', 'hayward-ca', 35, true,
   ARRAY['Dumpster Rental Hayward', 'Hayward Roll Off Dumpster', 'Dumpster Service in Hayward', 'Hayward CA Dumpster Rental'], true),
  ('Milpitas', 'milpitas-ca', 35, true,
   ARRAY['Dumpster Rental Milpitas', 'Milpitas Roll Off Dumpster', 'Dumpster Service in Milpitas', 'Milpitas CA Dumpster Rental'], false);

-- Index for fast lookups
CREATE INDEX idx_seo_locations_active ON public.seo_locations_registry (is_active, priority);
