-- SECURITY HARDENING MIGRATION (FIXED)
-- Handle existing policies gracefully

-- =====================================================
-- 1. MAKE DUMP-TICKETS BUCKET PRIVATE  
-- =====================================================
UPDATE storage.buckets 
SET public = false 
WHERE id = 'dump-tickets';

-- Drop existing storage policies (use IF EXISTS for safety)
DROP POLICY IF EXISTS "Anyone can view dump tickets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload dump tickets" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view dump tickets" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload dump tickets" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update dump tickets" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete dump tickets" ON storage.objects;

-- Create proper storage policies for dump-tickets
CREATE POLICY "Staff can view dump tickets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'dump-tickets' AND
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'finance_admin', 'ops_admin', 'system_admin']::public.app_role[]))
);

CREATE POLICY "Staff can upload dump tickets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dump-tickets' AND
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'finance_admin', 'ops_admin', 'system_admin']::public.app_role[]))
);

CREATE POLICY "Staff can update dump tickets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'dump-tickets' AND
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'finance_admin', 'ops_admin', 'system_admin']::public.app_role[]))
);

CREATE POLICY "Staff can delete dump tickets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'dump-tickets' AND
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'system_admin']::public.app_role[]))
);

-- =====================================================
-- 2. FIX PERMISSIVE RLS POLICIES ON QUOTE_EVENTS
-- =====================================================
DROP POLICY IF EXISTS "Anyone can insert quote events" ON public.quote_events;
DROP POLICY IF EXISTS "Public can insert quote events for existing quotes" ON public.quote_events;

CREATE POLICY "Public can insert quote events for existing quotes"
ON public.quote_events
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.quotes WHERE id = quote_id)
);

-- =====================================================
-- 3. DRIVER_PAYOUTS - DROP ALL AND RECREATE
-- =====================================================
ALTER TABLE public.driver_payouts ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can view driver payouts" ON public.driver_payouts;
DROP POLICY IF EXISTS "Drivers can view all payouts" ON public.driver_payouts;
DROP POLICY IF EXISTS "Drivers can view own payouts" ON public.driver_payouts;
DROP POLICY IF EXISTS "Finance and admin can view all payouts" ON public.driver_payouts;
DROP POLICY IF EXISTS "Finance can manage payouts" ON public.driver_payouts;

-- Only finance and admin can view all payouts
CREATE POLICY "Finance and admin can view all payouts"
ON public.driver_payouts
FOR SELECT
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'finance_admin', 'system_admin']::public.app_role[]))
);

-- Drivers can view only their own payouts
CREATE POLICY "Drivers can view own payouts"
ON public.driver_payouts
FOR SELECT
USING (
  driver_id IN (
    SELECT d.id FROM public.drivers d WHERE d.user_id = auth.uid()
  )
);

-- Only finance/admin can manage payouts
CREATE POLICY "Finance can manage payouts"
ON public.driver_payouts
FOR ALL
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'finance_admin', 'system_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'finance_admin', 'system_admin']::public.app_role[]))
);

-- =====================================================
-- 4. SERVICE_RECEIPTS - DROP ALL AND RECREATE
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view their receipts by quote" ON public.service_receipts;
DROP POLICY IF EXISTS "Staff can manage service receipts" ON public.service_receipts;

CREATE POLICY "Staff can manage service receipts"
ON public.service_receipts
FOR ALL
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'finance_admin', 'ops_admin', 'system_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'finance_admin', 'ops_admin', 'system_admin']::public.app_role[]))
);

-- =====================================================
-- 5. PAYMENTS TABLE - DROP ALL AND RECREATE
-- =====================================================
DROP POLICY IF EXISTS "Anyone can view payments" ON public.payments;
DROP POLICY IF EXISTS "Staff can view payments" ON public.payments;
DROP POLICY IF EXISTS "Finance can manage payments" ON public.payments;

CREATE POLICY "Staff can view payments"
ON public.payments
FOR SELECT
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'sales', 'finance_admin', 'ops_admin', 'system_admin', 'sales_admin']::public.app_role[]))
);

CREATE POLICY "Finance can manage payments"
ON public.payments
FOR ALL
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'finance_admin', 'system_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'finance_admin', 'system_admin']::public.app_role[]))
);

-- =====================================================
-- 6. CUSTOMERS TABLE - DROP ALL AND RECREATE
-- =====================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can manage customers" ON public.customers;

CREATE POLICY "Staff can view customers"
ON public.customers
FOR SELECT
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'finance', 'dispatcher', 'sales', 'finance_admin', 'ops_admin', 'system_admin', 'sales_admin']::public.app_role[]))
);

CREATE POLICY "Staff can manage customers"
ON public.customers
FOR ALL
USING (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'system_admin', 'sales_admin']::public.app_role[]))
)
WITH CHECK (
  (SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'system_admin', 'sales_admin']::public.app_role[]))
);