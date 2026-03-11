
-- ============================================================
-- PHASE 2: NORMALIZE CANONICAL PRICING TABLES
-- ============================================================

-- 1. Extend yards table with operational pricing fields
ALTER TABLE public.yards
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'CA',
  ADD COLUMN IF NOT EXISTS zip TEXT,
  ADD COLUMN IF NOT EXISTS service_radius_miles NUMERIC(5,1) NOT NULL DEFAULT 30.0,
  ADD COLUMN IF NOT EXISTS base_delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  ADD COLUMN IF NOT EXISTS base_pickup_fee NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  ADD COLUMN IF NOT EXISTS base_fuel_cost NUMERIC(10,2) NOT NULL DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS base_labor_cost NUMERIC(10,2) NOT NULL DEFAULT 80.00,
  ADD COLUMN IF NOT EXISTS overhead_pct NUMERIC(5,2) NOT NULL DEFAULT 8.00;

-- 2. Extend disposal_sites with pricing/acceptance fields
ALTER TABLE public.disposal_sites
  ADD COLUMN IF NOT EXISTS dump_fee_per_ton NUMERIC(10,2) NOT NULL DEFAULT 115.00,
  ADD COLUMN IF NOT EXISTS flat_rate_json JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS clean_only_flag BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mixed_allowed_flag BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS green_halo_supported_flag BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contamination_surcharge NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  ADD COLUMN IF NOT EXISTS reroute_surcharge NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  ADD COLUMN IF NOT EXISTS service_radius_miles NUMERIC(5,1) DEFAULT NULL;

-- 3. Extend pricing_zones with location-aware fields
ALTER TABLE public.pricing_zones
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS county TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'CA',
  ADD COLUMN IF NOT EXISTS yard_id UUID REFERENCES public.yards(id),
  ADD COLUMN IF NOT EXISTS delivery_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pickup_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fuel_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0;

-- 4. Create material_rules table — canonical material pricing modes
CREATE TABLE IF NOT EXISTS public.material_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_class TEXT NOT NULL UNIQUE,
  display_label TEXT NOT NULL,
  display_label_es TEXT,
  is_heavy BOOLEAN NOT NULL DEFAULT false,
  allowed_sizes INTEGER[] NOT NULL DEFAULT '{5,8,10,20,30,40,50}',
  pricing_mode TEXT NOT NULL DEFAULT 'included_tons',  -- included_tons | flat_rate | manual_review
  included_tons_json JSONB DEFAULT '{"5":0.5,"8":0.5,"10":1,"20":2,"30":3,"40":4,"50":5}',
  overweight_fee_per_ton NUMERIC(10,2) NOT NULL DEFAULT 165.00,
  flat_rate_json JSONB DEFAULT '{}',
  contamination_policy TEXT DEFAULT 'Additional disposal costs plus a $150 surcharge may apply.',
  reroute_policy TEXT DEFAULT 'Additional costs plus a $150 reroute surcharge may apply.',
  requires_clean_load BOOLEAN NOT NULL DEFAULT false,
  green_halo_eligible BOOLEAN NOT NULL DEFAULT false,
  public_warning TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for material_rules
ALTER TABLE public.material_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active material rules"
  ON public.material_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage material rules"
  ON public.material_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_material_rules_class ON public.material_rules(material_class);
CREATE INDEX IF NOT EXISTS idx_yards_active ON public.yards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_disposal_sites_active ON public.disposal_sites(is_active) WHERE is_active = true;
