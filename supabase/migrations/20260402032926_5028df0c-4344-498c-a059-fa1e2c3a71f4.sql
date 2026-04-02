
-- 1. PUBLIC PRICE CATALOG
CREATE TABLE IF NOT EXISTS public.public_price_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_version_id UUID REFERENCES public.pricing_versions(id),
  market_code TEXT NOT NULL DEFAULT 'default',
  city_slug TEXT,
  zip_code TEXT,
  service_line TEXT NOT NULL DEFAULT 'DUMPSTER_RENTAL',
  price_family TEXT NOT NULL DEFAULT 'GENERAL_DEBRIS',
  size_yd INTEGER NOT NULL,
  material_group_code TEXT,
  public_price NUMERIC NOT NULL,
  included_days INTEGER NOT NULL DEFAULT 7,
  included_tons NUMERIC NOT NULL DEFAULT 1,
  overage_rate NUMERIC NOT NULL DEFAULT 165,
  public_label TEXT NOT NULL,
  public_description TEXT,
  public_visible BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_public_price_catalog_unique 
  ON public.public_price_catalog(pricing_version_id, market_code, service_line, price_family, size_yd, COALESCE(material_group_code, '__none__'));

ALTER TABLE public.public_price_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active published catalog"
  ON public.public_price_catalog FOR SELECT
  USING (active = true AND public_visible = true);

CREATE POLICY "Staff can manage public price catalog"
  ON public.public_price_catalog FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'cs') OR public.has_role(auth.uid(), 'finance'));

-- 2. RENTAL TERM CATALOG
CREATE TABLE IF NOT EXISTS public.rental_term_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_version_id UUID REFERENCES public.pricing_versions(id),
  rental_term_code TEXT NOT NULL,
  label TEXT NOT NULL,
  included_days INTEGER NOT NULL DEFAULT 7,
  extra_day_fee NUMERIC NOT NULL DEFAULT 35,
  applies_to_sizes_json JSONB DEFAULT '[]'::jsonb,
  applies_to_material_classes_json JSONB DEFAULT '["GENERAL_DEBRIS","HEAVY_MATERIAL"]'::jsonb,
  public_visible BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rental_term_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active rental terms"
  ON public.rental_term_catalog FOR SELECT
  USING (active = true);

CREATE POLICY "Staff can manage rental terms"
  ON public.rental_term_catalog FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

-- 3. PUBLIC QUOTE DISPLAY RULES
CREATE TABLE IF NOT EXISTS public.public_quote_display_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_version_id UUID REFERENCES public.pricing_versions(id),
  show_sizes_json JSONB NOT NULL DEFAULT '[5,8,10,20,30,40,50]'::jsonb,
  show_materials_json JSONB NOT NULL DEFAULT '["GENERAL_DEBRIS","HEAVY_MATERIAL"]'::jsonb,
  show_heavy_groups_json JSONB NOT NULL DEFAULT '["CLEAN_NO_1","CLEAN_NO_2","ALL_MIXED","OTHER_HEAVY"]'::jsonb,
  show_extra_days BOOLEAN NOT NULL DEFAULT true,
  show_add_another_dumpster BOOLEAN NOT NULL DEFAULT false,
  show_swap BOOLEAN NOT NULL DEFAULT false,
  show_customer_required_dump_site BOOLEAN NOT NULL DEFAULT false,
  show_notes_field BOOLEAN NOT NULL DEFAULT true,
  display_mode TEXT NOT NULL DEFAULT 'standard',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_quote_display_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read display rules"
  ON public.public_quote_display_rules FOR SELECT
  USING (active = true);

CREATE POLICY "Admin can manage display rules"
  ON public.public_quote_display_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

-- 4. CRM CALCULATOR RULES
CREATE TABLE IF NOT EXISTS public.crm_calculator_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_version_id UUID REFERENCES public.pricing_versions(id),
  allow_multiline_quotes BOOLEAN NOT NULL DEFAULT true,
  allow_multiple_dumpsters BOOLEAN NOT NULL DEFAULT true,
  allow_swaps BOOLEAN NOT NULL DEFAULT true,
  allow_extra_days BOOLEAN NOT NULL DEFAULT true,
  allow_customer_required_dump_site BOOLEAN NOT NULL DEFAULT true,
  negotiated_price_floor NUMERIC DEFAULT 0,
  manager_approval_threshold NUMERIC DEFAULT 500,
  override_floors_json JSONB DEFAULT '{}'::jsonb,
  addendum_triggers_json JSONB DEFAULT '[]'::jsonb,
  placement_review_triggers_json JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_calculator_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read CRM calculator rules"
  ON public.crm_calculator_rules FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'cs') OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admin can manage CRM calculator rules"
  ON public.crm_calculator_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

-- 5. PRICING CHANGE LOG
CREATE TABLE IF NOT EXISTS public.pricing_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pricing_version_id UUID REFERENCES public.pricing_versions(id),
  config_area TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by_user_id UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read pricing change log"
  ON public.pricing_change_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'cs') OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Staff can insert pricing change log"
  ON public.pricing_change_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'finance'));

-- 6. Add pricing_version_id to existing tables
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pricing_extras' AND column_name = 'pricing_version_id'
  ) THEN
    ALTER TABLE public.pricing_extras ADD COLUMN pricing_version_id UUID REFERENCES public.pricing_versions(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pricing_policies' AND column_name = 'pricing_version_id'
  ) THEN
    ALTER TABLE public.pricing_policies ADD COLUMN pricing_version_id UUID REFERENCES public.pricing_versions(id);
  END IF;
END $$;

-- 7. Updated_at triggers
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_public_price_catalog') THEN
    CREATE TRIGGER set_updated_at_public_price_catalog
      BEFORE UPDATE ON public.public_price_catalog
      FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_rental_term_catalog') THEN
    CREATE TRIGGER set_updated_at_rental_term_catalog
      BEFORE UPDATE ON public.rental_term_catalog
      FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_public_quote_display_rules') THEN
    CREATE TRIGGER set_updated_at_public_quote_display_rules
      BEFORE UPDATE ON public.public_quote_display_rules
      FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_crm_calculator_rules') THEN
    CREATE TRIGGER set_updated_at_crm_calculator_rules
      BEFORE UPDATE ON public.crm_calculator_rules
      FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;

-- 8. Performance indexes
CREATE INDEX IF NOT EXISTS idx_public_price_catalog_lookup 
  ON public.public_price_catalog(market_code, service_line, price_family, size_yd, active);

CREATE INDEX IF NOT EXISTS idx_public_price_catalog_version 
  ON public.public_price_catalog(pricing_version_id);

CREATE INDEX IF NOT EXISTS idx_pricing_change_log_version 
  ON public.pricing_change_log(pricing_version_id, config_area);

CREATE INDEX IF NOT EXISTS idx_pricing_change_log_entity 
  ON public.pricing_change_log(entity_type, entity_id);
