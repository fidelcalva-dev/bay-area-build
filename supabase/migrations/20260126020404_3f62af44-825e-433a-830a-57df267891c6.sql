-- ============================================
-- HEAVY MATERIAL - ADD COLUMNS ONLY
-- ============================================

-- Add columns to quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS is_heavy_material BOOLEAN DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS heavy_material_code TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS requested_green_halo BOOLEAN DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS estimated_fill_pct NUMERIC(3,2);
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS estimated_weight_tons_min NUMERIC(5,2);
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS estimated_weight_tons_max NUMERIC(5,2);
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS weight_risk_level TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS requires_fill_line BOOLEAN DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS requires_pre_pickup_photos BOOLEAN DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS reclassify_on_contamination BOOLEAN DEFAULT true;

-- Add columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_heavy_material BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS heavy_material_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS requested_green_halo BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_fill_pct NUMERIC(3,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_weight_tons_min NUMERIC(5,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_weight_tons_max NUMERIC(5,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS weight_risk_level TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS requires_fill_line BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS requires_pre_pickup_photos BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reclassify_on_contamination BOOLEAN DEFAULT true;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS contamination_detected BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS contamination_detected_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS contamination_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reclassified_to_debris BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reclassified_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS actual_weight_tons NUMERIC(5,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS included_tons_for_size NUMERIC(4,2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS extra_tons_charged NUMERIC(5,2);