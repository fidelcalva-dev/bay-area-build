-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_rep';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer_service';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fleet_maintenance';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing_seo';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'read_only';