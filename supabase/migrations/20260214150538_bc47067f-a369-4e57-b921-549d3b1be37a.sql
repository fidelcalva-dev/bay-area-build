-- Fix calculator_logs: allow all staff to read their own logs (not just admin)
DROP POLICY IF EXISTS "Admin can view calculator logs" ON public.calculator_logs;
CREATE POLICY "Staff can view calculator logs" ON public.calculator_logs
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'cs'::app_role, 'dispatcher'::app_role, 'finance'::app_role])
  );

-- Allow finance role to also insert calculator logs (read-only but logging usage)
DROP POLICY IF EXISTS "Staff can create logs" ON public.calculator_logs;
CREATE POLICY "Staff can create logs" ON public.calculator_logs
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'cs'::app_role, 'cs_agent'::app_role, 'dispatcher'::app_role, 'finance'::app_role])
  );

-- Allow all staff to view calculator estimates (not just own + admin)
DROP POLICY IF EXISTS "Users can view own estimates" ON public.calculator_estimates;
CREATE POLICY "Staff can view estimates" ON public.calculator_estimates
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'cs'::app_role, 'cs_agent'::app_role, 'dispatcher'::app_role, 'finance'::app_role])
  );

-- Allow cs_agent and finance to also create estimates
DROP POLICY IF EXISTS "Staff can create estimates" ON public.calculator_estimates;
CREATE POLICY "Staff can create estimates" ON public.calculator_estimates
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'cs'::app_role, 'cs_agent'::app_role, 'dispatcher'::app_role])
  );

-- Allow staff to view zone_restrictions (add cs_agent, finance)
DROP POLICY IF EXISTS "Staff can view zone restrictions" ON public.zone_restrictions;
CREATE POLICY "Staff can view zone restrictions" ON public.zone_restrictions
  FOR SELECT
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'cs'::app_role, 'cs_agent'::app_role, 'dispatcher'::app_role, 'finance'::app_role])
  );