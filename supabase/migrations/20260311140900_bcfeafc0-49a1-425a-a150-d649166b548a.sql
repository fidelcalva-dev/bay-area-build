
-- Pricing Rules: configurable cost parameters for the dynamic pricing engine
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL UNIQUE,
  description text,
  base_delivery_cost numeric NOT NULL DEFAULT 85,
  base_pickup_cost numeric NOT NULL DEFAULT 65,
  per_mile_cost numeric NOT NULL DEFAULT 2.0,
  per_mile_threshold numeric NOT NULL DEFAULT 15,
  overweight_cost_per_ton numeric NOT NULL DEFAULT 165,
  minimum_margin_percent numeric NOT NULL DEFAULT 15,
  maximum_margin_percent numeric NOT NULL DEFAULT 35,
  surge_threshold_pct numeric NOT NULL DEFAULT 85,
  surge_multiplier numeric NOT NULL DEFAULT 1.08,
  same_day_premium numeric NOT NULL DEFAULT 100,
  contamination_surcharge numeric NOT NULL DEFAULT 150,
  reroute_surcharge numeric NOT NULL DEFAULT 150,
  extra_day_fee numeric NOT NULL DEFAULT 35,
  standard_rental_days integer NOT NULL DEFAULT 7,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Default rule
INSERT INTO public.pricing_rules (rule_name, description) 
VALUES ('default', 'Default pricing rule for all markets')
ON CONFLICT (rule_name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read pricing rules"
  ON public.pricing_rules FOR SELECT TO authenticated USING (true);

-- Vendor Marketplace: fallback when no local inventory
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  contact_phone text,
  contact_email text,
  service_area_zips text[] DEFAULT '{}',
  service_cities text[] DEFAULT '{}',
  available_sizes integer[] DEFAULT '{10,20,30}',
  vendor_price_10yd numeric,
  vendor_price_20yd numeric,
  vendor_price_30yd numeric,
  vendor_price_40yd numeric,
  markup_pct numeric NOT NULL DEFAULT 35,
  reliability_score numeric DEFAULT 80,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vendors"
  ON public.vendors FOR SELECT TO authenticated USING (true);
