-- Add distance-based pricing fields to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS customer_lat DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS customer_lng DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS yard_id TEXT,
ADD COLUMN IF NOT EXISTS yard_name TEXT,
ADD COLUMN IF NOT EXISTS distance_miles DECIMAL(6, 2),
ADD COLUMN IF NOT EXISTS distance_bracket TEXT;

-- Create yards table for internal yard locations
CREATE TABLE IF NOT EXISTS public.yards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  market TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority_rank INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on yards (read-only for public)
ALTER TABLE public.yards ENABLE ROW LEVEL SECURITY;

-- Public can read active yards
CREATE POLICY "Anyone can view active yards"
ON public.yards
FOR SELECT
USING (is_active = true);

-- Create distance brackets table for pricing
CREATE TABLE IF NOT EXISTS public.distance_brackets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bracket_name TEXT NOT NULL,
  min_miles DECIMAL(5, 2) NOT NULL DEFAULT 0,
  max_miles DECIMAL(5, 2),
  price_adjustment DECIMAL(8, 2) NOT NULL DEFAULT 0,
  requires_review BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on distance_brackets
ALTER TABLE public.distance_brackets ENABLE ROW LEVEL SECURITY;

-- Public can read active brackets
CREATE POLICY "Anyone can view active distance brackets"
ON public.distance_brackets
FOR SELECT
USING (is_active = true);

-- Insert default yard locations (Bay Area)
INSERT INTO public.yards (name, slug, latitude, longitude, market, address, priority_rank) VALUES
('Oakland Yard', 'oakland', 37.7799, -122.2264, 'Oakland / East Bay', 'Oakland, CA', 1),
('San Jose Yard', 'san-jose', 37.3382, -121.8863, 'San Jose / South Bay', 'San Jose, CA', 2),
('Tracy Yard', 'tracy', 37.7397, -121.4252, 'Tracy / Stockton', 'Tracy, CA', 3),
('Fremont Yard', 'fremont', 37.5485, -121.9886, 'Oakland / East Bay', 'Fremont, CA', 4);

-- Insert distance brackets
INSERT INTO public.distance_brackets (bracket_name, min_miles, max_miles, price_adjustment, requires_review, display_order) VALUES
('Local', 0, 5, 0, false, 1),
('Near', 5, 10, 25, false, 2),
('Standard', 10, 15, 50, false, 3),
('Extended', 15, 25, 75, false, 4),
('Far', 25, NULL, 100, true, 5);

-- Add index for fast yard lookups
CREATE INDEX IF NOT EXISTS idx_yards_active ON public.yards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_distance_brackets_active ON public.distance_brackets(is_active) WHERE is_active = true;

-- Add trigger for yards updated_at
CREATE TRIGGER update_yards_updated_at
BEFORE UPDATE ON public.yards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();