
-- Add attribution columns to quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS gclid TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Add attribution columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gclid TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Add attribution columns to payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gclid TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Index on gclid for conversion lookups
CREATE INDEX IF NOT EXISTS idx_quotes_gclid ON public.quotes(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_gclid ON public.orders(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_gclid ON public.payments(gclid) WHERE gclid IS NOT NULL;
