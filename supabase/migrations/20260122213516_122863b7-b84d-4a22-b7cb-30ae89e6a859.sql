-- Create config_versions table for versioning and rollback
CREATE TABLE public.config_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB NOT NULL,
  proposed_by UUID REFERENCES auth.users(id),
  proposed_by_email TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_by_email TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('proposed', 'approved', 'applied', 'rejected', 'rolled_back')),
  reason_note TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ
);

-- Create config_pending_changes table for approval workflow
CREATE TABLE public.config_pending_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT NOT NULL,
  current_data JSONB,
  proposed_data JSONB NOT NULL,
  proposed_by UUID REFERENCES auth.users(id) NOT NULL,
  proposed_by_email TEXT,
  reason_note TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  review_note TEXT
);

-- Create admin_permissions table for fine-grained access control
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  module TEXT NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, module)
);

-- Enable RLS
ALTER TABLE public.config_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_pending_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for config_versions (staff can read, admins can write)
CREATE POLICY "Staff can view config versions"
  ON public.config_versions FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'finance_admin', 'sales_admin', 'read_only_admin']::app_role[]));

CREATE POLICY "Admins can create config versions"
  ON public.config_versions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'finance_admin', 'sales_admin']::app_role[]));

CREATE POLICY "System admins can update config versions"
  ON public.config_versions FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::app_role[]));

-- RLS policies for config_pending_changes
CREATE POLICY "Staff can view pending changes"
  ON public.config_pending_changes FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'finance_admin', 'sales_admin', 'read_only_admin']::app_role[]));

CREATE POLICY "Admins can create pending changes"
  ON public.config_pending_changes FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'finance_admin', 'sales_admin']::app_role[]));

CREATE POLICY "Approvers can update pending changes"
  ON public.config_pending_changes FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::app_role[]));

-- RLS policies for admin_permissions (all staff can read)
CREATE POLICY "Staff can view permissions"
  ON public.admin_permissions FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'finance_admin', 'sales_admin', 'read_only_admin', 'dispatcher', 'finance']::app_role[]));

CREATE POLICY "System admins can manage permissions"
  ON public.admin_permissions FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::app_role[]));

-- Create helper function to check admin permissions
CREATE OR REPLACE FUNCTION public.check_admin_permission(_user_id uuid, _module text, _action text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_permission boolean := false;
  user_role app_role;
BEGIN
  FOR user_role IN SELECT role FROM user_roles WHERE user_id = _user_id
  LOOP
    SELECT 
      CASE _action
        WHEN 'read' THEN can_read
        WHEN 'write' THEN can_write
        WHEN 'approve' THEN can_approve
        WHEN 'delete' THEN can_delete
        ELSE false
      END INTO has_permission
    FROM admin_permissions
    WHERE role = user_role AND module = _module;
    
    IF has_permission THEN
      RETURN true;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$$;

-- Add indexes for performance
CREATE INDEX idx_config_versions_module ON public.config_versions(module);
CREATE INDEX idx_config_versions_status ON public.config_versions(status);
CREATE INDEX idx_config_pending_changes_status ON public.config_pending_changes(review_status);
CREATE INDEX idx_admin_permissions_role ON public.admin_permissions(role);