
-- =====================================================
-- MULTI-TENANT PLATFORM SCHEMA
-- =====================================================

-- =====================================================
-- 1. PLATFORM TABLES
-- =====================================================

-- Tenants (companies operating on the platform)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  legal_entity_name TEXT,
  brand_name TEXT,
  legacy_brand_name TEXT,
  license_number TEXT,
  license_classification TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','suspended','onboarding')),
  primary_domain TEXT,
  support_email TEXT,
  support_phone TEXT,
  default_timezone TEXT DEFAULT 'America/Los_Angeles',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant branding
CREATE TABLE IF NOT EXISTS public.tenant_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  header_config JSONB DEFAULT '{}'::jsonb,
  footer_config JSONB DEFAULT '{}'::jsonb,
  seo_config JSONB DEFAULT '{}'::jsonb,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Tenant integrations
CREATE TABLE IF NOT EXISTS public.tenant_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  credentials_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active','pending','failed','disabled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant locations / yards
CREATE TABLE IF NOT EXISTS public.tenant_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  location_name TEXT NOT NULL,
  location_type TEXT DEFAULT 'yard' CHECK (location_type IN ('yard','office','warehouse','virtual')),
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'CA',
  zip TEXT,
  lat NUMERIC,
  lng NUMERIC,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service catalog (platform-wide)
CREATE TABLE IF NOT EXISTS public.service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code TEXT UNIQUE NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('SIZE_BASED','WEIGHT_BASED','LINE_ITEM_BASED','LABOR_PLUS_DISPOSAL','FLAT_PACKAGE','RECURRING_SERVICE','MANUAL_REVIEW','SMART_ENGINE')),
  contract_template_code TEXT,
  requires_dispatch BOOLEAN DEFAULT false,
  requires_driver BOOLEAN DEFAULT false,
  requires_labor BOOLEAN DEFAULT false,
  requires_material_review BOOLEAN DEFAULT false,
  requires_photo BOOLEAN DEFAULT false,
  requires_scope_notes BOOLEAN DEFAULT false,
  quote_fields JSONB DEFAULT '[]'::jsonb,
  line_item_types TEXT[] DEFAULT '{}',
  default_surcharges JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tenant-service junction
CREATE TABLE IF NOT EXISTS public.tenant_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  service_code TEXT REFERENCES public.service_catalog(service_code) NOT NULL,
  public_visible BOOLEAN DEFAULT true,
  quote_enabled BOOLEAN DEFAULT true,
  brand_scope TEXT,
  launch_price TEXT,
  custom_pricing JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, service_code)
);

-- User-tenant role assignments (maps auth users to tenants with roles)
CREATE TABLE IF NOT EXISTS public.user_tenant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER','SALES','CUSTOMER_SERVICE','DISPATCH','CREW_LEAD','CREW_MEMBER','FINANCE','MARKETING','READ_ONLY','PLATFORM_ADMIN','MARKETPLACE_OPS','PROVIDER_SUCCESS','BILLING_ADMIN')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tenant_id, role)
);

