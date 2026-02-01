-- ========================================================
-- PHASE 1: Dual Cost Model Tables
-- ========================================================

-- 1) Vehicle Cost Profiles (determines default model per market/vehicle)
CREATE TABLE IF NOT EXISTS public.vehicle_cost_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('ROLLOFF', 'HIGHSIDE', 'END_DUMP', 'SUPER10', 'TENWHEEL', 'PICKUP')),
  default_cost_model TEXT NOT NULL DEFAULT 'IN_HOUSE' CHECK (default_cost_model IN ('IN_HOUSE', 'OWNER_OPERATOR')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_code, vehicle_type)
);

-- 2) In-House Cost Rates
CREATE TABLE IF NOT EXISTS public.inhouse_cost_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('ROLLOFF', 'HIGHSIDE', 'END_DUMP', 'SUPER10', 'TENWHEEL', 'PICKUP')),
  cost_per_hour NUMERIC(10,2) NOT NULL DEFAULT 85.00,
  cost_per_mile NUMERIC(10,2),
  minimum_charge_per_run NUMERIC(10,2),
  overhead_multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.15,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_code, vehicle_type)
);

-- 3) Owner Operator Rates
CREATE TABLE IF NOT EXISTS public.owner_operator_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('ROLLOFF', 'HIGHSIDE', 'END_DUMP', 'SUPER10', 'TENWHEEL', 'PICKUP')),
  payout_delivery NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  payout_pickup NUMERIC(10,2) NOT NULL DEFAULT 175.00,
  payout_swap NUMERIC(10,2) NOT NULL DEFAULT 225.00,
  payout_dump_run NUMERIC(10,2),
  mileage_rate NUMERIC(10,4),
  toll_policy_json JSONB DEFAULT '{"reimburse": true, "max_per_run": 25.00}'::jsonb,
  minimum_payout NUMERIC(10,2),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_code, vehicle_type)
);

-- 4) Add assumed_tons_defaults_json to dump_fee_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'dump_fee_profiles' 
    AND column_name = 'assumed_tons_defaults_json'
  ) THEN
    ALTER TABLE public.dump_fee_profiles 
    ADD COLUMN assumed_tons_defaults_json JSONB DEFAULT '{
      "by_size": {"10": 1.5, "20": 3.0, "30": 4.5, "40": 6.0},
      "heavy_cap": 10.0,
      "debris_heavy_multiplier": 1.25
    }'::jsonb;
  END IF;
END $$;

-- 5) Add comparison and model fields to service_cost_estimates
ALTER TABLE public.service_cost_estimates
ADD COLUMN IF NOT EXISTS cost_model_used TEXT DEFAULT 'IN_HOUSE' CHECK (cost_model_used IN ('IN_HOUSE', 'OWNER_OPERATOR')),
ADD COLUMN IF NOT EXISTS truck_cost_breakdown_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS dump_cost_breakdown_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS comparison_json JSONB,
ADD COLUMN IF NOT EXISTS route_miles NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS alternative_model_cost NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS alternative_model_margin_pct NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS best_model TEXT CHECK (best_model IN ('IN_HOUSE', 'OWNER_OPERATOR'));

-- 6) Add recommended_action to profit_guardrail_events
ALTER TABLE public.profit_guardrail_events
ADD COLUMN IF NOT EXISTS recommended_action TEXT;

-- ========================================================
-- RLS Policies for new tables
-- ========================================================

ALTER TABLE public.vehicle_cost_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inhouse_cost_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_operator_rates ENABLE ROW LEVEL SECURITY;

-- Vehicle Cost Profiles policies
CREATE POLICY "Internal staff can view vehicle cost profiles"
ON public.vehicle_cost_profiles FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'finance', 'dispatcher', 'sales', 'cs']::app_role[])
);

CREATE POLICY "Admin/Finance can manage vehicle cost profiles"
ON public.vehicle_cost_profiles FOR ALL
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[])
);

