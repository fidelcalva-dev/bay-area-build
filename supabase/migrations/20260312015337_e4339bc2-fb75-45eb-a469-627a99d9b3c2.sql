
-- Insert Santa Clara
INSERT INTO public.seo_cities (city_name, state, city_slug, county, market_code, primary_yard_id, is_active, is_primary_market, lat, lng, population, local_intro, dump_rules, pricing_note, permit_info, common_sizes_json, heavy_sizes_json, neighborhoods_json, nearby_cities_json)
VALUES (
  'Santa Clara', 'CA', 'santa-clara', 'Santa Clara County', 'SJ', 'sanjose', true, false,
  37.3541, -121.9552, '127,647',
  'Serving Santa Clara from our San Jose yard — fast South Bay dispatch for residential and commercial projects. We cover the entire city including neighborhoods near Santa Clara University, Mission Santa Clara, and the Great America business corridor.',
  'Santa Clara follows Santa Clara County C&D recycling requirements. Construction debris must be processed at certified facilities with minimum diversion rates. Clean heavy materials are routed to inert recycling.',
  'Santa Clara pricing is based on size, material, and your specific ZIP code. Enter your ZIP for an exact quote — transparent pricing with no hidden fees.',
  'Dumpsters placed on private property in Santa Clara typically do not require a permit. Street placement requires an encroachment permit from the City of Santa Clara Public Works. Allow 3-5 business days for processing.',
  '[5,8,10,20,30,40,50]'::jsonb, '[5,8,10]'::jsonb,
  '["Downtown Santa Clara","Old Quad","El Camino Corridor","Mission Santa Clara","Agnew","Rivermark","Great America","Pruneyard"]'::jsonb,
  '["san-jose","sunnyvale","milpitas","cupertino"]'::jsonb
);

-- Insert Sunnyvale
INSERT INTO public.seo_cities (city_name, state, city_slug, county, market_code, primary_yard_id, is_active, is_primary_market, lat, lng, population, local_intro, dump_rules, pricing_note, permit_info, common_sizes_json, heavy_sizes_json, neighborhoods_json, nearby_cities_json)
VALUES (
  'Sunnyvale', 'CA', 'sunnyvale', 'Santa Clara County', 'SJ', 'sanjose', true, false,
  37.3688, -122.0363, '155,805',
  'Professional dumpster rental in Sunnyvale from our San Jose yard. We serve tech-corridor office TI projects, residential remodels in Heritage District and Lakewood Village, and contractor jobs throughout the city. Fast South Bay dispatch means same-day availability for most Sunnyvale addresses.',
  'Sunnyvale follows Santa Clara County construction and demolition debris recycling mandates. Materials must be processed at certified transfer stations with required diversion rates.',
  'Sunnyvale pricing depends on dumpster size and material type. Enter your ZIP code for instant transparent pricing — what you see is what you pay.',
  'Private driveway placement in Sunnyvale does not typically require a permit. Street placement requires an encroachment permit from the City of Sunnyvale Department of Public Works.',
  '[5,8,10,20,30,40,50]'::jsonb, '[5,8,10]'::jsonb,
  '["Heritage District","Lakewood Village","Downtown Sunnyvale","Cherry Chase","Ponderosa Park","Birdland","Raynor Park","De Anza Park"]'::jsonb,
  '["santa-clara","mountain-view","cupertino","san-jose"]'::jsonb
);

-- Insert Mountain View
INSERT INTO public.seo_cities (city_name, state, city_slug, county, market_code, primary_yard_id, is_active, is_primary_market, lat, lng, population, local_intro, dump_rules, pricing_note, permit_info, common_sizes_json, heavy_sizes_json, neighborhoods_json, nearby_cities_json)
VALUES (
  'Mountain View', 'CA', 'mountain-view', 'Santa Clara County', 'SJ', 'sanjose', true, false,
  37.3861, -122.0839, '82,376',
  'Dumpster rental in Mountain View coordinated from our San Jose yard. We serve residential remodels in Old Mountain View, Cuesta Park, and Shoreline West, plus commercial projects in the North Bayshore tech corridor. Same-day delivery available for most Mountain View ZIP codes.',
  'Mountain View follows Santa Clara County C&D recycling regulations. All construction and demolition waste must be processed at certified facilities.',
  'Mountain View dumpster pricing varies by size and material. Get your exact price by entering your ZIP code — transparent, upfront pricing with delivery included.',
  'Dumpsters on private property in Mountain View generally do not need a permit. Street-placed containers require a right-of-way permit from the City of Mountain View Public Works Division.',
  '[5,8,10,20,30,40,50]'::jsonb, '[5,8,10]'::jsonb,
  '["Old Mountain View","Cuesta Park","Rex Manor","Shoreline West","Waverly Park","Monta Loma","Sylvan Park","North Bayshore","Gemello"]'::jsonb,
  '["sunnyvale","palo-alto","los-altos","santa-clara"]'::jsonb
);
