-- =====================================================
-- AI LEAD CAPTURE ENGINE - Phase 1: Core Tables
-- =====================================================

-- 1) Lead Sources Reference Table
CREATE TABLE IF NOT EXISTS public.lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'globe',
  is_active BOOLEAN DEFAULT true,
  requires_consent BOOLEAN DEFAULT true,
  is_automated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Extend sales_leads table with new columns for the engine
ALTER TABLE public.sales_leads 
  ADD COLUMN IF NOT EXISTS source_key TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS zip TEXT,
  ADD COLUMN IF NOT EXISTS customer_type_detected TEXT,
  ADD COLUMN IF NOT EXISTS project_category TEXT,
  ADD COLUMN IF NOT EXISTS requested_service TEXT DEFAULT 'dumpster',
  ADD COLUMN IF NOT EXISTS consent_status TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS gclid TEXT,
  ADD COLUMN IF NOT EXISTS urgency_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_classification_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS first_response_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linked_contact_id UUID,
  ADD COLUMN IF NOT EXISTS linked_opportunity_id UUID,
  ADD COLUMN IF NOT EXISTS raw_payload_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS market_code TEXT,
  ADD COLUMN IF NOT EXISTS capture_ip TEXT,
  ADD COLUMN IF NOT EXISTS capture_user_agent TEXT;

-- Add FK after table alteration to avoid issues
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sales_leads_linked_contact_id_fkey'
  ) THEN
    ALTER TABLE public.sales_leads 
      ADD CONSTRAINT sales_leads_linked_contact_id_fkey 
      FOREIGN KEY (linked_contact_id) REFERENCES public.customers(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sales_leads_linked_opportunity_id_fkey'
  ) THEN
    ALTER TABLE public.sales_leads 
      ADD CONSTRAINT sales_leads_linked_opportunity_id_fkey 
      FOREIGN KEY (linked_opportunity_id) REFERENCES public.opportunities(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3) Extend lead_events with payload_json
ALTER TABLE public.lead_events
  ADD COLUMN IF NOT EXISTS payload_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS event_source TEXT DEFAULT 'system';

-- 4) Lead Export Jobs Table
CREATE TABLE IF NOT EXISTS public.lead_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES auth.users(id),
  requested_by_email TEXT,
  export_format TEXT NOT NULL DEFAULT 'csv',
  filters_json JSONB DEFAULT '{}'::jsonb,
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  output_file_path TEXT,
  output_file_url TEXT,
  error_message TEXT,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 5) Lead Assignment Rules Table
CREATE TABLE IF NOT EXISTS public.lead_assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  priority INTEGER DEFAULT 50,
  conditions_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  assign_to_team TEXT,
  assign_to_user_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6) RLS Policies for lead_sources
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active lead sources" ON public.lead_sources;
CREATE POLICY "Anyone can read active lead sources"
  ON public.lead_sources FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage lead sources" ON public.lead_sources;
CREATE POLICY "Admins can manage lead sources"
  ON public.lead_sources FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7) RLS Policies for lead_export_jobs
ALTER TABLE public.lead_export_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own export jobs" ON public.lead_export_jobs;
CREATE POLICY "Users can view their own export jobs"
  ON public.lead_export_jobs FOR SELECT
  TO authenticated
  USING (requested_by = auth.uid() OR public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));

DROP POLICY IF EXISTS "Sales and CS can create export jobs" ON public.lead_export_jobs;
CREATE POLICY "Sales and CS can create export jobs"
  ON public.lead_export_jobs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));

DROP POLICY IF EXISTS "Admins can update export jobs" ON public.lead_export_jobs;
CREATE POLICY "Admins can update export jobs"
  ON public.lead_export_jobs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8) RLS Policies for lead_assignment_rules
ALTER TABLE public.lead_assignment_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active assignment rules" ON public.lead_assignment_rules;
CREATE POLICY "Anyone can read active assignment rules"
  ON public.lead_assignment_rules FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage assignment rules" ON public.lead_assignment_rules;
CREATE POLICY "Admins can manage assignment rules"
  ON public.lead_assignment_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_leads_source_key ON public.sales_leads(source_key);
