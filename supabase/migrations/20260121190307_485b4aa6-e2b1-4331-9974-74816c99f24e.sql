-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can create quotes" ON public.quotes;
DROP POLICY IF EXISTS "Anyone can read their own quotes by phone" ON public.quotes;
DROP POLICY IF EXISTS "Anyone can update quotes" ON public.quotes;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Public can create quotes" 
ON public.quotes 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can read quotes" 
ON public.quotes 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Public can update quotes" 
ON public.quotes 
FOR UPDATE 
TO anon, authenticated
USING (true);