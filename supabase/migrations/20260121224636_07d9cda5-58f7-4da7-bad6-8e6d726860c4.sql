-- Second migration: Create tables using the new enum values

-- User Profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  phone text,
  avatar_url text,
  preferred_role app_role,
  driver_id uuid REFERENCES public.drivers(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.user_profiles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Approval Requests table
CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  requested_value jsonb,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  review_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view approval requests"
ON public.approval_requests FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin', 'sales', 'dispatcher', 'finance']::app_role[]));

CREATE POLICY "Sales can create requests"
ON public.approval_requests FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[]));

CREATE POLICY "Admin Finance can review requests"
ON public.approval_requests FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[]));

-- Sales Leads table
CREATE TABLE public.sales_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES public.quotes(id),
  customer_name text,
  customer_phone text,
  customer_email text,
  company_name text,
  lead_source text,
  lead_status text NOT NULL DEFAULT 'new',
  assigned_to uuid,
  notes text,
  next_followup_at timestamp with time zone,
  converted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales staff can view leads"
ON public.sales_leads FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[]));

CREATE POLICY "Sales staff can manage leads"
ON public.sales_leads FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[]));

-- Driver Payouts table
CREATE TABLE public.driver_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  job_type text NOT NULL,
  base_payout numeric NOT NULL DEFAULT 0,
  mileage_payout numeric DEFAULT 0,
  bonus numeric DEFAULT 0,
  total_payout numeric GENERATED ALWAYS AS (base_payout + COALESCE(mileage_payout, 0) + COALESCE(bonus, 0)) STORED,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own payouts"
ON public.driver_payouts FOR SELECT
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "Admin Finance can manage payouts"
ON public.driver_payouts FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'finance']::app_role[]));

-- Update drivers table
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS payout_rate_per_job numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payout_rate_per_mile numeric DEFAULT 0;

-- Driver access policies
DROP POLICY IF EXISTS "Drivers can view own record" ON public.drivers;
CREATE POLICY "Drivers can view own record"
ON public.drivers FOR SELECT
USING (user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['admin', 'dispatcher']::app_role[]));

-- Driver order access
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON public.orders;
CREATE POLICY "Drivers can view assigned orders"
ON public.orders FOR SELECT
USING (assigned_driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;
CREATE POLICY "Drivers can update assigned orders"
ON public.orders FOR UPDATE
USING (assigned_driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Permission matrix table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  conditions jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role, resource, action)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read permissions"
ON public.role_permissions FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions"
ON public.role_permissions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));