CREATE INDEX IF NOT EXISTS idx_sales_leads_customer_type_detected ON public.sales_leads(customer_type_detected);
CREATE INDEX IF NOT EXISTS idx_sales_leads_market_code ON public.sales_leads(market_code);
CREATE INDEX IF NOT EXISTS idx_sales_leads_consent_status ON public.sales_leads(consent_status);
CREATE INDEX IF NOT EXISTS idx_sales_leads_gclid ON public.sales_leads(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_export_jobs_status ON public.lead_export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_lead_events_payload ON public.lead_events USING gin(payload_json);

-- 10) Function to create lead with deduplication
CREATE OR REPLACE FUNCTION public.create_or_update_lead(
  p_source_key TEXT,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_zip TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL,
  p_gclid TEXT DEFAULT NULL,
  p_raw_payload JSONB DEFAULT '{}'::jsonb,
  p_dedup_hours INTEGER DEFAULT 24
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id UUID;
  v_existing_lead_id UUID;
  v_clean_phone TEXT;
BEGIN
  -- Clean phone number
  v_clean_phone := regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF length(v_clean_phone) > 10 THEN
    v_clean_phone := right(v_clean_phone, 10);
  END IF;
  
  -- Check for existing lead within dedup window
  SELECT id INTO v_existing_lead_id
  FROM public.sales_leads
  WHERE (
    (v_clean_phone != '' AND customer_phone LIKE '%' || v_clean_phone || '%')
    OR (p_customer_email IS NOT NULL AND customer_email = p_customer_email)
  )
  AND created_at > now() - (p_dedup_hours || ' hours')::interval
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_existing_lead_id IS NOT NULL THEN
    -- Update existing lead with new data
    UPDATE public.sales_leads SET
      notes = COALESCE(notes, '') || E'\n[' || now()::text || '] New touchpoint from ' || p_source_key || ': ' || COALESCE(p_notes, ''),
      raw_payload_json = raw_payload_json || jsonb_build_object('touchpoints', 
        COALESCE(raw_payload_json->'touchpoints', '[]'::jsonb) || jsonb_build_array(p_raw_payload)),
      updated_at = now()
    WHERE id = v_existing_lead_id;
    
    -- Log dedup event
    INSERT INTO public.lead_events (lead_id, event_type, payload_json)
    VALUES (v_existing_lead_id, 'DEDUPLICATED', jsonb_build_object('source', p_source_key, 'original_payload', p_raw_payload));
    
    RETURN v_existing_lead_id;
  END IF;
  
  -- Create new lead
  INSERT INTO public.sales_leads (
    source_key, lead_source, customer_name, customer_phone, customer_email,
    company_name, address, city, zip, notes,
    utm_source, utm_campaign, utm_term, gclid, raw_payload_json,
    lead_status, assignment_type
  ) VALUES (
    p_source_key, p_source_key, p_customer_name, v_clean_phone, p_customer_email,
    p_company_name, p_address, p_city, p_zip, p_notes,
    p_utm_source, p_utm_campaign, p_utm_term, p_gclid, p_raw_payload,
    'new', 'sales'
  )
  RETURNING id INTO v_lead_id;
  
  -- Log creation event
  INSERT INTO public.lead_events (lead_id, event_type, payload_json)
  VALUES (v_lead_id, 'CREATED', jsonb_build_object('source', p_source_key));
  
  RETURN v_lead_id;
END;
$$;

-- 11) Function to classify and route lead
CREATE OR REPLACE FUNCTION public.classify_and_route_lead(p_lead_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead RECORD;
  v_is_existing BOOLEAN;
  v_assign_team TEXT := 'sales';
  v_customer_type TEXT := 'unknown';
BEGIN
  -- Get lead
  SELECT * INTO v_lead FROM public.sales_leads WHERE id = p_lead_id;
  IF v_lead IS NULL THEN
    RETURN jsonb_build_object('error', 'Lead not found');
  END IF;
  
  -- Check if existing customer
  v_is_existing := public.check_existing_customer(v_lead.customer_phone, v_lead.customer_email);
  
  -- Determine assignment
  IF v_is_existing THEN
    v_assign_team := 'cs';
  END IF;
  
  -- Detect customer type from company name
  IF v_lead.company_name IS NOT NULL AND (
    v_lead.company_name ILIKE '%LLC%' OR 
    v_lead.company_name ILIKE '%Inc%' OR 
    v_lead.company_name ILIKE '%Construction%' OR
    v_lead.company_name ILIKE '%Builders%'
  ) THEN
    v_customer_type := 'contractor';
    v_assign_team := 'sales';
  ELSIF v_lead.customer_email IS NOT NULL AND (
    v_lead.customer_email LIKE '%@gmail.com' OR
    v_lead.customer_email LIKE '%@yahoo.com' OR
    v_lead.customer_email LIKE '%@hotmail.com'
  ) THEN
    v_customer_type := 'homeowner';
  END IF;
  
  -- Update lead with classification
  UPDATE public.sales_leads SET
    customer_type_detected = v_customer_type,
    assignment_type = v_assign_team,
    is_existing_customer = v_is_existing,
    ai_classification_json = jsonb_build_object(
      'classified_at', now(),
      'customer_type', v_customer_type,
      'is_existing', v_is_existing,
      'assigned_team', v_assign_team
    ),
    updated_at = now()
  WHERE id = p_lead_id;
  
  -- Log event
  INSERT INTO public.lead_events (lead_id, event_type, payload_json)
  VALUES (p_lead_id, 'CLASSIFIED', jsonb_build_object(
    'customer_type', v_customer_type,
    'assigned_team', v_assign_team,
    'is_existing', v_is_existing
  ));
  
  RETURN jsonb_build_object(
    'lead_id', p_lead_id,
    'customer_type', v_customer_type,
    'assigned_team', v_assign_team,
    'is_existing', v_is_existing
  );
END;
$$;

-- 12) Storage bucket for lead exports (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lead-exports', 'lead-exports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lead-exports bucket
DROP POLICY IF EXISTS "Sales/CS/Admin can access lead exports" ON storage.objects;
CREATE POLICY "Sales/CS/Admin can access lead exports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'lead-exports' AND
    public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[])
  );

DROP POLICY IF EXISTS "System can upload lead exports" ON storage.objects;
CREATE POLICY "System can upload lead exports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lead-exports');