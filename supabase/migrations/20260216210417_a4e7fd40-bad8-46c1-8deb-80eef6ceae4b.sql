
-- Table to store multiple addresses per lead
CREATE TABLE public.lead_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Primary',
  address_line TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by lead
CREATE INDEX idx_lead_addresses_lead_id ON public.lead_addresses(lead_id);

-- Enable RLS
ALTER TABLE public.lead_addresses ENABLE ROW LEVEL SECURITY;

-- Policies - staff can manage all addresses
CREATE POLICY "Authenticated users can read lead addresses"
  ON public.lead_addresses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert lead addresses"
  ON public.lead_addresses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update lead addresses"
  ON public.lead_addresses FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete lead addresses"
  ON public.lead_addresses FOR DELETE
  TO authenticated
  USING (true);
