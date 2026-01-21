-- =====================================================
-- v58 PRICING SYSTEM - COMPLETE DATA TABLES
-- =====================================================

-- Toll Surcharge Rules (v58 core feature)
CREATE TABLE public.toll_surcharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.pricing_zones(id),
  origin_yard_id uuid REFERENCES public.yards(id),
  surcharge_amount numeric NOT NULL DEFAULT 0,
  description text,
  applies_to_delivery boolean NOT NULL DEFAULT true,
  applies_to_pickup boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.toll_surcharges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage toll surcharges"
ON public.toll_surcharges FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active toll surcharges"
ON public.toll_surcharges FOR SELECT
USING (is_active = true);

-- City Rates Table (extra ton rates per city/zone)
CREATE TABLE public.city_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.pricing_zones(id),
  city_name text NOT NULL,
  extra_ton_rate_standard numeric NOT NULL DEFAULT 165,
  prepay_discount_pct numeric NOT NULL DEFAULT 0.05,
  extra_ton_rate_prepay numeric GENERATED ALWAYS AS (extra_ton_rate_standard * (1 - prepay_discount_pct)) STORED,
  heavy_base_10yd numeric NOT NULL DEFAULT 638,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.city_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage city rates"
ON public.city_rates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active city rates"
ON public.city_rates FOR SELECT
USING (is_active = true);

-- Heavy Material Increments
CREATE TABLE public.heavy_material_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_class text NOT NULL, -- 'heavy_clean', 'heavy_mixed'
  material_list text[] NOT NULL DEFAULT '{}',
  increment_amount numeric NOT NULL DEFAULT 0,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.heavy_material_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage heavy rules"
ON public.heavy_material_rules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active heavy rules"
ON public.heavy_material_rules FOR SELECT
USING (is_active = true);

-- Insert default heavy material rules
INSERT INTO public.heavy_material_rules (material_class, material_list, increment_amount, description, display_order) VALUES
('heavy_clean', ARRAY['brick', 'asphalt', 'roofing_gravel', 'tile', 'rock', 'stone', 'granite', 'concrete'], 200, 'Heavy Clean +$200', 1),
('heavy_mixed', ARRAY['heavy_mixed'], 300, 'Heavy Mixed +$300 (mixing base heavy materials)', 2);

-- Size Volume Factors (for heavy pricing proportional)
CREATE TABLE public.size_volume_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  size_yards integer NOT NULL UNIQUE,
  volume_factor numeric NOT NULL DEFAULT 1.0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.size_volume_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view size factors"
ON public.size_volume_factors FOR SELECT USING (true);

CREATE POLICY "Admins can manage size factors"
ON public.size_volume_factors FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default size factors
INSERT INTO public.size_volume_factors (size_yards, volume_factor) VALUES
(6, 0.6),
(8, 0.8),
(10, 1.0);

-- Zip Warnings (for special handling)
CREATE TABLE public.zip_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text NOT NULL,
  warning_type text NOT NULL, -- 'distance_cap', 'service_unavailable', 'special_approval'
  warning_message text NOT NULL,
  max_distance_miles numeric,
  requires_approval boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.zip_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active warnings"
ON public.zip_warnings FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage warnings"
ON public.zip_warnings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Drivers/Owner Operators Table
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  license_number text,
  truck_type text,
  is_owner_operator boolean NOT NULL DEFAULT false,
  assigned_yard_id uuid REFERENCES public.yards(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view drivers"
ON public.drivers FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin', 'dispatcher']::app_role[]));

CREATE POLICY "Admins can manage drivers"
ON public.drivers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add toll_surcharge column to quotes if not exists
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS toll_surcharge numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS city_rate_id uuid,
ADD COLUMN IF NOT EXISTS driver_id uuid;

-- Add driver assignment to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS driver_notes_internal text,
ADD COLUMN IF NOT EXISTS route_notes text,
ADD COLUMN IF NOT EXISTS text_before_arrival boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivery_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pickup_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pickup_completed_at timestamp with time zone;

-- Add driver role to app_role enum if needed
-- Note: This is handled by checking if value exists first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'driver' AND enumtypid = 'app_role'::regtype) THEN
    ALTER TYPE app_role ADD VALUE 'driver';
  END IF;
END$$;