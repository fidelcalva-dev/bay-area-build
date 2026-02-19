
-- Create ai_entry_sessions table for chat-level session tracking
CREATE TABLE IF NOT EXISTS public.ai_entry_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  path_selected TEXT,
  lead_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_entry_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public-facing chat)
CREATE POLICY "Allow anonymous inserts on ai_entry_sessions"
  ON public.ai_entry_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated reads for staff
CREATE POLICY "Allow authenticated reads on ai_entry_sessions"
  ON public.ai_entry_sessions
  FOR SELECT
  USING (auth.role() = 'authenticated');
