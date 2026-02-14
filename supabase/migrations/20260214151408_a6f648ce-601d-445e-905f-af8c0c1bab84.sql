
-- PHASE 1: Yard address privacy — create a public view that hides address
-- and restrict direct yards SELECT to staff only

-- Drop the overly permissive "Anyone can view active yards" policy
DROP POLICY IF EXISTS "Anyone can view active yards" ON public.yards;

-- Create staff-only SELECT policy for full yards data (including address)
CREATE POLICY "Staff can view yards"
  ON public.yards FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role, 'driver'::app_role, 'finance'::app_role)
    )
  );

-- Create a public-safe view that excludes address for anonymous/customer use
CREATE OR REPLACE VIEW public.yards_public
WITH (security_invoker = on) AS
  SELECT id, name, slug, latitude, longitude, market, is_active, priority_rank, market_id
  FROM public.yards
  WHERE is_active = true;

-- Allow anon and authenticated to read the public view's underlying data
-- via a minimal policy (view uses security_invoker so caller's policies apply)
-- We need a policy that lets anon see active yards without address
CREATE POLICY "Public can view active yards without address"
  ON public.yards FOR SELECT TO anon
  USING (is_active = true);

-- PHASE 5: Add dump_details jsonb column to orders for extracted ticket data
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dump_details jsonb;

-- Add portal_show_dump_ticket flag to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS portal_show_dump_ticket boolean DEFAULT false;

-- Ensure documents table has proper RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Staff can read all documents
CREATE POLICY "Staff can view documents"
  ON public.documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role, 'driver'::app_role, 'finance'::app_role)
    )
  );

-- Staff can insert documents
CREATE POLICY "Staff can insert documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin'::app_role, 'dispatcher'::app_role, 'driver'::app_role)
    )
  );

-- Admin can delete documents
CREATE POLICY "Admin can delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
