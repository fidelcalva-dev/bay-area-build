
-- ========================================================
-- PHASE 1: LOCATION-BASED PRICING SYSTEM
-- Market Intelligence + Pricing CFO Implementation
-- ========================================================

-- 1) Enhance dump_fee_profiles with facility name and material_stream
ALTER TABLE public.dump_fee_profiles 
  ADD COLUMN IF NOT EXISTS facility_name TEXT,
  ADD COLUMN IF NOT EXISTS material_stream TEXT,
  ADD COLUMN IF NOT EXISTS min_charge NUMERIC(10,2);

-- Add comments for documentation
COMMENT ON COLUMN public.dump_fee_profiles.material_stream IS 'Specific material stream: CND_DEBRIS, GREEN_WASTE, CLEAN_WOOD, CLEAN_DRYWALL, CLEAN_CONCRETE, CLEAN_ASPHALT, CLEAN_ROCK_SAND';
COMMENT ON COLUMN public.dump_fee_profiles.facility_name IS 'Name of disposal facility';
COMMENT ON COLUMN public.dump_fee_profiles.min_charge IS 'Minimum disposal charge if applicable';

-- 2) Create market_size_pricing for location+size base prices
CREATE TABLE IF NOT EXISTS public.market_size_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_code TEXT NOT NULL REFERENCES public.markets(id),
  size_yd INTEGER NOT NULL,
  tier TEXT NOT NULL DEFAULT 'BASE' CHECK (tier IN ('BASE', 'CORE', 'PREMIUM')),
  base_price NUMERIC(10,2) NOT NULL,
  included_days INTEGER NOT NULL DEFAULT 7,
  included_tons NUMERIC(6,2) NOT NULL,
  extra_ton_rate NUMERIC(10,2) NOT NULL DEFAULT 165.00,
  overdue_daily_rate NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  same_day_fee NUMERIC(10,2) DEFAULT 75.00,
  service_fee_component NUMERIC(10,2),
  dump_cost_assumption NUMERIC(10,2),
  target_margin_pct NUMERIC(5,2),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_market_size_tier UNIQUE (market_code, size_yd, tier)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_size_pricing_market ON public.market_size_pricing(market_code);
CREATE INDEX IF NOT EXISTS idx_market_size_pricing_active ON public.market_size_pricing(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.market_size_pricing ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can read market size pricing"
  ON public.market_size_pricing FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Admin can manage market size pricing"
  ON public.market_size_pricing FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- 3) Create heavy_material_rates for flat pricing by location
CREATE TABLE IF NOT EXISTS public.heavy_material_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_code TEXT NOT NULL REFERENCES public.markets(id),
  size_yd INTEGER NOT NULL CHECK (size_yd IN (5, 6, 8, 10)),
  heavy_category TEXT NOT NULL CHECK (heavy_category IN ('HEAVY_BASE', 'GREEN_HALO')),
  material_stream TEXT NOT NULL,
  base_price_flat NUMERIC(10,2) NOT NULL,
  max_tons NUMERIC(6,2) NOT NULL DEFAULT 10.00,
  included_days INTEGER NOT NULL DEFAULT 7,
  facility_name TEXT,
  reclass_to_debris_heavy BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_heavy_rate UNIQUE (market_code, size_yd, heavy_category, material_stream)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_heavy_material_rates_market ON public.heavy_material_rates(market_code);
CREATE INDEX IF NOT EXISTS idx_heavy_material_rates_active ON public.heavy_material_rates(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.heavy_material_rates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can read heavy material rates"
  ON public.heavy_material_rates FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Admin can manage heavy material rates"
  ON public.heavy_material_rates FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- 4) Create size_pricing_defaults for canonical included tons
CREATE TABLE IF NOT EXISTS public.size_pricing_defaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size_yd INTEGER NOT NULL UNIQUE,
  included_days_default INTEGER NOT NULL DEFAULT 7,
  included_tons_default NUMERIC(6,2) NOT NULL,
  base_service_fee NUMERIC(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.size_pricing_defaults ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can read size pricing defaults"
  ON public.size_pricing_defaults FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Admin can manage size pricing defaults"
  ON public.size_pricing_defaults FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- 5) Add update triggers
CREATE OR REPLACE FUNCTION public.update_market_size_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_market_size_pricing_timestamp
  BEFORE UPDATE ON public.market_size_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_market_size_pricing_updated_at();

