
-- AI Entry Events tracking table
CREATE TABLE public.ai_entry_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  time_on_page_ms INTEGER,
  ip_hash TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_entry_events ENABLE ROW LEVEL SECURITY;

-- Public insert policy (anonymous visitors can log events)
CREATE POLICY "Anyone can insert ai entry events"
  ON public.ai_entry_events FOR INSERT
  WITH CHECK (true);

-- Only authenticated staff can read
CREATE POLICY "Authenticated users can read ai entry events"
  ON public.ai_entry_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Storage bucket for waste photo uploads from public visitors
INSERT INTO storage.buckets (id, name, public)
VALUES ('waste-uploads', 'waste-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous uploads to waste-uploads bucket
CREATE POLICY "Anyone can upload waste photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'waste-uploads');

-- Allow reading own uploads (by path match)
CREATE POLICY "Anyone can read waste uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'waste-uploads');
