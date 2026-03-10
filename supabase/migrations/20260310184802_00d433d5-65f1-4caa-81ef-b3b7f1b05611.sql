
CREATE TABLE public.crm_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  user_id text,
  error_message text NOT NULL,
  error_detail jsonb DEFAULT '{}'::jsonb,
  source_page text,
  entity_type text,
  entity_id text,
  resolved boolean DEFAULT false
);

ALTER TABLE public.crm_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert crm_errors"
  ON public.crm_errors FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read crm_errors"
  ON public.crm_errors FOR SELECT TO authenticated
  USING (true);

CREATE INDEX idx_crm_errors_created_at ON public.crm_errors (created_at DESC);
CREATE INDEX idx_crm_errors_action ON public.crm_errors (action);
