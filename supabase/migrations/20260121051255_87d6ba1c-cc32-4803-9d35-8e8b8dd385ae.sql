-- Add pre-purchase extra tons fields to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS pre_purchase_suggested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS suggested_extra_tons numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_tons_prepurchased numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS prepurchase_discount_pct numeric DEFAULT 0.05,
ADD COLUMN IF NOT EXISTS prepurchase_rate numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS prepurchase_city_rate numeric DEFAULT NULL;

-- Add prepurchase calculation to service_receipts for overage logic
ALTER TABLE public.service_receipts
ADD COLUMN IF NOT EXISTS prepurchased_tons numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS prepurchase_applied_tons numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS standard_overage_tons numeric DEFAULT 0;