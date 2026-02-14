
-- ============================================================
-- DYNAMIC EXTRAS CATALOG + PRICING RULES ENGINE
-- ============================================================

-- 1) Evolve extra_catalog with new columns
ALTER TABLE public.extra_catalog
  ADD COLUMN IF NOT EXISTS pricing_model text NOT NULL DEFAULT 'FIXED'
    CHECK (pricing_model IN ('FIXED','PER_ZONE','PER_SIZE','PER_ZONE_AND_SIZE','FORMULA','PENDING')),
  ADD COLUMN IF NOT EXISTS applies_to_material text NOT NULL DEFAULT 'ALL'
    CHECK (applies_to_material IN ('ALL','GENERAL','HEAVY','GREEN')),
  ADD COLUMN IF NOT EXISTS applies_to_sizes_json jsonb,
  ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS formula_expression text,
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'standard';

-- Drop old requires_pricing if it exists (replaced by pricing_model=PENDING)
-- Keep it for backward compat, just rename semantics

-- 2) extra_pricing_rules — zone/size/material-specific pricing
CREATE TABLE public.extra_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_id uuid NOT NULL REFERENCES public.extra_catalog(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.pricing_zones(id),
  size_yd int,
  material_type text,
  price numeric NOT NULL,
  margin_percent numeric,
  vendor_cost numeric,
  vendor_id uuid REFERENCES public.vendors(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.extra_pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read extra_pricing_rules" ON public.extra_pricing_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage extra_pricing_rules" ON public.extra_pricing_rules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_epr_extra ON public.extra_pricing_rules(extra_id);
CREATE INDEX idx_epr_zone ON public.extra_pricing_rules(zone_id);
CREATE INDEX idx_epr_lookup ON public.extra_pricing_rules(extra_id, zone_id, size_yd, material_type);

-- 3) pricing_override_log — audit trail for manual price overrides
CREATE TABLE public.pricing_override_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  cart_id uuid REFERENCES public.order_carts(id),
  user_id uuid NOT NULL,
  item_id uuid,
  extra_code text,
  original_price numeric NOT NULL,
  new_price numeric NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_override_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read pricing overrides" ON public.pricing_override_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Staff can log overrides" ON public.pricing_override_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));

CREATE INDEX idx_pol_cart ON public.pricing_override_log(cart_id);
CREATE INDEX idx_pol_order ON public.pricing_override_log(order_id);

-- 4) Update existing extras with new fields + add new extras
UPDATE public.extra_catalog SET pricing_model = 'PER_ZONE' WHERE code = 'EXTRA_DAY';
UPDATE public.extra_catalog SET pricing_model = 'PER_ZONE', applies_to_material = 'GENERAL', code = 'EXTRA_TON' WHERE code = 'EXTRA_TON';
UPDATE public.extra_catalog SET pricing_model = 'PER_ZONE_AND_SIZE' WHERE code = 'SWAP';
UPDATE public.extra_catalog SET pricing_model = 'FIXED' WHERE code = 'LOCK';
UPDATE public.extra_catalog SET pricing_model = 'FIXED' WHERE code = 'PLYWOOD';
UPDATE public.extra_catalog SET pricing_model = 'PENDING', requires_approval = true WHERE code = 'PERMIT_ASSIST';
UPDATE public.extra_catalog SET pricing_model = 'FIXED', requires_approval = true WHERE code = 'RUSH_FEE';
UPDATE public.extra_catalog SET pricing_model = 'FIXED' WHERE code = 'WALKWAY_PROTECTION';

-- Add new extras
INSERT INTO public.extra_catalog (code, name, description, unit, default_price, pricing_model, applies_to_material, requires_approval, display_order, formula_expression, category) VALUES
  ('EXTRA_TON_HEAVY', 'Extra Tonnage (Heavy)', 'Additional ton for heavy/inert materials', 'ton', 165, 'PER_ZONE', 'HEAVY', false, 9, NULL, 'tonnage'),
  ('AFTER_HOURS_DELIVERY', 'After-Hours Delivery', '15% surcharge for delivery outside business hours', 'percent', NULL, 'FORMULA', 'ALL', false, 10, 'base_price * 0.15', 'surcharge'),
  ('DRY_RUN_TRIP', 'Dry Run Trip', 'Charge for unsuccessful delivery attempt', 'flat', NULL, 'PER_ZONE_AND_SIZE', 'ALL', false, 11, NULL, 'service'),
  ('CONTAMINATION_FEE', 'Contamination Fee', '25% surcharge for contaminated heavy loads', 'percent', NULL, 'FORMULA', 'HEAVY', false, 12, 'total * 0.25', 'penalty')
ON CONFLICT (code) DO NOTHING;

-- Update categories on existing
UPDATE public.extra_catalog SET category = 'rental' WHERE code IN ('EXTRA_DAY');
UPDATE public.extra_catalog SET category = 'tonnage' WHERE code IN ('EXTRA_TON');
UPDATE public.extra_catalog SET category = 'service' WHERE code IN ('SWAP', 'PERMIT_ASSIST', 'RUSH_FEE');
UPDATE public.extra_catalog SET category = 'equipment' WHERE code IN ('LOCK', 'PLYWOOD', 'WALKWAY_PROTECTION');
