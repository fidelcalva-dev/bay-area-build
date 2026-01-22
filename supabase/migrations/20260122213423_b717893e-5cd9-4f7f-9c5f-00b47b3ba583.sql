-- Add new admin-level roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'system_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ops_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'read_only_admin';