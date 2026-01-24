-- =====================================================
-- PHASE 1: ASSET CONTROL TOWER - Data Model
-- Creates assets_dumpsters, extends existing trucks table
-- =====================================================

-- 1) Create assets_dumpsters table (individual dumpster tracking)
CREATE TABLE public.assets_dumpsters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL DEFAULT 'dumpster' CHECK (asset_type IN ('dumpster', 'container')),
  size_id UUID NOT NULL REFERENCES public.dumpster_sizes(id),
  home_yard_id UUID NOT NULL REFERENCES public.yards(id),
  
  -- Current location state
  current_location_type TEXT NOT NULL DEFAULT 'yard' CHECK (current_location_type IN ('yard', 'field', 'truck', 'maintenance', 'unknown')),
  current_yard_id UUID REFERENCES public.yards(id),
  current_order_id UUID REFERENCES public.orders(id),
  
  -- Status
  asset_status TEXT NOT NULL DEFAULT 'available' CHECK (asset_status IN ('available', 'reserved', 'deployed', 'maintenance', 'retired')),
  
  -- Tracking timestamps
  deployed_at TIMESTAMPTZ,
  last_movement_at TIMESTAMPTZ DEFAULT now(),
  days_out INTEGER NOT NULL DEFAULT 0,
  
  -- Revenue tracking
  revenue_30d NUMERIC(10,2) DEFAULT 0,
  revenue_90d NUMERIC(10,2) DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_deployments INTEGER DEFAULT 0,
  
  -- Metadata
  asset_notes TEXT,
  needs_rebalance BOOLEAN DEFAULT false,
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'needs_repair')),
  last_inspection_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Extend existing trucks table with missing fields
ALTER TABLE public.trucks
  ADD COLUMN IF NOT EXISTS truck_code TEXT,
  ADD COLUMN IF NOT EXISTS home_yard_id UUID REFERENCES public.yards(id),
  ADD COLUMN IF NOT EXISTS current_yard_id UUID REFERENCES public.yards(id),
  ADD COLUMN IF NOT EXISTS truck_status TEXT DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS capacity_tons NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS license_plate TEXT,
  ADD COLUMN IF NOT EXISTS vin TEXT,
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS make TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS odometer_miles INTEGER,
  ADD COLUMN IF NOT EXISTS last_maintenance_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_maintenance_due TIMESTAMPTZ;

-- 3) Extend inventory_movements with asset tracking
ALTER TABLE public.inventory_movements 
  ADD COLUMN IF NOT EXISTS asset_id UUID,
  ADD COLUMN IF NOT EXISTS from_location_type TEXT,
  ADD COLUMN IF NOT EXISTS from_yard_id UUID,
  ADD COLUMN IF NOT EXISTS to_location_type TEXT,
  ADD COLUMN IF NOT EXISTS to_yard_id UUID,
  ADD COLUMN IF NOT EXISTS driver_id UUID,
  ADD COLUMN IF NOT EXISTS truck_id UUID;

-- 4) Add asset_id to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS asset_id UUID;

-- 5) Create indexes
CREATE INDEX idx_assets_status ON public.assets_dumpsters(asset_status);
CREATE INDEX idx_assets_location ON public.assets_dumpsters(current_location_type);
CREATE INDEX idx_assets_yard ON public.assets_dumpsters(current_yard_id);
CREATE INDEX idx_assets_order ON public.assets_dumpsters(current_order_id);
CREATE INDEX idx_assets_deployed ON public.assets_dumpsters(deployed_at) WHERE deployed_at IS NOT NULL;
CREATE INDEX idx_assets_size ON public.assets_dumpsters(size_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_asset ON public.inventory_movements(asset_id);
CREATE INDEX IF NOT EXISTS idx_orders_asset ON public.orders(asset_id);

-- 6) updated_at trigger for assets_dumpsters
CREATE OR REPLACE FUNCTION public.update_assets_dumpsters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_assets_dumpsters_updated_at
  BEFORE UPDATE ON public.assets_dumpsters
  FOR EACH ROW EXECUTE FUNCTION public.update_assets_dumpsters_updated_at();

-- 7) Enable RLS
ALTER TABLE public.assets_dumpsters ENABLE ROW LEVEL SECURITY;

-- 8) RLS Policies
CREATE POLICY "Admin full access to assets_dumpsters"
  ON public.assets_dumpsters FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'dispatcher', 'system_admin', 'ops_admin']::app_role[]));

CREATE POLICY "Drivers can view assets_dumpsters"
  ON public.assets_dumpsters FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['driver', 'owner_operator']::app_role[]));