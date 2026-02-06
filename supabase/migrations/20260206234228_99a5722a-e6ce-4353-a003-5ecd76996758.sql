
-- ========================================
-- Missing Connections Scanner Tables
-- ========================================

-- Table: missing_connections
CREATE TABLE public.missing_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('TELEPHONY','MESSAGING','EMAIL','PAYMENTS','MAPS','LEADS','ADS','GOOGLE_WORKSPACE','SECURITY','OTHER')),
  item_key text NOT NULL UNIQUE,
  title text NOT NULL,
  priority text NOT NULL DEFAULT 'P2' CHECK (priority IN ('P0','P1','P2')),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','DONE','NOT_APPLICABLE')),
  detected_reason text,
  required_env_vars_json jsonb DEFAULT '[]'::jsonb,
  required_webhooks_json jsonb DEFAULT '[]'::jsonb,
  manual_steps_json jsonb DEFAULT '[]'::jsonb,
  verification_steps_json jsonb DEFAULT '[]'::jsonb,
  last_scanned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.missing_connections ENABLE ROW LEVEL SECURITY;

-- Admin-only read
CREATE POLICY "Authenticated users can read missing_connections"
  ON public.missing_connections FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only update (mark DONE)
CREATE POLICY "Admins can update missing_connections"
  ON public.missing_connections FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role can upsert (from edge function)
CREATE POLICY "Service can insert missing_connections"
  ON public.missing_connections FOR INSERT TO authenticated
  WITH CHECK (true);

-- Table: missing_connections_log
CREATE TABLE public.missing_connections_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.missing_connections(id) ON DELETE CASCADE,
  user_id uuid,
  action text NOT NULL CHECK (action IN ('MARK_DONE','MARK_OPEN','NOTE')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.missing_connections_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read missing_connections_log"
  ON public.missing_connections_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert missing_connections_log"
  ON public.missing_connections_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
