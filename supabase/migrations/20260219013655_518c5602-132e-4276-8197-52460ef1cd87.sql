-- Make user_id nullable to allow imported contacts without user accounts
ALTER TABLE public.customers ALTER COLUMN user_id DROP NOT NULL;

-- Add contact_name column for individual contact names
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS contact_name text;
