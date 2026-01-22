-- Create invoice_line_items table for tracking individual charges
CREATE TABLE public.invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL CHECK (line_type IN ('base', 'overage', 'extra', 'discount', 'adjustment', 'prepurchase')),
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_invoice_line_items_invoice ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_order ON public.invoice_line_items(order_id);
CREATE INDEX idx_invoice_line_items_type ON public.invoice_line_items(line_type);

-- Enable RLS
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Staff can manage line items
CREATE POLICY "Staff can manage invoice line items"
ON public.invoice_line_items
FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role, 'dispatcher'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'finance'::app_role]));

-- Customers can view their own line items
CREATE POLICY "Customers can view own invoice line items"
ON public.invoice_line_items
FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- Customers can view line items via phone session
CREATE POLICY "Customers can view line items via phone session"
ON public.invoice_line_items
FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM orders o
    JOIN quotes q ON o.quote_id = q.id
    WHERE q.customer_phone = current_setting('app.current_phone', true)
  )
);