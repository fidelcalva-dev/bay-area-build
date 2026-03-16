
-- Add negotiated pricing fields to quotes table
ALTER TABLE public.quotes 
  ADD COLUMN IF NOT EXISTS range_min numeric,
  ADD COLUMN IF NOT EXISTS range_max numeric,
  ADD COLUMN IF NOT EXISTS default_price numeric,
  ADD COLUMN IF NOT EXISTS negotiated_price numeric,
  ADD COLUMN IF NOT EXISTS price_override_reason text,
  ADD COLUMN IF NOT EXISTS price_override_user_id uuid,
  ADD COLUMN IF NOT EXISTS price_approval_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_approved_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS heavy_material_notes text;

-- Add commercial account fields to customers table
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS commercial_account_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS contractor_tier text DEFAULT 'retail',
  ADD COLUMN IF NOT EXISTS monthly_volume_estimate integer,
  ADD COLUMN IF NOT EXISTS credit_terms_requested text,
  ADD COLUMN IF NOT EXISTS discount_pct numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commercial_approved_by uuid,
  ADD COLUMN IF NOT EXISTS commercial_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS commercial_notes text;
