
-- Customer Contacts: multiple contacts per customer
CREATE TABLE public.customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_role TEXT DEFAULT 'primary',
  phone TEXT,
  email TEXT,
  preferred_method TEXT DEFAULT 'phone',
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customer Sites: multiple service locations per customer
CREATE TABLE public.customer_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL DEFAULT 'Primary',
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  gate_code TEXT,
  placement_instructions TEXT,
  permit_notes TEXT,
  site_notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_customer_contacts_customer ON public.customer_contacts(customer_id);
CREATE INDEX idx_customer_sites_customer ON public.customer_sites(customer_id);

-- RLS
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage customer contacts"
  ON public.customer_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage customer sites"
  ON public.customer_sites FOR ALL TO authenticated USING (true) WITH CHECK (true);
