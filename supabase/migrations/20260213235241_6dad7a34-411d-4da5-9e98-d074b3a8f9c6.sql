
-- Add missing columns to existing vendors table
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS coverage_zips TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coverage_cities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS equipment_types TEXT[] DEFAULT '{rolloff}',
  ADD COLUMN IF NOT EXISTS size_support INTEGER[] DEFAULT '{10,20,30,40}',
  ADD COLUMN IF NOT EXISTS material_support TEXT[] DEFAULT '{DEBRIS}',
  ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS response_sla_minutes INTEGER DEFAULT 60;

-- Vendor rates table
CREATE TABLE IF NOT EXISTS public.vendor_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  market_code TEXT,
  city TEXT,
  size_yd INTEGER NOT NULL,
  material_category TEXT NOT NULL DEFAULT 'DEBRIS',
  base_cost NUMERIC(10,2) NOT NULL,
  included_tons NUMERIC(6,2) DEFAULT 1.0,
  overage_cost_per_ton NUMERIC(8,2) DEFAULT 165.00,
  extra_day_cost NUMERIC(8,2) DEFAULT 35.00,
  effective_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendor_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read vendor_rates" ON public.vendor_rates
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'dispatcher'));

CREATE POLICY "Admin can manage vendor_rates" ON public.vendor_rates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Vendor quotes (RFQ tracking)
CREATE TABLE IF NOT EXISTS public.vendor_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id),
  request_payload JSONB NOT NULL DEFAULT '{}',
  quoted_cost NUMERIC(10,2),
  recommended_customer_price NUMERIC(10,2),
  margin_estimate NUMERIC(8,2),
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vendor_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read vendor_quotes" ON public.vendor_quotes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));

CREATE POLICY "Staff can create vendor_quotes" ON public.vendor_quotes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));

CREATE POLICY "Staff can update vendor_quotes" ON public.vendor_quotes
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));

-- Internal quote decisions (audit trail)
CREATE TABLE IF NOT EXISTS public.internal_quote_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_role TEXT,
  input_payload JSONB NOT NULL,
  output_payload JSONB,
  decision_type TEXT DEFAULT 'CALCULATE',
  vendor_id UUID REFERENCES public.vendors(id),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.internal_quote_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read decisions" ON public.internal_quote_decisions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can log decisions" ON public.internal_quote_decisions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
