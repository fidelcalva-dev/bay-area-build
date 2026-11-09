-- CAL 009: one order per quote. Prevents concurrent or repeated requests from
-- creating duplicate orders/invoices for the same quote. Verified 0 duplicates before adding.
-- Rollback: DROP INDEX IF EXISTS public.orders_quote_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS orders_quote_id_unique
  ON public.orders (quote_id)
  WHERE quote_id IS NOT NULL;