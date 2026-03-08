
-- Enable RLS on archive tables (admin-only access)
ALTER TABLE public.sales_leads_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_events_archive ENABLE ROW LEVEL SECURITY;

-- Admin read-only policies
CREATE POLICY "Admin read archive" ON public.sales_leads_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.quotes_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.customers_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.orders_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.lead_events_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read archive" ON public.lifecycle_events_archive FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
