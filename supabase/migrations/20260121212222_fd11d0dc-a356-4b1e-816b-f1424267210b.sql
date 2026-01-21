-- Add admin management policies for yards table
CREATE POLICY "Admins can manage yards"
  ON public.yards FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));