-- Create storage bucket for order documents (dump tickets, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-documents', 
  'order-documents', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for order documents
CREATE POLICY "Staff can upload order documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'order-documents' 
  AND (
    EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id)
  )
);

CREATE POLICY "Anyone can view order documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'order-documents');

CREATE POLICY "Staff can update order documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'order-documents'
  AND EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id)
);

CREATE POLICY "Staff can delete order documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'order-documents'
  AND EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id)
);