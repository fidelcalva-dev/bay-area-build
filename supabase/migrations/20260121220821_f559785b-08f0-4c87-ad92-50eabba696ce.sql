-- Phone OTP table for passwordless SMS login
CREATE TABLE public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  cooldown_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  verified_at timestamp with time zone
);

-- Index for quick phone lookups
CREATE INDEX idx_phone_otps_phone ON public.phone_otps(phone);
CREATE INDEX idx_phone_otps_expires ON public.phone_otps(expires_at);

-- Enable RLS
ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) can manage OTPs
CREATE POLICY "Service role manages OTPs"
ON public.phone_otps
FOR ALL
USING (false)
WITH CHECK (false);

-- Add phone column to customers if not exists
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS phone text;

-- Create index on customer phone for quick lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- Update customers RLS to allow phone-based access
CREATE POLICY "Customers can view by phone match"
ON public.customers
FOR SELECT
USING (
  billing_phone = current_setting('app.current_phone', true)
  OR phone = current_setting('app.current_phone', true)
);

-- Create customer_sessions table for phone-based sessions
CREATE TABLE public.customer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  customer_id uuid REFERENCES public.customers(id),
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_active_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_sessions_token ON public.customer_sessions(session_token);
CREATE INDEX idx_customer_sessions_phone ON public.customer_sessions(phone);

ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can manage sessions
CREATE POLICY "Service role manages sessions"
ON public.customer_sessions
FOR ALL
USING (false)
WITH CHECK (false);