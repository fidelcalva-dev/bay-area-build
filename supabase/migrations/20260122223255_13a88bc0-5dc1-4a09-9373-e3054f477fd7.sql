-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Public can create quotes" ON public.quotes;

-- Create a simpler, working policy for public quote creation
CREATE POLICY "Anyone can create quotes"
ON public.quotes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also ensure anon role has usage on the schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.quotes TO anon;