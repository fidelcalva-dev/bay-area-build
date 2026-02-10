
-- Staff invites table for temporary password system
CREATE TABLE public.staff_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  temp_password_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookups
CREATE INDEX idx_staff_invites_email ON public.staff_invites(email);
CREATE INDEX idx_staff_invites_expires ON public.staff_invites(expires_at);

-- Enable RLS
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write invites
CREATE POLICY "Admins can manage staff invites"
  ON public.staff_invites
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add must_reset_password column to staff_users
ALTER TABLE public.staff_users ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT false;
