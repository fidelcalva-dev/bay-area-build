-- CALSAN 100% FUNCTIONAL FIX: Database alignment to canon pricing + RLS hardening

-- ============================================================
-- P0 FIX 1: Update dumpster_sizes.base_price to match v56 canon
-- Canon: 6=$390, 8=$460, 10=$580, 20=$620, 30=$770, 40=$895, 50=$1135
-- ============================================================
UPDATE public.dumpster_sizes SET base_price = 390 WHERE size_value = 6;
UPDATE public.dumpster_sizes SET base_price = 460 WHERE size_value = 8;
UPDATE public.dumpster_sizes SET base_price = 580 WHERE size_value = 10;
UPDATE public.dumpster_sizes SET base_price = 620 WHERE size_value = 20;
UPDATE public.dumpster_sizes SET base_price = 770 WHERE size_value = 30;
UPDATE public.dumpster_sizes SET base_price = 895 WHERE size_value = 40;
UPDATE public.dumpster_sizes SET base_price = 1135 WHERE size_value = 50;

-- ============================================================
-- P0 FIX 2: Harden quotes RLS - restrict UPDATE to draft quotes only
-- Replace overly permissive USING(true) with controlled access
-- ============================================================
DROP POLICY IF EXISTS "Public can update quotes" ON public.quotes;

-- Allow updates only before order is created (status in initial states)
CREATE POLICY "Public can update own quotes before order"
ON public.quotes FOR UPDATE
TO anon, authenticated
USING (
  status IS NULL 
  OR status IN ('draft', 'saved', 'pinned', 'scheduled', 'checkout_started')
)
WITH CHECK (
  status IS NULL 
  OR status IN ('draft', 'saved', 'pinned', 'scheduled', 'checkout_started')
);

-- ============================================================
-- P0 FIX 3: Harden trusted_customers RLS - require staff roles
-- ============================================================
DROP POLICY IF EXISTS "Staff can manage trusted customers" ON public.trusted_customers;

CREATE POLICY "Staff can manage trusted customers"
ON public.trusted_customers FOR ALL
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'finance_admin', 'cs_agent', 'sales']::public.app_role[])
)
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin', 'finance_admin', 'cs_agent', 'sales']::public.app_role[])
);

-- ============================================================
-- P1 FIX 4: Seed city_rates for Oakland and San Jose
-- extra_ton_rate_prepay is a generated column, so exclude it from INSERT
-- Canon: extra_ton_rate = $165, prepay discount = 5%, heavy base 10yd = $638
-- ============================================================
INSERT INTO public.city_rates (
  zone_id, 
  city_name, 
  extra_ton_rate_standard, 
  prepay_discount_pct,
  heavy_base_10yd,
  is_active
)
VALUES
  -- Core Bay Area zone (Oakland)
  (
    '11111111-1111-1111-1111-111111111111',
    'Oakland',
    165.00,
    0.05,
    638.00,
    true
  ),
  -- Core Bay Area zone (San Jose)
  (
    '11111111-1111-1111-1111-111111111111',
    'San Jose',
    165.00,
    0.05,
    638.00,
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- P1 FIX 5: Ensure quotes have order_id field for tracking
-- ============================================================
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quotes_order_id ON public.quotes(order_id);

-- ============================================================
-- P2 FIX 6: Harden user_audit_logs INSERT policy
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can insert user audit logs" ON public.user_audit_logs;

CREATE POLICY "Staff can insert user audit logs"
ON public.user_audit_logs FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin', 'system_admin', 'ops_admin']::public.app_role[])
);

-- ============================================================
-- AUDIT LOG: Record this migration using valid action
-- ============================================================
INSERT INTO public.audit_logs (action, entity_type, changes_summary)
VALUES (
  'config_change',
  'system_migration',
  'CALSAN 100% functional fix: Updated dumpster_sizes base_price to v56 canon, hardened RLS policies (quotes UPDATE, trusted_customers ALL, user_audit_logs INSERT), seeded city_rates for Oakland/SJ'
);