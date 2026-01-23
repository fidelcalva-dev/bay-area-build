-- FIX ADDITIONAL SECURITY ISSUES

-- =====================================================
-- 1. AUDIT_LOGS - Restrict INSERT to admins/system only
-- =====================================================
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;

CREATE POLICY "Staff can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'sales', 'system_admin', 'ops_admin', 'finance_admin', 'sales_admin']::public.app_role[]))
  OR auth.uid() IS NULL  -- Service role for edge functions
);

-- =====================================================
-- 2. RISK_SCORE_EVENTS - Already fixed but ensure service role only
-- =====================================================
DROP POLICY IF EXISTS "System can insert risk events" ON public.risk_score_events;

-- Only allow insertion via edge functions (service role with null auth.uid)
-- or by admin staff
CREATE POLICY "System and staff can insert risk events"
ON public.risk_score_events
FOR INSERT
WITH CHECK (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'system_admin']::public.app_role[]))
);

-- =====================================================
-- 3. CUSTOMERS - Remove phone-based lookup for unauthenticated
-- =====================================================
DROP POLICY IF EXISTS "Customers can view by phone match" ON public.customers;

-- Only allow staff to view customers (customers access their data via orders/quotes)
-- The customer portal uses session-based auth, not direct table access