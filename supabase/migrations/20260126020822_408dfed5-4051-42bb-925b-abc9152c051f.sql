-- ============================================
-- HEAVY MATERIAL - TABLES AND FUNCTIONS
-- ============================================

-- 1) Create heavy_material_profiles table
CREATE TABLE IF NOT EXISTS public.heavy_material_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_code TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  display_name_es TEXT,
  density_ton_per_yd3_min NUMERIC(4,2) NOT NULL,
  density_ton_per_yd3_max NUMERIC(4,2) NOT NULL,
  recommended_fill_pct NUMERIC(3,2) NOT NULL DEFAULT 0.60,
  max_tons_cap NUMERIC(4,1) NOT NULL DEFAULT 10.0,
  green_halo_allowed BOOLEAN NOT NULL DEFAULT false,
  icon TEXT DEFAULT '🪨',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.heavy_material_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active heavy profiles" ON public.heavy_material_profiles;
CREATE POLICY "Anyone can read active heavy profiles"
ON public.heavy_material_profiles FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Staff can manage heavy profiles" ON public.heavy_material_profiles;
CREATE POLICY "Staff can manage heavy profiles"
ON public.heavy_material_profiles FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::app_role[]));

-- Populate profiles
INSERT INTO public.heavy_material_profiles (material_code, display_name, display_name_es, density_ton_per_yd3_min, density_ton_per_yd3_max, recommended_fill_pct, max_tons_cap, green_halo_allowed, icon, description, display_order) VALUES
('CONCRETE_CLEAN', 'Clean Concrete', 'Concreto Limpio', 1.20, 1.60, 0.60, 10.0, true, '🧱', 'No rebar, no trash, no soil mixed in', 1),
('ASPHALT_CLEAN', 'Clean Asphalt', 'Asfalto Limpio', 1.10, 1.50, 0.60, 10.0, true, '🛣️', 'Pure asphalt only, no dirt or debris', 2),
('SOIL_CLEAN', 'Clean Soil/Dirt', 'Tierra Limpia', 0.90, 1.20, 0.70, 10.0, true, '🌍', 'No rocks, roots, or debris mixed in', 3),
('ROCK_CLEAN', 'Clean Rock', 'Roca Limpia', 1.10, 1.80, 0.60, 10.0, true, '🪨', 'Natural rock, no soil or debris', 4),
('GRAVEL_CLEAN', 'Clean Gravel', 'Grava Limpia', 1.10, 1.60, 0.60, 10.0, true, '⚪', 'Pure gravel, no soil mixed', 5),
('GRANITE_CLEAN', 'Clean Granite', 'Granito Limpio', 1.40, 1.80, 0.60, 10.0, true, '💎', 'Granite pieces, no other materials', 6),
('BRICK_TILE_CLEAN', 'Clean Brick/Tile', 'Ladrillo/Azulejo Limpio', 1.20, 1.60, 0.60, 10.0, true, '🧱', 'No drywall, wood, or other debris', 7),
('WOOD_CLEAN', 'Clean Wood', 'Madera Limpia', 0.10, 0.30, 1.00, 10.0, true, '🪵', 'Untreated wood, no paint or finishes', 8),
('GRASS_CLEAN', 'Clean Grass/Yard Waste', 'Césped/Residuos de Jardín', 0.10, 0.25, 1.00, 10.0, true, '🌿', 'Grass, leaves, branches only', 9),
('WOOD_CHIPS_CLEAN', 'Clean Wood Chips', 'Astillas de Madera', 0.15, 0.30, 1.00, 10.0, true, '🌲', 'Wood chips and mulch only', 10),
('MIXED_HEAVY', 'Mixed Heavy Materials', 'Materiales Pesados Mezclados', 0.80, 1.40, 0.50, 10.0, false, '⚠️', 'Multiple heavy materials mixed - NO Green Halo', 11)
ON CONFLICT (material_code) DO NOTHING;

-- 2) Create heavy_weight_rules table
CREATE TABLE IF NOT EXISTS public.heavy_weight_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_yd INTEGER NOT NULL CHECK (size_yd IN (5, 6, 8, 10)),
  material_code TEXT NOT NULL,
  fill_line_pct NUMERIC(3,2) NOT NULL,
  estimated_weight_min_tons NUMERIC(5,2) NOT NULL,
  estimated_weight_max_tons NUMERIC(5,2) NOT NULL,
  allow_full_fill BOOLEAN NOT NULL DEFAULT false,
  hard_stop_over_tons BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(size_yd, material_code)
);

ALTER TABLE public.heavy_weight_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active weight rules" ON public.heavy_weight_rules;
CREATE POLICY "Anyone can read active weight rules"
ON public.heavy_weight_rules FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admin can manage weight rules" ON public.heavy_weight_rules;
CREATE POLICY "Admin can manage weight rules"
ON public.heavy_weight_rules FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::app_role[]));

-- Populate weight rules
INSERT INTO public.heavy_weight_rules (size_yd, material_code, fill_line_pct, estimated_weight_min_tons, estimated_weight_max_tons, allow_full_fill)
SELECT 
  s.size_yd,
  p.material_code,
  p.recommended_fill_pct,
  ROUND((s.size_yd * p.recommended_fill_pct * p.density_ton_per_yd3_min)::numeric, 2),
  ROUND((s.size_yd * p.recommended_fill_pct * p.density_ton_per_yd3_max)::numeric, 2),
  p.material_code IN ('WOOD_CLEAN', 'GRASS_CLEAN', 'WOOD_CHIPS_CLEAN')
