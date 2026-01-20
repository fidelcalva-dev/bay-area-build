-- Add smart recommendation fields to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS recommended_size_yards integer,
ADD COLUMN IF NOT EXISTS recommendation_reason text,
ADD COLUMN IF NOT EXISTS user_selected_size_yards integer,
ADD COLUMN IF NOT EXISTS project_type text;