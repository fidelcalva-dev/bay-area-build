
-- Create risk_checks table for scam risk evaluation results
CREATE TABLE public.risk_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('LEAD','CUSTOMER','CONTACT','ORDER')),
  entity_id UUID,
  requested_by_user_id UUID REFERENCES auth.users(id),
  email_input TEXT,
  phone_input TEXT,
  phone_normalized TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_band TEXT NOT NULL DEFAULT 'GREEN' CHECK (risk_band IN ('GREEN','AMBER','RED')),
  reasons_json JSONB DEFAULT '[]'::jsonb,
  provider_results_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new flag types to fraud_flags if not already supporting them
-- (fraud_flags table already exists, just add missing columns)
ALTER TABLE public.fraud_flags
  ADD COLUMN IF NOT EXISTS flag_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS risk_check_id UUID REFERENCES public.risk_checks(id);

-- Indexes
CREATE INDEX idx_risk_checks_entity ON public.risk_checks(entity_type, entity_id);
CREATE INDEX idx_risk_checks_email ON public.risk_checks(email_input) WHERE email_input IS NOT NULL;
CREATE INDEX idx_risk_checks_phone ON public.risk_checks(phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE INDEX idx_risk_checks_band ON public.risk_checks(risk_band) WHERE risk_band IN ('AMBER','RED');
CREATE INDEX idx_risk_checks_created ON public.risk_checks(created_at DESC);

-- RLS
ALTER TABLE public.risk_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view risk checks"
ON public.risk_checks FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

CREATE POLICY "Sales can view risk checks"
ON public.risk_checks FOR SELECT
USING (has_role(auth.uid(), 'sales'::app_role));

CREATE POLICY "Staff can create risk checks"
ON public.risk_checks FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'sales'::app_role]));

-- Config settings for optional providers
INSERT INTO public.config_settings (key, value, description, category, is_sensitive)
VALUES 
  ('risk.providers.twilio_lookup', 'false', 'Enable Twilio Lookup for phone carrier/VOIP detection', 'risk', false),
  ('risk.providers.email_reputation', 'false', 'Enable external email reputation checking', 'risk', false)
ON CONFLICT (key) DO NOTHING;
