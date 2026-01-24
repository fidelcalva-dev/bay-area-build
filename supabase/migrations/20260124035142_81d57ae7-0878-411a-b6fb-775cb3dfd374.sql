-- =====================================================
-- FACILITIES TABLE (Transfer Stations / Dumps / Recyclers)
-- =====================================================
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT NOT NULL,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  facility_type TEXT NOT NULL CHECK (facility_type IN (
    'transfer_station', 'landfill', 'recycler', 'organics', 
    'metal', 'inert', 'mixed_c_and_d', 'roofing'
  )),
  accepted_material_classes TEXT[] NOT NULL DEFAULT '{}',
  green_halo_certified BOOLEAN NOT NULL DEFAULT false,
  approved_by_city TEXT[] NOT NULL DEFAULT '{}',
  hours TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active facilities"
ON public.facilities FOR SELECT
USING (status = 'active');

CREATE POLICY "Admin can manage facilities"
ON public.facilities FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin']::app_role[]));

CREATE INDEX idx_facilities_city ON public.facilities(city);
CREATE INDEX idx_facilities_type ON public.facilities(facility_type);
CREATE INDEX idx_facilities_status ON public.facilities(status);
CREATE INDEX idx_facilities_approved_cities ON public.facilities USING GIN(approved_by_city);
CREATE INDEX idx_facilities_materials ON public.facilities USING GIN(accepted_material_classes);

-- =====================================================
-- CITY FACILITY RULES
-- =====================================================
CREATE TABLE public.city_facility_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL UNIQUE,
  market TEXT,
  default_facility_type_for_mixed TEXT NOT NULL DEFAULT 'transfer_station',
  requires_green_halo_for_projects BOOLEAN NOT NULL DEFAULT false,
  facility_selection_policy TEXT NOT NULL DEFAULT 'auto_suggest' 
    CHECK (facility_selection_policy IN ('auto_suggest', 'customer_request', 'dispatch_confirm')),
  manual_review_distance_miles NUMERIC(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.city_facility_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view city facility rules"
ON public.city_facility_rules FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admin can manage city facility rules"
ON public.city_facility_rules FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin']::app_role[]));

-- =====================================================
-- ORDER DISPOSAL PLAN
-- =====================================================
CREATE TABLE public.order_disposal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  material_classification TEXT NOT NULL,
  required_facility_type TEXT NOT NULL,
  green_halo_required BOOLEAN NOT NULL DEFAULT false,
  suggested_facilities JSONB NOT NULL DEFAULT '[]',
  selected_facility_id UUID REFERENCES public.facilities(id),
  selection_method TEXT CHECK (selection_method IN ('auto', 'dispatch', 'driver', 'customer')),
  route_miles_to_facility NUMERIC(6, 2),
  route_minutes_to_facility INTEGER,
  route_polyline TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

ALTER TABLE public.order_disposal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view disposal plans"
ON public.order_disposal_plans FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'dispatcher', 'driver', 'owner_operator']::app_role[]));

CREATE POLICY "Staff can manage disposal plans"
ON public.order_disposal_plans FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'dispatcher']::app_role[]));

CREATE POLICY "Drivers can update their assigned disposal plans"
ON public.order_disposal_plans FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_disposal_plans.order_id
    AND o.assigned_driver_id = auth.uid()
  )
);

CREATE INDEX idx_disposal_plans_order ON public.order_disposal_plans(order_id);
CREATE INDEX idx_disposal_plans_facility ON public.order_disposal_plans(selected_facility_id);

-- =====================================================
-- SEED SAMPLE FACILITIES (Bay Area)
-- =====================================================
INSERT INTO public.facilities (name, address, city, state, zip, lat, lng, facility_type, accepted_material_classes, green_halo_certified, approved_by_city, hours, phone) VALUES
('Davis Street Transfer Station', '2615 Davis St', 'San Leandro', 'CA', '94577', 37.7127, -122.1619, 'transfer_station', 
 ARRAY['MIXED_GENERAL', 'HEAVY_MIXED', 'HEAVY_CLEAN_BASE', 'HEAVY_PLUS_200'], true, ARRAY['Oakland', 'San Leandro', 'Alameda'], 
 'Mon-Sat 6am-5pm, Sun 8am-4pm', '(510) 562-0590'),
 