CREATE OR REPLACE FUNCTION public.update_heavy_material_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_heavy_material_rates_timestamp
  BEFORE UPDATE ON public.heavy_material_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_heavy_material_rates_updated_at();

-- ========================================================
-- PHASE 2: SEED OAKLAND DUMP FEE PROFILES (REAL RATES)
-- ========================================================

-- Clear existing Oakland dump fee profiles and insert accurate ones
DELETE FROM public.dump_fee_profiles WHERE market_code = 'oakland_east_bay';

INSERT INTO public.dump_fee_profiles (
  market_code, material_category, material_code, material_stream, dump_cost_model, 
  default_cost_per_ton, default_cost_per_load, min_charge, facility_name, notes, is_active,
  assumed_tons_defaults_json
) VALUES
-- C&D / General Debris: $115/ton
('oakland_east_bay', 'DEBRIS', NULL, 'CND_DEBRIS', 'PER_TON', 
  115.00, NULL, 50.00, 'Waste Management - Davis Street', 
  'Standard C&D debris - verified 2026 rate', true,
  '{"by_size": {"10": 1.5, "20": 3.0, "30": 4.5, "40": 6.0, "50": 7.5}, "debris_heavy_multiplier": 1.25, "heavy_cap": 10}'::jsonb),

-- Green Waste: $80/ton
('oakland_east_bay', 'DEBRIS', 'GRASS_CLEAN', 'GREEN_WASTE', 'PER_TON',
  80.00, NULL, 40.00, 'Republic Services - East Bay MRF',
  'Clean green waste / yard debris', true,
  '{"by_size": {"10": 1.0, "20": 2.0, "30": 3.0, "40": 4.0}, "debris_heavy_multiplier": 1.0, "heavy_cap": 10}'::jsonb),

-- Clean Wood: $80/ton
('oakland_east_bay', 'DEBRIS', 'WOOD_CLEAN', 'CLEAN_WOOD', 'PER_TON',
  80.00, NULL, 40.00, 'Schnitzer Steel - Wood Recycling',
  'Clean unpainted wood, pallets, lumber', true,
  '{"by_size": {"10": 1.0, "20": 2.0, "30": 3.0, "40": 4.0}, "debris_heavy_multiplier": 1.0, "heavy_cap": 10}'::jsonb),

-- Clean Drywall: $80/ton
('oakland_east_bay', 'DEBRIS', 'DRYWALL_CLEAN', 'CLEAN_DRYWALL', 'PER_TON',
  80.00, NULL, 40.00, 'USA Gypsum - Oakland',
  'Clean unpainted drywall, gypsum board', true,
  '{"by_size": {"10": 1.0, "20": 2.0, "30": 3.0, "40": 4.0}, "debris_heavy_multiplier": 1.0, "heavy_cap": 10}'::jsonb),

-- Mixed Debris Heavy: $115/ton (same as C&D but heavier)
('oakland_east_bay', 'DEBRIS_HEAVY', NULL, 'MIXED_HEAVY', 'PER_TON',
  115.00, NULL, 50.00, 'Waste Management - Davis Street',
  'Mixed debris with heavy content - uses standard C&D facility', true,
  '{"by_size": {"10": 2.0, "20": 4.0, "30": 6.0, "40": 8.0}, "debris_heavy_multiplier": 1.25, "heavy_cap": 10}'::jsonb),

-- Clean Concrete: Per Load at Argent Materials
('oakland_east_bay', 'HEAVY', 'CONCRETE_CLEAN', 'CLEAN_CONCRETE', 'PER_LOAD',
  NULL, 125.00, NULL, 'Argent Materials - Oakland',
  'Clean concrete only, no rebar - NEEDS_INPUT: verify current load rate', true,
  '{"by_size": {"5": 3.0, "6": 3.5, "8": 5.0, "10": 6.5}, "debris_heavy_multiplier": 1.0, "heavy_cap": 10}'::jsonb),

-- Clean Asphalt: Per Load at Argent Materials
('oakland_east_bay', 'HEAVY', 'ASPHALT_CLEAN', 'CLEAN_ASPHALT', 'PER_LOAD',
  NULL, 125.00, NULL, 'Argent Materials - Oakland',
  'Clean asphalt only - NEEDS_INPUT: verify current load rate', true,
  '{"by_size": {"5": 3.0, "6": 3.5, "8": 5.0, "10": 6.5}, "debris_heavy_multiplier": 1.0, "heavy_cap": 10}'::jsonb),

