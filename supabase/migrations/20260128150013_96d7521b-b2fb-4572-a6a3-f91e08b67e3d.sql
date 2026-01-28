-- Phase 2: Clean up duplicates and add phased Google config

-- First remove duplicate keys (keep the google category ones, delete others with same key)
DELETE FROM public.config_settings 
WHERE id NOT IN (
  SELECT DISTINCT ON (key) id 
  FROM public.config_settings 
  ORDER BY key, 
    CASE WHEN category = 'google' THEN 0 ELSE 1 END,
    created_at DESC
);

-- Now add unique constraint
ALTER TABLE public.config_settings ADD CONSTRAINT config_settings_key_unique UNIQUE (key);

-- Insert sub-mode config keys (Chat, Drive, Gmail, Meet)
INSERT INTO public.config_settings (key, value, category, description, is_sensitive)
VALUES 
  ('google.chat_mode', '"LIVE"', 'google', 'Chat webhook mode: LIVE or OFF', false),
  ('google.drive_mode', '"LIVE"', 'google', 'Drive folder creation mode: LIVE or OFF', false),
  ('google.gmail_mode', '"DRY_RUN"', 'google', 'Gmail send mode: DRY_RUN or LIVE', false),
  ('google.meet_mode', '"DRY_RUN"', 'google', 'Meet creation mode: DRY_RUN or LIVE', false),
  ('google.gmail_live_roles', '["sales"]', 'google', 'Roles allowed to send emails when gmail_mode=LIVE', false),
  ('google.meet_live_roles', '["sales","cs"]', 'google', 'Roles allowed to create meets when meet_mode=LIVE', false)
ON CONFLICT (key) DO UPDATE SET 
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Ensure allowed_domains exists
INSERT INTO public.config_settings (key, value, category, description, is_sensitive)
VALUES ('google.allowed_domains', '["calsandumpsterspro.com"]', 'google', 'Allowed email domains for Google connections', false)
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;

-- Add group email configs for team folder permissions
INSERT INTO public.config_settings (key, value, category, description, is_sensitive)
VALUES 
  ('google.group_sales', '"sales@calsandumpsterspro.com"', 'google', 'Sales team Google Group email', false),
  ('google.group_cs', '"cs@calsandumpsterspro.com"', 'google', 'CS team Google Group email', false),
  ('google.group_dispatch', '"dispatch@calsandumpsterspro.com"', 'google', 'Dispatch team Google Group email', false),
  ('google.group_billing', '"billing@calsandumpsterspro.com"', 'google', 'Billing team Google Group email', false),
  ('google.group_admins', '"admins@calsandumpsterspro.com"', 'google', 'Admin team Google Group email', false)
ON CONFLICT (key) DO UPDATE SET description = EXCLUDED.description;

-- Add preflight check tracking table
CREATE TABLE IF NOT EXISTS public.google_preflight_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  details TEXT,
  checked_at TIMESTAMPTZ DEFAULT now(),
  checked_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.google_preflight_checks ENABLE ROW LEVEL SECURITY;

-- Admin-only access
DROP POLICY IF EXISTS "Admins can manage preflight checks" ON public.google_preflight_checks;
CREATE POLICY "Admins can manage preflight checks" ON public.google_preflight_checks
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add index
CREATE INDEX IF NOT EXISTS idx_preflight_check_type ON public.google_preflight_checks(check_type, checked_at DESC);