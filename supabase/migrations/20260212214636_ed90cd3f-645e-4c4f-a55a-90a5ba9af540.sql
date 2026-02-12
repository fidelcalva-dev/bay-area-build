
-- Add follow-up tracking columns to review_requests
ALTER TABLE public.review_requests
  ADD COLUMN IF NOT EXISTS followup_1_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS followup_2_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'residential',
  ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT false;

-- Create index for pending follow-ups
CREATE INDEX IF NOT EXISTS idx_review_requests_followup
  ON public.review_requests(status, followup_1_sent_at, followup_2_sent_at)
  WHERE status = 'sent' AND review_received = false AND opted_out = false;
