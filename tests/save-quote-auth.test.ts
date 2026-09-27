// CAL 001A — save-quote authorization tests.
// Uses draft_mode only (no lead ingest, SMS, email or payments are triggered).
// Test rows use ZIP 99999 and name "Cal Test" so they can be cleaned up.
// Run: bun test tests/save-quote-auth.test.ts
import { describe, expect, test } from 'bun:test';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.VITE_SUPABASE_URL || 'https://tvcwzohfycwfaqjyruow.supabase.co';
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const FN = `${URL}/functions/v1/save-quote`;

const base = { draft_mode: true, material_type: 'general', user_type: 'homeowner', zip_code: '99999', customer_name: 'Cal Test', user_selected_size_yards: 10 };

async function call(body: Record<string, unknown>) {
  const r = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY }, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
}

describe('save-quote CAL 001A', () => {
  let quoteId = '';
  let token = '';

  test('legitimate create returns id + signed token, status forced to draft', async () => {
    const r = await call({ ...base, status: 'paid' });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    quoteId = r.body.quote_id; token = r.body.draft_token;
    expect(token.startsWith(quoteId + '.')).toBe(true);
  });

  test('legitimate update with token keeps same id', async () => {
    const r = await call({ ...base, existing_quote_id: quoteId, draft_token: token, user_selected_size_yards: 20, status: 'approved' });
    expect(r.status).toBe(200);
    expect(r.body.quote_id).toBe(quoteId);
    token = r.body.draft_token;
  });

  test('retry of the same update is idempotent (same id)', async () => {
    const r = await call({ ...base, existing_quote_id: quoteId, draft_token: token });
    expect(r.body.quote_id).toBe(quoteId);
  });

  test('missing token -> 401, no new quote', async () => {
    const r = await call({ ...base, existing_quote_id: quoteId });
    expect(r.status).toBe(401); expect(r.body.code).toBe('missing_token'); expect(r.body.quote_id).toBeUndefined();
  });

  test('tampered token -> 401', async () => {
    const r = await call({ ...base, existing_quote_id: quoteId, draft_token: token.slice(0, -2) + 'xx' });
    expect(r.status).toBe(401); expect(r.body.code).toBe('invalid_token');
  });

  test('expired token (altered expiry) -> 401 invalid', async () => {
    const [id, , sig] = token.split('.');
    const r = await call({ ...base, existing_quote_id: quoteId, draft_token: `${id}.1000.${sig}` });
    expect(r.status).toBe(401);
  });

  test('token for another quote -> 403', async () => {
    const other = await call(base);
    const r = await call({ ...base, existing_quote_id: other.body.quote_id, draft_token: token });
    expect(r.status).toBe(403); expect(r.body.code).toBe('token_quote_mismatch');
  });

  test('invalid quote id format -> 400', async () => {
    const r = await call({ ...base, existing_quote_id: 'abc', draft_token: token });
    expect(r.status).toBe(400);
  });

  test('anon cannot update quotes directly', async () => {
    const sb = createClient(URL, KEY);
    const { data } = await sb.from('quotes').update({ status: 'paid' }).eq('id', quoteId).select('id');
    expect(data?.length ?? 0).toBe(0);
  });

  test('anon cannot insert a paid quote directly', async () => {
    const sb = createClient(URL, KEY);
    const { error } = await sb.from('quotes').insert({ zip_code: '99999', material_type: 'general', subtotal: 1, estimated_min: 1, estimated_max: 1, rental_days: 7, status: 'paid' });
    expect(error).not.toBeNull();
  });

  test('print ids for locked-quote step', () => { console.log('QUOTE_ID', quoteId, 'TOKEN', token); });
});
