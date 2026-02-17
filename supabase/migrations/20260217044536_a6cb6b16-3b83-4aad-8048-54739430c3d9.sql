
-- =============================================
-- Visitor Intelligence System — Database Schema
-- =============================================

-- 1) visitor_profiles
CREATE TABLE public.visitor_profiles (
  id uuid PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  visit_count integer NOT NULL DEFAULT 1,
  total_sessions integer NOT NULL DEFAULT 0,
  total_pageviews integer NOT NULL DEFAULT 0,
  first_referrer text,
  last_referrer text,
  first_utm_json jsonb,
  last_utm_json jsonb,
  last_known_city text,
  last_known_region text,
  device_summary text,
  consent_status text NOT NULL DEFAULT 'UNKNOWN'
    CHECK (consent_status IN ('GRANTED', 'DENIED', 'UNKNOWN'))
);

ALTER TABLE public.visitor_profiles ENABLE ROW LEVEL SECURITY;

-- Only staff can read visitor data
CREATE POLICY "Staff can read visitor_profiles"
  ON public.visitor_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'executive'));

-- Edge function inserts via service role (no anon policy needed for insert)
-- Anon can insert/update (edge function uses anon key but we gate via the function itself)
CREATE POLICY "Service insert visitor_profiles"
  ON public.visitor_profiles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service update visitor_profiles"
  ON public.visitor_profiles FOR UPDATE
  TO anon
  USING (true);

-- 2) visitor_sessions
CREATE TABLE public.visitor_sessions (
  id uuid PRIMARY KEY,
  visitor_id uuid NOT NULL REFERENCES public.visitor_profiles(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  landing_url text,
  referrer_url text,
  utm_json jsonb,
  gclid text,
  device_json jsonb,
  timezone text,
  approx_geo_json jsonb,
  ip_hash text,
  consent_status text NOT NULL DEFAULT 'UNKNOWN'
    CHECK (consent_status IN ('GRANTED', 'DENIED', 'UNKNOWN'))
);

CREATE INDEX idx_visitor_sessions_visitor ON public.visitor_sessions(visitor_id);
CREATE INDEX idx_visitor_sessions_started ON public.visitor_sessions(started_at DESC);

ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read visitor_sessions"
  ON public.visitor_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Service insert visitor_sessions"
  ON public.visitor_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service update visitor_sessions"
  ON public.visitor_sessions FOR UPDATE
  TO anon
  USING (true);

-- 3) visitor_events
CREATE TABLE public.visitor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  visitor_id uuid NOT NULL REFERENCES public.visitor_profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_time timestamptz NOT NULL DEFAULT now(),
  page_url text,
  properties_json jsonb
);

CREATE INDEX idx_visitor_events_session ON public.visitor_events(session_id);
CREATE INDEX idx_visitor_events_visitor ON public.visitor_events(visitor_id);
CREATE INDEX idx_visitor_events_name ON public.visitor_events(event_name);
CREATE INDEX idx_visitor_events_time ON public.visitor_events(event_time DESC);

ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read visitor_events"
  ON public.visitor_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Service insert visitor_events"
  ON public.visitor_events FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4) lead_visitor_links
CREATE TABLE public.lead_visitor_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  visitor_id uuid NOT NULL REFERENCES public.visitor_profiles(id) ON DELETE CASCADE,
  first_linked_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL CHECK (source IN ('FORM_SUBMIT', 'PHONE_CAPTURE', 'EMAIL_CAPTURE')),
  UNIQUE (lead_id, visitor_id)
);

CREATE INDEX idx_lead_visitor_links_lead ON public.lead_visitor_links(lead_id);
CREATE INDEX idx_lead_visitor_links_visitor ON public.lead_visitor_links(visitor_id);

ALTER TABLE public.lead_visitor_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read lead_visitor_links"
  ON public.lead_visitor_links FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Service insert lead_visitor_links"
  ON public.lead_visitor_links FOR INSERT
  TO anon
  WITH CHECK (true);

-- Add visitor_id column to sales_leads for quick lookup
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS visitor_id uuid REFERENCES public.visitor_profiles(id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_visitor ON public.sales_leads(visitor_id);

-- Config rows for privacy settings
INSERT INTO public.config_settings (category, key, value, is_sensitive)
VALUES
  ('analytics', 'consent_required', '"false"', false),
  ('analytics', 'geoip_enabled', '"false"', false),
  ('analytics', 'ip_hash_enabled', '"true"', false)
ON CONFLICT DO NOTHING;