-- Provider profiles (marketplace)
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  owner_user_id UUID,
  company_name TEXT NOT NULL,
  dba_name TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  insurance_document_url TEXT,
  operating_hours TEXT,
  monthly_lead_cap INTEGER DEFAULT 50,
  preferred_lead_mode TEXT DEFAULT 'shared' CHECK (preferred_lead_mode IN ('exclusive','shared','round_robin','score_ranked')),
  qa_score NUMERIC DEFAULT 0,
  close_rate NUMERIC DEFAULT 0,
  response_sla_hours INTEGER DEFAULT 4,
  status TEXT DEFAULT 'onboarding' CHECK (status IN ('active','paused','suspended','onboarding')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Provider service areas
CREATE TABLE IF NOT EXISTS public.provider_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  service_code TEXT REFERENCES public.service_catalog(service_code) NOT NULL,
  geo_type TEXT NOT NULL CHECK (geo_type IN ('county','zip','radius')),
  geo_value TEXT NOT NULL,
  is_exclusive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Provider subscriptions
CREATE TABLE IF NOT EXISTS public.provider_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  plan_code TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  monthly_price_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','past_due','cancelled','trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  payment_method_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Platform leads (before routing to tenants)
CREATE TABLE IF NOT EXISTS public.platform_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'website',
  service_code TEXT REFERENCES public.service_catalog(service_code),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  company_name TEXT,
  project_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat NUMERIC,
  lng NUMERIC,
  intake_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW','QUALIFIED','ROUTED','ACCEPTED','DECLINED','QUOTED','WON','LOST')),
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lead matches (routing decisions)
CREATE TABLE IF NOT EXISTS public.lead_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.platform_leads(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id) NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  delivery_mode TEXT DEFAULT 'shared' CHECK (delivery_mode IN ('exclusive','shared','round_robin','score_ranked','admin_override')),
  match_score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','delivered','accepted','declined','expired')),
  delivered_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lead delivery events
CREATE TABLE IF NOT EXISTS public.lead_delivery_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.lead_matches(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  channel TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. TENANT OPERATIONAL TABLES
-- =====================================================

-- Tenant customers
CREATE TABLE IF NOT EXISTS public.tenant_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  customer_type TEXT DEFAULT 'residential' CHECK (customer_type IN ('residential','commercial','contractor','property_manager')),
  company_name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  total_revenue_cents INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer contacts (multi-contact per customer)
CREATE TABLE IF NOT EXISTS public.tenant_customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.tenant_customers(id) ON DELETE CASCADE NOT NULL,
  contact_type TEXT DEFAULT 'primary',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quote sessions
CREATE TABLE IF NOT EXISTS public.tenant_quote_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  service_code TEXT REFERENCES public.service_catalog(service_code),
  customer_id UUID REFERENCES public.tenant_customers(id),
  session_token TEXT DEFAULT gen_random_uuid()::text,
  intake_data JSONB DEFAULT '{}'::jsonb,
  pricing_snapshot JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned','expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes
CREATE TABLE IF NOT EXISTS public.tenant_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  quote_number TEXT,
  customer_id UUID REFERENCES public.tenant_customers(id),
  session_id UUID REFERENCES public.tenant_quote_sessions(id),
  service_code TEXT REFERENCES public.service_catalog(service_code),
  pricing_model TEXT,
  scope_of_work TEXT,
  assumptions TEXT,
  exclusions TEXT,
  subtotal_cents INTEGER DEFAULT 0,
  surcharges_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  payment_terms TEXT DEFAULT 'NET7',
  valid_until TIMESTAMPTZ,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','INTERNAL_REVIEW','SENT','VIEWED','APPROVED','SIGNED','DEPOSIT_PAID','EXPIRED','LOST')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quote line items
CREATE TABLE IF NOT EXISTS public.tenant_quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.tenant_quotes(id) ON DELETE CASCADE NOT NULL,
  line_type TEXT NOT NULL CHECK (line_type IN ('LABOR','DISPOSAL','DUMPSTER','TRUCK','MATERIAL_HANDLING','CLEANUP','SWAP','SURCHARGE','OTHER')),
  description TEXT,
  quantity NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'ea',
  unit_price_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quote service details (extra fields per service vertical)
CREATE TABLE IF NOT EXISTS public.tenant_quote_service_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  quote_id UUID REFERENCES public.tenant_quotes(id) ON DELETE CASCADE NOT NULL,
  field_key TEXT NOT NULL,
  field_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(quote_id, field_key)
);

-- Documents (contracts, addenda, SOWs, reports)
CREATE TABLE IF NOT EXISTS public.tenant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  template_code TEXT,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body_html TEXT,
  body_pdf_url TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  customer_id UUID REFERENCES public.tenant_customers(id),
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','signed','expired','archived')),
  signed_at TIMESTAMPTZ,
  signer_name TEXT,
  signer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE IF NOT EXISTS public.tenant_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  job_number TEXT,
  quote_id UUID REFERENCES public.tenant_quotes(id),
  customer_id UUID REFERENCES public.tenant_customers(id),
  service_code TEXT REFERENCES public.service_catalog(service_code),
  location_id UUID REFERENCES public.tenant_locations(id),
  project_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  scheduled_date DATE,
  scheduled_window TEXT,
  dispatch_notes TEXT,
  completion_notes TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SCHEDULED','CREW_ASSIGNED','DISPATCHED','IN_PROGRESS','QA_PENDING','COMPLETED','INVOICED','PAID','CLOSED')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Job assignments (crew)
CREATE TABLE IF NOT EXISTS public.tenant_job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.tenant_jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'crew_member',
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned','accepted','declined','completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job checklists
CREATE TABLE IF NOT EXISTS public.tenant_job_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.tenant_jobs(id) ON DELETE CASCADE NOT NULL,
  checklist_item TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job photos
CREATE TABLE IF NOT EXISTS public.tenant_job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.tenant_jobs(id) ON DELETE CASCADE NOT NULL,
  photo_type TEXT DEFAULT 'before' CHECK (photo_type IN ('before','during','after','issue')),
  photo_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.tenant_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT,
  job_id UUID REFERENCES public.tenant_jobs(id),
  customer_id UUID REFERENCES public.tenant_customers(id),
  subtotal_cents INTEGER DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  paid_cents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','partial','paid','overdue','void','collections')),
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.tenant_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.tenant_invoices(id),
  customer_id UUID REFERENCES public.tenant_customers(id),
  amount_cents INTEGER NOT NULL,
  payment_method TEXT,
  payment_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Timeline events
CREATE TABLE IF NOT EXISTS public.tenant_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  actor_id UUID,
  actor_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tenant_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id UUID,
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. DOCS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.doc_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code TEXT NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  service_code TEXT REFERENCES public.service_catalog(service_code),
  template_name TEXT NOT NULL,
  template_body TEXT,
  merge_tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_code, tenant_id, version)
);

