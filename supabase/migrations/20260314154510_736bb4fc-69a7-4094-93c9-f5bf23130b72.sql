
-- Extra Items Catalog: configurable operational extras and exceptions
CREATE TABLE public.extra_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  default_amount numeric NOT NULL DEFAULT 0,
  pricing_mode text NOT NULL DEFAULT 'flat' CHECK (pricing_mode IN ('flat', 'per_hour', 'per_day', 'per_ton', 'manual_review')),
  taxable boolean NOT NULL DEFAULT false,
  requires_photo boolean NOT NULL DEFAULT false,
  requires_note boolean NOT NULL DEFAULT false,
  requires_dispatch_review boolean NOT NULL DEFAULT false,
  requires_customer_notice boolean NOT NULL DEFAULT false,
  driver_selectable boolean NOT NULL DEFAULT false,
  customer_visible boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.extra_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read extra_items"
  ON public.extra_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage extra_items"
  ON public.extra_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order extras: track extras applied to specific orders
CREATE TABLE public.order_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  extra_item_id uuid NOT NULL REFERENCES public.extra_items(id),
  quantity integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'drafted' CHECK (status IN ('drafted','reported','under_review','approved','waived','invoiced','paid')),
  reported_by uuid,
  approved_by uuid,
  note text,
  photo_urls text[],
  reported_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read order_extras"
  ON public.order_extras FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage order_extras"
  ON public.order_extras FOR ALL TO authenticated USING (true) WITH CHECK (true);
