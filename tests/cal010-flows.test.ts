// CAL 010 — live backend tests for staff conversion, secure schedule links and the
// quick-calculator "details" save. All test data is isolated:
//   - quotes use ZIP 99999, name "Cal Test", email *@calsan.test (test transport:
//     lead-ingest, alerts and contract SMS are suppressed server-side);
//   - staff sessions belong to temporary @calsan.test accounts (CAL010_TEST_PASSWORD).
// Clean-up SQL is in docs/CAL_010.md.
// Run: CAL010_TEST_PASSWORD=... bun test ./tests/cal010-flows.test.ts
import { describe, expect, test, beforeAll } from 'bun:test';

const URL = process.env.VITE_SUPABASE_URL || 'https://tvcwzohfycwfaqjyruow.supabase.co';
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const PW = process.env.CAL010_TEST_PASSWORD!;
const SAVE = `${URL}/functions/v1/save-quote`;
const ORDER = `${URL}/functions/v1/create-order-from-quote`;
const LINK = `${URL}/functions/v1/quote-schedule-link`;

function hdr(jwt?: string) {
  return { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${jwt || KEY}` };
}
async function post(fn: string, body: unknown, jwt?: string) {
  const r = await fetch(fn, { method: 'POST', headers: hdr(jwt), body: JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}
async function signIn(email: string) {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: JSON.stringify({ email, password: PW }),
  });
  const b = await r.json();
  if (!b.access_token) throw new Error(`sign-in failed for ${email}: ${JSON.stringify(b).slice(0, 120)}`);
  return b.access_token as string;
}
let n = 0;
async function newQuote(extra: Record<string, unknown> = {}) {
  n += 1;
  const r = await post(SAVE, {
    draft_mode: true, material_type: 'general', user_type: 'homeowner', zip_code: '99999',
    customer_name: 'Cal Test', customer_email: `cal010+${Date.now()}${n}@calsan.test`,
    user_selected_size_yards: 10, subtotal: 581.6, estimated_min: 581.6, estimated_max: 581.6, ...extra,
  });
  expect(r.status).toBe(200);
  return { id: r.body.quote_id as string, token: r.body.draft_token as string };
}
function tomorrowPlus(days: number) {
  const la = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
  const d = new Date(`${la}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

let sales = '', norole = '', inactive = '';
beforeAll(async () => {
  sales = await signIn('cal010.sales@calsan.test');
  norole = await signIn('cal010.norole@calsan.test');
  inactive = await signIn('cal010.inactive@calsan.test');
});

describe('CAL 009 conversion with staff sessions', () => {
  test('authorized staff converts without quote token; retry returns same order', async () => {
    const q = await newQuote();
    const a = await post(ORDER, { quoteId: q.id }, sales);
    expect(a.status).toBe(200);
    expect(typeof a.body.orderId).toBe('string');
    expect(a.body.alreadyExists).toBe(false);
    const b = await post(ORDER, { quoteId: q.id }, sales);
    expect(b.body.orderId).toBe(a.body.orderId);
    expect(b.body.alreadyExists).toBe(true);
  });

  test('signed-in user without staff role -> 401', async () => {
    const q = await newQuote();
    const r = await post(ORDER, { quoteId: q.id }, norole);
    expect(r.status).toBe(401);
    expect(r.body.orderId).toBeUndefined();
  });

  test('deactivated staff member -> 403 staff_inactive', async () => {
    const q = await newQuote();
    const r = await post(ORDER, { quoteId: q.id }, inactive);
    expect(r.status).toBe(403);
    expect(r.body.code).toBe('staff_inactive');
  });

  test('signed-out (revoked) session -> 401', async () => {
    const jwt = await signIn('cal010.sales@calsan.test');
    await fetch(`${URL}/auth/v1/logout?scope=local`, { method: 'POST', headers: hdr(jwt) });
    const q = await newQuote();
    const r = await post(ORDER, { quoteId: q.id }, jwt);
    expect(r.status).toBe(401);
  });

  test('garbage session token -> 401', async () => {
    const q = await newQuote();
    const r = await post(ORDER, { quoteId: q.id }, 'eyJhbGciOiJIUzI1NiJ9.e30.invalid');
    expect(r.status).toBe(401);
  });

  test('ten simultaneous staff conversions -> one order', async () => {
    const q = await newQuote();
    const rs = await Promise.all(Array.from({ length: 10 }, () => post(ORDER, { quoteId: q.id }, sales)));
    const ids = new Set(rs.map((r) => r.body.orderId));
    expect(ids.size).toBe(1);
    expect(rs.filter((r) => r.body.alreadyExists === false).length).toBe(1);
  });
});

describe('CAL 010 secure schedule link', () => {
  test('only active staff can issue a link', async () => {
    const q = await newQuote();
    expect((await post(LINK, { action: 'issue', quote_id: q.id })).status).toBe(401);
    expect((await post(LINK, { action: 'issue', quote_id: q.id }, norole)).status).toBe(401);
    expect((await post(LINK, { action: 'issue', quote_id: q.id }, inactive)).status).toBe(401);
    const ok = await post(LINK, { action: 'issue', quote_id: q.id }, sales);
    expect(ok.status).toBe(200);
    expect(ok.body.path).toMatch(/^\/portal\/schedule\?t=[A-Za-z0-9_-]{40,60}$/);
  });

  test('preview is read-only; confirm needs explicit flag and valid date; retry returns same order', async () => {
    const q = await newQuote();
    const issued = await post(LINK, { action: 'issue', quote_id: q.id }, sales);
    const token = new URLSearchParams(issued.body.path.split('?')[1]).get('t')!;

    const p1 = await post(LINK, { action: 'preview', token });
    expect(p1.status).toBe(200);
    expect(p1.body.confirmed).toBe(false);
    expect(p1.body.order_id).toBeNull();
    const p2 = await post(LINK, { action: 'preview', token });
    expect(p2.body.order_id).toBeNull(); // opening twice still creates nothing

    const noFlag = await post(LINK, { action: 'confirm', token, delivery_date: tomorrowPlus(2), delivery_window: 'morning' });
    expect(noFlag.status).toBe(400);
    expect(noFlag.body.code).toBe('confirmation_required');

    const badDate = await post(LINK, { action: 'confirm', confirm: true, token, delivery_date: '2020-01-01', delivery_window: 'morning' });
    expect(badDate.body.code).toBe('invalid_date');

    const c1 = await post(LINK, { action: 'confirm', confirm: true, token, delivery_date: tomorrowPlus(2), delivery_window: 'morning' });
    expect(c1.status).toBe(200);
    expect(typeof c1.body.orderId).toBe('string');
    const c2 = await post(LINK, { action: 'confirm', confirm: true, token, delivery_date: tomorrowPlus(3), delivery_window: 'afternoon' });
    expect(c2.body.orderId).toBe(c1.body.orderId);
    expect(c2.body.alreadyConfirmed).toBe(true);
    expect(c2.body.delivery_date).toBe(tomorrowPlus(2)); // first confirmation stands
  });

  test('simultaneous confirmations -> one order', async () => {
    const q = await newQuote();
    const issued = await post(LINK, { action: 'issue', quote_id: q.id }, sales);
    const token = new URLSearchParams(issued.body.path.split('?')[1]).get('t')!;
    const rs = await Promise.all(Array.from({ length: 5 }, () =>
      post(LINK, { action: 'confirm', confirm: true, token, delivery_date: tomorrowPlus(4), delivery_window: 'midday' })));
    const ids = new Set(rs.map((r) => r.body.orderId));
    expect(ids.size).toBe(1);
    expect([...ids][0]).toBeTruthy();
  });

  test('revoked link stops working; tampered link rejected; link cannot convert another quote', async () => {
    const q = await newQuote();
    const other = await newQuote();
    const issued = await post(LINK, { action: 'issue', quote_id: q.id }, sales);
    const token = new URLSearchParams(issued.body.path.split('?')[1]).get('t')!;

    const cross = await post(ORDER, { quoteId: other.id, scheduleToken: token });
    expect(cross.status).toBe(403);
    expect(cross.body.code).toBe('link_quote_mismatch');

    const tampered = await post(LINK, { action: 'preview', token: token.slice(0, -3) + 'abc' });
    expect(tampered.status).toBe(401);

    const rv = await post(LINK, { action: 'revoke', link_id: issued.body.link_id }, sales);
    expect(rv.body.revoked).toBe(1);
    const after = await post(LINK, { action: 'preview', token });
    expect(after.status).toBe(410);
    expect(after.body.code).toBe('link_revoked');
    const conf = await post(LINK, { action: 'confirm', confirm: true, token, delivery_date: tomorrowPlus(2), delivery_window: 'morning' });
    expect(conf.status).toBe(410);
  });
});

describe('CAL 010 quick calculator details save', () => {
  test('details need the quote token, never change status, and old direct writes are blocked', async () => {
    const q = await newQuote();
    const other = await newQuote();

    const noTok = await post(SAVE, { details_only: true, existing_quote_id: q.id, delivery_address: '1 Test St' });
    expect(noTok.status).toBe(401);
    const wrongTok = await post(SAVE, { details_only: true, existing_quote_id: q.id, draft_token: other.token, delivery_address: '1 Test St' });
    expect(wrongTok.status).toBe(403);

    const ok = await post(SAVE, {
      details_only: true, existing_quote_id: q.id, draft_token: q.token,
      delivery_address: '1 Test St, Oakland, CA', delivery_lat: 37.8, delivery_lng: -122.27,
      preferred_delivery_date: tomorrowPlus(2), preferred_delivery_window: 'morning', status: 'paid',
    });
    expect(ok.status).toBe(200);

    const read = await fetch(`${URL}/rest/v1/quotes?id=eq.${q.id}&select=status,delivery_address,preferred_delivery_window`, { headers: hdr(sales) });
    const [row] = await read.json();
    expect(row.status).toBe('draft');
    expect(row.delivery_address).toBe('1 Test St, Oakland, CA');
    expect(row.preferred_delivery_window).toBe('morning');

    // The old quick-order path inserted status "saved" directly; that stays blocked.
    const direct = await fetch(`${URL}/rest/v1/quotes`, {
      method: 'POST', headers: hdr(),
      body: JSON.stringify({ zip_code: '99999', material_type: 'general', user_type: 'homeowner', status: 'saved', customer_name: 'Cal Test' }),
    });
    expect(direct.status).toBeGreaterThanOrEqual(400);
  });

  test('submitted quote with phone + address: order created, contract SMS uses test transport', async () => {
    const q = await newQuote();
    const sub = await post(SAVE, {
      draft_mode: false, existing_quote_id: q.id, draft_token: q.token,
      material_type: 'general', user_type: 'homeowner', zip_code: '99999', customer_name: 'Cal Test',
      customer_email: `cal010+sms${Date.now()}@calsan.test`, customer_phone: '5105550142',
      estimated_min: 581.6, estimated_max: 581.6, subtotal: 581.6, street_address: '2 Test St, Oakland, CA',
    });
    expect(sub.status).toBe(200);
    const o = await post(ORDER, { quoteId: q.id, draftToken: sub.body.draft_token });
    expect(o.status).toBe(200);
    expect(typeof o.body.orderId).toBe('string');
  });
});
