
-- Create placements-private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('placements-private', 'placements-private', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Allow anonymous inserts (quote flow is unauthenticated)
CREATE POLICY "Anyone can upload placement screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'placements-private');

-- RLS: Authenticated users can read (staff/dispatch/driver)
CREATE POLICY "Authenticated users can read placement screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'placements-private' AND auth.role() = 'authenticated');

-- Add timeline_events entry type if not already covered
-- (timeline_events table likely exists; we just need to insert events at runtime)
