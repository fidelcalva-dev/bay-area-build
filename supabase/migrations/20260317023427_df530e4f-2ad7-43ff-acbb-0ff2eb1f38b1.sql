
-- Add negotiated pricing control columns to quotes table
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS range_min numeric,
  ADD COLUMN IF NOT EXISTS range_max numeric,
  ADD COLUMN IF NOT EXISTS default_price numeric,
  ADD COLUMN IF NOT EXISTS approval_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS price_override_user_id uuid,
  ADD COLUMN IF NOT EXISTS pricing_status text DEFAULT 'standard';
