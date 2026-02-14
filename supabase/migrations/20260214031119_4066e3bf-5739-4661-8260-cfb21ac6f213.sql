
-- Quote drafts for cross-device resume
CREATE TABLE public.quote_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  zip text,
  address text,
  customer_type text,
  project_id text,
  size integer DEFAULT 20,
  wants_swap boolean DEFAULT false,
  name text,
  email text,
  phone text,
  step text DEFAULT 'zip',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- Index for token lookups
CREATE INDEX idx_quote_drafts_token ON public.quote_drafts (draft_token);

-- Auto-cleanup expired drafts index
CREATE INDEX idx_quote_drafts_expires ON public.quote_drafts (expires_at);

-- Enable RLS
ALTER TABLE public.quote_drafts ENABLE ROW LEVEL SECURITY;

-- Public insert/update (anonymous users creating drafts)
CREATE POLICY "Anyone can create drafts"
  ON public.quote_drafts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read own draft by token"
  ON public.quote_drafts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update own draft by token"
  ON public.quote_drafts FOR UPDATE
  USING (true);

-- Updated_at trigger
CREATE TRIGGER update_quote_drafts_updated_at
  BEFORE UPDATE ON public.quote_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
