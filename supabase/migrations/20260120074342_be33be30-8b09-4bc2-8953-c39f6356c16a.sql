-- Add new columns to quotes table for lead capture flow
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS delivery_lat numeric,
ADD COLUMN IF NOT EXISTS delivery_lng numeric,
ADD COLUMN IF NOT EXISTS placement_lat numeric,
ADD COLUMN IF NOT EXISTS placement_lng numeric,
ADD COLUMN IF NOT EXISTS placement_type text DEFAULT 'driveway',
ADD COLUMN IF NOT EXISTS placement_notes text;

-- Add comment for documentation
COMMENT ON COLUMN public.quotes.delivery_address IS 'Full formatted delivery address';
COMMENT ON COLUMN public.quotes.delivery_lat IS 'Delivery address latitude';
COMMENT ON COLUMN public.quotes.delivery_lng IS 'Delivery address longitude';
COMMENT ON COLUMN public.quotes.placement_lat IS 'Exact dumpster placement pin latitude';
COMMENT ON COLUMN public.quotes.placement_lng IS 'Exact dumpster placement pin longitude';
COMMENT ON COLUMN public.quotes.placement_type IS 'Placement type: driveway or street';
COMMENT ON COLUMN public.quotes.placement_notes IS 'Special placement instructions (gate code, obstacles, etc.)';