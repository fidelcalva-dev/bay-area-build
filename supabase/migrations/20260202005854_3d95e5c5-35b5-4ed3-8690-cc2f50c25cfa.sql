-- ============================================================
-- LIVE CALL AI COACH - DATABASE SCHEMA
-- ============================================================

-- Enum for transcript status
CREATE TYPE public.transcript_status AS ENUM ('LIVE', 'FINAL', 'FAILED');

-- Enum for followup status
CREATE TYPE public.call_followup_status AS ENUM ('DRAFT', 'SENT', 'DISCARDED');

-- Enum for call AI event types
CREATE TYPE public.call_ai_event_type AS ENUM ('TRANSCRIPT_CHUNK', 'INSIGHT_UPDATE', 'COACH_PROMPT', 'AGENT_ACTION', 'DISCLAIMER_PLAYED');

-- ============================================================
-- 1) call_transcripts - Rolling/final transcription storage
-- ============================================================
CREATE TABLE public.call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_events(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'TWILIO_STREAM',
  status transcript_status NOT NULL DEFAULT 'LIVE',
  transcript_text TEXT,
  language TEXT DEFAULT 'en',
  word_count INTEGER DEFAULT 0,
  confidence_avg NUMERIC(4,3),
  speaker_segments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for call_transcripts
CREATE INDEX idx_call_transcripts_call_id ON public.call_transcripts(call_id);
CREATE INDEX idx_call_transcripts_status ON public.call_transcripts(status);

-- RLS for call_transcripts
ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;

-- Managers and admins can view all transcripts
CREATE POLICY "Managers view all transcripts"
ON public.call_transcripts FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'executive']::app_role[])
);

-- Agents can view their own call transcripts
CREATE POLICY "Agents view own call transcripts"
ON public.call_transcripts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.call_events ce
    WHERE ce.id = call_id AND ce.assigned_user_id = auth.uid()
  )
);

-- Service role can insert/update (for edge functions)
CREATE POLICY "Service role manages transcripts"
ON public.call_transcripts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 2) call_ai_insights - Real-time analysis results
-- ============================================================
CREATE TABLE public.call_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_events(id) ON DELETE CASCADE,
  intent_score INTEGER CHECK (intent_score >= 0 AND intent_score <= 100),
  urgency_score INTEGER CHECK (urgency_score >= 0 AND urgency_score <= 100),
  churn_risk_score INTEGER CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  objection_tags_json JSONB DEFAULT '[]'::jsonb,
  detected_topics_json JSONB DEFAULT '[]'::jsonb,
  competitor_mentions JSONB DEFAULT '[]'::jsonb,
  next_best_action TEXT,
  suggested_responses_json JSONB DEFAULT '[]'::jsonb,
  risk_flags_json JSONB DEFAULT '[]'::jsonb,
  detected_material_category TEXT,
  detected_size_preference INTEGER,
  detected_zip_code TEXT,
  summary_bullets JSONB DEFAULT '[]'::jsonb,
  model_used TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_call_ai_insights_call_id ON public.call_ai_insights(call_id);
CREATE INDEX idx_call_ai_insights_is_final ON public.call_ai_insights(is_final);

-- RLS
ALTER TABLE public.call_ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers view all insights"
ON public.call_ai_insights FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'executive']::app_role[])
);

CREATE POLICY "Agents view own call insights"
ON public.call_ai_insights FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.call_events ce
    WHERE ce.id = call_id AND ce.assigned_user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages insights"
ON public.call_ai_insights FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 3) call_ai_events - Streaming event log for audit
-- ============================================================
CREATE TABLE public.call_ai_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_events(id) ON DELETE CASCADE,
  event_type call_ai_event_type NOT NULL,
  payload_json JSONB DEFAULT '{}'::jsonb,
  agent_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_call_ai_events_call_id ON public.call_ai_events(call_id);
CREATE INDEX idx_call_ai_events_type ON public.call_ai_events(event_type);
CREATE INDEX idx_call_ai_events_created ON public.call_ai_events(created_at DESC);

-- RLS
ALTER TABLE public.call_ai_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers view all events"
ON public.call_ai_events FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'executive']::app_role[])
);

CREATE POLICY "Agents view own call events"
ON public.call_ai_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.call_events ce
    WHERE ce.id = call_id AND ce.assigned_user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages events"
ON public.call_ai_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- 4) call_followups - Post-call draft messages
-- ============================================================
CREATE TABLE public.call_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_events(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('SMS', 'EMAIL')),
  draft_body TEXT NOT NULL,
  subject TEXT,
  status call_followup_status NOT NULL DEFAULT 'DRAFT',
  sent_at TIMESTAMPTZ,
  sent_by UUID,
  discarded_at TIMESTAMPTZ,
  discarded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_call_followups_call_id ON public.call_followups(call_id);
