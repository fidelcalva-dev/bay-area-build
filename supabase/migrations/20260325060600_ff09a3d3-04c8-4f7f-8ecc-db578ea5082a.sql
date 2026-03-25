
-- ══════════════════════════════════════════════════════════════
-- WASTE PROFILES: Weight-behavior profiles for general debris
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.waste_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waste_profile_code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  allowed_sizes_json JSONB NOT NULL DEFAULT '[5,8,10,20,30,40,50]'::jsonb,
  estimated_density TEXT DEFAULT 'medium',
  included_tons_by_size_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  overage_rate NUMERIC(10,2) NOT NULL DEFAULT 165,
  requires_manual_review BOOLEAN NOT NULL DEFAULT false,
  public_visible BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_waste_profiles" ON public.waste_profiles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "anon_read_waste_profiles" ON public.waste_profiles
  FOR SELECT TO anon
  USING (active = true AND public_visible = true);

CREATE POLICY "auth_read_waste_profiles" ON public.waste_profiles
  FOR SELECT TO authenticated
  USING (true);

-- Seed default profiles
INSERT INTO public.waste_profiles (waste_profile_code, label, description, estimated_density, included_tons_by_size_json, overage_rate, sort_order) VALUES
  ('LIGHT_CLEANOUT', 'Light Cleanout', 'Household junk, furniture, light garage cleanout', 'light', '{"5":0.5,"8":0.5,"10":1,"20":2,"30":3,"40":4,"50":5}', 165, 1),
  ('STANDARD_DEBRIS', 'Standard Debris', 'Mixed remodel, construction, general waste', 'medium', '{"5":0.5,"8":0.5,"10":1,"20":2,"30":3,"40":4,"50":5}', 165, 2),
  ('HEAVY_GENERAL', 'Heavy General', 'Heavier general debris (cabinets, drywall, tile mix)', 'heavy', '{"5":0.5,"8":0.5,"10":1,"20":2,"30":3,"40":4,"50":5}', 165, 3),
  ('ROOFING', 'Roofing', 'Shingles, roofing materials — heavier per yard', 'heavy', '{"5":0.5,"8":0.5,"10":1,"20":2,"30":3,"40":4}', 165, 4),
  ('GREEN_WASTE', 'Green Waste', 'Yard waste, branches, landscaping debris', 'light', '{"5":0.5,"8":0.5,"10":1,"20":2,"30":3,"40":4,"50":5}', 165, 5),
  ('DEMO_DEBRIS', 'Demolition Debris', 'Mixed demo materials — may contain heavy components', 'heavy', '{"5":0.5,"8":0.5,"10":1,"20":2,"30":3,"40":4,"50":5}', 165, 6),
  ('MANUAL_REVIEW', 'Manual Review Required', 'Unusual material needing staff review', 'unknown', '{}', 165, 99);

-- ══════════════════════════════════════════════════════════════
-- CUSTOMER REQUIRED DUMP SITE RULES
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.customer_required_dump_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dump_requirement_code TEXT NOT NULL UNIQUE,
  facility_name TEXT,
  facility_type TEXT DEFAULT 'landfill',
  pricing_mode TEXT NOT NULL DEFAULT 'flat_premium',
  flat_premium NUMERIC(10,2) NOT NULL DEFAULT 0,
  per_ton_delta NUMERIC(10,2) NOT NULL DEFAULT 0,
  per_yard_delta NUMERIC(10,2) NOT NULL DEFAULT 0,
  per_mile_delta NUMERIC(10,2) NOT NULL DEFAULT 0,
  admin_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  customer_visible BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_required_dump_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_dump_rules" ON public.customer_required_dump_rules
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "auth_read_dump_rules" ON public.customer_required_dump_rules
  FOR SELECT TO authenticated
  USING (true);

-- Seed default rule
INSERT INTO public.customer_required_dump_rules (dump_requirement_code, facility_name, pricing_mode, flat_premium, requires_approval, notes) VALUES
  ('DEFAULT_CUSTOMER_SITE', 'Customer-Specified Facility', 'flat_premium', 75, true, 'Default adjustment when customer requires a specific disposal site'),
  ('PREFERRED_RECYCLER', 'Preferred Recycling Facility', 'per_mile_delta', 0, false, 'Customer prefers a specific recycler — pricing adjusted by distance delta');
