
-- Table to store quote-specific contracts with signature
CREATE TABLE public.quote_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  service_address TEXT,
  dumpster_size TEXT,
  material_type TEXT,
  rental_days INTEGER,
  price NUMERIC(10,2),
  terms_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','signed','expired')),
  signature_data TEXT, -- base64 image or typed text
  signature_type TEXT CHECK (signature_type IN ('drawn','typed')),
  signed_at TIMESTAMPTZ,
  signed_ip TEXT,
  sent_at TIMESTAMPTZ,
  sent_via TEXT[], -- ['sms','email']
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_contracts ENABLE ROW LEVEL SECURITY;

-- Staff can read/write
CREATE POLICY "Authenticated users can read quote_contracts"
ON public.quote_contracts FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert quote_contracts"
ON public.quote_contracts FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update quote_contracts"
ON public.quote_contracts FOR UPDATE TO authenticated
USING (true);

-- Anonymous users can read and sign (for the public signing page)
CREATE POLICY "Anon can read quote_contracts"
ON public.quote_contracts FOR SELECT TO anon
USING (true);

CREATE POLICY "Anon can update signature on quote_contracts"
ON public.quote_contracts FOR UPDATE TO anon
USING (status = 'pending');

-- Timestamp trigger
CREATE TRIGGER update_quote_contracts_updated_at
BEFORE UPDATE ON public.quote_contracts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
