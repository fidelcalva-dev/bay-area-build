
-- Access Requests table
CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  requested_role text,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'APPROVED', 'REJECTED')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by_user_id uuid,
  UNIQUE (user_id, status)
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own access requests"
  ON public.access_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own request
CREATE POLICY "Users can create own access request"
  ON public.access_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all access requests"
  ON public.access_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update (approve/reject)
CREATE POLICY "Admins can update access requests"
  ON public.access_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Role Assignments Audit table
CREATE TABLE public.role_assignments_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL,
  target_email text,
  assigned_role text NOT NULL,
  assigned_by_user_id uuid NOT NULL,
  assigned_by_email text,
  source text NOT NULL CHECK (source IN ('ACCESS_REQUEST', 'ADMIN_MANUAL', 'AUTO_ASSIGN')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.role_assignments_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view role assignment audit"
  ON public.role_assignments_audit FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert role assignment audit"
  ON public.role_assignments_audit FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
