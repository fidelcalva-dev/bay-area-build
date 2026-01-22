-- Fix service_receipts INSERT policy - should be staff only, not public
DROP POLICY IF EXISTS "Anyone can create receipts" ON public.service_receipts;

CREATE POLICY "Staff can create receipts"
ON public.service_receipts
FOR INSERT
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role])
);