
-- Contractor/Commercial account applications
CREATE TABLE public.contractor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service_cities TEXT[] DEFAULT '{}',
  project_types TEXT[] DEFAULT '{}',
  estimated_monthly_volume TEXT,
  typical_sizes TEXT[] DEFAULT '{}',
  materials_handled TEXT[] DEFAULT '{}',
  billing_preference TEXT DEFAULT 'invoice',
  credit_terms_requested TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_id UUID REFERENCES public.customers(id),
  pricing_tier TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contractor_applications ENABLE ROW LEVEL SECURITY;

-- Public can insert (application submission)
CREATE POLICY "Anyone can submit contractor application"
  ON public.contractor_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated staff can view/update
CREATE POLICY "Authenticated users can view applications"
  ON public.contractor_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update applications"
  ON public.contractor_applications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
