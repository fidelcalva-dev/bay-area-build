# AGENTS.md — technical rules

- Server functions that create or change orders, invoices or payments must authorize the caller on the server (signed quote token from save-quote, or active staff role from user_roles); never rely on the browser or on knowing a record id. Why: service-key functions bypass RLS.
- Quote tokens are signed and verified only through `supabase/functions/_shared/quote-draft-token.ts`. Why: one implementation for every function that trusts them.
- One order per quote is enforced by a unique index on `orders.quote_id`; order-creation code must treat a unique violation as "already exists". Why: retries and double clicks must not duplicate orders or invoices.
- Customer scheduling links are issued only by `quote-schedule-link` (hashed token, expiry, revocation, explicit confirm); never build a schedule URL from a record id. Why: an id is not proof of who the customer is.
- Public visitors never write or read sensitive tables directly; they go through edge functions or security-definer RPCs that check a capability (token or link). Why: table-level "anyone" policies leaked data.
- Live backend tests use `@calsan.test` emails; `_shared/test-transport.ts` suppresses SMS, alerts and lead sync for them. Why: tests must never message real customers.
- Role checks must also deny deactivated staff: use `has_role`/`has_any_role`/`current_user_is_office_staff()` (they check `staff_users.status`); never query `user_roles` alone in new policies. Why: disabling a user only changes `staff_users.status`.
- Outbound customer messages are sent only through `send-outbound-quote` with an idempotency key that claims each channel before sending. Why: retries must never message a customer twice.
- The Calsan agent (`calsan-agent`) is read-only: fixed query tools run with the caller's session, never the service key. Why: the model must not see or change more than the user can.
