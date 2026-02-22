
-- Add lead_id and supporting columns to waste_vision_analyses
ALTER TABLE public.waste_vision_analyses
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.sales_leads(id),
  ADD COLUMN IF NOT EXISTS image_storage_path text,
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS customer_type text,
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'LIVE',
  ADD COLUMN IF NOT EXISTS detected_materials jsonb,
  ADD COLUMN IF NOT EXISTS heavy_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS confidence numeric;

-- Create index on lead_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_wva_lead_id ON public.waste_vision_analyses(lead_id);

-- Add config setting for photo_ai.mode
INSERT INTO public.config_settings (category, key, value, description)
VALUES ('photo_ai', 'photo_ai.mode', '"LIVE"', 'Photo AI mode: LIVE or DRY_RUN')
ON CONFLICT (key) DO NOTHING;
