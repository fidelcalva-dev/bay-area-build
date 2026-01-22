-- Contract types enum
CREATE TYPE contract_type AS ENUM ('msa', 'addendum');
CREATE TYPE contract_status AS ENUM ('pending', 'signed', 'declined', 'expired');

-- Master contracts table (MSA and Addendums)
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  contract_type contract_type NOT NULL,
  status contract_status NOT NULL DEFAULT 'pending',
  
  -- For addendums, link to specific address
  service_address TEXT,
  service_address_normalized TEXT, -- lowercase, trimmed for matching
  
  -- Contract content
  contract_version TEXT NOT NULL DEFAULT '1.0',
  terms_content TEXT, -- JSON or markdown of terms
  
  -- Signature info
  signed_at TIMESTAMPTZ,
  signed_ip TEXT,
  signature_method TEXT, -- 'sms_link', 'email_link', 'in_person'
  
  -- Document storage
  pdf_url TEXT,
  
  -- Expiration (for MSA)
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contract events for audit trail
CREATE TABLE public.contract_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'sent_sms', 'sent_email', 'viewed', 'signed', 'declined', 'expired'
  actor_id UUID,
  actor_role TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add contract validation to orders
ALTER TABLE public.orders 
  ADD COLUMN msa_contract_id UUID REFERENCES public.contracts(id),
  ADD COLUMN addendum_contract_id UUID REFERENCES public.contracts(id),
  ADD COLUMN contracts_valid BOOLEAN DEFAULT false;

-- Indexes
CREATE INDEX idx_contracts_customer ON public.contracts(customer_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_type ON public.contracts(contract_type);
CREATE INDEX idx_contracts_address ON public.contracts(service_address_normalized);
CREATE INDEX idx_contract_events_contract ON public.contract_events(contract_id);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Staff can manage contracts"
  ON public.contracts FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role]));

CREATE POLICY "Customers can view own contracts"
  ON public.contracts FOR SELECT
  USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Customers can update own contracts to sign"
  ON public.contracts FOR UPDATE
  USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  ));

-- RLS Policies for contract events
CREATE POLICY "Staff can view contract events"
  ON public.contract_events FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

CREATE POLICY "Staff can create contract events"
  ON public.contract_events FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role]));

-- Trigger for updated_at
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();