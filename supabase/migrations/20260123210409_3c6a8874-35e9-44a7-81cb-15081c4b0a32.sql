-- Create staff_users table for extended user information
CREATE TABLE public.staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  department TEXT NOT NULL CHECK (department IN (
    'customer_service', 'sales', 'dispatch_logistics', 
    'drivers_field_ops', 'finance_billing', 'operations_admin', 
    'system_admin', 'executive'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for staff_users
CREATE POLICY "Admins can view all staff"
ON public.staff_users FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin']::public.app_role[]));

CREATE POLICY "Admins can insert staff"
ON public.staff_users FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::public.app_role[]));

CREATE POLICY "Admins can update staff"
ON public.staff_users FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::public.app_role[]));

CREATE POLICY "System admins can delete staff"
ON public.staff_users FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- Create role_definitions table for role metadata
CREATE TABLE public.role_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  department TEXT,
  allowed_routes TEXT[] DEFAULT '{}',
  allowed_actions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on role_definitions
ALTER TABLE public.role_definitions ENABLE ROW LEVEL SECURITY;

-- Everyone can read role definitions
CREATE POLICY "All can view role definitions"
ON public.role_definitions FOR SELECT
TO authenticated
USING (true);

-- Insert role definitions
INSERT INTO public.role_definitions (role, label, description, department, allowed_routes, allowed_actions) VALUES
  ('admin', 'Admin', 'Full system access', 'system_admin',
   ARRAY['/admin/*', '/sales/*', '/cs/*', '/dispatch/*', '/finance/*', '/driver/*'],
   ARRAY['create', 'read', 'update', 'delete', 'approve', 'export']),
  ('system_admin', 'System Admin', 'System configuration and user management', 'system_admin',
   ARRAY['/admin/*'],
   ARRAY['create', 'read', 'update', 'delete', 'approve', 'export', 'configure']),
  ('ops_admin', 'Ops Admin', 'Operations oversight', 'operations_admin',
   ARRAY['/admin/orders', '/admin/inventory', '/admin/dispatch', '/admin/drivers', '/admin/dashboards/*'],
   ARRAY['read', 'update', 'approve', 'export']),
  ('cs', 'CS Manager', 'Customer service full access', 'customer_service',
   ARRAY['/cs/*'], ARRAY['read', 'update', 'create', 'approve']),
  ('cs_agent', 'CS Agent', 'Customer service limited access', 'customer_service',
   ARRAY['/cs/orders', '/cs/requests', '/cs/messages'], ARRAY['read', 'update', 'create']),
  ('sales', 'Sales Rep', 'Sales team access', 'sales',
   ARRAY['/sales/*'], ARRAY['read', 'update', 'create']),
  ('dispatcher', 'Dispatcher', 'Dispatch and scheduling', 'dispatch_logistics',
   ARRAY['/dispatch/*'], ARRAY['read', 'update', 'create', 'approve']),
  ('driver', 'Driver', 'Driver app access', 'drivers_field_ops',
   ARRAY['/driver/*'], ARRAY['read', 'update']),
  ('owner_operator', 'Owner Operator', 'Driver with payouts', 'drivers_field_ops',
   ARRAY['/driver/*', '/finance/payouts'], ARRAY['read', 'update']),
  ('finance', 'Finance Manager', 'Finance full access', 'finance_billing',
   ARRAY['/finance/*'], ARRAY['read', 'update', 'create', 'approve']),
  ('billing_specialist', 'Billing Specialist', 'Billing access', 'finance_billing',
   ARRAY['/finance/invoices', '/finance/payments', '/finance/ar-aging'], ARRAY['read', 'update', 'create']),
  ('executive', 'Executive', 'Read-only dashboards', 'executive',
   ARRAY['/admin/dashboards/*', '/admin'], ARRAY['read', 'export']);

-- Create user_audit_logs table
CREATE TABLE public.user_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID,
  target_email TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view user audit logs"
ON public.user_audit_logs FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin']::public.app_role[]));

CREATE POLICY "Authenticated can insert user audit logs"
ON public.user_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_staff_users_email ON public.staff_users(email);
CREATE INDEX idx_staff_users_status ON public.staff_users(status);
CREATE INDEX idx_staff_users_department ON public.staff_users(department);
CREATE INDEX idx_user_audit_logs_target ON public.user_audit_logs(target_user_id);
CREATE INDEX idx_user_audit_logs_admin ON public.user_audit_logs(admin_id);

-- Trigger for updated_at
CREATE TRIGGER update_staff_users_updated_at
  BEFORE UPDATE ON public.staff_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();