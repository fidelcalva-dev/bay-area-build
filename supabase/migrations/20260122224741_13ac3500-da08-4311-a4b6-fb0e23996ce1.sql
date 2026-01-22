-- Drop existing insert policy
DROP POLICY IF EXISTS "Anyone can create quotes" ON public.quotes;

-- Create a more permissive insert policy that works for anonymous users
CREATE POLICY "Public quote creation"
ON public.quotes
FOR INSERT
WITH CHECK (true);

-- Ensure table-level permissions are granted
GRANT ALL ON public.quotes TO anon;
GRANT ALL ON public.quotes TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;