CREATE INDEX idx_call_followups_status ON public.call_followups(status);

-- RLS
ALTER TABLE public.call_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers view all followups"
ON public.call_followups FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'executive', 'sales', 'cs']::app_role[])
);

CREATE POLICY "Agents view own call followups"
ON public.call_followups FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.call_events ce
    WHERE ce.id = call_id AND ce.assigned_user_id = auth.uid()
  )
);

CREATE POLICY "Agents update own call followups"
ON public.call_followups FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.call_events ce
    WHERE ce.id = call_id AND ce.assigned_user_id = auth.uid()
  )
);

CREATE POLICY "Service role manages followups"
ON public.call_followups FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- CONFIG SETTINGS FOR CALL AI
-- ============================================================
INSERT INTO public.config_settings (key, value, description, is_sensitive, category)
VALUES 
  ('call_ai.enabled', 'true', 'Enable Call AI Coach system', false, 'ai'),
  ('call_ai.mode', '"DRY_RUN"', 'DRY_RUN = no auto-sends, LIVE = full functionality', false, 'ai'),
  ('call_ai.consent_required', 'true', 'Require consent before recording/analyzing', false, 'ai'),
  ('call_ai.disclaimer_enabled', 'true', 'Play disclaimer at call start', false, 'ai'),
  ('call_ai.disclaimer_text', '"This call may be recorded and analyzed for quality and training purposes."', 'Disclaimer text played to caller', false, 'ai'),
  ('call_ai.coaching_enabled', 'true', 'Show live coaching prompts to agents', false, 'ai'),
  ('call_ai.storage_retention_days', '90', 'Days to retain transcripts and recordings', false, 'ai'),
  ('call_ai.insight_interval_seconds', '15', 'Seconds between AI insight updates during call', false, 'ai')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to log call AI events
CREATE OR REPLACE FUNCTION public.log_call_ai_event(
  p_call_id UUID,
  p_event_type call_ai_event_type,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_agent_user_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.call_ai_events (call_id, event_type, payload_json, agent_user_id)
  VALUES (p_call_id, p_event_type, p_payload, COALESCE(p_agent_user_id, auth.uid()))
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to update transcript with new chunk
CREATE OR REPLACE FUNCTION public.append_transcript_chunk(
  p_call_id UUID,
  p_chunk_text TEXT,
  p_confidence NUMERIC DEFAULT NULL,
  p_speaker TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transcript_id UUID;
  v_current_text TEXT;
  v_new_segment JSONB;
BEGIN
  -- Get or create transcript
  SELECT id, transcript_text INTO v_transcript_id, v_current_text
  FROM public.call_transcripts
  WHERE call_id = p_call_id AND status = 'LIVE'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_transcript_id IS NULL THEN
    INSERT INTO public.call_transcripts (call_id, status, transcript_text)
    VALUES (p_call_id, 'LIVE', p_chunk_text)
    RETURNING id INTO v_transcript_id;
  ELSE
    -- Append chunk
    v_new_segment := jsonb_build_object(
      'text', p_chunk_text,
      'timestamp', now(),
      'speaker', p_speaker,
      'confidence', p_confidence
    );
    
    UPDATE public.call_transcripts
    SET 
      transcript_text = COALESCE(v_current_text, '') || ' ' || p_chunk_text,
      speaker_segments = speaker_segments || v_new_segment,
      word_count = word_count + array_length(regexp_split_to_array(p_chunk_text, '\s+'), 1),
      updated_at = now()
    WHERE id = v_transcript_id;
  END IF;
  
  -- Log event
  PERFORM public.log_call_ai_event(p_call_id, 'TRANSCRIPT_CHUNK', jsonb_build_object(
    'chunk', p_chunk_text,
    'confidence', p_confidence,
    'speaker', p_speaker
  ));
  
  RETURN v_transcript_id;
END;
$$;

-- Function to finalize transcript
CREATE OR REPLACE FUNCTION public.finalize_call_transcript(p_call_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transcript_id UUID;
BEGIN
  UPDATE public.call_transcripts
  SET 
    status = 'FINAL',
    updated_at = now()
  WHERE call_id = p_call_id AND status = 'LIVE'
  RETURNING id INTO v_transcript_id;
  
  RETURN v_transcript_id;
END;
$$;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_call_ai_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_call_transcripts_updated_at
  BEFORE UPDATE ON public.call_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_call_ai_updated_at();

CREATE TRIGGER update_call_ai_insights_updated_at
  BEFORE UPDATE ON public.call_ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_call_ai_updated_at();

CREATE TRIGGER update_call_followups_updated_at
  BEFORE UPDATE ON public.call_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_call_ai_updated_at();