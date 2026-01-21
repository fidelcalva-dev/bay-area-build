-- Add volume commitment and discount tracking fields to quotes
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS volume_commitment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS volume_discount_pct numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_cap_applied boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS volume_agreement_id text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS volume_validity_start timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS volume_validity_end timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS requires_discount_approval boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.quotes.volume_commitment_count IS 'Number of prepaid/contracted services (3-5=3%, 6-10=5%, 11-20=7%, 20+=10%)';
COMMENT ON COLUMN public.quotes.volume_discount_pct IS 'Applied discount percentage (0-0.10 max)';
COMMENT ON COLUMN public.quotes.discount_cap_applied IS 'True if discount was capped at 10%';
COMMENT ON COLUMN public.quotes.volume_agreement_id IS 'Reference to signed volume agreement';
COMMENT ON COLUMN public.quotes.requires_discount_approval IS 'True if discount requires manual approval (7%+ for wholesalers)';