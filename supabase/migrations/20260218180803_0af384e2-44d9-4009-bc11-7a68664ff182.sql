
-- Create storage bucket for quote photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-photos', 'quote-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload quote photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quote-photos');

-- Allow public read access
CREATE POLICY "Public read access for quote photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'quote-photos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete quote photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'quote-photos');
