-- =====================================================
-- PHASE 1: ORDER SITE PLACEMENT TABLE
-- =====================================================

-- Create truck type enum
CREATE TYPE public.truck_type AS ENUM (
  'ROLLOFF',
  'HIGHSIDE', 
  'END_DUMP',
  'TENWHEEL',
  'SUPER10'
);

-- Create placement creator role enum
CREATE TYPE public.placement_creator_role AS ENUM (
  'CUSTOMER',
  'SALES',
  'CS',
  'DISPATCH',
  'ADMIN',
  'DRIVER'
);

-- Main placement table
CREATE TABLE public.order_site_placement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  created_by_user_id UUID,
  created_by_role placement_creator_role NOT NULL DEFAULT 'CUSTOMER',
  
  -- Map state
  map_provider TEXT NOT NULL DEFAULT 'GOOGLE_MAPS',
  map_center_lat NUMERIC(10, 7) NOT NULL,
  map_center_lng NUMERIC(10, 7) NOT NULL,
  map_zoom INTEGER NOT NULL DEFAULT 18,
  
  -- Dumpster placement
  dumpster_size_yd INTEGER NOT NULL,
  dumpster_rect_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Truck clearance placement
  truck_type truck_type NOT NULL DEFAULT 'ROLLOFF',
  truck_rect_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Notes and image
  placement_notes TEXT,
  image_storage_path TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure one placement per order (can be updated)
  UNIQUE(order_id)
);

-- Create index for fast order lookups
CREATE INDEX idx_order_site_placement_order_id ON public.order_site_placement(order_id);
CREATE INDEX idx_order_site_placement_created_by ON public.order_site_placement(created_by_user_id);

-- Enable RLS
ALTER TABLE public.order_site_placement ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 2: DIMENSION CONFIGURATION TABLES
-- =====================================================

-- Dumpster dimensions by size
CREATE TABLE public.dumpster_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_yd INTEGER NOT NULL UNIQUE,
  width_ft NUMERIC(5, 2) NOT NULL,
  length_ft NUMERIC(5, 2) NOT NULL,
  height_ft NUMERIC(5, 2),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Truck dimensions by type
CREATE TABLE public.truck_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_type truck_type NOT NULL UNIQUE,
  width_ft NUMERIC(5, 2) NOT NULL,
  length_ft NUMERIC(5, 2) NOT NULL,
  clearance_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on dimension tables
ALTER TABLE public.dumpster_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truck_dimensions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SEED DATA: CANONICAL DIMENSIONS
-- =====================================================

-- Dumpster dimensions (footprint in feet)
INSERT INTO public.dumpster_dimensions (size_yd, width_ft, length_ft, height_ft, description) VALUES
  (5, 4, 8, 3, '5 yard mini dumpster'),
  (6, 5, 10, 3.5, '6 yard small dumpster'),
  (8, 6, 12, 4, '8 yard residential dumpster'),
  (10, 7, 14, 4, '10 yard standard dumpster'),
  (20, 8, 22, 4.5, '20 yard medium dumpster'),
  (30, 8, 22, 6, '30 yard large dumpster'),
  (40, 8, 22, 8, '40 yard extra large dumpster'),
  (50, 8, 22, 8.5, '50 yard industrial dumpster');

-- Truck dimensions (clearance rectangles in feet)
INSERT INTO public.truck_dimensions (truck_type, width_ft, length_ft, clearance_notes) VALUES
  ('ROLLOFF', 10, 35, 'Standard roll-off truck with swing clearance'),
  ('HIGHSIDE', 10, 40, 'High-side trailer requires extra length'),
  ('END_DUMP', 10, 45, 'End dump requires maximum rear clearance'),
  ('TENWHEEL', 9, 30, 'Ten-wheel truck for smaller containers'),
  ('SUPER10', 9, 35, 'Super 10 with extended bed');

-- =====================================================
-- RLS POLICIES: PLACEMENT TABLE
-- =====================================================

-- Helper function to check if user owns the order (customer)
CREATE OR REPLACE FUNCTION public.user_owns_order(p_order_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  SELECT customer_id INTO v_customer_id
  FROM public.orders
  WHERE id = p_order_id;
  
  -- Check if user is linked to customer
  RETURN EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = v_customer_id
    AND c.auth_user_id = p_user_id
  );
END;
$$;

-- Helper function to check if driver is assigned to order's runs
CREATE OR REPLACE FUNCTION public.driver_assigned_to_order(p_order_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.runs r
    WHERE r.order_id = p_order_id
    AND r.assigned_driver_id = p_user_id
    AND r.status NOT IN ('COMPLETED', 'CANCELLED')
  );
END;
$$;

-- Customers can view their own order placements
CREATE POLICY "Customers can view own placements"
ON public.order_site_placement
FOR SELECT
TO authenticated
USING (
  public.user_owns_order(order_id, auth.uid())
);

-- Customers can insert placement for their own orders
CREATE POLICY "Customers can create own placements"
ON public.order_site_placement
FOR INSERT
TO authenticated
WITH CHECK (
  public.user_owns_order(order_id, auth.uid())
);

-- Customers can update their own placements
CREATE POLICY "Customers can update own placements"
ON public.order_site_placement
FOR UPDATE
TO authenticated
USING (
  public.user_owns_order(order_id, auth.uid())
);

-- Staff with dispatcher/admin/sales/cs roles can view all placements
CREATE POLICY "Staff can view all placements"
ON public.order_site_placement
FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'dispatcher', 'ops_admin', 'sales', 'cs']::app_role[])
);

