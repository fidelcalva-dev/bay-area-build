-- Add truck routing fields to quotes table
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS truck_distance_miles numeric,
ADD COLUMN IF NOT EXISTS truck_duration_min integer,
ADD COLUMN IF NOT EXISTS truck_duration_max integer,
ADD COLUMN IF NOT EXISTS route_polyline text,
ADD COLUMN IF NOT EXISTS routing_provider text,
ADD COLUMN IF NOT EXISTS route_calculated_at timestamp with time zone;