-- Clean Rock/Sand: Per Load at Argent Materials  
('oakland_east_bay', 'HEAVY', 'ROCK_GRAVEL_CLEAN', 'CLEAN_ROCK_SAND', 'PER_LOAD',
  NULL, 100.00, NULL, 'Argent Materials - Oakland',
  'Clean rock, gravel, sand - NEEDS_INPUT: verify current load rate', true,
  '{"by_size": {"5": 4.0, "6": 5.0, "8": 6.5, "10": 8.0}, "debris_heavy_multiplier": 1.0, "heavy_cap": 10}'::jsonb),

-- Clean Soil/Dirt: Per Load
('oakland_east_bay', 'HEAVY', 'DIRT_CLEAN', 'CLEAN_SOIL', 'PER_LOAD',
  NULL, 75.00, NULL, 'Argent Materials - Oakland',
  'Clean dirt/soil - NEEDS_INPUT: verify current load rate', true,
  '{"by_size": {"5": 4.0, "6": 5.0, "8": 6.5, "10": 8.0}, "debris_heavy_multiplier": 1.0, "heavy_cap": 10}'::jsonb);

-- ========================================================
-- PHASE 3: SEED SIZE PRICING DEFAULTS (CANONICAL)
-- ========================================================

INSERT INTO public.size_pricing_defaults (size_yd, included_days_default, included_tons_default, base_service_fee, description, is_active)
VALUES
(6,  7, 0.60, 220.00, 'Small cleanout, single-room renovation', true),
(8,  7, 0.80, 260.00, 'Bathroom/kitchen remodel', true),
(10, 7, 1.00, 300.00, 'Medium cleanout, deck removal', true),
(20, 7, 2.00, 340.00, 'Most popular - renovations, roofing', true),
(30, 7, 3.00, 380.00, 'Commercial, whole-home cleanouts', true),
(40, 7, 4.00, 420.00, 'Large construction/demo', true),
(50, 7, 5.00, 500.00, 'Maximum capacity commercial', true)
ON CONFLICT (size_yd) DO UPDATE SET
  included_tons_default = EXCLUDED.included_tons_default,
  base_service_fee = EXCLUDED.base_service_fee,
  description = EXCLUDED.description,
  updated_at = now();

-- ========================================================
-- PHASE 4: SEED MARKET SIZE PRICING (OAKLAND - BASE TIER)
-- Formula: service_fee + (dump_cost_per_ton × included_tons) + margin_buffer
-- Target: 55-65% gross margin
-- ========================================================

-- Calculate BASE tier pricing for Oakland
-- C&D dump at $115/ton
INSERT INTO public.market_size_pricing (
  market_code, size_yd, tier, base_price, included_days, included_tons,
  extra_ton_rate, overdue_daily_rate, same_day_fee,
  service_fee_component, dump_cost_assumption, target_margin_pct, notes, is_active
) VALUES
-- 6 yd: service($220) + dump($115 × 0.6 = $69) + margin = $390
('oakland_east_bay', 6, 'BASE', 390.00, 7, 0.60, 165.00, 35.00, 75.00, 
  220.00, 69.00, 60.00, 'Oakland BASE tier - 60% target margin', true),

-- 8 yd: service($260) + dump($115 × 0.8 = $92) + margin = $460
('oakland_east_bay', 8, 'BASE', 460.00, 7, 0.80, 165.00, 35.00, 75.00,
  260.00, 92.00, 60.00, 'Oakland BASE tier - 60% target margin', true),

-- 10 yd: service($300) + dump($115 × 1.0 = $115) + margin = $580
('oakland_east_bay', 10, 'BASE', 580.00, 7, 1.00, 165.00, 35.00, 75.00,
  300.00, 115.00, 60.00, 'Oakland BASE tier - 60% target margin', true),

-- 20 yd: service($340) + dump($115 × 2.0 = $230) + margin = $620
('oakland_east_bay', 20, 'BASE', 620.00, 7, 2.00, 165.00, 35.00, 75.00,
  340.00, 230.00, 55.00, 'Oakland BASE tier - 55% target margin', true),

-- 30 yd: service($380) + dump($115 × 3.0 = $345) + margin = $770
('oakland_east_bay', 30, 'BASE', 770.00, 7, 3.00, 165.00, 35.00, 75.00,
  380.00, 345.00, 55.00, 'Oakland BASE tier - 55% target margin', true),

