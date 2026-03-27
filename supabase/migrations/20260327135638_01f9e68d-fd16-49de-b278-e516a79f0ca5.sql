
-- Deactivate all out-of-area cities
UPDATE seo_cities SET is_active = false 
WHERE city_slug IN ('anaheim', 'bakersfield', 'fresno', 'los-angeles', 'long-beach', 'modesto', 'riverside', 'sacramento', 'san-bernardino', 'san-diego', 'stockton');

-- Remove duplicate -ca suffix rows (already inactive)
-- They remain for historical reference but ensure they stay inactive
UPDATE seo_cities SET is_active = false 
WHERE city_slug IN ('oakland-ca', 'san-jose-ca', 'san-francisco-ca');

-- Add missing Tier 2/3 cities that are in Bay Area scope but not in DB
INSERT INTO seo_cities (city_slug, city_name, state, county, is_active, is_primary_market, primary_yard_id, common_sizes_json, heavy_sizes_json, neighborhoods_json, nearby_cities_json)
VALUES 
  ('cupertino', 'Cupertino', 'CA', 'Santa Clara County', true, false, 'sanjose', '[10,20,30,40]', '[10,20]', '["Rancho Rinconada","Monta Vista","Garden Gate"]', '["sunnyvale","santa-clara","san-jose"]'),
  ('daly-city', 'Daly City', 'CA', 'San Mateo County', true, false, 'oakland', '[10,20,30]', '[10,20]', '["Westlake","Serramonte","Broadmoor"]', '["south-san-francisco","san-francisco"]'),
  ('san-rafael', 'San Rafael', 'CA', 'Marin County', true, false, 'oakland', '[10,20,30]', '[10,20]', '["Downtown","Canal","Terra Linda","San Rafael Hills"]', '["san-francisco","oakland"]'),
  ('petaluma', 'Petaluma', 'CA', 'Sonoma County', true, false, 'oakland', '[10,20,30]', '[10,20]', '["Downtown","Petaluma East","Petaluma West"]', '["santa-rosa","san-rafael"]'),
  ('napa', 'Napa', 'CA', 'Napa County', true, false, 'oakland', '[10,20,30]', '[10,20]', '["Downtown","Napa Valley","Browns Valley","Old Town"]', '["vallejo","santa-rosa"]')
ON CONFLICT (city_slug) DO UPDATE SET 
  is_active = true,
  primary_yard_id = EXCLUDED.primary_yard_id;

-- Update missing yard assignments for existing Bay Area cities
UPDATE seo_cities SET primary_yard_id = 'oakland' WHERE city_slug = 'dublin' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'oakland' WHERE city_slug = 'livermore' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'oakland' WHERE city_slug = 'pleasanton' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'sanjose' WHERE city_slug = 'palo-alto' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'sanjose' WHERE city_slug = 'redwood-city' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'sanjose' WHERE city_slug = 'san-mateo' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'oakland' WHERE city_slug = 'south-san-francisco' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'oakland' WHERE city_slug = 'santa-rosa' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'oakland' WHERE city_slug = 'vallejo' AND (primary_yard_id IS NULL OR primary_yard_id = '');
UPDATE seo_cities SET primary_yard_id = 'oakland' WHERE city_slug = 'menlo-park' AND (primary_yard_id IS NULL OR primary_yard_id = '');

-- Activate North Bay cities that were previously inactive/noindex
UPDATE seo_cities SET is_active = true WHERE city_slug IN ('santa-rosa', 'vallejo');
