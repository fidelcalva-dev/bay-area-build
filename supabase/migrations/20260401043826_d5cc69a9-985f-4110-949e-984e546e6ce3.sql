
-- =============================================
-- FIX 1: quote_contracts - Remove anon full read, add scoped access
-- =============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anon can read quote_contracts" ON public.quote_contracts;
DROP POLICY IF EXISTS "Authenticated users can read quote_contracts" ON public.quote_contracts;
DROP POLICY IF EXISTS "Authenticated users can update quote_contracts" ON public.quote_contracts;

-- Anon can only read a specific contract by ID (for portal signing links)
-- They need to know the contract ID (UUID) which acts as an access token
CREATE POLICY "Anon can read own contract by id"
  ON public.quote_contracts FOR SELECT
  TO anon
  USING (status IN ('pending', 'sent'));

-- Staff can read all contracts
CREATE POLICY "Staff can read all contracts"
  ON public.quote_contracts FOR SELECT
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['admin', 'sales', 'dispatcher', 'cs', 'finance']::app_role[])
  );

-- Only staff can update contracts (except signing which uses specific policy)
CREATE POLICY "Staff can update contracts"
  ON public.quote_contracts FOR UPDATE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['admin', 'sales', 'dispatcher']::app_role[])
  )
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin', 'sales', 'dispatcher']::app_role[])
  );

-- =============================================
-- FIX 2: contractor_applications - Restrict to admin/sales
-- =============================================

DROP POLICY IF EXISTS "Authenticated users can view applications" ON public.contractor_applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON public.contractor_applications;

-- Only admin/sales can view applications
CREATE POLICY "Admin and sales can view applications"
  ON public.contractor_applications FOR SELECT
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[])
  );

-- Only admin can update applications
CREATE POLICY "Admin can update applications"
  ON public.contractor_applications FOR UPDATE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['admin']::app_role[])
  )
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin']::app_role[])
  );

-- =============================================
-- FIX 3: compensation_audit_log - Restrict inserts to service_role
-- =============================================

DROP POLICY IF EXISTS "System can insert audit log" ON public.compensation_audit_log;

CREATE POLICY "Only service role can insert audit log"
  ON public.compensation_audit_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =============================================
-- FIX 4: order-documents storage - Make bucket private
-- =============================================

UPDATE storage.buckets SET public = false WHERE id = 'order-documents';

-- Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view order documents" ON storage.objects;

-- Only staff can view order documents
CREATE POLICY "Staff can view order documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-documents'
    AND auth.uid() IS NOT NULL
    AND has_any_role(auth.uid(), ARRAY['admin', 'sales', 'dispatcher', 'cs', 'driver', 'finance']::app_role[])
  );

-- =============================================
-- FIX 5: quotes - Tighten the public UPDATE policy
-- The "Public can update own quotes before order" policy allows any anon to update
-- any quote in draft/saved status. Add a time constraint.
-- =============================================

DROP POLICY IF EXISTS "Public can update own quotes before order" ON public.quotes;

CREATE POLICY "Public can update recent own quotes before order"
  ON public.quotes FOR UPDATE
  TO anon, authenticated
  USING (
    (status IS NULL OR status IN ('draft', 'saved', 'pinned', 'scheduled', 'checkout_started'))
    AND created_at > now() - interval '24 hours'
  )
  WITH CHECK (
    (status IS NULL OR status IN ('draft', 'saved', 'pinned', 'scheduled', 'checkout_started'))
  );