-- 40 yd: service($420) + dump($115 × 4.0 = $460) + margin = $895
('oakland_east_bay', 40, 'BASE', 895.00, 7, 4.00, 165.00, 35.00, 75.00,
  420.00, 460.00, 50.00, 'Oakland BASE tier - 50% target margin', true),

-- 50 yd: service($500) + dump($115 × 5.0 = $575) + margin = $1135
('oakland_east_bay', 50, 'BASE', 1135.00, 7, 5.00, 165.00, 35.00, 100.00,
  500.00, 575.00, 50.00, 'Oakland BASE tier - 50% target margin', true)
ON CONFLICT (market_code, size_yd, tier) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  included_tons = EXCLUDED.included_tons,
  service_fee_component = EXCLUDED.service_fee_component,
  dump_cost_assumption = EXCLUDED.dump_cost_assumption,
  target_margin_pct = EXCLUDED.target_margin_pct,
  updated_at = now();

-- CORE tier: BASE + 6% (higher demand areas)
INSERT INTO public.market_size_pricing (
  market_code, size_yd, tier, base_price, included_days, included_tons,
  extra_ton_rate, overdue_daily_rate, same_day_fee, notes, is_active
) VALUES
('oakland_east_bay', 6, 'CORE', 415.00, 7, 0.60, 165.00, 35.00, 75.00, 'CORE tier +6%', true),
('oakland_east_bay', 8, 'CORE', 490.00, 7, 0.80, 165.00, 35.00, 75.00, 'CORE tier +6%', true),
('oakland_east_bay', 10, 'CORE', 615.00, 7, 1.00, 165.00, 35.00, 75.00, 'CORE tier +6%', true),
('oakland_east_bay', 20, 'CORE', 660.00, 7, 2.00, 165.00, 35.00, 75.00, 'CORE tier +6%', true),
('oakland_east_bay', 30, 'CORE', 820.00, 7, 3.00, 165.00, 35.00, 75.00, 'CORE tier +6%', true),
('oakland_east_bay', 40, 'CORE', 950.00, 7, 4.00, 165.00, 35.00, 75.00, 'CORE tier +6%', true),
('oakland_east_bay', 50, 'CORE', 1205.00, 7, 5.00, 165.00, 35.00, 100.00, 'CORE tier +6%', true)
ON CONFLICT (market_code, size_yd, tier) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  updated_at = now();

-- PREMIUM tier: BASE + 15% (peak demand / constrained capacity)
INSERT INTO public.market_size_pricing (
  market_code, size_yd, tier, base_price, included_days, included_tons,
  extra_ton_rate, overdue_daily_rate, same_day_fee, notes, is_active
) VALUES
('oakland_east_bay', 6, 'PREMIUM', 450.00, 7, 0.60, 165.00, 35.00, 100.00, 'PREMIUM tier +15%', true),
('oakland_east_bay', 8, 'PREMIUM', 530.00, 7, 0.80, 165.00, 35.00, 100.00, 'PREMIUM tier +15%', true),
('oakland_east_bay', 10, 'PREMIUM', 670.00, 7, 1.00, 165.00, 35.00, 100.00, 'PREMIUM tier +15%', true),
('oakland_east_bay', 20, 'PREMIUM', 715.00, 7, 2.00, 165.00, 35.00, 100.00, 'PREMIUM tier +15%', true),
('oakland_east_bay', 30, 'PREMIUM', 890.00, 7, 3.00, 165.00, 35.00, 100.00, 'PREMIUM tier +15%', true),
('oakland_east_bay', 40, 'PREMIUM', 1030.00, 7, 4.00, 165.00, 35.00, 100.00, 'PREMIUM tier +15%', true),
('oakland_east_bay', 50, 'PREMIUM', 1310.00, 7, 5.00, 165.00, 35.00, 125.00, 'PREMIUM tier +15%', true)
ON CONFLICT (market_code, size_yd, tier) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  updated_at = now();

-- ========================================================
-- PHASE 5: SEED HEAVY MATERIAL RATES (OAKLAND)
-- Flat pricing for clean heavy materials (Argent Materials)
-- ========================================================

