
-- Add access constraint fields to orders and quotes
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS access_flags jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS placement_type text,
  ADD COLUMN IF NOT EXISTS gate_code text;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS access_flags jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS placement_type text,
  ADD COLUMN IF NOT EXISTS gate_code text;
