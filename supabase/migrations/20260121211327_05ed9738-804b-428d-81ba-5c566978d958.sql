-- ===========================================
-- PHASE 1B: CREATE TABLES AND POLICIES
-- ===========================================

-- 1) Create customers table (extends user with business profile)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT,
  customer_type TEXT NOT NULL DEFAULT 'homeowner' CHECK (customer_type IN ('homeowner', 'contractor', 'commercial', 'broker', 'property_manager')),
  billing_email TEXT,
  billing_phone TEXT,
  billing_address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile
CREATE POLICY "Customers can view own profile"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

-- Customers can update their own profile
CREATE POLICY "Customers can update own profile"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin/dispatcher can view all customers
CREATE POLICY "Staff can view all customers"
  ON public.customers FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher') OR
    public.has_role(auth.uid(), 'finance')
  );

-- Admin can manage all customers
CREATE POLICY "Admins can manage customers"
  ON public.customers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Create orders table (extends quotes with fulfillment data)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  -- Schedule
  scheduled_delivery_date DATE,
  scheduled_delivery_window TEXT CHECK (scheduled_delivery_window IN ('morning', 'midday', 'afternoon')),
  actual_delivery_at TIMESTAMPTZ,
  scheduled_pickup_date DATE,
  scheduled_pickup_window TEXT CHECK (scheduled_pickup_window IN ('morning', 'midday', 'afternoon')),
  actual_pickup_at TIMESTAMPTZ,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'scheduled', 'en_route', 'delivered', 
    'pickup_requested', 'pickup_scheduled', 'picked_up', 'completed', 'cancelled'
  )),
  
  -- Assignment
  assigned_driver_id UUID,
  assigned_yard_id UUID REFERENCES public.yards(id),
  
  -- Placement
  placement_confirmed BOOLEAN DEFAULT false,
  placement_locked BOOLEAN DEFAULT false,
  placement_photo_url TEXT,
  
  -- Pickup
  pickup_photo_url TEXT,
  dump_ticket_url TEXT,
  
  -- Financial
  final_total NUMERIC,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  invoice_url TEXT,
  
  -- Notes
  driver_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Staff can view all orders
CREATE POLICY "Staff can view all orders"
  ON public.orders FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher') OR
    public.has_role(auth.uid(), 'finance')
  );

-- Dispatchers and admins can manage orders
CREATE POLICY "Dispatchers can manage orders"
  ON public.orders FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher')
  );

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Create service_requests table (customer self-serve)
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  
  request_type TEXT NOT NULL CHECK (request_type IN (
    'pickup', 'schedule_change', 'placement_issue', 'damage_report', 'other'
  )),
  
  preferred_date DATE,
  preferred_window TEXT CHECK (preferred_window IN ('morning', 'midday', 'afternoon')),
  notes TEXT,
  photo_url TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'completed', 'denied')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Customers can create requests for their orders
CREATE POLICY "Customers can create requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view own requests"
  ON public.service_requests FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Staff can manage all requests
CREATE POLICY "Staff can manage requests"
  ON public.service_requests FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher')
  );

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'delivery_photo', 'pickup_photo', 'dump_ticket', 'invoice', 'receipt', 'permit', 'other'
  )),
  
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  uploaded_by UUID,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Customers can view documents for their orders
CREATE POLICY "Customers can view own documents"
  ON public.documents FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Staff can manage all documents
CREATE POLICY "Staff can manage documents"
  ON public.documents FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'dispatcher')
  );

-- 5) Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change', 'login', 'config_change')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  before_data JSONB,
  after_data JSONB,
  changes_summary TEXT,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins and system can insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() IS NOT NULL);

-- 6) Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  email_quotes BOOLEAN DEFAULT true,
  email_orders BOOLEAN DEFAULT true,
  email_receipts BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  
  sms_orders BOOLEAN DEFAULT true,
  sms_reminders BOOLEAN DEFAULT true,
  sms_marketing BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Customers can manage their own preferences
CREATE POLICY "Customers can manage own preferences"
  ON public.notification_preferences FOR ALL
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Admins can view all preferences
CREATE POLICY "Admins can view all preferences"
  ON public.notification_preferences FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Create config_settings table (admin editable business rules)
CREATE TABLE IF NOT EXISTS public.config_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_locked BOOLEAN DEFAULT false,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, key)
);

ALTER TABLE public.config_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read config (for pricing display)
CREATE POLICY "Anyone can read config"
  ON public.config_settings FOR SELECT
  USING (true);

-- Only admins can modify config
CREATE POLICY "Admins can manage config"
  ON public.config_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_config_settings_updated_at
  BEFORE UPDATE ON public.config_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8) Add customer_id to quotes for linking
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- 9) Helper function to check multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- 10) Insert default config settings
INSERT INTO public.config_settings (category, key, value, description, is_locked) VALUES
  ('office', 'hours', '{"open": "06:00", "close": "21:00", "timezone": "America/Los_Angeles"}', 'Office operating hours', true),
  ('delivery', 'windows', '["morning", "midday", "afternoon"]', 'Available delivery time windows', true),
  ('pricing', 'extra_ton_rate_default', '165', 'Default extra ton rate in dollars', false),
  ('pricing', 'prepay_discount_pct', '5', 'Prepay discount percentage', false),
  ('pricing', 'heavy_base_10yd', '638', 'Heavy material base price for 10yd', false),
  ('pricing', 'heavy_increment_200', '["Concrete", "Asphalt", "Rock", "Dirt"]', 'Materials with $200 increment', false),
  ('pricing', 'heavy_increment_300', '["Mixed Heavy", "Demo Debris"]', 'Materials with $300 increment', false),
  ('sizes', 'heavy_allowed', '[6, 8, 10]', 'Sizes available for heavy materials', true),
  ('sizes', 'general_allowed', '[6, 8, 10, 20, 30, 40, 50]', 'Sizes available for general debris', true)
ON CONFLICT (category, key) DO NOTHING;