INSERT INTO public.heavy_material_rates (
  market_code, size_yd, heavy_category, material_stream, base_price_flat,
  max_tons, included_days, facility_name, reclass_to_debris_heavy, notes, is_active
) VALUES
-- CLEAN CONCRETE
('oakland_east_bay', 5, 'HEAVY_BASE', 'CLEAN_CONCRETE', 395.00, 10.00, 7, 'Argent Materials', true, '5yd concrete - flat rate', true),
('oakland_east_bay', 6, 'HEAVY_BASE', 'CLEAN_CONCRETE', 438.00, 10.00, 7, 'Argent Materials', true, '6yd concrete - flat rate', true),
('oakland_east_bay', 8, 'HEAVY_BASE', 'CLEAN_CONCRETE', 538.00, 10.00, 7, 'Argent Materials', true, '8yd concrete - flat rate', true),
('oakland_east_bay', 10, 'HEAVY_BASE', 'CLEAN_CONCRETE', 638.00, 10.00, 7, 'Argent Materials', true, '10yd concrete - flat rate', true),

-- CLEAN ASPHALT
('oakland_east_bay', 5, 'HEAVY_BASE', 'CLEAN_ASPHALT', 395.00, 10.00, 7, 'Argent Materials', true, '5yd asphalt - flat rate', true),
('oakland_east_bay', 6, 'HEAVY_BASE', 'CLEAN_ASPHALT', 438.00, 10.00, 7, 'Argent Materials', true, '6yd asphalt - flat rate', true),
('oakland_east_bay', 8, 'HEAVY_BASE', 'CLEAN_ASPHALT', 538.00, 10.00, 7, 'Argent Materials', true, '8yd asphalt - flat rate', true),
('oakland_east_bay', 10, 'HEAVY_BASE', 'CLEAN_ASPHALT', 638.00, 10.00, 7, 'Argent Materials', true, '10yd asphalt - flat rate', true),

-- CLEAN ROCK/GRAVEL
('oakland_east_bay', 5, 'HEAVY_BASE', 'CLEAN_ROCK_SAND', 375.00, 10.00, 7, 'Argent Materials', true, '5yd rock/gravel - flat rate', true),
('oakland_east_bay', 6, 'HEAVY_BASE', 'CLEAN_ROCK_SAND', 418.00, 10.00, 7, 'Argent Materials', true, '6yd rock/gravel - flat rate', true),
('oakland_east_bay', 8, 'HEAVY_BASE', 'CLEAN_ROCK_SAND', 518.00, 10.00, 7, 'Argent Materials', true, '8yd rock/gravel - flat rate', true),
('oakland_east_bay', 10, 'HEAVY_BASE', 'CLEAN_ROCK_SAND', 618.00, 10.00, 7, 'Argent Materials', true, '10yd rock/gravel - flat rate', true),

-- CLEAN SOIL/DIRT
('oakland_east_bay', 5, 'HEAVY_BASE', 'CLEAN_SOIL', 350.00, 10.00, 7, 'Argent Materials', true, '5yd dirt - flat rate', true),
('oakland_east_bay', 6, 'HEAVY_BASE', 'CLEAN_SOIL', 390.00, 10.00, 7, 'Argent Materials', true, '6yd dirt - flat rate', true),
('oakland_east_bay', 8, 'HEAVY_BASE', 'CLEAN_SOIL', 480.00, 10.00, 7, 'Argent Materials', true, '8yd dirt - flat rate', true),
('oakland_east_bay', 10, 'HEAVY_BASE', 'CLEAN_SOIL', 580.00, 10.00, 7, 'Argent Materials', true, '10yd dirt - flat rate', true),

-- MIXED HEAVY (contaminated - reclassified to debris heavy pricing)
('oakland_east_bay', 5, 'HEAVY_BASE', 'MIXED_HEAVY', 495.00, 10.00, 7, 'Davis Street', true, '5yd mixed heavy - debris facility', true),
('oakland_east_bay', 6, 'HEAVY_BASE', 'MIXED_HEAVY', 538.00, 10.00, 7, 'Davis Street', true, '6yd mixed heavy - debris facility', true),
('oakland_east_bay', 8, 'HEAVY_BASE', 'MIXED_HEAVY', 638.00, 10.00, 7, 'Davis Street', true, '8yd mixed heavy - debris facility', true),
('oakland_east_bay', 10, 'HEAVY_BASE', 'MIXED_HEAVY', 738.00, 10.00, 7, 'Davis Street', true, '10yd mixed heavy - debris facility', true),

