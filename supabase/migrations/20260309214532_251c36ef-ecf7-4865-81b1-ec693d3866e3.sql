
CREATE TABLE public.ai_control_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  copilot_type TEXT NOT NULL,
  user_role TEXT,
  user_id UUID,
  entity_type TEXT,
  entity_id TEXT,
  action_type TEXT NOT NULL,
  prompt_summary TEXT,
  recommendation_summary TEXT,
  confidence_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_control_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert events"
  ON public.ai_control_events FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read events"
  ON public.ai_control_events FOR SELECT TO authenticated
  USING (true);

CREATE INDEX idx_ai_control_events_copilot ON public.ai_control_events (copilot_type);
CREATE INDEX idx_ai_control_events_created ON public.ai_control_events (created_at DESC);
