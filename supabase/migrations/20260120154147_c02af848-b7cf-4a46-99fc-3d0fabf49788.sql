-- Add confidence fields to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS confidence_level text,
ADD COLUMN IF NOT EXISTS confidence_note text;