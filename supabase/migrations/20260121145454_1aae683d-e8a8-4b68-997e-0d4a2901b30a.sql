-- Add Green Halo pricing columns to quotes table
ALTER TABLE public.quotes
ADD COLUMN is_green_halo boolean DEFAULT false,
ADD COLUMN green_halo_category text DEFAULT NULL,
ADD COLUMN green_halo_dump_fee numeric DEFAULT NULL,
ADD COLUMN green_halo_handling_fee numeric DEFAULT NULL,
ADD COLUMN green_halo_dump_fee_per_ton numeric DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.quotes.is_green_halo IS 'True if material is Green Halo compliant (clean recyclables transported to specialized facility)';
COMMENT ON COLUMN public.quotes.green_halo_category IS 'Green Halo material category (e.g., mixed_cd, roofing_only, wood_clean, metal, etc.)';
COMMENT ON COLUMN public.quotes.green_halo_dump_fee IS 'Estimated dump fee for Green Halo materials';
COMMENT ON COLUMN public.quotes.green_halo_handling_fee IS 'Handling fee for Green Halo processing and compliance documentation';
COMMENT ON COLUMN public.quotes.green_halo_dump_fee_per_ton IS 'Dump fee rate per ton used for calculation ($75-250)';