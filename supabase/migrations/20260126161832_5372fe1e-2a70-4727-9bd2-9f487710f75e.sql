-- ========================================================
-- PHASE 1: OMNICHANNEL LEAD HUB DATA MODEL
-- ========================================================

-- 1) Lead Channels Reference Table
CREATE TABLE IF NOT EXISTS public.lead_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_api_key BOOLEAN DEFAULT false,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed authorized channels
INSERT INTO public.lead_channels (channel_key, display_name, icon, description, is_active) VALUES
  ('WEBSITE_QUOTE', 'Website Quote', '🌐', 'Leads from website quote calculator', true),
  ('WEBSITE_CHAT', 'Website Chat', '💬', 'Leads from website chat widget', true),
  ('WEBSITE_FORM', 'Website Form', '📝', 'Leads from contact/inquiry forms', true),
  ('GOOGLE_ADS', 'Google Ads', '📊', 'Google Ads lead forms and clicks', true),
  ('GBP_CALL', 'GBP Call', '📞', 'Google Business Profile call tracking', true),
  ('GBP_MESSAGE', 'GBP Message', '💬', 'Google Business Profile messages', true),
  ('FB_MESSENGER', 'Facebook Messenger', '📘', 'Facebook page messenger leads', true),
  ('INSTAGRAM_DM', 'Instagram DM', '📸', 'Instagram direct messages', true),
  ('WHATSAPP', 'WhatsApp', '📱', 'WhatsApp Business messages', true),
  ('YELP', 'Yelp', '⭐', 'Yelp messages and leads', true),
  ('NEXTDOOR', 'Nextdoor', '🏘️', 'Nextdoor messages', true),
  ('SMS_INBOUND', 'SMS Inbound', '📲', 'Inbound text messages', true),
  ('PHONE_CALL', 'Phone Call', '☎️', 'Inbound phone calls', true),
  ('YOUTUBE', 'YouTube', '▶️', 'YouTube lead forms/links', true),
  ('CRAIGSLIST', 'Craigslist', '📋', 'Craigslist inquiries (manual)', true),
  ('REFERRAL', 'Referral', '🤝', 'Partner/customer referrals', true)
ON CONFLICT (channel_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.lead_channels ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Authenticated users can view lead channels" ON public.lead_channels;
CREATE POLICY "Authenticated users can view lead channels"
ON public.lead_channels FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage lead channels" ON public.lead_channels;
CREATE POLICY "Admins can manage lead channels"
ON public.lead_channels FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Add missing columns to sales_leads
ALTER TABLE public.sales_leads 
ADD COLUMN IF NOT EXISTS channel_key TEXT,
ADD COLUMN IF NOT EXISTS message_excerpt TEXT,
ADD COLUMN IF NOT EXISTS call_recording_id UUID,
ADD COLUMN IF NOT EXISTS ai_recommended_action TEXT,
ADD COLUMN IF NOT EXISTS ai_mode TEXT DEFAULT 'DRY_RUN';

-- 3) Lead Dedup Keys Table
CREATE TABLE IF NOT EXISTS public.lead_dedup_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  phone_normalized TEXT,
  email_normalized TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(phone_normalized, email_normalized)
);

CREATE INDEX IF NOT EXISTS idx_lead_dedup_phone ON public.lead_dedup_keys(phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_dedup_email ON public.lead_dedup_keys(email_normalized) WHERE email_normalized IS NOT NULL;

ALTER TABLE public.lead_dedup_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view dedup keys" ON public.lead_dedup_keys;
CREATE POLICY "Staff can view dedup keys"
ON public.lead_dedup_keys FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));

-- 4) Add channel_key to lead_events
ALTER TABLE public.lead_events ADD COLUMN IF NOT EXISTS channel_key TEXT;

