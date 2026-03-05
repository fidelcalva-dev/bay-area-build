
-- Insert canonical slug cities (copied from -ca variants where available, new entries for others)
-- San Francisco (canonical from san-francisco-ca)
INSERT INTO public.seo_cities (city_slug, city_name, county, state, lat, lng, population, local_intro, dump_rules, permit_info, pricing_note, primary_yard_id, market_code, is_active, is_primary_market, common_sizes_json, heavy_sizes_json, nearby_cities_json, neighborhoods_json)
VALUES (
  'san-francisco', 'San Francisco', 'San Francisco County', 'CA', 37.7749, -122.4194, 874000,
  'San Francisco projects demand specialized dumpster logistics—tight streets, steep hills, and strict city permitting. We serve all SF neighborhoods from our Oakland yard across the Bay Bridge with reliable scheduling.',
  'San Francisco enforces mandatory construction and demolition debris recycling under the Construction & Demolition Debris Recovery Ordinance. All loads must be processed at approved facilities. Recology operates the primary transfer and recycling facilities.',
  'SFPW requires a Temporary Exclusive Use permit for street-placed dumpsters. Apply through the SFMTA portal. Expect 5-10 business days. Street sweeping schedule conflicts may restrict placement days.',
  'San Francisco pricing accounts for Bay Bridge crossing and city-specific permitting requirements. Heavy materials are flat-fee with no weight overage.',
  'oakland', 'SF_PENINSULA', true, true,
  '[6,8,10,20,30,40]', '[6,8,10]',
  '["oakland","berkeley","alameda","san-leandro","emeryville"]',
  '["Mission","SoMa","Castro","Nob Hill","Pacific Heights","Sunset","Richmond","Marina","Haight","Tenderloin","North Beach","Financial District","Potrero Hill","Bernal Heights","Noe Valley","Glen Park","Excelsior","Bayview","Dogpatch"]'
)
ON CONFLICT (city_slug) DO NOTHING;

-- San Jose (canonical from san-jose-ca)
INSERT INTO public.seo_cities (city_slug, city_name, county, state, lat, lng, population, local_intro, dump_rules, permit_info, pricing_note, primary_yard_id, market_code, is_active, is_primary_market, common_sizes_json, heavy_sizes_json, nearby_cities_json, neighborhoods_json)
VALUES (
  'san-jose', 'San Jose', 'Santa Clara County', 'CA', 37.3382, -121.8863, 1013000,
  'Our San Jose yard at 2071 Ringwood Ave puts us right in the heart of the South Bay. Same-day delivery is available for most San Jose ZIP codes when ordered before noon.',
  'San Jose has strict construction debris recycling requirements under its Zero Waste policy. Concrete, asphalt, and clean dirt are routed to certified recycling facilities. Mixed C&D loads must achieve minimum diversion rates.',
  'San Jose DOT issues encroachment permits for street-placed dumpsters. Apply online through the city portal. Allow 5-7 business days.',
  'San Jose pricing starts at competitive base rates. Heavy materials (concrete, dirt, rock) are flat-fee with no weight overage charges.',
  'sanjose', 'SJ_SOUTH_BAY', true, true,
  '[6,8,10,20,30,40]', '[6,8,10]',
  '["milpitas","fremont","santa-clara","sunnyvale","campbell"]',
  '["Willow Glen","Almaden Valley","Evergreen","Rose Garden","Cambrian","Downtown San Jose","Japantown","Berryessa","Alum Rock","Silver Creek","Blossom Valley","Coyote Valley"]'
)
ON CONFLICT (city_slug) DO NOTHING;

-- Fremont (new)
INSERT INTO public.seo_cities (city_slug, city_name, county, state, lat, lng, population, local_intro, dump_rules, permit_info, pricing_note, primary_yard_id, market_code, is_active, is_primary_market, common_sizes_json, heavy_sizes_json, nearby_cities_json, neighborhoods_json)
VALUES (
  'fremont', 'Fremont', 'Alameda County', 'CA', 37.5485, -121.9886, 230504,
  'Fremont sits at the crossroads of the East Bay and South Bay, making it easy for our drivers to deliver from either our Oakland or San Jose yards. Same-day delivery available for most Fremont ZIP codes.',
  'Fremont follows Alameda County construction and demolition debris recycling requirements. C&D materials must be processed at certified facilities with minimum diversion rates.',
  'Dumpsters placed on private property in Fremont typically do not require a permit. Street placement requires an encroachment permit from the City of Fremont Public Works. Allow 3-5 business days.',
  'Fremont pricing is competitive with base rates starting from our standard schedule. Heavy materials are flat-fee with no weight overage charges.',
  'oakland', 'OAK_EAST_BAY', true, false,
  '[6,8,10,20,30,40]', '[6,8,10]',
  '["milpitas","hayward","san-jose","newark","union-city"]',
  '["Niles","Irvington","Centerville","Warm Springs","Mission San Jose","Glenmoor","Sundale"]'
)
ON CONFLICT (city_slug) DO NOTHING;

