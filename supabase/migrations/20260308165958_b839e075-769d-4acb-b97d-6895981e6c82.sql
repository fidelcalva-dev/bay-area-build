
CREATE TABLE IF NOT EXISTS public.lead_fallback_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source_channel text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  error_message text,
  retry_count int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'pending',
  resolved_at timestamptz,
  resolved_lead_id uuid
);

ALTER TABLE public.lead_fallback_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on lead_fallback_queue"
  ON public.lead_fallback_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view fallback queue"
  ON public.lead_fallback_queue
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
  );

CREATE INDEX idx_lead_fallback_queue_status ON public.lead_fallback_queue(status) WHERE status = 'pending';
