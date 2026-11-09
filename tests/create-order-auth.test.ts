// CAL 009 — create-order-from-quote authorization tests (live backend).
// Test quotes use ZIP 99999, name "Cal Test" and NO phone/email, so no SMS,
// contract request, email or payment is ever triggered. The two "allowed" tests
// create an order + unpaid invoice for those test quotes; clean them up afterwards
// with the SQL in docs/CAL_009.md.
// Run: bun test tests/create-order-auth.test.ts
import { describe, expect, test } from 'bun:test';

const URL = process.env.VITE_SUPABASE_URL || 'https://tvcwzohfycwfaqjyruow.supabase.co';
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SAVE = `${URL}/functions/v1/save-quote`;
const ORDER = `${URL}/functions/v1/create-order-from-quote`;
const headers = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` };

const base = { draft_mode: true, material_type: 'general', user_type: 'homeowner', zip_code: '99999', customer_name: 'Cal Test', user_selected_size_yards: 10 };

async function post(fn: string, body: unknown) {
  const r = await fetch(fn, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}
async function newQuote() {
  const r = await post(SAVE, base);
  expect(r.status).toBe(200);
  return { id: r.body.quote_id as string, token: r.body.draft_token as string };
}

describe('create-order-from-quote CAL 009', () => {
  test('missing quoteId -> 400', async () => {
    const r = await post(ORDER, {});
    expect(r.status).toBe(400);
    expect(r.body.code).toBe('missing_quote_id');
  });

  test('malformed quoteId -> 400', async () => {
    const r = await post(ORDER, { quoteId: 'not-a-uuid' });
    expect(r.status).toBe(400);
    expect(r.body.code).toBe('invalid_quote_id');
  });

  test('quote id only (no token, not staff) -> 401, no order', async () => {
    const q = await newQuote();
    const r = await post(ORDER, { quoteId: q.id });
    expect(r.status).toBe(401);
    expect(r.body.code).toBe('not_authorized');
    expect(r.body.orderId).toBeUndefined();
  });

  test('tampered token -> 401', async () => {
    const q = await newQuote();
    const r = await post(ORDER, { quoteId: q.id, draftToken: q.token.slice(0, -2) + 'xx' });
    expect(r.status).toBe(401);
    expect(r.body.code).toBe('invalid_token');
  });

  test('token from another quote -> 403', async () => {
    const a = await newQuote();
    const b = await newQuote();
    const r = await post(ORDER, { quoteId: b.id, draftToken: a.token });
    expect(r.status).toBe(403);
    expect(r.body.code).toBe('token_quote_mismatch');
  });

  test('valid token creates exactly one order; retry returns the same order', async () => {
    const q = await newQuote();
    const first = await post(ORDER, { quoteId: q.id, draftToken: q.token });
    expect(first.status).toBe(200);
    expect(first.body.alreadyExists).toBe(false);
    const again = await post(ORDER, { quoteId: q.id, draftToken: q.token });
    expect(again.body.orderId).toBe(first.body.orderId);
    expect(again.body.alreadyExists).toBe(true);
  });

  test('existing order is not revealed without a token', async () => {
    const q = await newQuote();
    await post(ORDER, { quoteId: q.id, draftToken: q.token });
    const r = await post(ORDER, { quoteId: q.id });
    expect(r.status).toBe(401);
    expect(r.body.orderId).toBeUndefined();
  });

  test('two simultaneous requests never create two orders', async () => {
    const q = await newQuote();
    const [x, y] = await Promise.all([
      post(ORDER, { quoteId: q.id, draftToken: q.token }),
      post(ORDER, { quoteId: q.id, draftToken: q.token }),
    ]);
    expect(x.body.orderId).toBeTruthy();
    expect(x.body.orderId).toBe(y.body.orderId);
  });
});
