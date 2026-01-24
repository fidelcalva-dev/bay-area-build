-- =====================================================
-- PHASE 1: Create canonical MARKETS table
-- =====================================================
CREATE TABLE public.markets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'coming_soon')),
  default_yard_id UUID REFERENCES public.yards(id) ON DELETE SET NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Markets readable by authenticated users"
ON public.markets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Markets writable by admin roles"
ON public.markets FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'system_admin', 'ops_admin')
  )
);

-- =====================================================
-- PHASE 2: Create MARKET_RATES table
-- =====================================================
CREATE TABLE public.market_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id TEXT NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  extra_ton_rate_standard NUMERIC NOT NULL DEFAULT 165,
  extra_ton_rate_prepay NUMERIC,
  prepay_discount_pct NUMERIC NOT NULL DEFAULT 5,
  heavy_base_10yd NUMERIC NOT NULL DEFAULT 638,
  mixed_small_overage_rate NUMERIC DEFAULT 30,
  rental_day_3_factor NUMERIC DEFAULT 0.6,
  rental_day_7_factor NUMERIC DEFAULT 1.0,
  rental_day_10_factor NUMERIC DEFAULT 1.15,
  rental_day_14_factor NUMERIC DEFAULT 1.25,
  rental_day_30_factor NUMERIC DEFAULT 1.5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(market_id)
);

ALTER TABLE public.market_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market rates readable by authenticated users"
ON public.market_rates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Market rates writable by admin roles"
ON public.market_rates FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'system_admin', 'ops_admin')
  )
);

-- =====================================================
-- PHASE 3: Add market_id to existing tables
-- =====================================================
ALTER TABLE public.zone_zip_codes 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.facilities 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.yards 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.city_rates 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.distance_brackets 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.distance_caps 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.facility_recommendations 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

ALTER TABLE public.certified_sources 
ADD COLUMN IF NOT EXISTS market_id TEXT REFERENCES public.markets(id) ON DELETE SET NULL;

-- =====================================================
-- PHASE 4: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_zone_zip_codes_market ON public.zone_zip_codes(market_id);
CREATE INDEX IF NOT EXISTS idx_facilities_market ON public.facilities(market_id);
CREATE INDEX IF NOT EXISTS idx_yards_market ON public.yards(market_id);
CREATE INDEX IF NOT EXISTS idx_quotes_market ON public.quotes(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_market ON public.orders(market_id);
CREATE INDEX IF NOT EXISTS idx_market_rates_market ON public.market_rates(market_id);

-- Triggers for updated_at
CREATE TRIGGER update_markets_updated_at
BEFORE UPDATE ON public.markets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_rates_updated_at
BEFORE UPDATE ON public.market_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();