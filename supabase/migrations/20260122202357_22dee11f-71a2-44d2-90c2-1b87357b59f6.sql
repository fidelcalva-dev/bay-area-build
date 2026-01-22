-- Create fraud_flags table for tracking suspicious activity
CREATE TABLE public.fraud_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT,
  customer_id UUID REFERENCES public.customers(id),
  quote_id UUID REFERENCES public.quotes(id),
  order_id UUID REFERENCES public.orders(id),
  flag_type TEXT NOT NULL CHECK (flag_type IN ('velocity_phone', 'multi_address', 'out_of_range', 'identity_mismatch', 'high_risk_combo')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'blocked')),
  reason TEXT NOT NULL,
  evidence_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_notes TEXT
);

-- Create fraud_actions table for tracking actions taken on flags
CREATE TABLE public.fraud_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_id UUID NOT NULL REFERENCES public.fraud_flags(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'reviewed', 'resolved', 'blocked', 'require_deposit', 'whitelist', 'note_added', 'escalated')),
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add fraud-related columns to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS fraud_flags_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS requires_deposit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_required_reason TEXT,
ADD COLUMN IF NOT EXISTS fraud_blocked BOOLEAN DEFAULT false;

-- Add fraud-related columns to quotes
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS fraud_flags_count INTEGER DEFAULT 0;

-- Create indexes for efficient fraud queries
CREATE INDEX idx_fraud_flags_phone ON public.fraud_flags(phone);
CREATE INDEX idx_fraud_flags_status ON public.fraud_flags(status) WHERE status IN ('open', 'reviewing');
CREATE INDEX idx_fraud_flags_severity ON public.fraud_flags(severity);
CREATE INDEX idx_fraud_flags_created_at ON public.fraud_flags(created_at DESC);
CREATE INDEX idx_fraud_actions_flag ON public.fraud_actions(flag_id);

-- Enable RLS
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for fraud_flags
CREATE POLICY "Staff can view fraud flags"
ON public.fraud_flags
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

CREATE POLICY "Staff can create fraud flags"
ON public.fraud_flags
FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

CREATE POLICY "Staff can update fraud flags"
ON public.fraud_flags
FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

-- RLS policies for fraud_actions
CREATE POLICY "Staff can view fraud actions"
ON public.fraud_actions
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

CREATE POLICY "Staff can create fraud actions"
ON public.fraud_actions
FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));