-- ============================================================
-- CUSTOMER PORTAL LINKS - Secure Token-Based Access
-- ============================================================

-- Create table for secure portal link tokens
CREATE TABLE public.customer_portal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  last_used_at TIMESTAMPTZ,
  trigger_source TEXT CHECK (trigger_source IN ('SIGNED', 'CONFIRMED', 'PAID', 'MANUAL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_active_token_per_order UNIQUE (order_id, token_hash)
);

-- Create index for token lookups
CREATE INDEX idx_portal_links_token_hash ON public.customer_portal_links(token_hash);
CREATE INDEX idx_portal_links_order_id ON public.customer_portal_links(order_id);
CREATE INDEX idx_portal_links_expires_at ON public.customer_portal_links(expires_at);

-- Enable RLS
ALTER TABLE public.customer_portal_links ENABLE ROW LEVEL SECURITY;

-- RLS: Customers can only see their own links (using user_id column)
CREATE POLICY "Customers can view their own portal links"
  ON public.customer_portal_links
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

-- RLS: Staff with appropriate roles can manage portal links
CREATE POLICY "Staff can manage portal links"
  ON public.customer_portal_links
  FOR ALL
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[])
  );

-- Add portal_link_sent_at to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS portal_link_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portal_link_id UUID REFERENCES public.customer_portal_links(id);

-- Add message templates for portal links
INSERT INTO public.message_templates (key, name, category, channel, subject, body, variables, is_active)
VALUES 
  ('portal_link_signed', 'Portal Link - Agreement Signed', 'portal', 'sms', NULL,
   'Hi {{customer_name}}, your agreement is signed. Track your dumpster order here: {{portal_link}} Reply STOP to opt out.',
   '["customer_name", "portal_link"]'::jsonb, true),
  ('portal_link_confirmed', 'Portal Link - Order Confirmed', 'portal', 'sms', NULL,
   'Hi {{customer_name}}, your order is confirmed. Track your dumpster here: {{portal_link}} Reply STOP to opt out.',
   '["customer_name", "portal_link"]'::jsonb, true),
  ('portal_link_paid', 'Portal Link - Payment Received', 'portal', 'sms', NULL,
   'Hi {{customer_name}}, payment received. Track your order here: {{portal_link}} Reply STOP to opt out.',
   '["customer_name", "portal_link"]'::jsonb, true),
  ('portal_link_email', 'Portal Link - Email', 'portal', 'email', 
   'Track Your Dumpster Order',
   'Hi {{customer_name}},\n\nYour dumpster order is ready to track. View your order status, delivery details, and more:\n\n{{portal_link}}\n\nQuestions? Call us at (510) 680-2150.\n\nThank you,\nCalsan Dumpsters Team',
   '["customer_name", "portal_link"]'::jsonb, true)
ON CONFLICT (key) DO NOTHING;

-- Function to validate and use a portal link token
CREATE OR REPLACE FUNCTION public.validate_portal_token(
  p_order_id UUID,
  p_token_hash TEXT
)
RETURNS TABLE(
  valid BOOLEAN,
  customer_id UUID,
  order_id UUID,
  link_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link customer_portal_links%ROWTYPE;
BEGIN
  -- Find the link
  SELECT * INTO v_link
  FROM public.customer_portal_links
  WHERE customer_portal_links.order_id = p_order_id
    AND customer_portal_links.token_hash = p_token_hash
    AND expires_at > now();
  
  IF v_link IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;
  
  -- Update last used timestamp
  UPDATE public.customer_portal_links
  SET last_used_at = now()
  WHERE id = v_link.id;
  
  RETURN QUERY SELECT true, v_link.customer_id, v_link.order_id, v_link.id;
END;
$$;

-- Function to create a portal link
CREATE OR REPLACE FUNCTION public.create_portal_link(
  p_order_id UUID,
  p_token_hash TEXT,
  p_trigger_source TEXT DEFAULT 'MANUAL'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_link_id UUID;
BEGIN
  -- Get customer from order
  SELECT customer_id INTO v_customer_id
  FROM public.orders
  WHERE id = p_order_id;
  
  -- Create the link
  INSERT INTO public.customer_portal_links (
    order_id, customer_id, token_hash, trigger_source
  ) VALUES (
    p_order_id, v_customer_id, p_token_hash, p_trigger_source
  )
  ON CONFLICT (order_id, token_hash) 
  DO UPDATE SET expires_at = now() + INTERVAL '30 days'
  RETURNING id INTO v_link_id;
  
  -- Update order with link reference
  UPDATE public.orders
  SET portal_link_id = v_link_id
  WHERE id = p_order_id;
  
  RETURN v_link_id;
END;
$$;