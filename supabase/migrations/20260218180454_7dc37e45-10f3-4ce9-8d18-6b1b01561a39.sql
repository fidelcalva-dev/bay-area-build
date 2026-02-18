
-- Add new columns for sales agent editable fields on quotes
ALTER TABLE public.quotes 
  ADD COLUMN IF NOT EXISTS delivery_date date,
  ADD COLUMN IF NOT EXISTS delivery_instructions text,
  ADD COLUMN IF NOT EXISTS delivery_time_window text,
  ADD COLUMN IF NOT EXISTS delivery_photos text[] DEFAULT '{}';
