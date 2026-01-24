-- =====================================================
-- CITY-CERTIFIED FACILITY FINDER MIGRATION
-- Adds certified_sources table and extends facilities
-- =====================================================

-- 1) Create certified_sources table for tracking official city sources
CREATE TABLE IF NOT EXISTS public.certified_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_or_market TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('city_webpage', 'pdf', 'map', 'api', 'csv_upload')),
  source_url TEXT,
  source_name TEXT NOT NULL,
  last_checked_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN ('pending', 'ok', 'failed', 'manual')),
  facilities_found INTEGER DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Add certification fields to facilities table
ALTER TABLE public.facilities 
  ADD COLUMN IF NOT EXISTS certification_type TEXT DEFAULT 'unknown' 
    CHECK (certification_type IN ('city_certified', 'city_approved', 'authorized', 'permitted', 'unknown')),
  ADD COLUMN IF NOT EXISTS certification_city TEXT,
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES public.certified_sources(id),
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS green_halo_related BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS compliance_notes TEXT;

-- 3) Create facility_recommendations table for per-order compliance recommendations
CREATE TABLE IF NOT EXISTS public.facility_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL DEFAULT 'homeowner' CHECK (project_type IN ('homeowner', 'contractor', 'business')),
  compliance_required BOOLEAN DEFAULT false,
  city_or_market TEXT,
  recommended_facilities JSONB NOT NULL DEFAULT '[]',
  recommended_reason TEXT,
  selected_facility_id UUID REFERENCES public.facilities(id),
  selection_method TEXT DEFAULT 'auto' CHECK (selection_method IN ('auto', 'dispatch', 'customer_request', 'driver')),
  compliance_guidance TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- 4) Enable RLS
ALTER TABLE public.certified_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_recommendations ENABLE ROW LEVEL SECURITY;

-- 5) RLS policies for certified_sources (admin only)
CREATE POLICY "Staff can view certified sources"
  ON public.certified_sources
  FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin']::app_role[]));

CREATE POLICY "Admin can manage certified sources"
  ON public.certified_sources
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::app_role[]));

-- 6) RLS policies for facility_recommendations
CREATE POLICY "Staff can view facility recommendations"
  ON public.facility_recommendations
  FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'dispatcher', 'driver', 'owner_operator']::app_role[]));

CREATE POLICY "Staff can manage facility recommendations"
  ON public.facility_recommendations
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'dispatcher']::app_role[]));

-- 7) Indexes
CREATE INDEX IF NOT EXISTS idx_certified_sources_city ON public.certified_sources(city_or_market);
CREATE INDEX IF NOT EXISTS idx_certified_sources_active ON public.certified_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_facilities_certification ON public.facilities(certification_type, certification_city);
CREATE INDEX IF NOT EXISTS idx_facility_recs_order ON public.facility_recommendations(order_id);
CREATE INDEX IF NOT EXISTS idx_facility_recs_compliance ON public.facility_recommendations(compliance_required);

-- 8) Triggers for updated_at
CREATE TRIGGER update_certified_sources_updated_at
  BEFORE UPDATE ON public.certified_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facility_recommendations_updated_at
  BEFORE UPDATE ON public.facility_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9) Seed initial certified sources
INSERT INTO public.certified_sources (city_or_market, source_type, source_url, source_name, notes) VALUES
  ('san_jose', 'city_webpage', 'https://www.sanjoseca.gov/your-government/departments/environmental-services/recycling-garbage/construction-demolition', 'City of San José C&D Program', 'Official City-Certified C&D Facilities page'),
  ('oakland', 'city_webpage', 'https://www.oaklandca.gov/topics/construction-demolition-debris', 'City of Oakland C&D Program', 'Oakland C&D requirements and authorized facilities. Green Halo used for WRRP/CDSR reporting.')
ON CONFLICT DO NOTHING;

-- 10) Update existing facilities with certification info where known
UPDATE public.facilities 
SET certification_type = 'city_approved', 
    certification_city = 'oakland',
    compliance_notes = 'Accepts Oakland C&D materials'
WHERE city = 'Oakland' AND status = 'active';

UPDATE public.facilities 
SET certification_type = 'city_certified', 
    certification_city = 'san_jose',
    compliance_notes = 'City of San José certified C&D recycling facility'
WHERE city = 'San Jose' AND status = 'active';