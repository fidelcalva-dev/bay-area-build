
-- Document versioning table for tracking terms/contract/addendum template versions
CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL CHECK (document_type IN ('terms', 'contract_msa', 'contract_addendum', 'policy')),
  version_code text NOT NULL,
  effective_date timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  summary text,
  content_hash text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_type, version_code)
);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated users can read document_versions"
  ON public.document_versions FOR SELECT
  TO authenticated USING (true);

-- Document acceptance log for tracking what each customer signed
CREATE TABLE IF NOT EXISTS public.document_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  document_type text NOT NULL,
  version_code text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  signer_name text,
  signer_email text,
  signer_phone text,
  signer_title text,
  delivery_method text CHECK (delivery_method IN ('sms_link', 'email_link', 'in_person', 'portal')),
  electronic_consent_given boolean DEFAULT false,
  electronic_consent_at timestamptz,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.document_acceptances ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated users can read document_acceptances"
  ON public.document_acceptances FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert document_acceptances"
  ON public.document_acceptances FOR INSERT
  TO authenticated WITH CHECK (true);

-- Seed initial document versions
INSERT INTO public.document_versions (document_type, version_code, summary, is_active)
VALUES
  ('terms', '2026.03.1', 'Initial terms of service version', true),
  ('contract_msa', '2026.03.1', 'Initial master service agreement template', true),
  ('contract_addendum', '2026.03.1', 'Initial service addendum template', true),
  ('policy', '2026.03.1', 'Initial policy language version (heavy material, contamination, etc.)', true)
ON CONFLICT (document_type, version_code) DO NOTHING;

-- Add signer_title and delivery_method to contracts if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contracts' AND column_name = 'signer_title') THEN
    ALTER TABLE public.contracts ADD COLUMN signer_title text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'contracts' AND column_name = 'delivery_method') THEN
    ALTER TABLE public.contracts ADD COLUMN delivery_method text;
  END IF;
END $$;
