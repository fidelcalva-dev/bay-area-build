
-- Fix overly permissive INSERT policy on missing_connections
DROP POLICY IF EXISTS "Service can insert missing_connections" ON public.missing_connections;

-- Only admins can insert (edge function uses service role key which bypasses RLS)
CREATE POLICY "Admins can insert missing_connections"
  ON public.missing_connections FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also need DELETE for upsert conflict handling
CREATE POLICY "Admins can delete missing_connections"
  ON public.missing_connections FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