-- =====================================================
-- 4. BILLING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.platform_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  monthly_price_cents INTEGER NOT NULL,
  features JSONB DEFAULT '{}'::jsonb,
  lead_cap INTEGER,
  priority_weight INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  subscription_amount_cents INTEGER DEFAULT 0,
  lead_fees_cents INTEGER DEFAULT 0,
  total_cents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','void')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lead_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.lead_matches(id),
  provider_id UUID REFERENCES public.providers(id) NOT NULL,
  fee_type TEXT DEFAULT 'per_lead' CHECK (fee_type IN ('per_lead','exclusive_zip','success_fee')),
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','invoiced','paid')),
  invoice_id UUID REFERENCES public.platform_invoices(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 5. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tenant_customers_tenant ON public.tenant_customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_quotes_tenant ON public.tenant_quotes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_quotes_customer ON public.tenant_quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_tenant_jobs_tenant ON public.tenant_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_jobs_status ON public.tenant_jobs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tenant_invoices_tenant ON public.tenant_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_timeline_entity ON public.tenant_timeline_events(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_platform_leads_status ON public.platform_leads(status);
CREATE INDEX IF NOT EXISTS idx_lead_matches_lead ON public.lead_matches(lead_id);
CREATE INDEX IF NOT EXISTS idx_provider_service_areas_provider ON public.provider_service_areas(provider_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_roles_user ON public.user_tenant_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_roles_tenant ON public.user_tenant_roles(tenant_id);

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- Helper function: check if user has role in tenant
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_tenant_roles
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND is_active = true
  )
$$;

-- Helper: get user's tenant IDs
CREATE OR REPLACE FUNCTION public.user_tenant_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.user_tenant_roles
  WHERE user_id = _user_id AND is_active = true
$$;

-- Enable RLS on all tenant tables
ALTER TABLE public.tenant_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_quote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_quote_service_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_job_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_tasks ENABLE ROW LEVEL SECURITY;

-- RLS: tenant_customers
CREATE POLICY "tenant_customers_access" ON public.tenant_customers
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_customer_contacts
CREATE POLICY "tenant_customer_contacts_access" ON public.tenant_customer_contacts
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_quote_sessions
CREATE POLICY "tenant_quote_sessions_access" ON public.tenant_quote_sessions
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_quotes
CREATE POLICY "tenant_quotes_access" ON public.tenant_quotes
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_quote_line_items
CREATE POLICY "tenant_quote_line_items_access" ON public.tenant_quote_line_items
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_quote_service_details
CREATE POLICY "tenant_quote_service_details_access" ON public.tenant_quote_service_details
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_documents
CREATE POLICY "tenant_documents_access" ON public.tenant_documents
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_jobs
CREATE POLICY "tenant_jobs_access" ON public.tenant_jobs
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_job_assignments
CREATE POLICY "tenant_job_assignments_access" ON public.tenant_job_assignments
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_job_checklists
CREATE POLICY "tenant_job_checklists_access" ON public.tenant_job_checklists
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_job_photos
CREATE POLICY "tenant_job_photos_access" ON public.tenant_job_photos
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_invoices
CREATE POLICY "tenant_invoices_access" ON public.tenant_invoices
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_payments
CREATE POLICY "tenant_payments_access" ON public.tenant_payments
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_timeline_events
CREATE POLICY "tenant_timeline_events_access" ON public.tenant_timeline_events
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- RLS: tenant_tasks
CREATE POLICY "tenant_tasks_access" ON public.tenant_tasks
  FOR ALL TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id))
  WITH CHECK (public.user_has_tenant_access(auth.uid(), tenant_id));

