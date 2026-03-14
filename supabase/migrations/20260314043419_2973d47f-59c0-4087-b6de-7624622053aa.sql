
-- ============================================================
-- ZONE SURCHARGES TABLE
-- Defines pricing zones per yard with distance bands
-- ============================================================
CREATE TABLE IF NOT EXISTS public.zone_surcharges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  yard_id UUID REFERENCES public.yards(id) ON DELETE CASCADE NOT NULL,
  miles_from_yard_min NUMERIC(6,2) NOT NULL DEFAULT 0,
  miles_from_yard_max NUMERIC(6,2),
  quote_surcharge NUMERIC(8,2) NOT NULL DEFAULT 0,
  dispatch_cost_adjustment NUMERIC(8,2) NOT NULL DEFAULT 0,
  remote_area_flag BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(yard_id, zone_name)
);

ALTER TABLE public.zone_surcharges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read zone_surcharges"
  ON public.zone_surcharges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage zone_surcharges"
  ON public.zone_surcharges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- RUSH DELIVERY CONFIG TABLE
-- Per-yard rush delivery settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rush_delivery_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yard_id UUID REFERENCES public.yards(id) ON DELETE CASCADE NOT NULL,
  allow_same_day BOOLEAN NOT NULL DEFAULT true,
  same_day_cutoff_hour INT NOT NULL DEFAULT 10,
  next_day_cutoff_hour INT NOT NULL DEFAULT 16,
  daily_capacity INT NOT NULL DEFAULT 8,
  rush_fee_same_day NUMERIC(8,2) NOT NULL DEFAULT 100,
  rush_fee_next_day NUMERIC(8,2) NOT NULL DEFAULT 0,
  rush_fee_priority NUMERIC(8,2) NOT NULL DEFAULT 75,
  rush_fee_after_hours NUMERIC(8,2) NOT NULL DEFAULT 150,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(yard_id)
);

ALTER TABLE public.rush_delivery_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read rush_delivery_config"
  ON public.rush_delivery_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage rush_delivery_config"
  ON public.rush_delivery_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- CONTRACTOR PRICING RULES TABLE
-- Tier-based contractor discounts and overrides
-- ============================================================
CREATE TYPE public.contractor_tier AS ENUM ('RETAIL', 'CONTRACTOR_TIER_1', 'CONTRACTOR_TIER_2', 'COMMERCIAL_ACCOUNT', 'MANUAL_RATE_CARD');

CREATE TABLE IF NOT EXISTS public.contractor_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name public.contractor_tier NOT NULL,
  size_yd INT,
  material_class TEXT,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  base_override NUMERIC(8,2),
  included_tons_override NUMERIC(5,2),
  zone_surcharge_behavior TEXT NOT NULL DEFAULT 'apply',
  rush_fee_behavior TEXT NOT NULL DEFAULT 'apply',
  minimum_margin_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contractor_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read contractor_pricing_rules"
  ON public.contractor_pricing_rules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage contractor_pricing_rules"
  ON public.contractor_pricing_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- CONTRACTOR ACCOUNTS TABLE
-- Approved contractor accounts with tier assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contractor_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  pricing_tier public.contractor_tier NOT NULL DEFAULT 'RETAIL',
  monthly_volume_estimate INT,
  preferred_sizes INT[],
  common_materials TEXT[],
  payment_terms TEXT DEFAULT 'net_0',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contractor_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read contractor_accounts"
  ON public.contractor_accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage contractor_accounts"
  ON public.contractor_accounts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- SEED DEFAULT ZONE SURCHARGES
-- ============================================================
INSERT INTO public.zone_surcharges (zone_name, yard_id, miles_from_yard_min, miles_from_yard_max, quote_surcharge, dispatch_cost_adjustment, remote_area_flag, display_order)
SELECT 'Zone A - Local', id, 0, 5, 0, 0, false, 1 FROM public.yards WHERE is_active = true
UNION ALL
SELECT 'Zone B - Near', id, 5, 10, 25, 15, false, 2 FROM public.yards WHERE is_active = true
UNION ALL
SELECT 'Zone C - Standard', id, 10, 15, 50, 30, false, 3 FROM public.yards WHERE is_active = true
UNION ALL
SELECT 'Zone D - Extended', id, 15, 25, 75, 50, false, 4 FROM public.yards WHERE is_active = true
UNION ALL
SELECT 'Zone E - Remote', id, 25, NULL, 100, 75, true, 5 FROM public.yards WHERE is_active = true
ON CONFLICT (yard_id, zone_name) DO NOTHING;

-- ============================================================
-- SEED DEFAULT RUSH DELIVERY CONFIG
-- ============================================================
INSERT INTO public.rush_delivery_config (yard_id, allow_same_day, same_day_cutoff_hour, next_day_cutoff_hour, daily_capacity, rush_fee_same_day, rush_fee_next_day, rush_fee_priority, rush_fee_after_hours)
SELECT id, true, 10, 16, 8, 100, 0, 75, 150 FROM public.yards WHERE is_active = true
ON CONFLICT (yard_id) DO NOTHING;

-- ============================================================
-- SEED DEFAULT CONTRACTOR PRICING RULES
-- ============================================================
INSERT INTO public.contractor_pricing_rules (tier_name, discount_percent, minimum_margin_pct) VALUES
  ('RETAIL', 0, 15),
  ('CONTRACTOR_TIER_1', 3, 12),
  ('CONTRACTOR_TIER_2', 5, 10),
  ('COMMERCIAL_ACCOUNT', 7, 8),
  ('MANUAL_RATE_CARD', 0, 5)
ON CONFLICT DO NOTHING;
