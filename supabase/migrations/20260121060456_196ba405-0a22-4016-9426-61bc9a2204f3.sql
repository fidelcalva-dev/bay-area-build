-- Create enum for commitment types
CREATE TYPE public.commitment_type AS ENUM ('prepaid', 'contracted');

-- Create enum for volume tiers
CREATE TYPE public.volume_tier AS ENUM ('tier_a', 'tier_b', 'tier_c', 'tier_d');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create volume_commitments table
CREATE TABLE public.volume_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('contractor', 'preferred_contractor', 'wholesaler_broker')),
  commitment_type commitment_type NOT NULL,
  volume_tier volume_tier NOT NULL,
  service_count_committed INTEGER NOT NULL CHECK (service_count_committed >= 3),
  services_remaining INTEGER NOT NULL CHECK (services_remaining >= 0),
  discount_pct NUMERIC NOT NULL CHECK (discount_pct >= 0 AND discount_pct <= 0.10),
  validity_start_date DATE NOT NULL,
  validity_end_date DATE NOT NULL,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  agreement_id TEXT,
  payment_ref TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure validity window is valid
  CONSTRAINT valid_date_range CHECK (validity_end_date > validity_start_date)
);

-- Enable RLS
ALTER TABLE public.volume_commitments ENABLE ROW LEVEL SECURITY;

-- Only admins can manage volume commitments
CREATE POLICY "Admins can manage volume commitments"
ON public.volume_commitments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for lookups
CREATE INDEX idx_volume_commitments_customer ON public.volume_commitments(customer_email, customer_phone);
CREATE INDEX idx_volume_commitments_status ON public.volume_commitments(approval_status);
CREATE INDEX idx_volume_commitments_validity ON public.volume_commitments(validity_start_date, validity_end_date);

-- Create trigger for updated_at
CREATE TRIGGER update_volume_commitments_updated_at
BEFORE UPDATE ON public.volume_commitments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.volume_commitments IS 'Internal volume commitment tracking for contractor discount programs';
COMMENT ON COLUMN public.volume_commitments.volume_tier IS 'tier_a=3-5 services (3%), tier_b=6-10 (5%), tier_c=11-20 (7%), tier_d=20+ (10%)';
COMMENT ON COLUMN public.volume_commitments.discount_pct IS 'Discount percentage (0.03, 0.05, 0.07, 0.10 max)';