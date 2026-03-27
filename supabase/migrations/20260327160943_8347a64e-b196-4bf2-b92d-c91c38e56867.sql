
-- =====================================================
-- MULTI-TENANT PLATFORM CORE SCHEMA
-- =====================================================

-- Companies (tenants)
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  legal_entity_name text,
  brand_name text,
  legacy_brand_name text,
  license_number text,
  license_classification text,
  status text NOT NULL DEFAULT 'active',
  domain text,
  logo_url text,
  primary_color text,
  secondary_color text,
  phone text,
  email text,
  address text,
  operating_locations text[] DEFAULT '{}',
  analytics_ids jsonb DEFAULT '{}',
  payment_account_id text,
  ghl_subaccount_id text,
  seo_config jsonb DEFAULT '{}',
  header_config jsonb DEFAULT '{}',
  footer_config jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Service verticals
CREATE TABLE public.service_verticals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code text UNIQUE NOT NULL,
  service_name text NOT NULL,
  service_category text,
  pricing_model text NOT NULL,
  contract_template_code text,
  requires_dispatch boolean NOT NULL DEFAULT false,
  requires_driver boolean NOT NULL DEFAULT false,
  requires_labor boolean NOT NULL DEFAULT false,
  requires_material_review boolean NOT NULL DEFAULT false,
  requires_photo boolean NOT NULL DEFAULT false,
  requires_scope_notes boolean NOT NULL DEFAULT false,
  quote_fields jsonb DEFAULT '[]',
  line_item_types text[] DEFAULT '{}',
  default_surcharges jsonb DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_verticals ENABLE ROW LEVEL SECURITY;

-- Company-service junction
CREATE TABLE public.company_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  service_code text NOT NULL REFERENCES public.service_verticals(service_code),
  public_visible boolean NOT NULL DEFAULT true,
  quote_enabled boolean NOT NULL DEFAULT true,
  brand_scope text,
  launch_price text,
  custom_pricing jsonb DEFAULT '{}',
  custom_quote_fields jsonb DEFAULT '[]',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, service_code)
);
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;

-- Provider profiles (marketplace)
CREATE TABLE public.provider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  service_codes text[] DEFAULT '{}',
  counties text[] DEFAULT '{}',
  zip_codes text[] DEFAULT '{}',
  response_hours int NOT NULL DEFAULT 24,
  lead_cap int,
  plan_tier text NOT NULL DEFAULT 'starter',
  payment_method text,
  rating numeric(3,2),
  insurance_url text,
  insurance_verified_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code text UNIQUE NOT NULL,
  plan_name text NOT NULL,
  monthly_price_cents int NOT NULL,
  features jsonb DEFAULT '{}',
  lead_cap int,
  priority_weight int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Add company_id to existing lead_routing_rules
ALTER TABLE public.lead_routing_rules
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS service_code_mt text REFERENCES public.service_verticals(service_code),
  ADD COLUMN IF NOT EXISTS routing_mode text NOT NULL DEFAULT 'round_robin',
  ADD COLUMN IF NOT EXISTS is_exclusive boolean NOT NULL DEFAULT false;

-- Document templates (multi-tenant)
CREATE TABLE public.document_templates_mt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code text NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  service_code text REFERENCES public.service_verticals(service_code),
  template_name text NOT NULL,
  template_body text,
  merge_tags jsonb DEFAULT '[]',
  version int NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(template_code, company_id)
);
ALTER TABLE public.document_templates_mt ENABLE ROW LEVEL SECURITY;

-- Pricing families
CREATE TABLE public.pricing_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  service_code text REFERENCES public.service_verticals(service_code),
  family_code text NOT NULL,
  family_name text NOT NULL,
  rates jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, family_code)
);
ALTER TABLE public.pricing_families ENABLE ROW LEVEL SECURITY;

-- Company user assignments
CREATE TABLE public.company_user_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);
ALTER TABLE public.company_user_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "anon_read_companies" ON public.companies FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "auth_read_companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_read_sv" ON public.service_verticals FOR SELECT TO anon USING (active = true);
CREATE POLICY "auth_read_sv" ON public.service_verticals FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_read_cs" ON public.company_services FOR SELECT TO anon USING (active = true);
CREATE POLICY "auth_read_cs" ON public.company_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_read_plans" ON public.subscription_plans FOR SELECT TO anon USING (active = true);
CREATE POLICY "auth_read_plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_pp" ON public.provider_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_dt" ON public.document_templates_mt FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_pf" ON public.pricing_families FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_cua" ON public.company_user_assignments FOR SELECT TO authenticated USING (user_id = auth.uid());
