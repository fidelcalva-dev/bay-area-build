-- Create ar_actions table to track all AR collection actions
CREATE TABLE public.ar_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID REFERENCES public.customers(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('reminder_sent', 'payment_request_sent', 'dispute_marked', 'dispute_resolved', 'collections_flagged', 'note_added', 'payment_received', 'call_logged')),
  channel TEXT CHECK (channel IN ('sms', 'email', 'phone', 'system')),
  performed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add issue_date column to invoices if missing (for AR calculations)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE;

-- Add collections_flagged column to invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS collections_flagged BOOLEAN DEFAULT false;

-- Add dispute_reason column to invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- Create index for efficient AR queries
CREATE INDEX idx_ar_actions_invoice ON public.ar_actions(invoice_id);
CREATE INDEX idx_ar_actions_action_type ON public.ar_actions(action_type);
CREATE INDEX idx_ar_actions_created_at ON public.ar_actions(created_at DESC);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date) WHERE balance_due > 0;
CREATE INDEX idx_invoices_collections ON public.invoices(collections_flagged) WHERE collections_flagged = true;

-- Enable RLS
ALTER TABLE public.ar_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ar_actions
CREATE POLICY "Finance staff can view AR actions"
ON public.ar_actions
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]));

CREATE POLICY "Finance staff can create AR actions"
ON public.ar_actions
FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]));

CREATE POLICY "Admins can manage AR actions"
ON public.ar_actions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));