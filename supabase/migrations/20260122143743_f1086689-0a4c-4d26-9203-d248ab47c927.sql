-- Enable realtime for payments and invoices tables (orders already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;