
-- Pricing Catalog: editable general debris base prices
CREATE TABLE IF NOT EXISTS public.pricing_general_debris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_yd INTEGER NOT NULL,
  market_code TEXT NOT NULL DEFAULT 'default',
  base_price NUMERIC(10,2) NOT NULL,
  included_tons NUMERIC(5,2) NOT NULL DEFAULT 1,
  rental_days INTEGER NOT NULL DEFAULT 7,
  overage_rate NUMERIC(10,2) NOT NULL DEFAULT 165,
  best_for TEXT,
  public_visible BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  version_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(size_yd, market_code)
);

-- Pricing Catalog: editable heavy material service costs
CREATE TABLE IF NOT EXISTS public.pricing_heavy_service_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_yd INTEGER NOT NULL,
  service_cost NUMERIC(10,2) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  version_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(size_yd)
);

-- Pricing Catalog: editable heavy material groups
CREATE TABLE IF NOT EXISTS public.pricing_heavy_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heavy_group_code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  label_es TEXT,
  customer_label TEXT,
  description TEXT,
  materials_json JSONB NOT NULL DEFAULT '[]',
  dump_fee_per_yard NUMERIC(10,2) NOT NULL,
  rebar_premium NUMERIC(10,2) NOT NULL DEFAULT 50,
  green_halo_premium NUMERIC(10,2) NOT NULL DEFAULT 75,
  icon TEXT DEFAULT 'scale',
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  version_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns to existing pricing_extras
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS extra_code TEXT;
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'flat';
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'each';
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS driver_selectable BOOLEAN DEFAULT false;
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS requires_review BOOLEAN DEFAULT false;
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS customer_visible BOOLEAN DEFAULT true;
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS version_id UUID;
ALTER TABLE public.pricing_extras ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);

-- Pricing Catalog: editable policies / fees
CREATE TABLE IF NOT EXISTS public.pricing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  version_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing versions for draft/publish workflow
CREATE TABLE IF NOT EXISTS public.pricing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  created_by UUID,
  approved_by UUID,
  published_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing audit log for change tracking
CREATE TABLE IF NOT EXISTS public.pricing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by_user_id UUID,
  changed_by_email TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  config_area TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,
  version_code TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.pricing_general_debris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_heavy_service_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_heavy_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated read, admin write
CREATE POLICY "auth_read_general_debris" ON public.pricing_general_debris FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_general_debris" ON public.pricing_general_debris FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anon_read_general_debris" ON public.pricing_general_debris FOR SELECT TO anon USING (active = true AND public_visible = true);

CREATE POLICY "auth_read_heavy_costs" ON public.pricing_heavy_service_costs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_heavy_costs" ON public.pricing_heavy_service_costs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anon_read_heavy_costs" ON public.pricing_heavy_service_costs FOR SELECT TO anon USING (active = true);

CREATE POLICY "auth_read_heavy_groups" ON public.pricing_heavy_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_heavy_groups" ON public.pricing_heavy_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anon_read_heavy_groups" ON public.pricing_heavy_groups FOR SELECT TO anon USING (active = true);

CREATE POLICY "auth_read_policies" ON public.pricing_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_policies" ON public.pricing_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_versions" ON public.pricing_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_versions" ON public.pricing_versions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_audit" ON public.pricing_audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_insert_audit" ON public.pricing_audit_log FOR INSERT TO authenticated WITH CHECK (true);
