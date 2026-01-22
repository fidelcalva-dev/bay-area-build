-- =====================================================
-- Create payment_actions table for refund/void workflow
-- =====================================================

-- Create enum for action types
CREATE TYPE payment_action_type AS ENUM ('refund', 'void');

-- Create enum for action statuses
CREATE TYPE payment_action_status AS ENUM (
  'requested',
  'approved', 
  'processing',
  'completed',
  'failed',
  'canceled'
);

-- Create the payment_actions table
CREATE TABLE public.payment_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL,
  order_id UUID NOT NULL,
  invoice_id UUID,
  action_type payment_action_type NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  reason_code TEXT NOT NULL,
  reason_notes TEXT,
  status payment_action_status NOT NULL DEFAULT 'requested',
  requested_by UUID NOT NULL,
  approved_by UUID,
  processed_by UUID,
  provider TEXT NOT NULL DEFAULT 'AuthorizeNet',
  provider_transaction_id TEXT,
  provider_refund_transaction_id TEXT,
  evidence_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for common queries
CREATE INDEX idx_payment_actions_payment_id ON public.payment_actions(payment_id);
CREATE INDEX idx_payment_actions_order_id ON public.payment_actions(order_id);
CREATE INDEX idx_payment_actions_status ON public.payment_actions(status);
CREATE INDEX idx_payment_actions_created_at ON public.payment_actions(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_payment_actions_updated_at
  BEFORE UPDATE ON public.payment_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add refunded_amount column to payments table if not exists
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.payment_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Finance and Admin can view all payment actions
CREATE POLICY "Staff can view payment actions"
  ON public.payment_actions
  FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role, 'dispatcher'::app_role]));

-- Finance and Admin can create payment actions (request refund/void)
CREATE POLICY "Finance can create payment actions"
  ON public.payment_actions
  FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]));

-- Finance and Admin can update payment actions (approve, process, complete)
CREATE POLICY "Finance can update payment actions"
  ON public.payment_actions
  FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]));

-- Add comments for documentation
COMMENT ON TABLE public.payment_actions IS 'Tracks refund and void requests for payments';
COMMENT ON COLUMN public.payment_actions.reason_code IS 'Dropdown reason: customer_request, duplicate, fraud, service_issue, pricing_error, other';
COMMENT ON COLUMN public.payment_actions.evidence_url IS 'Screenshot or receipt URL for manual refunds processed in gateway dashboard';