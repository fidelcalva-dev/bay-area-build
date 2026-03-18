
-- Add missing lead enrichment columns for unified lead persistence
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS source_channel text,
  ADD COLUMN IF NOT EXISTS source_page text,
  ADD COLUMN IF NOT EXISTS source_module text,
  ADD COLUMN IF NOT EXISTS first_touch_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS latest_touch_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS next_best_action text,
  ADD COLUMN IF NOT EXISTS last_step_completed text,
  ADD COLUMN IF NOT EXISTS selected_size integer,
  ADD COLUMN IF NOT EXISTS quote_amount numeric,
  ADD COLUMN IF NOT EXISTS quote_amount_high numeric,
  ADD COLUMN IF NOT EXISTS requested_delivery_date date,
  ADD COLUMN IF NOT EXISTS delivery_preference text,
  ADD COLUMN IF NOT EXISTS placement_type text,
  ADD COLUMN IF NOT EXISTS ai_conversation_id text,
  ADD COLUMN IF NOT EXISTS ai_conversation_summary text,
  ADD COLUMN IF NOT EXISTS ai_estimated_yards_min numeric,
  ADD COLUMN IF NOT EXISTS ai_estimated_yards_max numeric,
  ADD COLUMN IF NOT EXISTS identity_group_id uuid,
  ADD COLUMN IF NOT EXISTS normalized_phone text,
  ADD COLUMN IF NOT EXISTS normalized_email text;

-- Backfill source_channel from lead_source where missing
UPDATE public.sales_leads SET source_channel = lead_source WHERE source_channel IS NULL AND lead_source IS NOT NULL;

-- Create indexes for identity matching
CREATE INDEX IF NOT EXISTS idx_sales_leads_normalized_phone ON public.sales_leads(normalized_phone) WHERE normalized_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_leads_normalized_email ON public.sales_leads(normalized_email) WHERE normalized_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_leads_source_channel ON public.sales_leads(source_channel) WHERE source_channel IS NOT NULL;
