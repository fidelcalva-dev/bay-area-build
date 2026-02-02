-- ============================================================
-- MARKET PRICING AUTO-SEED TABLES
-- ============================================================

-- 1) market_templates - Default pricing templates for new markets
CREATE TABLE public.market_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_included_tons_json JSONB NOT NULL DEFAULT '{"10": 1.0, "20": 2.0, "30": 3.0, "40": 4.0, "50": 5.0}'::jsonb,
  default_days_included INTEGER NOT NULL DEFAULT 7,
  default_extra_ton_rate NUMERIC(10,2) NOT NULL DEFAULT 165.00,
  default_overdue_daily_rate NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  default_core_markup_pct NUMERIC(5,2) NOT NULL DEFAULT 6.00,
  default_premium_markup_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  default_service_fee_by_size_json JSONB DEFAULT '{"10": 285, "20": 340, "30": 395, "40": 450, "50": 520}'::jsonb,
  default_same_day_fee NUMERIC(10,2) DEFAULT 75.00,
  heavy_base_prices_json JSONB DEFAULT '{"5": 395, "6": 445, "8": 535, "10": 625}'::jsonb,
  green_halo_prices_json JSONB DEFAULT '{"5": 325, "6": 365, "8": 435, "10": 495}'::jsonb,
  heavy_max_tons NUMERIC(5,2) DEFAULT 10.00,
  heavy_included_days INTEGER DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) market_onboarding - Tracks new market setup status
CREATE TABLE public.market_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_code TEXT NOT NULL UNIQUE,
  market_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  yard_id UUID REFERENCES public.yards(id),
  template_id UUID REFERENCES public.market_templates(id),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SEEDED', 'REVIEWED', 'LIVE_READY', 'ACTIVE')),
  facilities_config_json JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_by UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) market_price_versions - Version control for market pricing
CREATE TABLE public.market_price_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_code TEXT NOT NULL,
  version_label TEXT NOT NULL DEFAULT 'v1',
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
  pricing_snapshot_json JSONB,
  notes TEXT,
  created_by UUID,
  activated_by UUID,
  activated_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_code, version_label)
);

-- 4) market_price_adjustments - Market-specific % adjustments
CREATE TABLE public.market_price_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_code TEXT NOT NULL,
  applies_to TEXT NOT NULL CHECK (applies_to IN ('STANDARD_DEBRIS', 'GREEN_WASTE', 'HEAVY_BASE', 'GREEN_HALO', 'ALL')),
  adjustment_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_price_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_price_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin access only
CREATE POLICY "Admin read market_templates" ON public.market_templates
  FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[]));

CREATE POLICY "Admin write market_templates" ON public.market_templates
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Admin read market_onboarding" ON public.market_onboarding
  FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'sales']::app_role[]));

CREATE POLICY "Admin write market_onboarding" ON public.market_onboarding
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Admin read market_price_versions" ON public.market_price_versions
  FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[]));

CREATE POLICY "Admin write market_price_versions" ON public.market_price_versions
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Admin read market_price_adjustments" ON public.market_price_adjustments
  FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[]));

CREATE POLICY "Admin write market_price_adjustments" ON public.market_price_adjustments
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- Update triggers
CREATE TRIGGER update_market_templates_updated_at
  BEFORE UPDATE ON public.market_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_onboarding_updated_at
  BEFORE UPDATE ON public.market_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_price_versions_updated_at
  BEFORE UPDATE ON public.market_price_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_price_adjustments_updated_at
  BEFORE UPDATE ON public.market_price_adjustments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default template (East Bay base)
INSERT INTO public.market_templates (
  template_name,
  description,
  default_included_tons_json,
  default_days_included,
  default_extra_ton_rate,
  default_overdue_daily_rate,
  default_core_markup_pct,
  default_premium_markup_pct,
  default_service_fee_by_size_json,
  heavy_base_prices_json,
  green_halo_prices_json
) VALUES (
  'EAST_BAY_BASE_TEMPLATE',
  'Standard template based on Oakland/East Bay pricing model',
  '{"10": 1.0, "20": 2.0, "30": 3.0, "40": 4.0, "50": 5.0}'::jsonb,
  7,
  165.00,
  35.00,
  6.00,
  15.00,
  '{"10": 285, "20": 340, "30": 395, "40": 450, "50": 520}'::jsonb,
  '{"5": 395, "6": 445, "8": 535, "10": 625}'::jsonb,
  '{"5": 325, "6": 365, "8": 435, "10": 495}'::jsonb
);

-- Add index for lookups
CREATE INDEX idx_market_onboarding_status ON public.market_onboarding(status);
CREATE INDEX idx_market_price_versions_market_status ON public.market_price_versions(market_code, status);
CREATE INDEX idx_market_price_adjustments_market ON public.market_price_adjustments(market_code, is_active);