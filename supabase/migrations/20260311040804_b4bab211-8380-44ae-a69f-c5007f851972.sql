
-- Add market_code to dumpster_pricing for city-specific pricing
ALTER TABLE public.dumpster_pricing ADD COLUMN market_code TEXT NOT NULL DEFAULT 'oakland_east_bay';

-- Drop old unique constraint and add new one including market_code
ALTER TABLE public.dumpster_pricing DROP CONSTRAINT dumpster_pricing_size_yd_material_type_key;
ALTER TABLE public.dumpster_pricing ADD CONSTRAINT dumpster_pricing_size_material_market_key UNIQUE(size_yd, material_type, market_code);

-- Add city dump cost reference columns
ALTER TABLE public.dumpster_pricing ADD COLUMN dump_cost_per_ton NUMERIC(10,2) NOT NULL DEFAULT 115.00;
ALTER TABLE public.dumpster_pricing ADD COLUMN margin_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00;

-- Index for market lookups
CREATE INDEX idx_dumpster_pricing_market ON public.dumpster_pricing(market_code);
