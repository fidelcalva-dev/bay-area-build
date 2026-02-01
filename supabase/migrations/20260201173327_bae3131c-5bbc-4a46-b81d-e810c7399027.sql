-- System Health Events (individual health signals)
CREATE TABLE IF NOT EXISTS public.system_health_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('EDGE_FUNCTION', 'CRON', 'WEBHOOK', 'CONFIG', 'INTEGRATION', 'MANUAL_SETUP')),
  source_key TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('GREEN', 'AMBER', 'RED')),
  message TEXT NOT NULL,
  details_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick lookups by source
CREATE INDEX IF NOT EXISTS idx_health_events_source ON public.system_health_events(source_type, source_key);
CREATE INDEX IF NOT EXISTS idx_health_events_severity ON public.system_health_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_events_created ON public.system_health_events(created_at DESC);

-- System Health Snapshot (periodic summaries)
CREATE TABLE IF NOT EXISTS public.system_health_snapshot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  summary_json JSONB NOT NULL DEFAULT '{}',
  node_health_json JSONB NOT NULL DEFAULT '{}',
  issues_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for latest snapshot
CREATE INDEX IF NOT EXISTS idx_health_snapshot_generated ON public.system_health_snapshot(generated_at DESC);

-- Manual Setup Items (track external configuration status)
CREATE TABLE IF NOT EXISTS public.manual_setup_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED', 'NOT_APPLICABLE')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, key)
);

-- Seed initial manual setup items
INSERT INTO public.manual_setup_items (category, key, name, description, status) VALUES
  ('TWILIO', 'voice_webhook', 'Twilio Voice Webhook', 'Configure calls-inbound-handler as Voice webhook URL', 'PENDING'),
  ('TWILIO', 'status_callback', 'Twilio Status Callback', 'Configure calls-status-callback URL', 'PENDING'),
  ('TWILIO', 'sms_webhook', 'Twilio SMS Webhook', 'Configure twilio-sms-webhook URL', 'PENDING'),
  ('AUTHNET', 'webhook', 'Authorize.Net Webhook', 'Configure authnet-webhook URL in merchant interface', 'PENDING'),
  ('RESEND', 'domain_verification', 'Resend Domain Verification', 'Verify sending domain in Resend dashboard', 'PENDING'),
  ('META', 'webhook_config', 'Meta Webhooks', 'Configure lead-from-meta webhook in Meta Business', 'PENDING'),
  ('GOOGLE_ADS', 'lead_form', 'Google Ads Lead Forms', 'Configure lead-from-google-ads webhook', 'PENDING'),
  ('GHL', 'inbound_webhook', 'GoHighLevel Inbound Webhook', 'Configure ghl-inbound-webhook URL', 'PENDING'),
  ('SECURITY', 'leaked_password_protection', 'Leaked Password Protection', 'Enable in Supabase Auth settings', 'PENDING'),
  ('SECURITY', 'extension_schema', 'Move pg_net Extension', 'Move pg_net from public to extensions schema', 'PENDING')
ON CONFLICT (category, key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_setup_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin-only access
CREATE POLICY "Admins can view health events" ON public.system_health_events
  FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Service can insert health events" ON public.system_health_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view health snapshots" ON public.system_health_snapshot
  FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Service can insert health snapshots" ON public.system_health_snapshot
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view manual setup items" ON public.manual_setup_items
  FOR SELECT USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Admins can update manual setup items" ON public.manual_setup_items
  FOR UPDATE USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_manual_setup_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_manual_setup_items_updated_at
  BEFORE UPDATE ON public.manual_setup_items
  FOR EACH ROW EXECUTE FUNCTION public.update_manual_setup_updated_at();