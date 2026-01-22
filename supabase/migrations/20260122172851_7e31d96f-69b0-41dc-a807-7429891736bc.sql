-- Logistics type enum
DO $$ BEGIN
  CREATE TYPE logistics_type AS ENUM (
    'delivery',
    'pickup', 
    'swap',
    'live_load',
    'dump_and_return',
    'relocation',
    'custom_request',
    'yard_filled',
    'truck_filled',
    'partial_pickup',
    'dry_run',
    'multi_stop',
    'maintenance_hold'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Filled location enum
DO $$ BEGIN
  CREATE TYPE filled_location AS ENUM ('customer', 'yard', 'truck');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add logistics fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS logistics_type text DEFAULT 'delivery',
ADD COLUMN IF NOT EXISTS origin_yard_id uuid REFERENCES public.yards(id),
ADD COLUMN IF NOT EXISTS destination_type text DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS destination_yard_id uuid REFERENCES public.yards(id),
ADD COLUMN IF NOT EXISTS primary_dumpster_id uuid REFERENCES public.inventory(id),
ADD COLUMN IF NOT EXISTS secondary_dumpster_id uuid REFERENCES public.inventory(id),
ADD COLUMN IF NOT EXISTS truck_id text,
ADD COLUMN IF NOT EXISTS filled_location text,
ADD COLUMN IF NOT EXISTS live_load_minutes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_logistics_notes text,
ADD COLUMN IF NOT EXISTS requires_manual_review boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_dry_run boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dry_run_reason text,
ADD COLUMN IF NOT EXISTS overfill_flagged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS wrong_material_flagged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS multi_stop_sequence integer,
ADD COLUMN IF NOT EXISTS parent_order_id uuid REFERENCES public.orders(id);

-- Logistics events table for detailed audit trail
CREATE TABLE IF NOT EXISTS public.logistics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  logistics_type text NOT NULL,
  from_status text,
  to_status text,
  actor_id uuid,
  actor_role text,
  photo_url text,
  location_lat numeric,
  location_lng numeric,
  filled_location text,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Trucks table for tracking truck assignments
CREATE TABLE IF NOT EXISTS public.trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_number text NOT NULL UNIQUE,
  truck_type text DEFAULT 'roll-off',
  assigned_driver_id uuid REFERENCES public.drivers(id),
  assigned_yard_id uuid REFERENCES public.yards(id),
  is_active boolean DEFAULT true,
  capacity_yards integer DEFAULT 40,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Logistics pricing rules
CREATE TABLE IF NOT EXISTS public.logistics_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logistics_type text NOT NULL,
  base_fee numeric DEFAULT 0,
  per_minute_fee numeric DEFAULT 0,
  included_minutes integer DEFAULT 0,
  dry_run_fee numeric DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Insert default pricing rules
INSERT INTO public.logistics_pricing (logistics_type, base_fee, per_minute_fee, included_minutes, dry_run_fee, description) VALUES
  ('delivery', 0, 0, 0, 125, 'Standard delivery'),
  ('pickup', 0, 0, 0, 125, 'Standard pickup'),
  ('swap', 50, 0, 0, 125, 'Swap fee for replacement'),
  ('live_load', 75, 2, 30, 125, 'Live load with 30 min included'),
  ('dump_and_return', 150, 0, 0, 125, 'Dump and return same day'),
  ('relocation', 100, 0, 0, 125, 'On-site relocation'),
  ('custom_request', 0, 0, 0, 125, 'Custom - requires manual pricing'),
  ('yard_filled', 0, 0, 0, 0, 'Filled at yard - no extra fee'),
  ('truck_filled', 0, 0, 0, 0, 'Filled on truck - no extra fee'),
  ('partial_pickup', 0, 0, 0, 75, 'Partial pickup'),
  ('dry_run', 125, 0, 0, 0, 'Dry run fee'),
  ('multi_stop', 50, 0, 0, 125, 'Multi-stop per additional stop'),
  ('maintenance_hold', 0, 0, 0, 0, 'Maintenance hold - no fee')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.logistics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_pricing ENABLE ROW LEVEL SECURITY;

-- RLS policies for logistics_events
CREATE POLICY "Staff can view logistics events" ON public.logistics_events
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role, 'driver'::app_role]));

CREATE POLICY "Staff can create logistics events" ON public.logistics_events
  FOR INSERT WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'driver'::app_role]));

-- RLS policies for trucks
CREATE POLICY "Anyone can view active trucks" ON public.trucks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage trucks" ON public.trucks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for logistics_pricing
CREATE POLICY "Anyone can view active pricing" ON public.logistics_pricing
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage pricing" ON public.logistics_pricing
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_logistics_events_order_id ON public.logistics_events(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_events_created_at ON public.logistics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_logistics_type ON public.orders(logistics_type);
CREATE INDEX IF NOT EXISTS idx_orders_requires_review ON public.orders(requires_manual_review) WHERE requires_manual_review = true;