-- FIX REMAINING PERMISSIVE INSERT POLICIES

-- =====================================================
-- 1. QUOTES - Already has a validation check now via edge function
-- The "Public quote creation" policy is intentional for lead capture
-- Keep it but it goes through edge function with service role anyway
-- =====================================================

-- =====================================================
-- 2. RISK_SCORE_EVENTS - Should only be insertable by system/staff
-- =====================================================
DROP POLICY IF EXISTS "System can insert risk events" ON public.risk_score_events;

CREATE POLICY "System can insert risk events"
ON public.risk_score_events
FOR INSERT
WITH CHECK (
  -- Allow if user has staff role OR if insert is happening via service role (edge function)
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'system_admin']::public.app_role[]))
  OR auth.uid() IS NULL  -- Service role access (edge functions)
);

-- =====================================================
-- 3. TRUSTED_CUSTOMERS - Fix the ALL policy
-- =====================================================
DROP POLICY IF EXISTS "Staff can manage trusted customers" ON public.trusted_customers;
DROP POLICY IF EXISTS "Staff can view trusted customers" ON public.trusted_customers;

CREATE POLICY "Staff can view trusted customers"
ON public.trusted_customers
FOR SELECT
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'sales', 'finance_admin', 'system_admin', 'sales_admin']::public.app_role[]))
);

CREATE POLICY "Staff can manage trusted customers"
ON public.trusted_customers
FOR ALL
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'system_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'system_admin']::public.app_role[]))
);

-- =====================================================
-- 4. QUOTE_EVENTS - Already fixed in previous migration
-- Keeping the EXISTS check on quote_id
-- =====================================================

-- Already done: "Public can insert quote events for existing quotes"