-- In-House Cost Rates policies
CREATE POLICY "Internal staff can view inhouse rates"
ON public.inhouse_cost_rates FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'finance', 'dispatcher', 'sales', 'cs']::app_role[])
);

CREATE POLICY "Admin/Finance can manage inhouse rates"
ON public.inhouse_cost_rates FOR ALL
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[])
);

-- Owner Operator Rates policies
CREATE POLICY "Internal staff can view owner operator rates"
ON public.owner_operator_rates FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'finance', 'dispatcher', 'sales', 'cs']::app_role[])
);

CREATE POLICY "Admin/Finance can manage owner operator rates"
ON public.owner_operator_rates FOR ALL
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[])
);

-- ========================================================
-- Seed default data for East Bay market
-- ========================================================

-- Vehicle cost profiles with default models
INSERT INTO public.vehicle_cost_profiles (market_code, vehicle_type, default_cost_model)
VALUES 
  ('oakland_east_bay', 'ROLLOFF', 'IN_HOUSE'),
  ('oakland_east_bay', 'HIGHSIDE', 'OWNER_OPERATOR'),
  ('oakland_east_bay', 'END_DUMP', 'IN_HOUSE'),
  ('oakland_east_bay', 'SUPER10', 'OWNER_OPERATOR'),
  ('oakland_east_bay', 'TENWHEEL', 'IN_HOUSE'),
  ('oakland_east_bay', 'PICKUP', 'IN_HOUSE')
ON CONFLICT (market_code, vehicle_type) DO NOTHING;

-- In-house rates
INSERT INTO public.inhouse_cost_rates (market_code, vehicle_type, cost_per_hour, cost_per_mile, minimum_charge_per_run)
VALUES 
  ('oakland_east_bay', 'ROLLOFF', 85.00, 2.50, 125.00),
  ('oakland_east_bay', 'HIGHSIDE', 95.00, 2.75, 150.00),
  ('oakland_east_bay', 'END_DUMP', 90.00, 2.60, 140.00),
  ('oakland_east_bay', 'SUPER10', 80.00, 2.25, 120.00),
  ('oakland_east_bay', 'TENWHEEL', 75.00, 2.00, 110.00),
  ('oakland_east_bay', 'PICKUP', 45.00, 1.25, 75.00)
ON CONFLICT (market_code, vehicle_type) DO NOTHING;

-- Owner operator rates
INSERT INTO public.owner_operator_rates (market_code, vehicle_type, payout_delivery, payout_pickup, payout_swap, payout_dump_run, mileage_rate, minimum_payout)
VALUES 
  ('oakland_east_bay', 'ROLLOFF', 150.00, 175.00, 250.00, 125.00, 0.75, 125.00),
  ('oakland_east_bay', 'HIGHSIDE', 175.00, 200.00, 285.00, 150.00, 0.85, 150.00),
  ('oakland_east_bay', 'END_DUMP', 165.00, 190.00, 275.00, 140.00, 0.80, 140.00),
  ('oakland_east_bay', 'SUPER10', 140.00, 165.00, 235.00, 120.00, 0.70, 120.00),
  ('oakland_east_bay', 'TENWHEEL', 125.00, 150.00, 210.00, 110.00, 0.65, 110.00),
  ('oakland_east_bay', 'PICKUP', 75.00, 90.00, 125.00, 65.00, 0.40, 65.00)
ON CONFLICT (market_code, vehicle_type) DO NOTHING;

-- Update dump_fee_profiles with assumed tons defaults
UPDATE public.dump_fee_profiles
SET assumed_tons_defaults_json = '{
  "by_size": {"5": 0.75, "6": 0.9, "8": 1.2, "10": 1.5, "15": 2.25, "20": 3.0, "30": 4.5, "40": 6.0},
  "heavy_cap": 10.0,
  "debris_heavy_multiplier": 1.25
}'::jsonb
WHERE assumed_tons_defaults_json IS NULL;