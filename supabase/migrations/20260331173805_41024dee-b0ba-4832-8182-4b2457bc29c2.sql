
-- =============================================
-- Extend quote_sessions with attribution + context fields
-- =============================================
ALTER TABLE public.quote_sessions
  ADD COLUMN IF NOT EXISTS session_token text,
  ADD COLUMN IF NOT EXISTS brand_origin text DEFAULT 'CALSAN_DUMPSTERS_PRO',
  ADD COLUMN IF NOT EXISTS service_line text DEFAULT 'DUMPSTER',
  ADD COLUMN IF NOT EXISTS source_channel text DEFAULT 'QUOTE_FLOW',
  ADD COLUMN IF NOT EXISTS source_page text,
  ADD COLUMN IF NOT EXISTS landing_page text,
  ADD COLUMN IF NOT EXISTS referrer_url text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS gclid text,
  ADD COLUMN IF NOT EXISTS fbclid text,
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS browser_name text,
  ADD COLUMN IF NOT EXISTS os_name text,
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS customer_type text,
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS customer_notes text,
  ADD COLUMN IF NOT EXISTS photos_uploaded_flag boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS abandoned_at timestamptz,
  ADD COLUMN IF NOT EXISTS promoted_to_lead_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Index for session token lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_quote_sessions_session_token ON public.quote_sessions(session_token) WHERE session_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quote_sessions_status ON public.quote_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quote_sessions_zip ON public.quote_sessions(zip);
CREATE INDEX IF NOT EXISTS idx_quote_sessions_created_at ON public.quote_sessions(created_at);

-- Allow anon select for session resume
CREATE POLICY "Allow anon select quote_sessions by token"
  ON public.quote_sessions FOR SELECT TO anon
  USING (session_token IS NOT NULL);

-- =============================================
-- lead_source_events: granular step-by-step event log
-- =============================================
CREATE TABLE IF NOT EXISTS public.lead_source_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_session_id uuid REFERENCES public.quote_sessions(id),
  lead_id uuid REFERENCES public.sales_leads(id),
  event_name text NOT NULL,
  event_payload_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.lead_source_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read lead_source_events"
  ON public.lead_source_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow anon insert lead_source_events"
  ON public.lead_source_events FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated insert lead_source_events"
  ON public.lead_source_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_source_events_session ON public.lead_source_events(quote_session_id);
CREATE INDEX IF NOT EXISTS idx_lead_source_events_lead ON public.lead_source_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_source_events_name ON public.lead_source_events(event_name);
