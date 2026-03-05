
-- Update seo_locations_registry to use canonical slugs (no -ca suffix)
UPDATE public.seo_locations_registry SET slug = 'oakland', page_exists = true WHERE slug = 'oakland-ca';
UPDATE public.seo_locations_registry SET slug = 'berkeley', page_exists = true WHERE slug = 'berkeley-ca';
UPDATE public.seo_locations_registry SET slug = 'hayward', page_exists = true WHERE slug = 'hayward-ca';
UPDATE public.seo_locations_registry SET slug = 'fremont', page_exists = true WHERE slug = 'fremont-ca';
UPDATE public.seo_locations_registry SET slug = 'milpitas', page_exists = true WHERE slug = 'milpitas-ca';
UPDATE public.seo_locations_registry SET slug = 'san-francisco', page_exists = true WHERE slug = 'san-francisco-ca';
UPDATE public.seo_locations_registry SET slug = 'san-jose', page_exists = true WHERE slug = 'san-jose-ca';

-- Add missing entries for walnut-creek and concord
INSERT INTO public.seo_locations_registry (slug, city_name, page_exists, anchor_variants)
VALUES 
  ('walnut-creek', 'Walnut Creek', true, '{"Walnut Creek Dumpster Rental","Dumpsters in Walnut Creek","Walnut Creek Roll-Off"}'),
  ('concord', 'Concord', true, '{"Concord Dumpster Rental","Dumpsters in Concord","Concord Roll-Off"}')
ON CONFLICT (slug) DO NOTHING;
