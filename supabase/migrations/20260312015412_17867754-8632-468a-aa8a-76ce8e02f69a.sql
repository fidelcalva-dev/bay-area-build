
-- Fix stale "6-yard" pricing_note references and thin local_intros

UPDATE public.seo_cities SET
  pricing_note = 'Berkeley pricing starts from $395 for a 5-yard dumpster. Our Oakland yard proximity means fast delivery and competitive rates for Berkeley addresses.',
  nearby_cities_json = '["oakland","alameda","san-leandro","emeryville","richmond","el-cerrito"]'::jsonb
WHERE city_slug = 'berkeley';

UPDATE public.seo_cities SET
  pricing_note = 'Alameda pricing starts from $395 for a 5-yard dumpster. Island logistics are well-handled by our experienced Oakland dispatch team.',
  nearby_cities_json = '["oakland","san-leandro","berkeley","alameda"]'::jsonb
WHERE city_slug = 'alameda';

UPDATE public.seo_cities SET
  pricing_note = 'San Leandro pricing starts from $395 for a 5-yard dumpster. Proximity to our Oakland yard means fast delivery and minimal fuel surcharges.',
  nearby_cities_json = '["oakland","hayward","alameda","san-lorenzo"]'::jsonb
WHERE city_slug = 'san-leandro';

UPDATE public.seo_cities SET
  pricing_note = 'Hayward pricing starts from $395 for a 5-yard dumpster. Our Oakland yard provides same-day service for most Hayward addresses.',
  nearby_cities_json = '["oakland","san-leandro","fremont","hayward","union-city"]'::jsonb
WHERE city_slug = 'hayward';

UPDATE public.seo_cities SET
  pricing_note = 'Fremont pricing starts from $395 for a 5-yard dumpster. Served from both our Oakland and San Jose yards for maximum availability.',
  primary_yard_id = 'sanjose'
WHERE city_slug = 'fremont';

UPDATE public.seo_cities SET
  local_intro = 'Professional dumpster rental in Dublin for Tri-Valley homeowners and contractors. We serve Dublin Ranch, Fallon Village, and downtown Dublin with reliable delivery from our East Bay operations. Home remodels, garage cleanouts, and new construction projects are our specialty in this growing market.',
  pricing_note = 'Dublin pricing starts from $395 for a 5-yard dumpster. Enter your ZIP code for an exact, transparent quote.',
  nearby_cities_json = '["pleasanton","livermore","fremont","san-ramon"]'::jsonb,
  neighborhoods_json = '["Downtown Dublin","Dublin Ranch","Fallon Village","Emerald Glen","Dublin Crossing","Positano","Schaefer Ranch"]'::jsonb
WHERE city_slug = 'dublin';

UPDATE public.seo_cities SET
  local_intro = 'Reliable dumpster rental in Pleasanton from our East Bay operations. We serve Pleasanton homeowners tackling remodels, estate cleanouts, and landscaping projects across Birdland, Vintage Hills, Ruby Hill, and the Hacienda Business Park. Tri-Valley contractor projects welcome.',
  pricing_note = 'Pleasanton pricing starts from $395 for a 5-yard dumpster. Get your exact price by entering your ZIP code.',
  nearby_cities_json = '["dublin","livermore","fremont","san-ramon"]'::jsonb,
  neighborhoods_json = '["Downtown Pleasanton","Birdland","Vintage Hills","Ruby Hill","Hacienda Business Park","Stoneridge","Val Vista Park","Castlewood"]'::jsonb
WHERE city_slug = 'pleasanton';

UPDATE public.seo_cities SET
  local_intro = 'Dumpster rental in Livermore for Tri-Valley homeowners, contractors, and vineyard properties. We serve residential projects in the Springtown, Sunset West, and South Livermore wine country areas. Estate cleanouts, home remodels, and construction projects are our core Livermore business.',
  pricing_note = 'Livermore pricing starts from $395 for a 5-yard dumpster. Enter your ZIP code for exact pricing with delivery included.',
  nearby_cities_json = '["pleasanton","dublin","fremont","tracy"]'::jsonb,
  neighborhoods_json = '["Downtown Livermore","Springtown","Sunset West","South Livermore","Sunset East","Portola Meadows","Altamont Creek","May Nissen"]'::jsonb
WHERE city_slug = 'livermore';

UPDATE public.seo_cities SET
  local_intro = 'Dumpster rental throughout Walnut Creek and the Lamorinda corridor from our Oakland yard. We serve residential remodels, home cleanouts, and contractor projects in Rossmoor, Northgate, Tice Valley, and Downtown Walnut Creek. Same-day delivery available for most Walnut Creek addresses.',
  pricing_note = 'Walnut Creek pricing starts from $395 for a 5-yard dumpster. Heavy materials are flat-fee with no weight overage.',
  nearby_cities_json = '["concord","oakland","lafayette","pleasant-hill","berkeley"]'::jsonb,
  neighborhoods_json = '["Downtown Walnut Creek","Rossmoor","Northgate","Tice Valley","Saranap","Lakewood","Indian Valley","Parkmead"]'::jsonb
WHERE city_slug = 'walnut-creek';

UPDATE public.seo_cities SET
  local_intro = 'Full dumpster service across Concord and the Contra Costa corridor from our Oakland yard. We cover Downtown Concord, Clayton Valley, Todos Santos, and the Sun Terrace area. Residential cleanouts, roofing jobs, and contractor work are our strengths in this market.',
  pricing_note = 'Concord pricing starts from $395 for a 5-yard dumpster. Heavy materials are flat-fee with no weight overage charges.',
  nearby_cities_json = '["walnut-creek","oakland","martinez","pleasant-hill","pittsburg"]'::jsonb
WHERE city_slug = 'concord';
