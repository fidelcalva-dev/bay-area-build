-- =============================================
-- TELEPHONY SYSTEM - COMPLETE MIGRATION
-- =============================================

-- Enum for phone number purposes
CREATE TYPE public.phone_purpose AS ENUM ('SALES', 'CS', 'BILLING');

-- Enum for call directions
CREATE TYPE public.call_direction AS ENUM ('INBOUND', 'OUTBOUND');

-- Enum for call statuses
CREATE TYPE public.call_status AS ENUM ('RINGING', 'ANSWERED', 'MISSED', 'VOICEMAIL', 'COMPLETED', 'FAILED');

-- 1) phone_numbers - Company phone lines
CREATE TABLE public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twilio_number TEXT NOT NULL UNIQUE,
  friendly_name TEXT,
  purpose public.phone_purpose NOT NULL,
  market_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2) call_events - All call records
CREATE TABLE public.call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twilio_call_sid TEXT UNIQUE,
  direction public.call_direction NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  phone_number_id UUID REFERENCES public.phone_numbers(id),
  contact_id UUID REFERENCES public.customers(id),
  order_id UUID REFERENCES public.orders(id),
  assigned_user_id UUID REFERENCES auth.users(id),
  call_status public.call_status NOT NULL DEFAULT 'RINGING',
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  recording_sid TEXT,
  notes TEXT,
  caller_name TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3) call_assignments - Track agent assignments
CREATE TABLE public.call_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role public.phone_purpose NOT NULL,
  offered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4) voicemails - Voicemail recordings
CREATE TABLE public.voicemails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_events(id) ON DELETE CASCADE,
  audio_path TEXT NOT NULL,
  transcription TEXT,
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5) agent_availability - Track agent status
CREATE TABLE public.agent_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  status TEXT NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'BUSY', 'AWAY', 'OFFLINE')),
  current_call_id UUID REFERENCES public.call_events(id),
  last_call_ended_at TIMESTAMP WITH TIME ZONE,
  calls_today INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6) call_tasks - Auto-generated follow-up tasks
CREATE TABLE public.call_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.call_events(id),
  task_type TEXT NOT NULL CHECK (task_type IN ('CALLBACK', 'VOICEMAIL_REVIEW', 'FOLLOW_UP', 'ESCALATION')),
  assigned_to UUID REFERENCES auth.users(id),
  priority INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_call_events_status ON public.call_events(call_status);
CREATE INDEX idx_call_events_direction ON public.call_events(direction);
CREATE INDEX idx_call_events_started_at ON public.call_events(started_at DESC);
CREATE INDEX idx_call_events_assigned_user ON public.call_events(assigned_user_id);
CREATE INDEX idx_call_events_contact ON public.call_events(contact_id);
CREATE INDEX idx_call_events_order ON public.call_events(order_id);
CREATE INDEX idx_call_assignments_user ON public.call_assignments(user_id);
CREATE INDEX idx_agent_availability_status ON public.agent_availability(status);
CREATE INDEX idx_call_tasks_assigned ON public.call_tasks(assigned_to, completed_at);
CREATE INDEX idx_voicemails_reviewed ON public.voicemails(is_reviewed);

-- Enable RLS on all tables
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voicemails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phone_numbers
CREATE POLICY "Staff can view active phone numbers"
ON public.phone_numbers FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Admin can manage phone numbers"
ON public.phone_numbers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for call_events
CREATE POLICY "Staff can view calls"
ON public.call_events FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Staff can insert calls"
ON public.call_events FOR INSERT
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Staff can update their calls"
ON public.call_events FOR UPDATE
USING (assigned_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for call_assignments
CREATE POLICY "Staff can view assignments"
ON public.call_assignments FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Staff can manage own assignments"
ON public.call_assignments FOR ALL
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for voicemails
CREATE POLICY "Staff can view voicemails"
ON public.voicemails FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Staff can update voicemails"
ON public.voicemails FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

-- RLS Policies for agent_availability
CREATE POLICY "Staff can view availability"
ON public.agent_availability FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Users can manage own availability"
ON public.agent_availability FOR ALL
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for call_tasks
CREATE POLICY "Staff can view tasks"
ON public.call_tasks FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

CREATE POLICY "Staff can manage tasks"
ON public.call_tasks FOR ALL
USING (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_phone_numbers_updated_at
BEFORE UPDATE ON public.phone_numbers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_availability_updated_at
BEFORE UPDATE ON public.agent_availability
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to find available agent for routing
CREATE OR REPLACE FUNCTION public.find_available_agent(p_purpose phone_purpose)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agent_id UUID;
  v_role app_role;
BEGIN
  v_role := CASE p_purpose
    WHEN 'SALES' THEN 'sales'::app_role
    WHEN 'CS' THEN 'cs'::app_role
    WHEN 'BILLING' THEN 'finance'::app_role
  END;
  
  SELECT aa.user_id INTO v_agent_id
  FROM agent_availability aa
  JOIN user_roles ur ON ur.user_id = aa.user_id
  WHERE aa.status = 'ONLINE'
    AND ur.role = v_role
  ORDER BY aa.calls_today ASC, aa.last_call_ended_at ASC NULLS FIRST
  LIMIT 1;
  
  RETURN v_agent_id;
END;
$$;

-- Function to log call event from webhook
CREATE OR REPLACE FUNCTION public.log_call_event(
  p_twilio_sid TEXT,
  p_direction call_direction,
  p_from TEXT,
  p_to TEXT,
  p_status call_status DEFAULT 'RINGING'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_call_id UUID;
  v_phone_id UUID;
  v_contact_id UUID;
BEGIN
  SELECT id INTO v_phone_id
  FROM phone_numbers
  WHERE twilio_number = CASE 
    WHEN p_direction = 'INBOUND' THEN p_to 
    ELSE p_from 
  END
  AND is_active = true;
  
  SELECT id INTO v_contact_id
  FROM customers
  WHERE billing_phone = REPLACE(REPLACE(REPLACE(p_from, '+1', ''), '-', ''), ' ', '')
  LIMIT 1;
  
  INSERT INTO call_events (
    twilio_call_sid, direction, from_number, to_number,
    phone_number_id, contact_id, call_status
  ) VALUES (
    p_twilio_sid, p_direction, p_from, p_to,
    v_phone_id, v_contact_id, p_status
  ) RETURNING id INTO v_call_id;
  
  RETURN v_call_id;
END;
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_availability;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_assignments;

-- Create storage bucket for call recordings (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('call-recordings', 'call-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for call recordings
CREATE POLICY "Staff can view call recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'call-recordings' AND
  public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[])
);

CREATE POLICY "System can upload call recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'call-recordings');