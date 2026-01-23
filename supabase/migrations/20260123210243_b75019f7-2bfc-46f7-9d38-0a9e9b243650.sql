-- Add missing roles to the app_role enum 
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cs_agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'billing_specialist';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'executive';