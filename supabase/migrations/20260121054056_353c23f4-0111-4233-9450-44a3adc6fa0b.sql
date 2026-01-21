-- Heavy Material Sub-Classification Support
-- Adds fields to track heavy material classification (base, +$200, +$300 mixed, reclassified)

-- Add heavy material classification columns to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS heavy_material_class text,
ADD COLUMN IF NOT EXISTS heavy_material_increment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_trash_contaminated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reclassified_to_mixed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS original_material_type text;

-- Add comments for clarity
COMMENT ON COLUMN public.quotes.heavy_material_class IS 'Heavy material classification: base, plus_200, mixed_heavy, or null for general debris';
COMMENT ON COLUMN public.quotes.heavy_material_increment IS 'Price increment for heavy materials: 0 (base), 200 (+$200), or 300 (mixed heavy)';
COMMENT ON COLUMN public.quotes.is_trash_contaminated IS 'Whether trash/C&D was mixed with heavy materials, triggering reclassification';
COMMENT ON COLUMN public.quotes.reclassified_to_mixed IS 'Whether load was reclassified from heavy to mixed debris due to contamination';
COMMENT ON COLUMN public.quotes.original_material_type IS 'Original material type before any reclassification';

-- Add heavy_material_class to service_receipts for post-service documentation
ALTER TABLE public.service_receipts
ADD COLUMN IF NOT EXISTS heavy_material_class text,
ADD COLUMN IF NOT EXISTS was_reclassified boolean DEFAULT false;