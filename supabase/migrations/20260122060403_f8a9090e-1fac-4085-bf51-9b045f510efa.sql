-- Create payments table for tracking all payment transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'balance', 'overage')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'authorized', 'captured', 'settled', 'failed', 'refunded', 'voided')),
  provider TEXT NOT NULL DEFAULT 'AuthorizeNet',
  transaction_id TEXT,
  auth_code TEXT,
  response_code TEXT,
  response_message TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  card_last_four TEXT,
  card_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table for tracking billing
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  invoice_number TEXT NOT NULL UNIQUE,
  amount_due NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue', 'disputed')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX idx_invoices_payment_status ON public.invoices(payment_status);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Payments RLS policies
CREATE POLICY "Staff can manage payments"
ON public.payments FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role, 'dispatcher'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]));

CREATE POLICY "Customers can view own payments"
ON public.payments FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Invoices RLS policies
CREATE POLICY "Staff can manage invoices"
ON public.invoices FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role, 'dispatcher'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]));

CREATE POLICY "Customers can view own invoices"
ON public.invoices FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add payment link fields to orders table for Chase fallback
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_link_url TEXT,
ADD COLUMN IF NOT EXISTS payment_link_type TEXT,
ADD COLUMN IF NOT EXISTS payment_link_amount NUMERIC,
ADD COLUMN IF NOT EXISTS payment_link_sent_at TIMESTAMP WITH TIME ZONE;