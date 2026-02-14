
-- ============================================================
-- ORDER BUILDER: Cart-style multi-item order composition
-- ============================================================

-- 1) extra_catalog — standard extras available for selection
CREATE TABLE public.extra_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'each', -- day|ton|flat|each
  default_price numeric,
  is_active boolean NOT NULL DEFAULT true,
  requires_pricing boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.extra_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read extra_catalog" ON public.extra_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage extra_catalog" ON public.extra_catalog FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed standard extras
INSERT INTO public.extra_catalog (code, name, description, unit, default_price, display_order) VALUES
  ('EXTRA_DAY', 'Extra Rental Day', 'Additional day beyond included rental period', 'day', 15, 1),
  ('EXTRA_TON', 'Extra Tonnage', 'Additional ton beyond included weight', 'ton', 165, 2),
  ('SWAP', 'Dumpster Swap', 'Swap full dumpster for empty one', 'each', 150, 3),
  ('LOCK', 'Lockbox', 'Keyed lock for dumpster security', 'each', 25, 4),
  ('PLYWOOD', 'Plywood Protection', 'Protect driveway/surface from damage', 'each', 50, 5),
  ('PERMIT_ASSIST', 'Permit Assistance', 'Help obtaining street placement permit', 'each', NULL, 6),
  ('RUSH_FEE', 'Rush / Same-Day Fee', 'Expedited same-day or next-day delivery', 'each', 75, 7),
  ('WALKWAY_PROTECTION', 'Walkway Protection', 'Protect walkways and paths', 'each', 50, 8);
UPDATE public.extra_catalog SET requires_pricing = true WHERE code = 'PERMIT_ASSIST';

-- 2) order_carts — the cart/quote builder
CREATE TABLE public.order_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id),
  lead_id uuid,
  created_by_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','SENT','ACCEPTED','CONVERTED','CANCELLED')),
  service_address_text text,
  service_lat numeric,
  service_lng numeric,
  zip text,
  customer_type text,
  notes_internal text,
  notes_customer text,
  total_estimated numeric,
  total_final numeric,
  portal_token text UNIQUE,
  portal_token_expires_at timestamptz,
  converted_order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read order_carts" ON public.order_carts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'dispatcher') OR public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Staff can insert order_carts" ON public.order_carts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));
CREATE POLICY "Staff can update order_carts" ON public.order_carts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));

-- 3) order_cart_items — line items in the cart
CREATE TABLE public.order_cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.order_carts(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'DUMPSTER'
    CHECK (item_type IN ('DUMPSTER','EXTRA','CUSTOM','RFQ')),
  title text NOT NULL,
  description text,
  qty int NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'each',
  unit_price numeric,
  amount numeric,
  is_price_pending boolean NOT NULL DEFAULT false,
  pricing_source text NOT NULL DEFAULT 'MANUAL'
    CHECK (pricing_source IN ('AUTO','MANUAL','VENDOR','PENDING')),
  related_size_yd int,
  related_material_category text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read cart items" ON public.order_cart_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.order_carts c WHERE c.id = cart_id AND (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'dispatcher') OR public.has_role(auth.uid(), 'finance')
  )));
CREATE POLICY "Staff can manage cart items" ON public.order_cart_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.order_carts c WHERE c.id = cart_id AND (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales')
  )));

-- 4) order_cart_schedules — per-item scheduling
CREATE TABLE public.order_cart_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_item_id uuid NOT NULL REFERENCES public.order_cart_items(id) ON DELETE CASCADE,
  schedule_type text NOT NULL DEFAULT 'DELIVERY'
    CHECK (schedule_type IN ('DELIVERY','PICKUP','SWAP')),
  scheduled_date date NOT NULL,
  time_window text NOT NULL DEFAULT 'Morning 8-12'
    CHECK (time_window IN ('Morning 8-12','Midday 12-3','Afternoon 3-6')),
  notes text,
  status text NOT NULL DEFAULT 'REQUESTED'
    CHECK (status IN ('REQUESTED','CONFIRMED','COMPLETED','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_cart_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read cart schedules" ON public.order_cart_schedules FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.order_cart_items i JOIN public.order_carts c ON c.id = i.cart_id WHERE i.id = cart_item_id AND (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'dispatcher') OR public.has_role(auth.uid(), 'finance')
  )));
CREATE POLICY "Staff can manage cart schedules" ON public.order_cart_schedules FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.order_cart_items i JOIN public.order_carts c ON c.id = i.cart_id WHERE i.id = cart_item_id AND (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales')
  )));

-- 5) cart_audit_log — full audit trail
CREATE TABLE public.cart_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.order_carts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL
    CHECK (action IN ('CREATE_CART','ADD_ITEM','REMOVE_ITEM','EDIT_ITEM','ADD_SCHEDULE','REMOVE_SCHEDULE','EDIT_SCHEDULE','SEND_TO_CUSTOMER','CONVERT_TO_ORDER','FINALIZE_PRICE','CANCEL','STATUS_CHANGE')),
  details_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cart_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read cart audit" ON public.cart_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'finance'));
CREATE POLICY "Staff can insert cart audit" ON public.cart_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));

-- Indexes
CREATE INDEX idx_order_carts_status ON public.order_carts(status);
CREATE INDEX idx_order_carts_customer ON public.order_carts(customer_id);
CREATE INDEX idx_order_carts_lead ON public.order_carts(lead_id);
CREATE INDEX idx_order_carts_portal_token ON public.order_carts(portal_token);
CREATE INDEX idx_cart_items_cart ON public.order_cart_items(cart_id);
CREATE INDEX idx_cart_schedules_item ON public.order_cart_schedules(cart_item_id);
CREATE INDEX idx_cart_schedules_date ON public.order_cart_schedules(scheduled_date);
CREATE INDEX idx_cart_audit_cart ON public.cart_audit_log(cart_id);
