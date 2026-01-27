-- Migration tracking table for GHL to Twilio transition
CREATE TABLE public.telephony_migrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  friendly_name TEXT,
  purpose phone_purpose NOT NULL,
  current_provider TEXT NOT NULL DEFAULT 'GHL',
  target_provider TEXT NOT NULL DEFAULT 'TWILIO',
  migration_method TEXT NOT NULL CHECK (migration_method IN ('PORT', 'FORWARD', 'DUAL_RING')),
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'TESTING', 'LIVE', 'DONE', 'ROLLED_BACK')),
  ghl_routing_rules JSONB,
  business_hours JSONB,
  voicemail_enabled BOOLEAN DEFAULT true,
  recording_enabled BOOLEAN DEFAULT true,
  twilio_number_id UUID REFERENCES phone_numbers(id),
  cutover_started_at TIMESTAMPTZ,
  cutover_completed_at TIMESTAMPTZ,
  rollback_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add call source tracking to call_events
ALTER TABLE public.call_events
ADD COLUMN IF NOT EXISTS call_source TEXT DEFAULT 'NATIVE',
ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;

-- Call history import logs
CREATE TABLE public.call_history_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT,
  records_total INTEGER DEFAULT 0,
  records_imported INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  errors JSONB,
  imported_by UUID,
  imported_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telephony_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history_imports ENABLE ROW LEVEL SECURITY;

-- RLS policies for telephony_migrations (admin-only)
CREATE POLICY "Admins can manage telephony migrations"
ON public.telephony_migrations
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'executive'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'executive'::app_role]));

-- RLS policies for call_history_imports (admin-only)
CREATE POLICY "Admins can manage call history imports"
ON public.call_history_imports
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'executive'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'executive'::app_role]));

-- Create index for faster lookups
CREATE INDEX idx_telephony_migrations_status ON public.telephony_migrations(status);
CREATE INDEX idx_call_events_source ON public.call_events(call_source) WHERE call_source != 'NATIVE';
CREATE INDEX idx_call_events_historical ON public.call_events(is_historical) WHERE is_historical = true;