-- Milpitas (new)
INSERT INTO public.seo_cities (city_slug, city_name, county, state, lat, lng, population, local_intro, dump_rules, permit_info, pricing_note, primary_yard_id, market_code, is_active, is_primary_market, common_sizes_json, heavy_sizes_json, nearby_cities_json, neighborhoods_json)
VALUES (
  'milpitas', 'Milpitas', 'Santa Clara County', 'CA', 37.4323, -121.8996, 80430,
  'Milpitas is minutes from our San Jose yard, making same-day delivery straightforward. We serve residential and commercial projects throughout Milpitas.',
  'Milpitas follows Santa Clara County construction and demolition debris recycling requirements. Materials are processed at certified recycling and transfer facilities.',
  'Dumpsters on private property in Milpitas generally do not need a permit. Street placement requires an encroachment permit from Milpitas Public Works.',
  'Milpitas pricing follows our South Bay rate schedule. Heavy materials are flat-fee with no weight overage charges.',
  'sanjose', 'SJ_SOUTH_BAY', true, false,
  '[6,8,10,20,30,40]', '[6,8,10]',
  '["san-jose","fremont","santa-clara","sunnyvale"]',
  '["Calaveras Hills","Sunnyhills","Augustine","Midtown"]'
)
ON CONFLICT (city_slug) DO NOTHING;

-- Walnut Creek (new)
INSERT INTO public.seo_cities (city_slug, city_name, county, state, lat, lng, population, local_intro, dump_rules, permit_info, pricing_note, primary_yard_id, market_code, is_active, is_primary_market, common_sizes_json, heavy_sizes_json, nearby_cities_json, neighborhoods_json)
VALUES (
  'walnut-creek', 'Walnut Creek', 'Contra Costa County', 'CA', 37.9101, -122.0652, 71903,
  'We deliver dumpsters throughout Walnut Creek and the Contra Costa corridor from our Oakland yard. Residential and commercial projects welcome.',
  'Walnut Creek follows Contra Costa County construction debris recycling guidelines. C&D materials are processed at certified facilities.',
  'Private property placement typically requires no permit. Street-placed dumpsters in Walnut Creek require an encroachment permit from Public Works. Allow 3-5 business days.',
  'Walnut Creek pricing follows our East Bay rate schedule. Heavy materials are flat-fee. General debris includes base tonnage.',
  'oakland', 'OAK_EAST_BAY', true, false,
  '[6,8,10,20,30,40]', '[6,8,10]',
  '["concord","oakland","berkeley","lafayette","pleasant-hill"]',
  '["Downtown Walnut Creek","Northgate","Rossmoor","Saranap","Lakewood"]'
)
ON CONFLICT (city_slug) DO NOTHING;

-- Concord (new)
INSERT INTO public.seo_cities (city_slug, city_name, county, state, lat, lng, population, local_intro, dump_rules, permit_info, pricing_note, primary_yard_id, market_code, is_active, is_primary_market, common_sizes_json, heavy_sizes_json, nearby_cities_json, neighborhoods_json)
VALUES (
  'concord', 'Concord', 'Contra Costa County', 'CA', 37.978, -122.0311, 129295,
  'Concord is a key market in the Contra Costa corridor. We serve residential cleanouts, contractor projects, and commercial jobs throughout Concord.',
  'Concord follows Contra Costa County C&D recycling mandates. Construction debris is processed at certified transfer and recycling facilities.',
  'Private driveway placement usually does not require a permit. Street placement in Concord requires a city encroachment permit. Contact Concord Public Works.',
  'Concord pricing follows our East Bay schedule. Heavy materials are flat-fee with no weight overage.',
  'oakland', 'OAK_EAST_BAY', true, false,
  '[6,8,10,20,30,40]', '[6,8,10]',
  '["walnut-creek","oakland","martinez","pleasant-hill","pittsburg"]',
  '["Downtown Concord","Todos Santos","Clayton Valley","North Concord","Sun Terrace"]'
)
ON CONFLICT (city_slug) DO NOTHING;

-- Deactivate old -ca variants to prevent confusion
UPDATE public.seo_cities SET is_active = false WHERE city_slug IN ('san-francisco-ca', 'san-jose-ca', 'oakland-ca');
