-- Add scheduling fields to quotes table for P0-09
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS preferred_delivery_date date,
ADD COLUMN IF NOT EXISTS preferred_delivery_window text,
ADD COLUMN IF NOT EXISTS suggested_pickup_date date,
ADD COLUMN IF NOT EXISTS is_weekend_delivery boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS scheduling_notes text;

-- Add comment for documentation
COMMENT ON COLUMN public.quotes.preferred_delivery_date IS 'Customer selected delivery date';
COMMENT ON COLUMN public.quotes.preferred_delivery_window IS 'Time window: morning, midday, afternoon';
COMMENT ON COLUMN public.quotes.suggested_pickup_date IS 'Auto-calculated based on rental_days';
COMMENT ON COLUMN public.quotes.is_weekend_delivery IS 'True if delivery falls on Sat/Sun (special request)';