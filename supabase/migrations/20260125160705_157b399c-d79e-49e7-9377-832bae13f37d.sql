-- Create security acknowledgements table
CREATE TABLE public.security_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED')),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.security_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify
CREATE POLICY "Admins can view security acknowledgements"
ON public.security_acknowledgements FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update security acknowledgements"
ON public.security_acknowledgements FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert security acknowledgements"
ON public.security_acknowledgements FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Pre-populate with known issues
INSERT INTO public.security_acknowledgements (issue_key, status, notes) VALUES
  ('SUPA_auth_leaked_password_protection', 'OPEN', 'Requires manual enablement in Supabase Auth settings'),
  ('SUPA_extension_in_public', 'OPEN', 'PostgreSQL extensions installed in public schema - low risk'),
  ('driver_payouts_financial_data', 'RESOLVED', 'RLS policies implemented via migration')
ON CONFLICT (issue_key) DO NOTHING;