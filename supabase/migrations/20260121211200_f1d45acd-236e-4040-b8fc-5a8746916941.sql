-- ===========================================
-- PHASE 1A: EXTEND ROLES ENUM ONLY
-- ===========================================
-- These new enum values will be committed first

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dispatcher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';