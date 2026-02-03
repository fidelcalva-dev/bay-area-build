-- ========================================================
-- PHASE 1: GHL DATA MODEL TABLES
-- ========================================================

-- 1) GHL Connections - tracks location connection status
CREATE TABLE IF NOT EXISTS public.ghl_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL UNIQUE,
  location_name TEXT,
  status TEXT NOT NULL DEFAULT 'CONNECTED' CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'ERROR')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) GHL Message Threads - conversation containers
CREATE TABLE IF NOT EXISTS public.ghl_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_conversation_id TEXT NOT NULL UNIQUE,
  ghl_contact_id TEXT,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'SMS' CHECK (channel IN ('SMS', 'EMAIL', 'FB', 'IG', 'WHATSAPP', 'CHAT')),
  phone_number TEXT,
  email_address TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_direction TEXT CHECK (last_message_direction IN ('INBOUND', 'OUTBOUND')),
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) GHL Messages - individual messages
CREATE TABLE IF NOT EXISTS public.ghl_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_message_id TEXT UNIQUE,
  ghl_conversation_id TEXT NOT NULL,
  thread_id UUID REFERENCES public.ghl_message_threads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  channel TEXT NOT NULL DEFAULT 'SMS' CHECK (channel IN ('SMS', 'EMAIL', 'FB', 'IG', 'WHATSAPP', 'CHAT')),
  from_number TEXT,
  to_number TEXT,
  from_email TEXT,
  to_email TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  attachments_json JSONB DEFAULT '[]'::jsonb,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'RECEIVED', 'READ')),
  error_message TEXT,
  -- CRM linking
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  -- Audit
  sent_by_user_id UUID,
  template_key TEXT,
  is_automated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) GHL Call Logs
CREATE TABLE IF NOT EXISTS public.ghl_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ghl_call_id TEXT UNIQUE,
  ghl_conversation_id TEXT,
  thread_id UUID REFERENCES public.ghl_message_threads(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  caller_name TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'MISSED', 'VOICEMAIL', 'FAILED', 'BUSY', 'NO_ANSWER')),
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  voicemail_url TEXT,
  transcript TEXT,
  -- CRM linking
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  -- Timestamps
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) GHL Sync Log - audit trail
CREATE TABLE IF NOT EXISTS public.ghl_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('MESSAGES', 'CALLS', 'CONTACTS', 'CONVERSATIONS', 'FULL')),
  status TEXT NOT NULL CHECK (status IN ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  details_json JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================
-- INDEXES
-- ========================================================

CREATE INDEX IF NOT EXISTS idx_ghl_threads_conversation ON public.ghl_message_threads(ghl_conversation_id);
CREATE INDEX IF NOT EXISTS idx_ghl_threads_contact ON public.ghl_message_threads(contact_id);
CREATE INDEX IF NOT EXISTS idx_ghl_threads_customer ON public.ghl_message_threads(customer_id);
CREATE INDEX IF NOT EXISTS idx_ghl_threads_lead ON public.ghl_message_threads(lead_id);
CREATE INDEX IF NOT EXISTS idx_ghl_threads_phone ON public.ghl_message_threads(phone_number);
CREATE INDEX IF NOT EXISTS idx_ghl_threads_last_message ON public.ghl_message_threads(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_ghl_messages_conversation ON public.ghl_messages(ghl_conversation_id);
CREATE INDEX IF NOT EXISTS idx_ghl_messages_thread ON public.ghl_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_ghl_messages_contact ON public.ghl_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_ghl_messages_customer ON public.ghl_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_ghl_messages_sent_at ON public.ghl_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_ghl_messages_direction ON public.ghl_messages(direction);

CREATE INDEX IF NOT EXISTS idx_ghl_calls_conversation ON public.ghl_call_logs(ghl_conversation_id);
CREATE INDEX IF NOT EXISTS idx_ghl_calls_contact ON public.ghl_call_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_ghl_calls_customer ON public.ghl_call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_ghl_calls_from ON public.ghl_call_logs(from_number);
CREATE INDEX IF NOT EXISTS idx_ghl_calls_to ON public.ghl_call_logs(to_number);
CREATE INDEX IF NOT EXISTS idx_ghl_calls_started ON public.ghl_call_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_ghl_sync_type_status ON public.ghl_sync_log(sync_type, status);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_created ON public.ghl_sync_log(created_at DESC);

-- ========================================================
-- RLS POLICIES
-- ========================================================

ALTER TABLE public.ghl_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_sync_log ENABLE ROW LEVEL SECURITY;

-- GHL Connections - Admin only
CREATE POLICY "Admin can manage GHL connections"
  ON public.ghl_connections FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'executive']::app_role[]));

