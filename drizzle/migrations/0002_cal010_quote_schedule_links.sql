-- CAL 010 — Secure schedule links tied to one quote.
-- A link is a random token (only its SHA-256 hash is stored), expires, can be revoked,
-- and is validated by the server. Opening it never creates an order; the customer
-- confirms explicitly and repeated confirmations return the same result.
CREATE TABLE public.quote_schedule_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  outbound_quote_id uuid NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz NULL,
  revoked_by uuid NULL,
  last_viewed_at timestamptz NULL,
  view_count integer NOT NULL DEFAULT 0,
  confirmed_at timestamptz NULL,
  order_id uuid NULL REFERENCES public.orders(id) ON DELETE SET NULL,
  requested_delivery_date date NULL,
  requested_delivery_window text NULL
);
CREATE INDEX quote_schedule_links_quote_idx ON public.quote_schedule_links(quote_id);

GRANT SELECT ON public.quote_schedule_links TO authenticated;
GRANT ALL ON public.quote_schedule_links TO service_role;

ALTER TABLE public.quote_schedule_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view schedule links" ON public.quote_schedule_links
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

COMMENT ON TABLE public.quote_schedule_links IS
  'CAL 010: customer schedule links per quote. Written only by the quote-schedule-link edge function (service role).';