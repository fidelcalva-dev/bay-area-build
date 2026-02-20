
-- Create facility_assignments table for tracking facility-to-run/order assignments
CREATE TABLE public.facility_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('ORDER', 'RUN')),
  entity_id uuid NOT NULL,
  facility_id uuid NOT NULL REFERENCES public.facilities(id),
  assigned_by_user_id uuid,
  assigned_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_facility_assignments_entity ON public.facility_assignments(entity_type, entity_id);
CREATE INDEX idx_facility_assignments_facility ON public.facility_assignments(facility_id);
CREATE INDEX idx_facility_assignments_created ON public.facility_assignments(created_at DESC);

-- Enable RLS
ALTER TABLE public.facility_assignments ENABLE ROW LEVEL SECURITY;

-- Only admin/dispatch/finance can view
CREATE POLICY "Staff can view facility assignments"
ON public.facility_assignments FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'dispatcher') OR
  public.has_role(auth.uid(), 'finance')
);

-- Only admin/dispatch can insert
CREATE POLICY "Staff can create facility assignments"
ON public.facility_assignments FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'dispatcher')
);

-- Only admin can delete
CREATE POLICY "Admin can delete facility assignments"
ON public.facility_assignments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
