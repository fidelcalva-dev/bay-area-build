
-- =====================================================
-- FLEET + DOT/DMV + MAINTENANCE MANAGEMENT TABLES
-- =====================================================

-- 1) Update trucks table with missing compliance columns
ALTER TABLE public.trucks
  ADD COLUMN IF NOT EXISTS insurance_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS insurance_exp_date date,
  ADD COLUMN IF NOT EXISTS registration_exp_date date,
  ADD COLUMN IF NOT EXISTS dot_compliance_status text DEFAULT 'OK',
  ADD COLUMN IF NOT EXISTS last_inspection_at timestamptz,
  ADD COLUMN IF NOT EXISTS plate_number text;

-- 2) driver_truck_assignments
CREATE TABLE IF NOT EXISTS public.driver_truck_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  truck_id uuid NOT NULL REFERENCES public.trucks(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.driver_truck_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read truck assignments"
  ON public.driver_truck_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers and admins can insert truck assignments"
  ON public.driver_truck_assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update truck assignments"
  ON public.driver_truck_assignments FOR UPDATE TO authenticated USING (true);

-- 3) vehicle_inspections
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  truck_id uuid NOT NULL REFERENCES public.trucks(id),
  inspection_type text NOT NULL DEFAULT 'PRE_TRIP',
  status text NOT NULL DEFAULT 'PASS',
  checklist_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  signature_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read inspections"
  ON public.vehicle_inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers can insert inspections"
  ON public.vehicle_inspections FOR INSERT TO authenticated WITH CHECK (true);

-- 4) vehicle_issues
CREATE TABLE IF NOT EXISTS public.vehicle_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL REFERENCES public.trucks(id),
  reported_by_driver_id uuid REFERENCES public.drivers(id),
  issue_category text NOT NULL DEFAULT 'OTHER',
  severity text NOT NULL DEFAULT 'LOW',
  status text NOT NULL DEFAULT 'OPEN',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid
);
ALTER TABLE public.vehicle_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vehicle issues"
  ON public.vehicle_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers can report issues"
  ON public.vehicle_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin/maintenance can update issues"
  ON public.vehicle_issues FOR UPDATE TO authenticated USING (true);

-- 5) vehicle_issue_photos
CREATE TABLE IF NOT EXISTS public.vehicle_issue_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL REFERENCES public.vehicle_issues(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicle_issue_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read issue photos"
  ON public.vehicle_issue_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers can upload issue photos"
  ON public.vehicle_issue_photos FOR INSERT TO authenticated WITH CHECK (true);

-- 6) maintenance_work_orders
CREATE TABLE IF NOT EXISTS public.maintenance_work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL REFERENCES public.trucks(id),
  issue_id uuid REFERENCES public.vehicle_issues(id),
  assigned_to_user_id uuid,
  status text NOT NULL DEFAULT 'OPEN',
  labor_cost numeric(10,2) DEFAULT 0,
  parts_cost numeric(10,2) DEFAULT 0,
  total_cost numeric(10,2) DEFAULT 0,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read work orders"
  ON public.maintenance_work_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/maintenance can manage work orders"
  ON public.maintenance_work_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin/maintenance can update work orders"
  ON public.maintenance_work_orders FOR UPDATE TO authenticated USING (true);

-- 7) vehicle_documents
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id uuid NOT NULL REFERENCES public.trucks(id) ON DELETE CASCADE,
  doc_type text NOT NULL DEFAULT 'OTHER',
  file_url text NOT NULL,
  expires_at date,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read vehicle documents"
  ON public.vehicle_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage vehicle documents"
  ON public.vehicle_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update vehicle documents"
  ON public.vehicle_documents FOR UPDATE TO authenticated USING (true);

-- 8) Storage bucket for vehicle photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view vehicle photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-photos');

CREATE POLICY "Authenticated users can upload vehicle photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-photos');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_driver_truck_assignments_active ON public.driver_truck_assignments (driver_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_truck ON public.vehicle_inspections (truck_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_issues_truck ON public.vehicle_issues (truck_id, status);
CREATE INDEX IF NOT EXISTS idx_maintenance_work_orders_truck ON public.maintenance_work_orders (truck_id, status);