-- GHL Message Threads - Staff with appropriate roles
CREATE POLICY "Staff can view GHL threads"
  ON public.ghl_message_threads FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Staff can manage GHL threads"
  ON public.ghl_message_threads FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'sales', 'cs']::app_role[]));

-- GHL Messages - Staff with appropriate roles
CREATE POLICY "Staff can view GHL messages"
  ON public.ghl_messages FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Staff can create GHL messages"
  ON public.ghl_messages FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'sales', 'cs']::app_role[]));

-- GHL Call Logs - Staff with appropriate roles
CREATE POLICY "Staff can view GHL call logs"
  ON public.ghl_call_logs FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Staff can manage GHL call logs"
  ON public.ghl_call_logs FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'sales', 'cs']::app_role[]));

-- GHL Sync Log - Admin only
CREATE POLICY "Admin can view sync logs"
  ON public.ghl_sync_log FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'executive']::app_role[]));

CREATE POLICY "Service role can manage sync logs"
  ON public.ghl_sync_log FOR ALL
  USING (true);

-- ========================================================
-- PHASE 2: LINKING FUNCTIONS
-- ========================================================

-- Function to match contact by phone or email
CREATE OR REPLACE FUNCTION public.ghl_match_contact(
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
) RETURNS TABLE(
  contact_id UUID,
  customer_id UUID,
  lead_id UUID,
  match_type TEXT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_phone_normalized TEXT;
  v_contact RECORD;
  v_customer RECORD;
  v_lead RECORD;
BEGIN
  -- Normalize phone
  IF p_phone IS NOT NULL THEN
    v_phone_normalized := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF length(v_phone_normalized) > 10 THEN
      v_phone_normalized := right(v_phone_normalized, 10);
    END IF;
  END IF;
  
  -- Try to match contact by phone
  IF v_phone_normalized IS NOT NULL AND length(v_phone_normalized) = 10 THEN
    SELECT c.id, c.customer_id INTO v_contact
    FROM public.contacts c
    WHERE c.phone_normalized = v_phone_normalized
    LIMIT 1;
    
    IF v_contact.id IS NOT NULL THEN
      RETURN QUERY SELECT v_contact.id, v_contact.customer_id, NULL::UUID, 'CONTACT_PHONE'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Try to match contact by email
  IF p_email IS NOT NULL THEN
    SELECT c.id, c.customer_id INTO v_contact
    FROM public.contacts c
    WHERE lower(c.email) = lower(p_email)
    LIMIT 1;
    
    IF v_contact.id IS NOT NULL THEN
      RETURN QUERY SELECT v_contact.id, v_contact.customer_id, NULL::UUID, 'CONTACT_EMAIL'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Try to match customer directly by phone
  IF v_phone_normalized IS NOT NULL THEN
    SELECT cu.id INTO v_customer
    FROM public.customers cu
    WHERE regexp_replace(cu.billing_phone, '[^0-9]', '', 'g') LIKE '%' || v_phone_normalized
    LIMIT 1;
    
    IF v_customer.id IS NOT NULL THEN
      RETURN QUERY SELECT NULL::UUID, v_customer.id, NULL::UUID, 'CUSTOMER_PHONE'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Try to match customer by email
  IF p_email IS NOT NULL THEN
    SELECT cu.id INTO v_customer
    FROM public.customers cu
    WHERE lower(cu.billing_email) = lower(p_email)
    LIMIT 1;
    
    IF v_customer.id IS NOT NULL THEN
      RETURN QUERY SELECT NULL::UUID, v_customer.id, NULL::UUID, 'CUSTOMER_EMAIL'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Try to match lead by phone
  IF v_phone_normalized IS NOT NULL THEN
    SELECT l.id INTO v_lead
    FROM public.sales_leads l
    WHERE regexp_replace(l.customer_phone, '[^0-9]', '', 'g') = v_phone_normalized
      AND l.lead_status NOT IN ('converted', 'lost', 'disqualified')
    ORDER BY l.created_at DESC
    LIMIT 1;
    
    IF v_lead.id IS NOT NULL THEN
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, v_lead.id, 'LEAD_PHONE'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Try to match lead by email
  IF p_email IS NOT NULL THEN
    SELECT l.id INTO v_lead
    FROM public.sales_leads l
    WHERE lower(l.customer_email) = lower(p_email)
      AND l.lead_status NOT IN ('converted', 'lost', 'disqualified')
    ORDER BY l.created_at DESC
    LIMIT 1;
    
    IF v_lead.id IS NOT NULL THEN
      RETURN QUERY SELECT NULL::UUID, NULL::UUID, v_lead.id, 'LEAD_EMAIL'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- No match found
  RETURN QUERY SELECT NULL::UUID, NULL::UUID, NULL::UUID, 'NO_MATCH'::TEXT;
END;
$$;

-- Function to create timeline event from GHL message
CREATE OR REPLACE FUNCTION public.ghl_create_message_timeline_event(
  p_message_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_msg RECORD;
  v_event_id UUID;
  v_summary TEXT;
  v_visibility TEXT := 'INTERNAL';
BEGIN
  SELECT * INTO v_msg FROM public.ghl_messages WHERE id = p_message_id;
  
  IF v_msg IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Build summary
  IF v_msg.direction = 'INBOUND' THEN
    v_summary := 'Received ' || v_msg.channel || ': ' || left(COALESCE(v_msg.body_text, ''), 100);
  ELSE
    v_summary := 'Sent ' || v_msg.channel || ': ' || left(COALESCE(v_msg.body_text, ''), 100);
  END IF;
  
  -- Insert timeline event
  INSERT INTO public.timeline_events (
    entity_type, entity_id, event_type, summary, visibility,
    details_json, source, created_at
  ) VALUES (
    p_entity_type, p_entity_id,
    v_msg.channel,
    v_summary,
    v_visibility,
    jsonb_build_object(
      'ghl_message_id', v_msg.ghl_message_id,
      'direction', v_msg.direction,
      'channel', v_msg.channel,
      'from', COALESCE(v_msg.from_number, v_msg.from_email),
      'to', COALESCE(v_msg.to_number, v_msg.to_email),
      'body_excerpt', left(v_msg.body_text, 500),
      'status', v_msg.status,
      'sent_at', v_msg.sent_at
    ),
    'GHL',
    COALESCE(v_msg.sent_at, now())
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to create timeline event from GHL call
CREATE OR REPLACE FUNCTION public.ghl_create_call_timeline_event(
  p_call_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_call RECORD;
  v_event_id UUID;
  v_summary TEXT;
  v_duration_text TEXT;
BEGIN
  SELECT * INTO v_call FROM public.ghl_call_logs WHERE id = p_call_id;
  
  IF v_call IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Format duration
  IF v_call.duration_seconds > 0 THEN
    v_duration_text := (v_call.duration_seconds / 60)::TEXT || 'm ' || (v_call.duration_seconds % 60)::TEXT || 's';
  ELSE
    v_duration_text := '0s';
  END IF;
  
  -- Build summary
  IF v_call.direction = 'INBOUND' THEN
    v_summary := 'Inbound call from ' || v_call.from_number;
  ELSE
    v_summary := 'Outbound call to ' || v_call.to_number;
  END IF;
  
  IF v_call.status = 'MISSED' THEN
    v_summary := v_summary || ' (Missed)';
  ELSIF v_call.status = 'VOICEMAIL' THEN
    v_summary := v_summary || ' (Voicemail)';
  ELSIF v_call.duration_seconds > 0 THEN
    v_summary := v_summary || ' (' || v_duration_text || ')';
  END IF;
  
  -- Insert timeline event
  INSERT INTO public.timeline_events (
    entity_type, entity_id, event_type, summary, visibility,
    details_json, source, created_at
  ) VALUES (
    p_entity_type, p_entity_id,
    'CALL',
    v_summary,
    'INTERNAL',
    jsonb_build_object(
      'ghl_call_id', v_call.ghl_call_id,
      'direction', v_call.direction,
      'from_number', v_call.from_number,
      'to_number', v_call.to_number,
      'duration_seconds', v_call.duration_seconds,
      'status', v_call.status,
      'recording_url', v_call.recording_url,
      'started_at', v_call.started_at
    ),
    'GHL',
    COALESCE(v_call.started_at, now())
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to process inbound GHL message
CREATE OR REPLACE FUNCTION public.ghl_process_inbound_message(
  p_ghl_message_id TEXT,
  p_ghl_conversation_id TEXT,
  p_channel TEXT,
  p_from_number TEXT DEFAULT NULL,
  p_to_number TEXT DEFAULT NULL,
  p_from_email TEXT DEFAULT NULL,
  p_to_email TEXT DEFAULT NULL,
  p_subject TEXT DEFAULT NULL,
  p_body_text TEXT DEFAULT NULL,
  p_sent_at TIMESTAMPTZ DEFAULT now()
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_message_id UUID;
  v_thread_id UUID;
  v_match RECORD;
  v_phone TEXT;
  v_email TEXT;
BEGIN
  -- Check if message already exists
  SELECT id INTO v_message_id FROM public.ghl_messages WHERE ghl_message_id = p_ghl_message_id;
  IF v_message_id IS NOT NULL THEN
    RETURN v_message_id;
  END IF;
  
  -- Determine phone/email for matching
  v_phone := COALESCE(p_from_number, p_to_number);
  v_email := COALESCE(p_from_email, p_to_email);
  
  -- Find or create thread
  SELECT id INTO v_thread_id FROM public.ghl_message_threads WHERE ghl_conversation_id = p_ghl_conversation_id;
  
  IF v_thread_id IS NULL THEN
    -- Match contact/customer/lead
    SELECT * INTO v_match FROM public.ghl_match_contact(v_phone, v_email);
    
    INSERT INTO public.ghl_message_threads (
      ghl_conversation_id, channel, phone_number, email_address,
      contact_id, customer_id, lead_id,
      last_message_at, last_message_direction, unread_count
    ) VALUES (
      p_ghl_conversation_id, p_channel, v_phone, v_email,
      v_match.contact_id, v_match.customer_id, v_match.lead_id,
      p_sent_at, 'INBOUND', 1
    ) RETURNING id INTO v_thread_id;
  ELSE
    -- Update thread
    SELECT contact_id, customer_id, lead_id INTO v_match FROM public.ghl_message_threads WHERE id = v_thread_id;
    
    UPDATE public.ghl_message_threads SET
      last_message_at = p_sent_at,
      last_message_direction = 'INBOUND',
      unread_count = unread_count + 1,
      updated_at = now()
    WHERE id = v_thread_id;
  END IF;
  
  -- Insert message
  INSERT INTO public.ghl_messages (
    ghl_message_id, ghl_conversation_id, thread_id,
    direction, channel, from_number, to_number, from_email, to_email,
    subject, body_text, sent_at, status,
    contact_id, customer_id, lead_id
  ) VALUES (
    p_ghl_message_id, p_ghl_conversation_id, v_thread_id,
    'INBOUND', p_channel, p_from_number, p_to_number, p_from_email, p_to_email,
    p_subject, p_body_text, p_sent_at, 'RECEIVED',
    v_match.contact_id, v_match.customer_id, v_match.lead_id
  ) RETURNING id INTO v_message_id;
  
  -- Create timeline events
  IF v_match.customer_id IS NOT NULL THEN
    PERFORM public.ghl_create_message_timeline_event(v_message_id, 'CUSTOMER', v_match.customer_id);
  END IF;
  IF v_match.lead_id IS NOT NULL THEN
    PERFORM public.ghl_create_message_timeline_event(v_message_id, 'LEAD', v_match.lead_id);
  END IF;
  
  -- Handle STOP keyword for SMS opt-out
  IF p_channel = 'SMS' AND lower(trim(p_body_text)) IN ('stop', 'unsubscribe', 'cancel', 'quit') THEN
    IF v_match.customer_id IS NOT NULL THEN
      UPDATE public.customers SET
        sms_opt_out = true,
        sms_opt_out_at = now()
      WHERE id = v_match.customer_id;
    END IF;
    IF v_match.contact_id IS NOT NULL THEN
      UPDATE public.contacts SET
        sms_opt_out = true,
        sms_opt_out_at = now()
      WHERE id = v_match.contact_id;
    END IF;
  END IF;
  
  RETURN v_message_id;
END;
$$;

-- Function to process inbound GHL call
CREATE OR REPLACE FUNCTION public.ghl_process_inbound_call(
  p_ghl_call_id TEXT,
  p_ghl_conversation_id TEXT DEFAULT NULL,
  p_direction TEXT DEFAULT 'INBOUND',
  p_from_number TEXT DEFAULT NULL,
  p_to_number TEXT DEFAULT NULL,
  p_duration_seconds INTEGER DEFAULT 0,
  p_status TEXT DEFAULT 'COMPLETED',
  p_recording_url TEXT DEFAULT NULL,
  p_started_at TIMESTAMPTZ DEFAULT now()
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_call_id UUID;
  v_thread_id UUID;
  v_match RECORD;
  v_phone TEXT;
BEGIN
  -- Check if call already exists
  SELECT id INTO v_call_id FROM public.ghl_call_logs WHERE ghl_call_id = p_ghl_call_id;
  IF v_call_id IS NOT NULL THEN
    RETURN v_call_id;
  END IF;
  
  -- Determine phone for matching
  v_phone := CASE WHEN p_direction = 'INBOUND' THEN p_from_number ELSE p_to_number END;
  
  -- Match contact/customer/lead
  SELECT * INTO v_match FROM public.ghl_match_contact(v_phone, NULL);
  
  -- Find thread if conversation_id provided
  IF p_ghl_conversation_id IS NOT NULL THEN
    SELECT id INTO v_thread_id FROM public.ghl_message_threads WHERE ghl_conversation_id = p_ghl_conversation_id;
  END IF;
  
  -- Insert call log
  INSERT INTO public.ghl_call_logs (
    ghl_call_id, ghl_conversation_id, thread_id,
    direction, from_number, to_number,
    duration_seconds, status, recording_url, started_at,
    contact_id, customer_id, lead_id
  ) VALUES (
    p_ghl_call_id, p_ghl_conversation_id, v_thread_id,
    p_direction, p_from_number, p_to_number,
    p_duration_seconds, p_status, p_recording_url, p_started_at,
    v_match.contact_id, v_match.customer_id, v_match.lead_id
  ) RETURNING id INTO v_call_id;
  
  -- Create timeline events
  IF v_match.customer_id IS NOT NULL THEN
    PERFORM public.ghl_create_call_timeline_event(v_call_id, 'CUSTOMER', v_match.customer_id);
  END IF;
  IF v_match.lead_id IS NOT NULL THEN
    PERFORM public.ghl_create_call_timeline_event(v_call_id, 'LEAD', v_match.lead_id);
  END IF;
  
  -- Create callback task for missed calls
  IF p_status IN ('MISSED', 'NO_ANSWER') AND (v_match.customer_id IS NOT NULL OR v_match.lead_id IS NOT NULL) THEN
    INSERT INTO public.crm_tasks (
      entity_type, entity_id,
      task_type, subject, description,
      priority, due_date, assigned_team
    ) VALUES (
      CASE WHEN v_match.customer_id IS NOT NULL THEN 'customer' ELSE 'lead' END,
      COALESCE(v_match.customer_id, v_match.lead_id),
      'callback',
      'Missed Call - Callback Required',
      'Missed call from ' || v_phone || ' at ' || p_started_at::TEXT,
      'high',
      now() + interval '15 minutes',
      CASE WHEN v_match.lead_id IS NOT NULL THEN 'sales' ELSE 'cs' END
    );
  END IF;
  
  RETURN v_call_id;
END;
$$;

-- Add config settings for GHL
INSERT INTO public.config_settings (key, value, category, description)
VALUES 
  ('ghl.email_enabled', '"true"', 'integrations', 'Enable GHL email sending'),
  ('ghl.sms_enabled', '"true"', 'integrations', 'Enable GHL SMS sending'),
  ('ghl.webhook_signature_secret', '""', 'integrations', 'GHL webhook signature secret for verification'),
  ('ghl.sync_interval_minutes', '"5"', 'integrations', 'Polling interval for GHL sync')
ON CONFLICT (key) DO NOTHING;

-- Add sms_opt_out columns to contacts if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'sms_opt_out') THEN
    ALTER TABLE public.contacts ADD COLUMN sms_opt_out BOOLEAN DEFAULT false;
    ALTER TABLE public.contacts ADD COLUMN sms_opt_out_at TIMESTAMPTZ;
  END IF;
END $$;