-- Platform tables: RLS for platform-level access
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenant_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_fees ENABLE ROW LEVEL SECURITY;

-- Service catalog is public read
CREATE POLICY "service_catalog_public_read" ON public.service_catalog
  FOR SELECT TO anon, authenticated USING (true);

-- Platform plans public read
CREATE POLICY "platform_plans_public_read" ON public.platform_plans
  FOR SELECT TO anon, authenticated USING (true);

-- Tenants: users can see their own tenants
CREATE POLICY "tenants_member_read" ON public.tenants
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.user_tenant_ids(auth.uid())));

-- Tenant branding: members can read
CREATE POLICY "tenant_branding_member_read" ON public.tenant_branding
  FOR SELECT TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id));

-- Tenant integrations: members can read
CREATE POLICY "tenant_integrations_member_read" ON public.tenant_integrations
  FOR SELECT TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id));

-- Tenant locations: members can read
CREATE POLICY "tenant_locations_member_read" ON public.tenant_locations
  FOR SELECT TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id));

-- Tenant services: members can read
CREATE POLICY "tenant_services_member_read" ON public.tenant_services
  FOR SELECT TO authenticated
  USING (public.user_has_tenant_access(auth.uid(), tenant_id));

-- User tenant roles: users can see their own
CREATE POLICY "user_tenant_roles_own" ON public.user_tenant_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Doc templates: read by tenant members or global (NULL tenant_id)
CREATE POLICY "doc_templates_read" ON public.doc_templates
  FOR SELECT TO authenticated
  USING (tenant_id IS NULL OR public.user_has_tenant_access(auth.uid(), tenant_id));

-- Providers: own provider read
CREATE POLICY "providers_own_read" ON public.providers
  FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid() OR public.user_has_tenant_access(auth.uid(), tenant_id));

-- Provider service areas
CREATE POLICY "provider_service_areas_read" ON public.provider_service_areas
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE owner_user_id = auth.uid()));

-- Provider subscriptions
CREATE POLICY "provider_subscriptions_read" ON public.provider_subscriptions
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM public.providers WHERE owner_user_id = auth.uid()));

-- Platform leads: authenticated staff with platform roles
CREATE POLICY "platform_leads_staff" ON public.platform_leads
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_tenant_roles
    WHERE user_id = auth.uid() AND role IN ('PLATFORM_ADMIN','MARKETPLACE_OPS') AND is_active = true
  ));

-- Lead matches: platform staff or matched provider
CREATE POLICY "lead_matches_access" ON public.lead_matches
  FOR SELECT TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE owner_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_tenant_roles WHERE user_id = auth.uid() AND role IN ('PLATFORM_ADMIN','MARKETPLACE_OPS') AND is_active = true)
  );

-- Lead delivery events
CREATE POLICY "lead_delivery_events_access" ON public.lead_delivery_events
  FOR SELECT TO authenticated
  USING (
    match_id IN (
      SELECT id FROM public.lead_matches WHERE provider_id IN (
        SELECT id FROM public.providers WHERE owner_user_id = auth.uid()
      )
    )
  );

-- Platform invoices
CREATE POLICY "platform_invoices_access" ON public.platform_invoices
  FOR SELECT TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE owner_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_tenant_roles WHERE user_id = auth.uid() AND role IN ('PLATFORM_ADMIN','BILLING_ADMIN') AND is_active = true)
  );

-- Lead fees
CREATE POLICY "lead_fees_access" ON public.lead_fees
  FOR SELECT TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE owner_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_tenant_roles WHERE user_id = auth.uid() AND role IN ('PLATFORM_ADMIN','BILLING_ADMIN') AND is_active = true)
  );