('Waste Management Oakland', '98th Ave Facility', 'Oakland', 'CA', '94603', 37.7495, -122.1821, 'transfer_station',
 ARRAY['MIXED_GENERAL', 'HEAVY_MIXED'], true, ARRAY['Oakland', 'Emeryville', 'Berkeley'],
 'Mon-Fri 6am-4pm, Sat 7am-12pm', '(510) 613-8700'),

('Vulcan Materials - Oakland', '1355 64th Ave', 'Oakland', 'CA', '94621', 37.7662, -122.2141, 'inert',
 ARRAY['HEAVY_CLEAN_BASE'], true, ARRAY['Oakland', 'Alameda', 'San Leandro'],
 'Mon-Fri 6am-3:30pm', '(510) 638-2020'),

('Zanker Road Resource Management', '705 Los Esteros Rd', 'San Jose', 'CA', '95134', 37.4283, -121.9341, 'transfer_station',
 ARRAY['MIXED_GENERAL', 'HEAVY_MIXED', 'HEAVY_CLEAN_BASE', 'HEAVY_PLUS_200'], true, ARRAY['San Jose', 'Milpitas', 'Santa Clara'],
 'Mon-Sat 6am-5pm', '(408) 263-2385'),

('Newby Island Resource Recovery Park', '1601 Dixon Landing Rd', 'Milpitas', 'CA', '95035', 37.4614, -121.9489, 'landfill',
 ARRAY['MIXED_GENERAL', 'HEAVY_MIXED'], false, ARRAY['San Jose', 'Milpitas', 'Fremont'],
 'Mon-Sat 6am-5pm', '(408) 262-1401'),

('GreenWaste Recovery San Jose', '625 Charles St', 'San Jose', 'CA', '95112', 37.3647, -121.8897, 'organics',
 ARRAY['GREEN_WASTE', 'ORGANICS'], true, ARRAY['San Jose', 'Santa Clara', 'Campbell'],
 'Mon-Fri 7am-4pm, Sat 8am-12pm', '(408) 283-4800'),

('Guadalupe Rubbish Disposal', '1760 Rogers Ave', 'San Jose', 'CA', '95112', 37.3589, -121.8854, 'transfer_station',
 ARRAY['MIXED_GENERAL', 'HEAVY_MIXED', 'HEAVY_CLEAN_BASE'], false, ARRAY['San Jose', 'Santa Clara'],
 'Mon-Fri 6am-5pm, Sat 6am-3pm', '(408) 287-7430'),

('SA Recycling Oakland', '1700 Maritime St', 'Oakland', 'CA', '94607', 37.8067, -122.3183, 'metal',
 ARRAY['METAL_CLEAN'], true, ARRAY['Oakland', 'Alameda', 'Berkeley', 'Emeryville'],
 'Mon-Fri 7am-4pm', '(510) 893-3999'),

('Schnitzer Steel San Jose', '299 Stockton Ave', 'San Jose', 'CA', '95126', 37.3318, -121.9112, 'metal',
 ARRAY['METAL_CLEAN'], true, ARRAY['San Jose', 'Santa Clara', 'Campbell', 'Cupertino'],
 'Mon-Fri 7am-4:30pm, Sat 7am-12pm', '(408) 295-5055');

-- =====================================================
-- SEED CITY FACILITY RULES
-- =====================================================
INSERT INTO public.city_facility_rules (city, market, default_facility_type_for_mixed, requires_green_halo_for_projects, facility_selection_policy, manual_review_distance_miles) VALUES
('Oakland', 'East Bay', 'transfer_station', false, 'auto_suggest', 25),
('San Jose', 'South Bay', 'transfer_station', false, 'auto_suggest', 30),
('San Leandro', 'East Bay', 'transfer_station', false, 'auto_suggest', 20),
('Berkeley', 'East Bay', 'transfer_station', true, 'dispatch_confirm', 20),
('Alameda', 'East Bay', 'transfer_station', false, 'auto_suggest', 20),
('Fremont', 'East Bay', 'transfer_station', false, 'auto_suggest', 25),
('Hayward', 'East Bay', 'transfer_station', false, 'auto_suggest', 25),
('Santa Clara', 'South Bay', 'transfer_station', false, 'auto_suggest', 25),
('Milpitas', 'South Bay', 'transfer_station', false, 'auto_suggest', 20),
('Sunnyvale', 'South Bay', 'transfer_station', false, 'auto_suggest', 25);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_facilities_updated_at
BEFORE UPDATE ON public.facilities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_city_facility_rules_updated_at
BEFORE UPDATE ON public.city_facility_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_disposal_plans_updated_at
BEFORE UPDATE ON public.order_disposal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();