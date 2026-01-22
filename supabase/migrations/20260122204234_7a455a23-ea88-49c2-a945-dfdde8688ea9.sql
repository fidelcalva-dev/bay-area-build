-- Create trusted_customers (whitelist) table
CREATE TABLE public.trusted_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  phone TEXT,
  reason TEXT NOT NULL,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Add indexes for lookups
CREATE INDEX idx_trusted_customers_phone ON public.trusted_customers(phone);
CREATE INDEX idx_trusted_customers_customer_id ON public.trusted_customers(customer_id);
CREATE INDEX idx_trusted_customers_status ON public.trusted_customers(status);

-- Enable RLS
ALTER TABLE public.trusted_customers ENABLE ROW LEVEL SECURITY;

-- RLS policies for staff access
CREATE POLICY "Staff can view trusted customers"
  ON public.trusted_customers FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage trusted customers"
  ON public.trusted_customers FOR ALL
  USING (true);

-- Add risk score fields to fraud_flags
ALTER TABLE public.fraud_flags 
  ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_whitelisted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high'));

-- Create risk_score_events table for audit trail
CREATE TABLE public.risk_score_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT,
  customer_id UUID REFERENCES public.customers(id),
  quote_id UUID REFERENCES public.quotes(id),
  order_id UUID REFERENCES public.orders(id),
  score_delta INTEGER NOT NULL,
  rule_name TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_risk_score_events_phone ON public.risk_score_events(phone);
CREATE INDEX idx_risk_score_events_customer_id ON public.risk_score_events(customer_id);
CREATE INDEX idx_risk_score_events_created_at ON public.risk_score_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.risk_score_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can view risk events"
  ON public.risk_score_events FOR SELECT
  USING (true);

CREATE POLICY "System can insert risk events"
  ON public.risk_score_events FOR INSERT
  WITH CHECK (true);