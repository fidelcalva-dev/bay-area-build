-- Ensure anon role has all necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.quotes TO anon;
GRANT SELECT ON public.quotes TO anon;

-- Also grant to authenticated for logged-in users
GRANT INSERT ON public.quotes TO authenticated;
GRANT SELECT ON public.quotes TO authenticated;