-- 5) Create unified lead capture function with dedup
CREATE OR REPLACE FUNCTION public.capture_omnichannel_lead(
  p_channel_key TEXT,
  p_contact_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_zip TEXT DEFAULT NULL,
  p_message_excerpt TEXT DEFAULT NULL,
  p_consent_status TEXT DEFAULT 'UNKNOWN',
  p_utm_source TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL,
  p_gclid TEXT DEFAULT NULL,
  p_raw_payload JSONB DEFAULT '{}'::jsonb,
  p_dedup_window_days INTEGER DEFAULT 30
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id UUID;
  v_existing_lead_id UUID;
  v_phone_normalized TEXT;
  v_email_normalized TEXT;
  v_is_existing_customer BOOLEAN;
  v_assign_team TEXT := 'sales';
BEGIN
  -- Normalize phone
  v_phone_normalized := regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g');
  IF length(v_phone_normalized) > 10 THEN
    v_phone_normalized := right(v_phone_normalized, 10);
  END IF;
  IF v_phone_normalized = '' THEN
    v_phone_normalized := NULL;
  END IF;
  
  -- Normalize email
  v_email_normalized := lower(trim(p_email));
  IF v_email_normalized = '' THEN
    v_email_normalized := NULL;
  END IF;
  
  -- Check for existing lead within dedup window
  SELECT dk.lead_id INTO v_existing_lead_id
  FROM public.lead_dedup_keys dk
  JOIN public.sales_leads sl ON sl.id = dk.lead_id
  WHERE sl.created_at > now() - (p_dedup_window_days || ' days')::interval
    AND (
      (v_phone_normalized IS NOT NULL AND dk.phone_normalized = v_phone_normalized)
      OR (v_email_normalized IS NOT NULL AND dk.email_normalized = v_email_normalized)
    )
  ORDER BY sl.created_at DESC
  LIMIT 1;
  
  IF v_existing_lead_id IS NOT NULL THEN
    -- Update existing lead with new touchpoint
    UPDATE public.sales_leads SET
      notes = COALESCE(notes, '') || E'\n[' || now()::text || '] New touchpoint from ' || p_channel_key || 
        CASE WHEN p_message_excerpt IS NOT NULL THEN ': ' || left(p_message_excerpt, 200) ELSE '' END,
      raw_payload_json = COALESCE(raw_payload_json, '{}'::jsonb) || jsonb_build_object(
        'touchpoints', COALESCE(raw_payload_json->'touchpoints', '[]'::jsonb) || 
        jsonb_build_array(jsonb_build_object(
          'channel', p_channel_key,
          'timestamp', now(),
          'message', p_message_excerpt
        ))
      ),
      updated_at = now()
    WHERE id = v_existing_lead_id;
    
    INSERT INTO public.lead_events (lead_id, event_type, channel_key, payload_json)
    VALUES (v_existing_lead_id, 'DEDUPLICATED', p_channel_key, jsonb_build_object('channel', p_channel_key));
    
    RETURN v_existing_lead_id;
  END IF;
  
  -- Check if existing customer
  v_is_existing_customer := public.check_existing_customer(v_phone_normalized, v_email_normalized);
  IF v_is_existing_customer THEN
    v_assign_team := 'cs';
  END IF;
  
  -- Create new lead
  INSERT INTO public.sales_leads (
    source_key, lead_source, channel_key,
    customer_name, customer_phone, customer_email,
    company_name, address, city, zip,
    message_excerpt, consent_status,
    utm_source, utm_campaign, utm_term, gclid,
    raw_payload_json, lead_status, assignment_type,
    is_existing_customer, ai_mode
  ) VALUES (
    p_channel_key, p_channel_key, p_channel_key,
    p_contact_name, v_phone_normalized, v_email_normalized,
    p_company_name, p_address, p_city, p_zip,
    p_message_excerpt, p_consent_status,
    p_utm_source, p_utm_campaign, p_utm_term, p_gclid,
    p_raw_payload, 'new', v_assign_team,
    v_is_existing_customer, 'DRY_RUN'
  )
  RETURNING id INTO v_lead_id;
  
  -- Create dedup key
  INSERT INTO public.lead_dedup_keys (lead_id, phone_normalized, email_normalized)
  VALUES (v_lead_id, v_phone_normalized, v_email_normalized)
  ON CONFLICT (phone_normalized, email_normalized) DO NOTHING;
  
  -- Log creation event
  INSERT INTO public.lead_events (lead_id, event_type, channel_key, payload_json)
  VALUES (v_lead_id, 'CREATED', p_channel_key, jsonb_build_object(
    'channel', p_channel_key,
    'assigned_team', v_assign_team,
    'is_existing_customer', v_is_existing_customer
  ));
  
  RETURN v_lead_id;
END;
$$;

-- 6) Auto-assignment function using correct column name (assigned_to)
CREATE OR REPLACE FUNCTION public.auto_assign_lead(p_lead_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead RECORD;
  v_assigned_user_id UUID;
  v_team TEXT;
BEGIN
  SELECT * INTO v_lead FROM public.sales_leads WHERE id = p_lead_id;
  
  IF v_lead IS NULL THEN
    RETURN 'LEAD_NOT_FOUND';
  END IF;
  
  v_team := COALESCE(v_lead.assignment_type, 'sales');
  
  SELECT aa.user_id INTO v_assigned_user_id
  FROM public.agent_availability aa
  JOIN public.user_roles ur ON ur.user_id = aa.user_id
  WHERE aa.status = 'ONLINE'
    AND ur.role = v_team::app_role
  ORDER BY aa.calls_today ASC, aa.last_call_ended_at ASC NULLS FIRST
  LIMIT 1;
  
  IF v_assigned_user_id IS NOT NULL THEN
    UPDATE public.sales_leads SET
      assigned_to = v_assigned_user_id,
      assigned_at = now()
    WHERE id = p_lead_id;
    
    INSERT INTO public.lead_events (lead_id, event_type, payload_json)
    VALUES (p_lead_id, 'ASSIGNED', jsonb_build_object(
      'assigned_to', v_assigned_user_id,
      'team', v_team,
      'method', 'auto_round_robin'
    ));
    
    RETURN 'ASSIGNED';
  END IF;
  
  RETURN 'NO_AVAILABLE_AGENT';
END;
$$;

-- 7) Update lead status function
CREATE OR REPLACE FUNCTION public.update_lead_status(
  p_lead_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  SELECT lead_status INTO v_old_status FROM public.sales_leads WHERE id = p_lead_id;
  
  UPDATE public.sales_leads SET
    lead_status = p_status,
    notes = CASE WHEN p_notes IS NOT NULL 
      THEN COALESCE(notes, '') || E'\n[' || now()::text || '] Status → ' || p_status || ': ' || p_notes
      ELSE notes END,
    updated_at = now()
  WHERE id = p_lead_id;
  
  INSERT INTO public.lead_events (lead_id, event_type, payload_json)
  VALUES (p_lead_id, 'STATUS_CHANGED', jsonb_build_object(
    'from', v_old_status,
    'to', p_status,
    'notes', p_notes,
    'changed_by', auth.uid()
  ));
  
  RETURN true;
END;
$$;

-- 8) Indexes for lead queries
CREATE INDEX IF NOT EXISTS idx_sales_leads_channel ON public.sales_leads(channel_key);
CREATE INDEX IF NOT EXISTS idx_sales_leads_status ON public.sales_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_sales_leads_urgency ON public.sales_leads(urgency_score DESC);
CREATE INDEX IF NOT EXISTS idx_sales_leads_assigned ON public.sales_leads(assignment_type, assigned_to);
CREATE INDEX IF NOT EXISTS idx_lead_events_channel ON public.lead_events(channel_key);