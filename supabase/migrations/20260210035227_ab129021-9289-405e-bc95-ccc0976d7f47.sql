
-- =====================================================
-- INTERNAL ALERTS SYSTEM
-- =====================================================

-- Config settings for internal notifications
INSERT INTO config_settings (key, value, description, category, is_sensitive)
VALUES
  ('internal_notifications.mode', '"DRY_RUN"', 'Internal notifications mode: DRY_RUN or LIVE', 'notifications', false),
  ('internal_notifications.email_recipients', '["hi@calsandumpsterspro.com","info@calsandumpsterspro.com"]', 'Email recipients for internal alerts', 'notifications', false),
  ('internal_notifications.chat_enabled', 'true', 'Enable chat notifications for internal alerts', 'notifications', false),
  ('internal_notifications.chat_mode', '"GOOGLE_CHAT"', 'Chat mode: GOOGLE_CHAT or IN_APP_ONLY', 'notifications', false),
  ('internal_notifications.dedupe_minutes', '10', 'Dedup window in minutes for internal alerts', 'notifications', false)
ON CONFLICT (key) DO NOTHING;

-- Internal alerts table
CREATE TABLE IF NOT EXISTS public.internal_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- LEAD_CREATED, QUOTE_SAVED, ORDER_CONFIRMED, PAYMENT_RECEIVED
  source text NOT NULL DEFAULT 'WEBSITE', -- WEBSITE, PORTAL, ADMIN, SALES
  entity_type text NOT NULL, -- LEAD, QUOTE, ORDER, PAYMENT
  entity_id text NOT NULL,
  title text NOT NULL,
  body_text text,
  links_json jsonb DEFAULT '[]'::jsonb,
  dedupe_key text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, FAILED, SKIPPED
  payload_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_internal_alerts_dedupe ON public.internal_alerts (dedupe_key, created_at);
CREATE INDEX idx_internal_alerts_status ON public.internal_alerts (status, created_at DESC);
CREATE INDEX idx_internal_alerts_event ON public.internal_alerts (event_type, created_at DESC);

ALTER TABLE public.internal_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read internal alerts"
  ON public.internal_alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert internal alerts"
  ON public.internal_alerts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update internal alerts"
  ON public.internal_alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role can do everything (edge functions use service role)
CREATE POLICY "Service role full access internal_alerts"
  ON public.internal_alerts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Internal alert deliveries table
CREATE TABLE IF NOT EXISTS public.internal_alert_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.internal_alerts(id) ON DELETE CASCADE,
  channel text NOT NULL, -- EMAIL, CHAT, IN_APP
  recipient text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, FAILED, SKIPPED
  provider text NOT NULL, -- RESEND, GOOGLE_CHAT, IN_APP
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_internal_alert_deliveries_alert ON public.internal_alert_deliveries (alert_id);
CREATE INDEX idx_internal_alert_deliveries_status ON public.internal_alert_deliveries (status);

ALTER TABLE public.internal_alert_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read deliveries"
  ON public.internal_alert_deliveries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update deliveries"
  ON public.internal_alert_deliveries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role full access deliveries"
  ON public.internal_alert_deliveries FOR ALL
  USING (true)
  WITH CHECK (true);
