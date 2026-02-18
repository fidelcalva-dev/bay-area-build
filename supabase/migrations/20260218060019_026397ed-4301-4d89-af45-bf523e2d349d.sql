
-- ============================
-- PHASE 1: DISPOSAL COST ENGINE TABLES
-- ============================

-- 1. disposal_sites — certified disposal/recycling facilities
CREATE TABLE public.disposal_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'transfer_station' CHECK (type IN ('transfer_station', 'recycling', 'landfill', 'composting')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  materials_accepted TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  compliance_rating SMALLINT DEFAULT 3 CHECK (compliance_rating BETWEEN 1 AND 5),
  typical_wait_time_min INTEGER DEFAULT 20,
  ticket_required BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  hours TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.disposal_sites ENABLE ROW LEVEL SECURITY;

-- Staff can read
CREATE POLICY "Staff can read disposal_sites"
  ON public.disposal_sites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'dispatcher', 'sales', 'cs', 'finance', 'driver')
  ));

-- Admin can manage
CREATE POLICY "Admin can manage disposal_sites"
  ON public.disposal_sites FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  ));

-- 2. disposal_rates — per-material rates at each site
CREATE TABLE public.disposal_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disposal_site_id UUID NOT NULL REFERENCES public.disposal_sites(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL,
  price_per_ton NUMERIC(10,2),
  flat_fee NUMERIC(10,2),
  minimum_fee NUMERIC(10,2),
  last_verified_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'phone', 'website')),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.disposal_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read disposal_rates"
  ON public.disposal_rates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'dispatcher', 'sales', 'cs', 'finance')
  ));

CREATE POLICY "Admin can manage disposal_rates"
  ON public.disposal_rates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  ));

-- 3. material_weight_reference — weight/density per material
CREATE TABLE public.material_weight_reference (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_name TEXT NOT NULL UNIQUE,
  estimated_weight_per_cubic_yard NUMERIC(10,2) NOT NULL,
  weight_range_min NUMERIC(10,2),
  weight_range_max NUMERIC(10,2),
  typical_density_class TEXT NOT NULL DEFAULT 'medium' CHECK (typical_density_class IN ('light', 'medium', 'heavy')),
  allowed_in_general BOOLEAN NOT NULL DEFAULT true,
  requires_separation BOOLEAN NOT NULL DEFAULT false,
  heavy_only BOOLEAN NOT NULL DEFAULT false,
  max_dumpster_size INTEGER,
  fill_line_pct INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.material_weight_reference ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read reference data
CREATE POLICY "Authenticated users can read material_weight_reference"
  ON public.material_weight_reference FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage material_weight_reference"
  ON public.material_weight_reference FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  ));

-- 4. yard_disposal_config — per-yard defaults (Phase 9)
CREATE TABLE public.yard_disposal_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  yard_id UUID NOT NULL REFERENCES public.yards(id) ON DELETE CASCADE,
  default_disposal_site_ids UUID[] DEFAULT '{}',
  markup_pct NUMERIC(5,2) DEFAULT 0,
  fuel_cost_per_mile NUMERIC(5,2) DEFAULT 3.50,
  labor_hourly_rate NUMERIC(7,2) DEFAULT 55.00,
  overhead_factor NUMERIC(5,2) DEFAULT 1.15,
  min_margin_pct NUMERIC(5,2) DEFAULT 20.00,
  compliance_mode BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(yard_id)
);

ALTER TABLE public.yard_disposal_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read yard_disposal_config"
  ON public.yard_disposal_config FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'dispatcher', 'sales', 'cs', 'finance')
  ));

CREATE POLICY "Admin can manage yard_disposal_config"
  ON public.yard_disposal_config FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  ));

-- Seed material weight reference data
INSERT INTO public.material_weight_reference (material_name, estimated_weight_per_cubic_yard, weight_range_min, weight_range_max, typical_density_class, allowed_in_general, requires_separation, heavy_only, max_dumpster_size, fill_line_pct)
VALUES
  ('Concrete', 2250, 2000, 2500, 'heavy', false, true, true, 10, 60),
  ('Dirt / Soil', 2200, 2000, 2400, 'heavy', false, true, true, 10, 60),
  ('Asphalt', 2100, 1800, 2400, 'heavy', false, true, true, 10, 60),
  ('Brick', 1800, 1500, 2100, 'heavy', false, true, true, 10, 60),
  ('Mixed C&D', 400, 300, 500, 'medium', true, false, false, NULL, NULL),
  ('Green Waste', 225, 150, 300, 'light', true, false, false, NULL, NULL),
  ('Roofing Shingles', 325, 250, 400, 'medium', true, false, false, NULL, NULL),
  ('Drywall', 250, 200, 300, 'light', true, false, false, NULL, NULL),
  ('Wood (Clean)', 200, 150, 250, 'light', true, false, false, NULL, NULL),
  ('Metal / Scrap', 600, 400, 800, 'medium', false, true, false, 20, NULL),
  ('Cardboard / Paper', 100, 50, 150, 'light', true, false, false, NULL, NULL),
  ('General Household', 150, 100, 200, 'light', true, false, false, NULL, NULL);

-- Triggers for updated_at
CREATE TRIGGER update_disposal_sites_updated_at
  BEFORE UPDATE ON public.disposal_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disposal_rates_updated_at
  BEFORE UPDATE ON public.disposal_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_material_weight_reference_updated_at
  BEFORE UPDATE ON public.material_weight_reference
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yard_disposal_config_updated_at
  BEFORE UPDATE ON public.yard_disposal_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
