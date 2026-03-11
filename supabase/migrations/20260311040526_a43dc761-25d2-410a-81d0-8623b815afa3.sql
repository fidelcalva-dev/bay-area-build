-- ============================================================
-- MASTER DUMPSTER PRICING TABLE
-- Canonical source of truth for all pricing across the platform
-- ============================================================

CREATE TABLE public.dumpster_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  size_yd INTEGER NOT NULL,
  material_type TEXT NOT NULL DEFAULT 'general',
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  pickup_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  rental_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  dump_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (delivery_fee + pickup_fee + rental_fee + dump_fee) STORED,
  included_tons NUMERIC(4,2) NOT NULL DEFAULT 0,
  overweight_fee_per_ton NUMERIC(10,2) NOT NULL DEFAULT 165.00,
  contamination_surcharge NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  included_days INTEGER NOT NULL DEFAULT 7,
  extra_day_fee NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  is_heavy_only BOOLEAN NOT NULL DEFAULT false,
  allowed_materials TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(size_yd, material_type)
);

-- Add constraint: heavy materials only 5, 8, 10
CREATE OR REPLACE FUNCTION public.validate_dumpster_pricing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Heavy materials restricted to 5, 8, 10 yard
  IF NEW.material_type = 'heavy' AND NEW.size_yd NOT IN (5, 8, 10) THEN
    RAISE EXCEPTION 'Heavy materials only allow 5, 8, and 10 yard dumpsters';
  END IF;
  
  -- Auto-set updated_at
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_dumpster_pricing
  BEFORE INSERT OR UPDATE ON public.dumpster_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_dumpster_pricing();

-- RLS
ALTER TABLE public.dumpster_pricing ENABLE ROW LEVEL SECURITY;

-- Public read for website pricing
CREATE POLICY "Anyone can read active pricing"
  ON public.dumpster_pricing
  FOR SELECT
  USING (is_active = true);

-- Admin write via has_role
CREATE POLICY "Admins can manage pricing"
  ON public.dumpster_pricing
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_dumpster_pricing_size_material ON public.dumpster_pricing(size_yd, material_type);
CREATE INDEX idx_dumpster_pricing_active ON public.dumpster_pricing(is_active) WHERE is_active = true;

COMMENT ON TABLE public.dumpster_pricing IS 'Canonical master pricing table — single source of truth for all dumpster pricing across website, CRM, quotes, invoices, and contracts';