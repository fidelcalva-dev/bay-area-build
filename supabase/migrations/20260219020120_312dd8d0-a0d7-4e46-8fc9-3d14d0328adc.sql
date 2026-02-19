
-- Activation tokens table for customer portal onboarding
CREATE TABLE public.activation_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  channel text NOT NULL CHECK (channel IN ('sms', 'email')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  used_at timestamptz,
  sent_at timestamptz,
  clicked_at timestamptz,
  opened_at timestamptz,
  attempt_number int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'activated', 'expired', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for lookup performance
CREATE INDEX idx_activation_tokens_customer ON public.activation_tokens(customer_id);
CREATE INDEX idx_activation_tokens_token ON public.activation_tokens(token);
CREATE INDEX idx_activation_tokens_status ON public.activation_tokens(status);
CREATE INDEX idx_activation_tokens_expires ON public.activation_tokens(expires_at) WHERE used_at IS NULL;

-- Enable RLS
ALTER TABLE public.activation_tokens ENABLE ROW LEVEL SECURITY;

-- Admin/staff can manage all tokens
CREATE POLICY "Staff can manage activation tokens"
ON public.activation_tokens
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'cs'));

-- Anon can read by token (for activation page)
CREATE POLICY "Anon can read by token"
ON public.activation_tokens
FOR SELECT
TO anon
USING (true);

-- Add activation_status column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS activation_status text NOT NULL DEFAULT 'not_sent' CHECK (activation_status IN ('not_sent', 'sent', 'opened', 'activated', 'expired'));
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS activated_at timestamptz;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS activation_attempts int NOT NULL DEFAULT 0;
