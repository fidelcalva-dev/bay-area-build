-- CAL 010 follow-up: signed-in customers see the same public reference data as anonymous visitors.
DROP POLICY IF EXISTS "cal010_public_read_dumpster_dimensions" ON public.dumpster_dimensions;
CREATE POLICY "cal010_public_read_dumpster_dimensions" ON public.dumpster_dimensions
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cal010_public_read_truck_dimensions" ON public.truck_dimensions;
CREATE POLICY "cal010_public_read_truck_dimensions" ON public.truck_dimensions
  FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.dumpster_dimensions, public.truck_dimensions TO anon, authenticated;

DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.companies;
CREATE POLICY "cal010_auth_public_read" ON public.companies FOR SELECT TO authenticated USING (status = 'active');
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.company_services;
CREATE POLICY "cal010_auth_public_read" ON public.company_services FOR SELECT TO authenticated USING (active = true);
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.contractor_tiers;
CREATE POLICY "cal010_auth_public_read" ON public.contractor_tiers FOR SELECT TO authenticated USING (is_active = true);
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.pricing_general_debris;
CREATE POLICY "cal010_auth_public_read" ON public.pricing_general_debris FOR SELECT TO authenticated USING (active = true AND public_visible = true);
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.pricing_heavy_groups;
CREATE POLICY "cal010_auth_public_read" ON public.pricing_heavy_groups FOR SELECT TO authenticated USING (active = true);
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.pricing_heavy_service_costs;
CREATE POLICY "cal010_auth_public_read" ON public.pricing_heavy_service_costs FOR SELECT TO authenticated USING (active = true);
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.service_verticals;
CREATE POLICY "cal010_auth_public_read" ON public.service_verticals FOR SELECT TO authenticated USING (active = true);
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.subscription_plans;
CREATE POLICY "cal010_auth_public_read" ON public.subscription_plans FOR SELECT TO authenticated USING (active = true);
DROP POLICY IF EXISTS "cal010_auth_public_read" ON public.waste_profiles;
CREATE POLICY "cal010_auth_public_read" ON public.waste_profiles FOR SELECT TO authenticated USING (active = true AND public_visible = true);