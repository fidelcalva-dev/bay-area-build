# AGENTS.md — technical rules

- Server functions that create or change orders, invoices or payments must authorize the caller on the server (signed quote token from save-quote, or active staff role from user_roles); never rely on the browser or on knowing a record id. Why: service-key functions bypass RLS.
- Quote tokens are signed and verified only through `supabase/functions/_shared/quote-draft-token.ts`. Why: one implementation for every function that trusts them.
- One order per quote is enforced by a unique index on `orders.quote_id`; order-creation code must treat a unique violation as "already exists". Why: retries and double clicks must not duplicate orders or invoices.
