-- Add local_intro and permit_info for 5 cities missing them
UPDATE public.seo_cities SET 
  local_intro = 'Cupertino''s family-oriented neighborhoods and tech industry presence drive steady demand for dumpster rentals. From Apple Park area renovations to Rancho Rinconada home remodels, we deliver reliable roll-off service throughout Cupertino from our San Jose yard.',
  permit_info = 'Dumpsters placed on private property in Cupertino typically do not require a permit. Street placement requires an encroachment permit from the City of Cupertino Public Works Department. HOA communities may have additional placement guidelines.',
  pricing_note = 'Enter your Cupertino ZIP code for exact pricing. Prices vary by size, material type, and delivery location within the city.'
WHERE city_slug = 'cupertino' AND is_active = true;

UPDATE public.seo_cities SET 
  local_intro = 'Daly City''s dense residential neighborhoods and hillside terrain make it one of the most active Peninsula markets for dumpster service. We navigate Westlake, Serramonte, and Broadmoor with expertise, dispatched from our Oakland yard via I-280.',
  permit_info = 'Daly City requires an encroachment permit for dumpsters placed on public streets. Private property placement (driveways) typically does not require a permit. Contact Daly City Public Works for permit applications.',
  pricing_note = 'Enter your Daly City ZIP code for exact pricing. Prices vary by size, material type, and delivery location.'
WHERE city_slug = 'daly-city' AND is_active = true;

UPDATE public.seo_cities SET 
  local_intro = 'As the gateway to Napa Valley wine country, the city of Napa sees demand from winery construction, downtown renovations, and residential remodels. We provide reliable dumpster service for all project types throughout the Napa area.',
  permit_info = 'Street placement of dumpsters in Napa requires a permit from the City of Napa Public Works. Private property placement is generally permitted without additional approvals. Wine country properties may have specific access considerations.',
  pricing_note = 'Enter your Napa ZIP code for exact pricing. North Bay pricing reflects our partner network service model.'
WHERE city_slug = 'napa' AND is_active = true;

UPDATE public.seo_cities SET 
  local_intro = 'Petaluma''s historic downtown, surrounding farmland, and growing residential areas create diverse dumpster needs. From downtown renovation to agricultural cleanup, we deliver professional roll-off service throughout the Petaluma area.',
  permit_info = 'Petaluma requires permits for dumpsters placed on public streets. Apply through the City of Petaluma Public Works Department. Historic downtown placements may have additional timing restrictions.',
  pricing_note = 'Enter your Petaluma ZIP code for exact pricing. North Bay pricing reflects our partner network service model.'
WHERE city_slug = 'petaluma' AND is_active = true;

UPDATE public.seo_cities SET 
  local_intro = 'San Rafael, as Marin County''s largest city and county seat, generates steady demand for dumpster rentals. We serve commercial downtown projects, Canal district renovations, and hillside residential remodels from our East Bay operations.',
  permit_info = 'San Rafael requires an encroachment permit from the Department of Public Works for dumpsters on city streets. Private property placement on driveways does not typically require a permit. The Canal district may have specific access considerations.',
  pricing_note = 'Enter your San Rafael ZIP code for exact pricing. Marin County pricing reflects our partner network service model.'
WHERE city_slug = 'san-rafael' AND is_active = true;

-- Add 7 missing city_display_pricing entries
INSERT INTO public.city_display_pricing (city_slug, city_name, primary_zip, is_active, notes)
VALUES
  ('daly-city', 'Daly City', '94014', true, 'Peninsula - dispatched from Oakland yard'),
  ('south-san-francisco', 'South San Francisco', '94080', true, 'Peninsula - dispatched from Oakland yard'),
  ('san-rafael', 'San Rafael', '94901', true, 'North Bay - partner network'),
  ('santa-rosa', 'Santa Rosa', '95401', true, 'North Bay - partner network'),
  ('petaluma', 'Petaluma', '94952', true, 'North Bay - partner network'),
  ('napa', 'Napa', '94559', true, 'North Bay - partner network'),
  ('vallejo', 'Vallejo', '94590', true, 'North Bay - partner network')
ON CONFLICT (city_slug) DO UPDATE SET
  is_active = true,
  primary_zip = EXCLUDED.primary_zip,
  notes = EXCLUDED.notes;