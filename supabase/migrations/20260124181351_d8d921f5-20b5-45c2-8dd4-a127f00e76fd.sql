
-- Add included_days column to orders for overdue calculation
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS included_days INTEGER DEFAULT 7;