-- GREEN HALO (clean wood/vegetation - lower disposal cost)
('oakland_east_bay', 5, 'GREEN_HALO', 'GREEN_WASTE', 295.00, 10.00, 7, 'Republic Services', false, '5yd green waste - eco rate', true),
('oakland_east_bay', 6, 'GREEN_HALO', 'GREEN_WASTE', 338.00, 10.00, 7, 'Republic Services', false, '6yd green waste - eco rate', true),
('oakland_east_bay', 8, 'GREEN_HALO', 'GREEN_WASTE', 438.00, 10.00, 7, 'Republic Services', false, '8yd green waste - eco rate', true),
('oakland_east_bay', 10, 'GREEN_HALO', 'GREEN_WASTE', 538.00, 10.00, 7, 'Republic Services', false, '10yd green waste - eco rate', true),

('oakland_east_bay', 5, 'GREEN_HALO', 'CLEAN_WOOD', 295.00, 10.00, 7, 'Schnitzer Steel', false, '5yd clean wood - eco rate', true),
('oakland_east_bay', 6, 'GREEN_HALO', 'CLEAN_WOOD', 338.00, 10.00, 7, 'Schnitzer Steel', false, '6yd clean wood - eco rate', true),
('oakland_east_bay', 8, 'GREEN_HALO', 'CLEAN_WOOD', 438.00, 10.00, 7, 'Schnitzer Steel', false, '8yd clean wood - eco rate', true),
('oakland_east_bay', 10, 'GREEN_HALO', 'CLEAN_WOOD', 538.00, 10.00, 7, 'Schnitzer Steel', false, '10yd clean wood - eco rate', true)
ON CONFLICT (market_code, size_yd, heavy_category, material_stream) DO UPDATE SET
  base_price_flat = EXCLUDED.base_price_flat,
  facility_name = EXCLUDED.facility_name,
  updated_at = now();

-- ========================================================
-- PHASE 6: CREATE HELPER FUNCTIONS
-- ========================================================

-- Function to get location-based pricing
CREATE OR REPLACE FUNCTION public.get_market_pricing(
  p_market_code TEXT,
  p_size_yd INTEGER,
  p_tier TEXT DEFAULT 'BASE'
)
RETURNS TABLE(
  base_price NUMERIC,
  included_days INTEGER,
  included_tons NUMERIC,
  extra_ton_rate NUMERIC,
  overdue_daily_rate NUMERIC,
  same_day_fee NUMERIC,
  service_fee_component NUMERIC,
  dump_cost_assumption NUMERIC
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    msp.base_price,
    msp.included_days,
    msp.included_tons,
    msp.extra_ton_rate,
    msp.overdue_daily_rate,
    msp.same_day_fee,
    msp.service_fee_component,
    msp.dump_cost_assumption
  FROM public.market_size_pricing msp
  WHERE msp.market_code = p_market_code
    AND msp.size_yd = p_size_yd
    AND msp.tier = p_tier
    AND msp.is_active = true;
END;
$$;

-- Function to get heavy material rate
CREATE OR REPLACE FUNCTION public.get_heavy_material_rate(
  p_market_code TEXT,
  p_size_yd INTEGER,
  p_material_stream TEXT
)
RETURNS TABLE(
  base_price_flat NUMERIC,
  max_tons NUMERIC,
  included_days INTEGER,
  facility_name TEXT,
  heavy_category TEXT,
  reclass_to_debris_heavy BOOLEAN
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hmr.base_price_flat,
    hmr.max_tons,
    hmr.included_days,
    hmr.facility_name,
    hmr.heavy_category,
    hmr.reclass_to_debris_heavy
  FROM public.heavy_material_rates hmr
  WHERE hmr.market_code = p_market_code
    AND hmr.size_yd = p_size_yd
    AND hmr.material_stream = p_material_stream
    AND hmr.is_active = true
  LIMIT 1;
END;
$$;

-- Function to get dump fee for cost estimation
CREATE OR REPLACE FUNCTION public.get_dump_fee(
  p_market_code TEXT,
  p_material_stream TEXT
)
RETURNS TABLE(
  dump_cost_model TEXT,
  cost_per_ton NUMERIC,
  cost_per_load NUMERIC,
  min_charge NUMERIC,
  facility_name TEXT,
  assumed_tons_json JSONB
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dfp.dump_cost_model,
    dfp.default_cost_per_ton,
    dfp.default_cost_per_load,
    dfp.min_charge,
    dfp.facility_name,
    dfp.assumed_tons_defaults_json
  FROM public.dump_fee_profiles dfp
  WHERE dfp.market_code = p_market_code
    AND (dfp.material_stream = p_material_stream OR dfp.material_category = p_material_stream)
    AND dfp.is_active = true
  LIMIT 1;
END;
$$;
