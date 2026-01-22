-- SECURITY HARDENING: Fix insecure USING(true) policies
-- Goal: Remove public UPDATE/DELETE, restrict SELECT to owners/staff

-- ============================================
-- 1. QUOTES TABLE - Fix public UPDATE/SELECT
-- ============================================

-- Drop insecure policies
DROP POLICY IF EXISTS "Public can read quotes" ON public.quotes;
DROP POLICY IF EXISTS "Public can update quotes" ON public.quotes;

-- Keep public INSERT (needed for quick quote flow)
-- Policy "Public can create quotes" already exists with WITH CHECK(true)

-- Allow SELECT only for:
-- 1. Quote owner (matching phone or email)
-- 2. Staff (admin, sales, dispatcher)
CREATE POLICY "Owners can view own quotes"
ON public.quotes
FOR SELECT
USING (
  -- Match by phone
  (customer_phone IS NOT NULL AND customer_phone = current_setting('app.current_phone', true))
  OR
  -- Match by email  
  (customer_email IS NOT NULL AND customer_email = current_setting('app.current_email', true))
  OR
  -- Staff access
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role])
);

-- Allow UPDATE only for staff (no public updates)
CREATE POLICY "Staff can update quotes"
ON public.quotes
FOR UPDATE
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role])
);

-- Allow DELETE only for admin
CREATE POLICY "Admins can delete quotes"
ON public.quotes
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================
-- 2. SERVICE_RECEIPTS TABLE - Fix public SELECT
-- ============================================

DROP POLICY IF EXISTS "Anyone can view their receipts by quote" ON public.service_receipts;

-- Allow SELECT only for quote owner or staff
CREATE POLICY "Owners can view own receipts"
ON public.service_receipts
FOR SELECT
USING (
  -- Check if the receipt's quote belongs to current user
  quote_id IN (
    SELECT id FROM public.quotes
    WHERE 
      (customer_phone IS NOT NULL AND customer_phone = current_setting('app.current_phone', true))
      OR
      (customer_email IS NOT NULL AND customer_email = current_setting('app.current_email', true))
  )
  OR
  -- Staff access
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role])
);

-- ============================================
-- 3. ORDERS TABLE - Ensure no public access
-- ============================================
-- Orders already have proper RLS (customer_id match + staff roles)
-- Just verify no USING(true) exists - these are already secure

-- ============================================
-- 4. INVENTORY TABLE - Keep public SELECT, ensure no UPDATE/DELETE
-- ============================================
-- Public SELECT is intentional (show availability on website)
-- Verify no public UPDATE/DELETE policies exist

-- Drop any accidental public write policies (safety measure)
DROP POLICY IF EXISTS "Anyone can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Anyone can delete inventory" ON public.inventory;

-- ============================================
-- 5. DOCUMENTS TABLE - Add customer portal access via session
-- ============================================

-- Add policy for customer portal to view documents via phone session
CREATE POLICY "Customers can view documents via phone session"
ON public.documents
FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM orders o
    JOIN quotes q ON o.quote_id = q.id
    WHERE q.customer_phone = current_setting('app.current_phone', true)
  )
);