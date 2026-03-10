
-- Drop existing anon policies if they exist to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anon can view contracts for signing" ON public.contracts;
  DROP POLICY IF EXISTS "Anon can sign contracts" ON public.contracts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Allow anon to view and sign contracts (for public signing page)
CREATE POLICY "Anon can view contracts for signing"
  ON public.contracts FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can sign contracts"
  ON public.contracts FOR UPDATE TO anon
  USING (status = 'pending');
