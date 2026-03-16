
-- Add placement marking fields to quotes
ALTER TABLE public.quotes 
  ADD COLUMN IF NOT EXISTS placement_type_requested text,
  ADD COLUMN IF NOT EXISTS placement_notes text,
  ADD COLUMN IF NOT EXISTS placement_point_lat numeric,
  ADD COLUMN IF NOT EXISTS placement_point_lng numeric,
  ADD COLUMN IF NOT EXISTS placement_verification_status text DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS access_notes text,
  ADD COLUMN IF NOT EXISTS gate_code text,
  ADD COLUMN IF NOT EXISTS permit_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS time_window text,
  ADD COLUMN IF NOT EXISTS driver_notes text,
  ADD COLUMN IF NOT EXISTS heavy_material_notes text,
  ADD COLUMN IF NOT EXISTS material_class text;

-- Add identity resolution fields to customers
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS normalized_phone text,
  ADD COLUMN IF NOT EXISTS normalized_email text,
  ADD COLUMN IF NOT EXISTS identity_group_id uuid,
  ADD COLUMN IF NOT EXISTS alternate_names_json jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS merge_status text DEFAULT 'new_profile';

-- Create identity groups table
CREATE TABLE IF NOT EXISTS public.identity_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_customer_id uuid REFERENCES public.customers(id),
  merge_confidence numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create identity merge suggestions
CREATE TABLE IF NOT EXISTS public.identity_merge_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id_a uuid REFERENCES public.customers(id) NOT NULL,
  customer_id_b uuid REFERENCES public.customers(id) NOT NULL,
  match_type text NOT NULL, -- 'phone', 'email', 'both'
  match_value text,
  confidence numeric DEFAULT 0,
  status text DEFAULT 'pending', -- pending, approved, rejected, merged
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add placement verification fields to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS placement_type_requested text,
  ADD COLUMN IF NOT EXISTS placement_point_lat numeric,
  ADD COLUMN IF NOT EXISTS placement_point_lng numeric,
  ADD COLUMN IF NOT EXISTS placement_verification_status text DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS placement_verified_by uuid,
  ADD COLUMN IF NOT EXISTS placement_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS placement_notes text;

-- Create trigger to auto-normalize phone/email on customer insert/update
CREATE OR REPLACE FUNCTION public.normalize_customer_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Normalize phone: strip non-digits, keep last 10
  IF NEW.phone IS NOT NULL THEN
    NEW.normalized_phone := right(regexp_replace(NEW.phone, '[^0-9]', '', 'g'), 10);
  END IF;
  -- Normalize email: lowercase trim
  IF NEW.billing_email IS NOT NULL THEN
    NEW.normalized_email := lower(trim(NEW.billing_email));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_customer_identity ON public.customers;
CREATE TRIGGER trg_normalize_customer_identity
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_customer_identity();

-- Enable RLS on new tables
ALTER TABLE public.identity_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_merge_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users can read/write identity tables
CREATE POLICY "Authenticated users can manage identity groups"
  ON public.identity_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage merge suggestions"
  ON public.identity_merge_suggestions FOR ALL TO authenticated USING (true) WITH CHECK (true);
