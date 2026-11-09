-- CAL 011 — Only active office staff may create or change outbound quotes
-- (before, any signed-in account, customers included, could create one for itself).
ALTER POLICY "Staff can insert outbound quotes" ON public.outbound_quotes
  WITH CHECK (auth.uid() = created_by_user_id AND public.current_user_is_office_staff());
ALTER POLICY "Staff can update own outbound quotes" ON public.outbound_quotes
  USING (auth.uid() = created_by_user_id AND public.current_user_is_office_staff());
ALTER POLICY "Staff can insert outbound quote messages" ON public.outbound_quote_messages
  WITH CHECK (public.current_user_is_office_staff());