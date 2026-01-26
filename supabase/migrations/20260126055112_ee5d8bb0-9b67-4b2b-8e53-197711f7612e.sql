-- Auto-Identify Customer Type System - Complete Migration

-- 1) Customer type rules - scoring rules for auto-detection
CREATE TABLE public.customer_type_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_code TEXT UNIQUE NOT NULL,
  description TEXT,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('email_domain', 'company_name', 'quantity', 'recurring', 'urgency', 'keywords', 'explicit', 'project_type')),
  conditions_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_customer_type TEXT NOT NULL CHECK (output_customer_type IN ('homeowner', 'contractor', 'business', 'preferred_contractor', 'wholesaler')),
  weight INTEGER NOT NULL DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Customer profiles - stores detected customer type for leads
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  contact_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_type TEXT NOT NULL DEFAULT 'homeowner' CHECK (customer_type IN ('homeowner', 'contractor', 'business', 'preferred_contractor', 'wholesaler')),
  confidence_score INTEGER NOT NULL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  was_auto_detected BOOLEAN DEFAULT false,
  was_overridden BOOLEAN DEFAULT false,
  detected_signals_json JSONB DEFAULT '{}'::jsonb,
  email TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.customer_type_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_type_rules
CREATE POLICY "Anyone can read active customer type rules"
  ON public.customer_type_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage customer type rules"
  ON public.customer_type_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for customer_profiles
CREATE POLICY "Anyone can create customer profiles"
  ON public.customer_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read customer profiles"
  ON public.customer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage customer profiles"
  ON public.customer_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Add allowed_customer_types to project_categories
ALTER TABLE public.project_categories 
ADD COLUMN IF NOT EXISTS allowed_customer_types JSONB DEFAULT '["homeowner", "contractor", "business"]'::jsonb;

-- Update existing categories with proper customer type restrictions
UPDATE public.project_categories SET allowed_customer_types = '["homeowner"]'::jsonb 
WHERE category_code IN ('HOME_CLEANOUT', 'YARD_CLEANUP', 'SMALL_CONCRETE_PAVERS', 'GARAGE_PROPERTY_CLEANOUT');

UPDATE public.project_categories SET allowed_customer_types = '["homeowner", "contractor"]'::jsonb 
WHERE category_code IN ('REMODEL', 'ROOFING', 'LANDSCAPING');

UPDATE public.project_categories SET allowed_customer_types = '["contractor", "preferred_contractor"]'::jsonb 
WHERE category_code IN ('DEMOLITION', 'NEW_CONSTRUCTION');

UPDATE public.project_categories SET allowed_customer_types = '["business"]'::jsonb 
WHERE category_code IN ('COMMERCIAL_TRASH', 'COMMERCIAL_RECYCLING', 'WAREHOUSE_CLEANOUT', 'PROPERTY_MANAGEMENT');

-- 4) Seed customer type detection rules
INSERT INTO public.customer_type_rules (rule_code, rule_name, signal_type, conditions_json, output_customer_type, weight, display_order) VALUES
('email_personal_gmail', 'Personal Gmail/Yahoo', 'email_domain', '{"domains": ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"]}', 'homeowner', 20, 1),
('email_company_domain', 'Company Email Domain', 'email_domain', '{"pattern": "company_domain"}', 'contractor', 25, 2),
('has_company_name', 'Company Name Provided', 'company_name', '{"has_value": true}', 'contractor', 15, 10),
('company_llc_inc', 'LLC/Inc in Company Name', 'company_name', '{"patterns": ["llc", "inc", "corp", "construction", "builders", "contracting"]}', 'contractor', 30, 11),
('company_commercial', 'Commercial Business Name', 'company_name', '{"patterns": ["restaurant", "store", "warehouse", "hotel", "property management", "retail"]}', 'business', 30, 12),
('multiple_dumpsters', 'Multiple Dumpsters Requested', 'quantity', '{"min_quantity": 2}', 'contractor', 25, 20),
('bulk_order', 'Bulk Order (3+)', 'quantity', '{"min_quantity": 3}', 'business', 35, 21),
('recurring_service', 'Recurring Service Requested', 'recurring', '{"is_recurring": true}', 'business', 40, 30),
('same_day_multiple', 'Same-Day + Multiple Jobs', 'urgency', '{"same_day": true, "multiple_jobs": true}', 'contractor', 30, 40),
('keywords_contractor', 'Contractor Keywords', 'keywords', '{"patterns": ["jobsite", "demo", "demolition", "framing", "adu", "permit", "renovation project", "construction site", "build"]}', 'contractor', 35, 50),
('keywords_commercial', 'Commercial Keywords', 'keywords', '{"patterns": ["warehouse", "office", "retail", "store", "restaurant", "property management", "commercial"]}', 'business', 35, 51),
('keywords_homeowner', 'Homeowner Keywords', 'keywords', '{"patterns": ["garage cleanout", "home cleanout", "moving", "downsizing", "estate", "spring cleaning", "yard waste"]}', 'homeowner', 25, 52),
('explicit_contractor', 'Explicitly Selected Contractor', 'explicit', '{"selected_type": "contractor"}', 'contractor', 100, 100),
('explicit_business', 'Explicitly Selected Business', 'explicit', '{"selected_type": "business"}', 'business', 100, 101),
('explicit_homeowner', 'Explicitly Selected Homeowner', 'explicit', '{"selected_type": "homeowner"}', 'homeowner', 100, 102);