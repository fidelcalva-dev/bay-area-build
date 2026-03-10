
CREATE POLICY "Anon users can insert crm_errors"
  ON public.crm_errors FOR INSERT TO anon
  WITH CHECK (true);