FROM (VALUES (5), (6), (8), (10)) AS s(size_yd)
CROSS JOIN public.heavy_material_profiles p
ON CONFLICT (size_yd, material_code) DO NOTHING;

-- 3) Create view for heavy risk monitoring
CREATE OR REPLACE VIEW public.heavy_risk_orders_vw AS
SELECT 
  o.id as order_id,
  q.customer_name,
  q.customer_phone,
  q.delivery_address,
  o.status,
  o.is_heavy_material,
  o.heavy_material_code,
  o.requested_green_halo,
  o.estimated_fill_pct,
  o.estimated_weight_tons_min,
  o.estimated_weight_tons_max,
  o.weight_risk_level,
  o.requires_fill_line,
  o.requires_pre_pickup_photos,
  o.contamination_detected,
  o.reclassified_to_debris,
  o.actual_weight_tons,
  o.included_tons_for_size,
  o.extra_tons_charged,
  o.created_at
FROM public.orders o
JOIN public.quotes q ON q.id = o.quote_id
WHERE COALESCE(o.is_heavy_material, false) = true
ORDER BY 
  CASE o.weight_risk_level WHEN 'HIGH' THEN 1 WHEN 'MED' THEN 2 ELSE 3 END,
  o.created_at DESC;

-- 4) Create function to estimate heavy weight
CREATE OR REPLACE FUNCTION public.estimate_heavy_weight(
  p_size_yd INTEGER,
  p_material_code TEXT,
  p_fill_pct NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  volume_effective NUMERIC,
  weight_min_tons NUMERIC,
  weight_max_tons NUMERIC,
  risk_level TEXT,
  recommended_fill_pct NUMERIC,
  allow_full_fill BOOLEAN,
  green_halo_allowed BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile heavy_material_profiles%ROWTYPE;
  v_fill NUMERIC;
  v_volume NUMERIC;
  v_min NUMERIC;
  v_max NUMERIC;
  v_risk TEXT;
BEGIN
  SELECT * INTO v_profile
  FROM public.heavy_material_profiles
  WHERE material_code = p_material_code AND is_active = true;
  
  IF v_profile IS NULL THEN
    RAISE EXCEPTION 'Material profile not found: %', p_material_code;
  END IF;
  
  v_fill := COALESCE(p_fill_pct, v_profile.recommended_fill_pct);
  v_volume := p_size_yd * v_fill;
  v_min := ROUND((v_volume * v_profile.density_ton_per_yd3_min)::numeric, 2);
  v_max := ROUND((v_volume * v_profile.density_ton_per_yd3_max)::numeric, 2);
  
  IF v_max > 10 THEN v_risk := 'HIGH';
  ELSIF v_min > 9 OR v_max > 9 THEN v_risk := 'MED';
  ELSE v_risk := 'LOW';
  END IF;
  
  RETURN QUERY SELECT 
    v_volume, v_min, v_max, v_risk, v_profile.recommended_fill_pct,
    p_material_code IN ('WOOD_CLEAN', 'GRASS_CLEAN', 'WOOD_CHIPS_CLEAN'),
    v_profile.green_halo_allowed;
END;
$$;

-- 5) Create function to mark contamination
CREATE OR REPLACE FUNCTION public.mark_order_contaminated(
  p_order_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders SET
    contamination_detected = true,
    contamination_detected_at = now(),
    contamination_notes = p_notes,
    reclassified_to_debris = true,
    reclassified_at = now()
  WHERE id = p_order_id;
  
  INSERT INTO public.alerts (entity_type, entity_id, alert_type, severity, title, message, metadata)
  VALUES ('order', p_order_id::text, 'CONTAMINATION_DETECTED', 'warn',
    'Heavy Material Contamination Detected',
    'Order reclassified from heavy clean to mixed debris. Extra ton billing applies.',
    jsonb_build_object('order_id', p_order_id, 'notes', p_notes));
  
  RETURN true;
END;
$$;

-- 6) Create trigger to auto-populate heavy fields from quote
CREATE OR REPLACE FUNCTION public.auto_populate_heavy_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote quotes%ROWTYPE;
BEGIN
  IF NEW.quote_id IS NOT NULL THEN
    SELECT * INTO v_quote FROM public.quotes WHERE id = NEW.quote_id;
    IF v_quote IS NOT NULL THEN
      NEW.is_heavy_material := COALESCE(v_quote.is_heavy_material, false);
      NEW.heavy_material_code := v_quote.heavy_material_code;
      NEW.requested_green_halo := COALESCE(v_quote.requested_green_halo, false);
      NEW.estimated_fill_pct := v_quote.estimated_fill_pct;
      NEW.estimated_weight_tons_min := v_quote.estimated_weight_tons_min;
      NEW.estimated_weight_tons_max := v_quote.estimated_weight_tons_max;
      NEW.weight_risk_level := v_quote.weight_risk_level;
      NEW.requires_fill_line := COALESCE(v_quote.requires_fill_line, false);
      NEW.requires_pre_pickup_photos := COALESCE(v_quote.requires_pre_pickup_photos, false);
      NEW.reclassify_on_contamination := COALESCE(v_quote.reclassify_on_contamination, true);
      
      IF NEW.is_heavy_material THEN
        NEW.included_tons_for_size := CASE v_quote.size_value
          WHEN 5 THEN 0.50 WHEN 6 THEN 0.60 WHEN 8 THEN 0.80 WHEN 10 THEN 1.00 ELSE 1.00
        END;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_populate_heavy_fields_trigger ON public.orders;
CREATE TRIGGER auto_populate_heavy_fields_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.auto_populate_heavy_fields();