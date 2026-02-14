
-- Phase 1: outbound_quotes table
CREATE TABLE public.outbound_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  address_text text,
  zip text,
  customer_type text NOT NULL DEFAULT 'homeowner',
  material_category text NOT NULL DEFAULT 'general',
  size_yd integer NOT NULL,
  tier text NOT NULL,
  customer_price numeric NOT NULL,
  included_days integer NOT NULL DEFAULT 7,
  included_tons text NOT NULL DEFAULT '2.0',
  overage_rule_text text NOT NULL DEFAULT '$165/ton overage',
  same_day_flag boolean NOT NULL DEFAULT false,
  quote_source text NOT NULL DEFAULT 'INTERNAL_CALCULATOR',
  order_id uuid,
  quote_id uuid,
  payment_link text,
  schedule_link text,
  portal_link text,
  status text NOT NULL DEFAULT 'DRAFT',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.outbound_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read outbound quotes"
  ON public.outbound_quotes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can insert outbound quotes"
  ON public.outbound_quotes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Staff can update own outbound quotes"
  ON public.outbound_quotes FOR UPDATE TO authenticated
  USING (auth.uid() = created_by_user_id);

-- Phase 1: outbound_quote_messages table
CREATE TABLE public.outbound_quote_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_quote_id uuid NOT NULL REFERENCES public.outbound_quotes(id) ON DELETE CASCADE,
  channel text NOT NULL,
  provider text NOT NULL,
  to_address text NOT NULL,
  message_body text NOT NULL,
  status text NOT NULL DEFAULT 'DRY_RUN',
  provider_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.outbound_quote_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read outbound quote messages"
  ON public.outbound_quote_messages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Staff can insert outbound quote messages"
  ON public.outbound_quote_messages FOR INSERT TO authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_outbound_quotes_status ON public.outbound_quotes(status);
CREATE INDEX idx_outbound_quotes_created_by ON public.outbound_quotes(created_by_user_id);
CREATE INDEX idx_outbound_quote_messages_quote_id ON public.outbound_quote_messages(outbound_quote_id);
