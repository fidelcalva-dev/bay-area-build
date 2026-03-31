
-- Notification events table for all meaningful business events
CREATE TABLE IF NOT EXISTS public.notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  lead_id UUID NULL,
  quote_id UUID NULL,
  customer_id UUID NULL,
  brand_origin TEXT NULL,
  service_line TEXT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  requires_action BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  message TEXT NULL,
  deep_link TEXT NULL,
  payload_json JSONB DEFAULT '{}'::jsonb,
  dedupe_key TEXT NULL,
  target_roles TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for dedup lookups
CREATE INDEX idx_notification_events_dedupe ON public.notification_events (dedupe_key, created_at DESC) WHERE dedupe_key IS NOT NULL;
-- Index for role-based queries
CREATE INDEX idx_notification_events_roles ON public.notification_events USING GIN (target_roles);
-- Index for event type + time
CREATE INDEX idx_notification_events_type_time ON public.notification_events (event_type, created_at DESC);

-- Routing configuration table
CREATE TABLE IF NOT EXISTS public.notification_routing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  target_role TEXT NOT NULL,
  channel_in_app BOOLEAN NOT NULL DEFAULT true,
  channel_email BOOLEAN NOT NULL DEFAULT false,
  channel_sms BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_type, target_role)
);

-- Enable RLS
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_routing_config ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view notification events"
  ON public.notification_events FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view routing config"
  ON public.notification_routing_config FOR SELECT TO authenticated
  USING (true);

-- Enable realtime for notification_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_events;

-- Seed routing config with default rules
INSERT INTO public.notification_routing_config (event_type, target_role, channel_in_app, channel_email) VALUES
  -- Sales receives commercial lead events
  ('lead_created', 'sales', true, false),
  ('lead_created', 'admin', true, true),
  ('dumpster_lead_created', 'sales', true, false),
  ('dumpster_lead_created', 'admin', true, false),
  ('cleanup_lead_created', 'sales', true, false),
  ('cleanup_lead_created', 'admin', true, false),
  ('bundle_lead_created', 'sales', true, true),
  ('bundle_lead_created', 'admin', true, true),
  ('contractor_application_submitted', 'sales', true, true),
  ('contractor_application_submitted', 'admin', true, true),
  ('ai_chat_handoff_created', 'sales', true, false),
  ('ai_chat_handoff_created', 'admin', true, false),
  ('contact_form_submitted', 'sales', true, false),
  ('contact_form_submitted', 'admin', true, false),
  ('photos_uploaded', 'sales', true, false),
  ('recurring_service_interest', 'sales', true, false),
  ('recurring_service_interest', 'admin', true, false),
  ('needs_site_visit', 'sales', true, false),
  ('needs_site_visit', 'customer_service', true, false),
  ('quote_high_intent_started', 'sales', true, false),
  ('lead_unassigned', 'admin', true, true),
  ('follow_up_overdue', 'sales', true, false),
  ('follow_up_overdue', 'admin', true, false),
  ('high_risk_lead', 'admin', true, true),
  ('quote_ready', 'sales', true, false),
  ('proposal_sent', 'sales', true, false),
  ('proposal_sent', 'customer_service', true, false),
  ('contract_sent', 'sales', true, false),
  ('contract_sent', 'customer_service', true, false),
  ('payment_link_sent', 'sales', true, false),
  ('payment_link_sent', 'customer_service', true, false),
  ('lead_won', 'sales', true, false),
  ('lead_won', 'admin', true, false),
  ('lead_won', 'customer_service', true, false),
  ('lead_lost', 'sales', true, false),
  ('lead_lost', 'admin', true, false)
ON CONFLICT (event_type, target_role) DO NOTHING;
