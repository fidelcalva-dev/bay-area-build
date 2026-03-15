
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS terms_version text DEFAULT '2026.03.1',
  ADD COLUMN IF NOT EXISTS signer_name text,
  ADD COLUMN IF NOT EXISTS signer_email text,
  ADD COLUMN IF NOT EXISTS signer_phone text,
  ADD COLUMN IF NOT EXISTS esign_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS quote_id uuid,
  ADD COLUMN IF NOT EXISTS parent_contract_id uuid REFERENCES public.contracts(id),
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz;