-- Staff with dispatcher/admin roles can insert placements
CREATE POLICY "Staff can create placements"
ON public.order_site_placement
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'dispatcher', 'ops_admin', 'sales', 'cs']::app_role[])
);

-- Staff with dispatcher/admin roles can update placements
CREATE POLICY "Staff can update placements"
ON public.order_site_placement
FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'dispatcher', 'ops_admin']::app_role[])
);

-- Staff with admin role can delete placements
CREATE POLICY "Admin can delete placements"
ON public.order_site_placement
FOR DELETE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin']::app_role[])
);

-- Drivers can view placements for their assigned runs
CREATE POLICY "Drivers can view assigned placements"
ON public.order_site_placement
FOR SELECT
TO authenticated
USING (
  public.driver_assigned_to_order(order_id, auth.uid())
);

-- =====================================================
-- RLS POLICIES: DIMENSION TABLES (READ-ONLY FOR ALL)
-- =====================================================

-- Anyone authenticated can read dimensions
CREATE POLICY "Anyone can view dumpster dimensions"
ON public.dumpster_dimensions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view truck dimensions"
ON public.truck_dimensions
FOR SELECT
TO authenticated
USING (true);

-- Only admin can modify dimensions
CREATE POLICY "Admin can manage dumpster dimensions"
ON public.dumpster_dimensions
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Admin can manage truck dimensions"
ON public.truck_dimensions
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- =====================================================
-- STORAGE BUCKET FOR PLACEMENT IMAGES
-- =====================================================

-- Create private bucket for placement images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-placements',
  'order-placements',
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Customers can upload to their order folder
CREATE POLICY "Customers upload own placement images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-placements'
  AND public.user_owns_order((storage.foldername(name))[1]::uuid, auth.uid())
);

-- Storage RLS: Customers can view their own placement images
CREATE POLICY "Customers view own placement images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-placements'
  AND public.user_owns_order((storage.foldername(name))[1]::uuid, auth.uid())
);

-- Storage RLS: Staff can view all placement images
CREATE POLICY "Staff view all placement images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-placements'
  AND public.has_any_role(auth.uid(), ARRAY['admin', 'dispatcher', 'ops_admin', 'sales', 'cs']::app_role[])
);

-- Storage RLS: Staff can upload placement images
CREATE POLICY "Staff upload placement images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-placements'
  AND public.has_any_role(auth.uid(), ARRAY['admin', 'dispatcher', 'ops_admin', 'sales', 'cs']::app_role[])
);

-- Storage RLS: Drivers can view assigned order placement images
CREATE POLICY "Drivers view assigned placement images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-placements'
  AND public.driver_assigned_to_order((storage.foldername(name))[1]::uuid, auth.uid())
);

-- Storage RLS: Admin can delete placement images
CREATE POLICY "Admin delete placement images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'order-placements'
  AND public.has_any_role(auth.uid(), ARRAY['admin']::app_role[])
);

-- =====================================================
-- TRIGGER: UPDATE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_order_site_placement_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_order_site_placement_timestamp
BEFORE UPDATE ON public.order_site_placement
FOR EACH ROW
EXECUTE FUNCTION public.update_order_site_placement_updated_at();

-- =====================================================
-- HELPER FUNCTION: SAVE PLACEMENT WITH NOTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.save_order_placement(
  p_order_id UUID,
  p_map_center_lat NUMERIC,
  p_map_center_lng NUMERIC,
  p_map_zoom INTEGER,
  p_dumpster_size_yd INTEGER,
  p_dumpster_rect_json JSONB,
  p_truck_type truck_type,
  p_truck_rect_json JSONB,
  p_placement_notes TEXT DEFAULT NULL,
  p_image_storage_path TEXT DEFAULT NULL,
  p_creator_role placement_creator_role DEFAULT 'CUSTOMER'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_placement_id UUID;
BEGIN
  INSERT INTO public.order_site_placement (
    order_id,
    created_by_user_id,
    created_by_role,
    map_center_lat,
    map_center_lng,
    map_zoom,
    dumpster_size_yd,
    dumpster_rect_json,
    truck_type,
    truck_rect_json,
    placement_notes,
    image_storage_path
  ) VALUES (
    p_order_id,
    auth.uid(),
    p_creator_role,
    p_map_center_lat,
    p_map_center_lng,
    p_map_zoom,
    p_dumpster_size_yd,
    p_dumpster_rect_json,
    p_truck_type,
    p_truck_rect_json,
    p_placement_notes,
    p_image_storage_path
  )
  ON CONFLICT (order_id) DO UPDATE SET
    created_by_user_id = auth.uid(),
    created_by_role = p_creator_role,
    map_center_lat = p_map_center_lat,
    map_center_lng = p_map_center_lng,
    map_zoom = p_map_zoom,
    dumpster_size_yd = p_dumpster_size_yd,
    dumpster_rect_json = p_dumpster_rect_json,
    truck_type = p_truck_type,
    truck_rect_json = p_truck_rect_json,
    placement_notes = p_placement_notes,
    image_storage_path = COALESCE(p_image_storage_path, order_site_placement.image_storage_path),
    updated_at = now()
  RETURNING id INTO v_placement_id;
  
  -- Create a CRM note for the placement
  INSERT INTO public.crm_notes (
    entity_type,
    entity_id,
    content,
    created_by
  ) VALUES (
    'order',
    p_order_id,
    'Site placement saved. ' || COALESCE('Notes: ' || p_placement_notes, 'No additional notes.'),
    auth.uid()
  );
  
  RETURN v_placement_id;
END;
$$;