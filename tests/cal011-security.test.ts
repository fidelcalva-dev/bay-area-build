// CAL 011 — live backend tests: customer files, cameras/profiles, deactivated staff,
// and sending a quote with a secure schedule link from the Sales portal.
// Isolation: temporary @calsan.test accounts (CAL011_TEST_PASSWORD), quotes in ZIP 99999
// with @calsan.test emails (test transport: nothing is sent to anyone), file names
// ending in "cal011test". Clean-up steps are in docs/CAL_010.md (CAL 011 section).
// Run: CAL011_TEST_PASSWORD=... bun test ./tests/cal011-security.test.ts
import { describe, expect, test, beforeAll } from 'bun:test';

const URL = process.env.VITE_SUPABASE_URL || 'https://tvcwzohfycwfaqjyruow.supabase.co';
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const PW = process.env.CAL011_TEST_PASSWORD!;
const FN = (n: string) => `${URL}/functions/v1/${n}`;
const REST = (p: string) => `${URL}/rest/v1/${p}`;

function hdr(jwt?: string, extra: Record<string, string> = {}) {
  return { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${jwt || KEY}`, ...extra };
}
async function post(url: string, body: unknown, jwt?: string, extra: Record<string, string> = {}) {
  const r = await fetch(url, { method: 'POST', headers: hdr(jwt, extra), body: JSON.stringify(body) });
  const text = await r.text();
  let parsed: any = {};
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
  return { status: r.status, body: parsed };
}
async function get(url: string, jwt?: string) {
  const r = await fetch(url, { headers: hdr(jwt) });
  return { status: r.status, body: await r.json().catch(() => null) };
}
async function signIn(email: string) {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: JSON.stringify({ email, password: PW }),
  });
  const b = await r.json();
  if (!b.access_token) throw new Error(`sign-in failed for ${email}`);
  return { jwt: b.access_token as string, id: b.user.id as string };
}
async function upload(bucket: string, path: string, jwt?: string, type = 'image/jpeg') {
  const r = await fetch(`${URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${jwt || KEY}`, 'Content-Type': type },
    body: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
  });
  return r.status;
}
async function download(bucket: string, path: string, jwt?: string) {
  const r = await fetch(`${URL}/storage/v1/object/authenticated/${bucket}/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${jwt || KEY}` },
  });
  return r.status;
}

let sales = { jwt: '', id: '' }, inactive = { jwt: '', id: '' }, customer = { jwt: '', id: '' }, driver = { jwt: '', id: '' };
beforeAll(async () => {
  [sales, inactive, customer, driver] = await Promise.all([
    signIn('cal011.sales@calsan.test'), signIn('cal011.inactive@calsan.test'),
    signIn('cal011.customer@calsan.test'), signIn('cal011.driver@calsan.test'),
  ]);
});

describe('Customer photos (waste-uploads)', () => {
  const name = `photo_${Date.now()}_cal011test.jpg`;

  test('visitor can still upload with the website file name', async () => {
    expect(await upload('waste-uploads', name)).toBe(200);
  });
  test('visitor cannot upload with another name or folder', async () => {
    expect(await upload('waste-uploads', `other/${Date.now()}_cal011test.jpg`)).toBeGreaterThanOrEqual(400);
  });
  test('no session, customer and deactivated employee cannot open it', async () => {
    expect(await download('waste-uploads', name)).toBeGreaterThanOrEqual(400);
    expect(await download('waste-uploads', name, customer.jwt)).toBeGreaterThanOrEqual(400);
    expect(await download('waste-uploads', name, inactive.jwt)).toBeGreaterThanOrEqual(400);
    expect(await download('waste-uploads', name, driver.jwt)).toBeGreaterThanOrEqual(400);
  });
  test('active office employee can open it', async () => {
    expect(await download('waste-uploads', name, sales.jwt)).toBe(200);
  });
  test('signed link: only active office staff, only this bucket', async () => {
    const f = FN('get-assessment-media-url');
    expect((await post(f, { storage_path: name })).status).toBe(401);
    expect((await post(f, { storage_path: name }, customer.jwt)).status).toBe(403);
    expect((await post(f, { storage_path: name }, inactive.jwt)).status).toBe(403);
    expect((await post(f, { storage_path: name }, driver.jwt)).status).toBe(403);
    const ok = await post(f, { storage_path: name }, sales.jwt);
    expect(ok.status).toBe(200);
    expect(typeof ok.body.signed_url).toBe('string');
    const other = await post(f, { storage_path: 'contractor-documents/applications/1_x.pdf' }, sales.jwt);
    expect(other.status).toBe(400);
  });
});

describe('Contractor documents and placement screenshots', () => {
  const doc = `applications/${Date.now()}_cal011test.pdf`;
  test('applicant upload works; customer and deactivated cannot read; office staff can', async () => {
    expect(await upload('contractor-documents', doc, undefined, 'application/pdf')).toBe(200);
    expect(await download('contractor-documents', doc, customer.jwt)).toBeGreaterThanOrEqual(400);
    expect(await download('contractor-documents', doc, inactive.jwt)).toBeGreaterThanOrEqual(400);
    expect(await download('contractor-documents', doc, sales.jwt)).toBe(200);
  });
  test('placement screenshot only with the quote-flow file name', async () => {
    expect(await upload('placements-private', `anything/${Date.now()}.png`, undefined, 'image/png')).toBeGreaterThanOrEqual(400);
  });
});

describe('Cameras, customer profiles and other public writes', () => {
  test('no public or customer inserts into camera clips/events or customer profiles', async () => {
    for (const jwt of [undefined, customer.jwt, inactive.jwt]) {
      expect((await post(REST('camera_clips'), { file_url: 'x', camera_event_id: crypto.randomUUID() }, jwt)).status).toBeGreaterThanOrEqual(400);
      expect((await post(REST('camera_events'), { event_type: 'TEST' }, jwt)).status).toBeGreaterThanOrEqual(400);
      expect((await post(REST('customer_profiles'), { full_name: 'x' }, jwt)).status).toBeGreaterThanOrEqual(400);
    }
  });
  test('camera receiver requires a provider secret', async () => {
    expect((await post(FN('camera-webhook'), { event_type: 'TEST', truck_id: 'x' })).status).toBe(401);
    expect((await post(FN('camera-webhook'), { provider_id: crypto.randomUUID(), webhook_secret: 'wrong', event_type: 'TEST' })).status).toBe(401);
  });
  test('camera linking requires office staff', async () => {
    expect((await post(FN('link-camera-event'), { backfill: true })).status).toBe(401);
    expect((await post(FN('link-camera-event'), { backfill: true }, customer.jwt)).status).toBe(401);
    expect((await post(FN('link-camera-event'), { backfill: true }, inactive.jwt)).status).toBe(401);
  });
  test('camera clip link: no session rejected, unknown clip not found', async () => {
    expect((await post(FN('camera-clip-url'), { clip_id: crypto.randomUUID() })).status).toBe(401);
    expect((await post(FN('camera-clip-url'), { clip_id: crypto.randomUUID() }, customer.jwt)).status).toBe(404);
  });
  test('permissions list, analyses and placements are not readable publicly', async () => {
    expect(((await get(REST('role_permissions?select=*'))).body ?? []).length).toBe(0);
    expect(((await get(REST('waste_vision_analyses?select=id'), customer.jwt)).body ?? []).length).toBe(0);
    expect(((await get(REST('quote_site_placement?select=id'))).body ?? []).length).toBe(0);
    expect(((await get(REST('quote_item_selections?select=id'))).body ?? []).length).toBe(0);
  });
  test('quote placement insert needs a real, open quote', async () => {
    const r = await post(REST('quote_site_placement'), { quote_id: crypto.randomUUID(), placement_data: {} });
    expect(r.status).toBeGreaterThanOrEqual(400);
  });
});

describe('Deactivated employee loses role-based access', () => {
  test('active sales sees yards; deactivated sales sees none', async () => {
    const a = await get(REST('yards?select=id'), sales.jwt);
    const b = await get(REST('yards?select=id'), inactive.jwt);
    expect((a.body ?? []).length).toBeGreaterThan(0);
    expect((b.body ?? []).length).toBe(0);
  });
});

describe('Sales portal: send quote with secure schedule link', () => {
  let quoteId = '';
  let outboundId = '';

  beforeAll(async () => {
    const q = await post(FN('save-quote'), {
      draft_mode: true, material_type: 'general', user_type: 'homeowner', zip_code: '99999',
      customer_name: 'Cal Test', customer_email: `cal011+${Date.now()}@calsan.test`, customer_phone: '5555550111',
      user_selected_size_yards: 10, subtotal: 581.6, estimated_min: 581.6, estimated_max: 581.6,
    });
    quoteId = q.body.quote_id;
    const o = await post(REST('outbound_quotes'), {
      created_by_user_id: sales.id, customer_name: 'Cal Test', customer_phone: '5555550111',
      customer_email: `cal011+${Date.now()}@calsan.test`, zip: '99999', customer_type: 'homeowner',
      material_category: 'general', size_yd: 10, tier: 'CORE', customer_price: 581.6,
      included_days: 7, included_tons: '1.0', overage_rule_text: '$165/ton', quote_id: quoteId,
    }, sales.jwt, { Prefer: 'return=representation' });
    expect(o.status).toBe(201);
    outboundId = o.body[0].id;
  });

  test('customer and deactivated employee cannot create outbound quotes', async () => {
    for (const u of [customer, inactive]) {
      const r = await post(REST('outbound_quotes'), {
        created_by_user_id: u.id, customer_name: 'x', size_yd: 10, tier: 'CORE', customer_price: 1,
      }, u.jwt);
      expect(r.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('only active office staff can send', async () => {
    const body = { outbound_quote_id: outboundId, channels: ['SMS'], idempotency_key: 'cal011-deny-key' };
    expect((await post(FN('send-outbound-quote'), body)).status).toBe(401);
    expect((await post(FN('send-outbound-quote'), body, customer.jwt)).status).toBe(403);
    expect((await post(FN('send-outbound-quote'), body, inactive.jwt)).status).toBe(403);
    expect((await post(FN('send-outbound-quote'), body, driver.jwt)).status).toBe(403);
  });

  test('send includes a secure link; test contact is never messaged; retry does not duplicate', async () => {
    const key = `cal011-${Date.now()}`;
    const body = { outbound_quote_id: outboundId, channels: ['SMS', 'EMAIL'], idempotency_key: key, include_schedule_link: true };
    const a = await post(FN('send-outbound-quote'), body, sales.jwt);
    expect(a.status).toBe(200);
    expect(a.body.schedule_link_included).toBe(true);
    expect(a.body.results.map((r: any) => r.status).sort()).toEqual(['TEST_SUPPRESSED', 'TEST_SUPPRESSED']);

    const b = await post(FN('send-outbound-quote'), body, sales.jwt);
    expect(b.body.duplicate).toBe(true);
    expect(b.body.schedule_link_included).toBe(false);

    const rs = await Promise.all(Array.from({ length: 5 }, () => post(FN('send-outbound-quote'), body, sales.jwt)));
    expect(rs.every((r) => r.body.duplicate === true)).toBe(true);

    const msgs = await get(REST(`outbound_quote_messages?select=id,channel,status,provider,message_body&outbound_quote_id=eq.${outboundId}&idempotency_key=eq.${key}`), sales.jwt);
    expect(msgs.body.length).toBe(2);
    expect(msgs.body.every((m: any) => /\/portal\/schedule\?t=[A-Za-z0-9_-]{40,60}/.test(m.message_body) || m.channel === 'EMAIL')).toBe(true);
    expect(msgs.body.some((m: any) => m.provider === 'GHL')).toBe(false);
  });

  test('five simultaneous first sends with one key -> one message per channel', async () => {
    const key = `cal011-par-${Date.now()}`;
    const body = { outbound_quote_id: outboundId, channels: ['SMS'], idempotency_key: key, include_schedule_link: true };
    await Promise.all(Array.from({ length: 5 }, () => post(FN('send-outbound-quote'), body, sales.jwt)));
    const msgs = await get(REST(`outbound_quote_messages?select=id&outbound_quote_id=eq.${outboundId}&idempotency_key=eq.${key}`), sales.jwt);
    expect(msgs.body.length).toBe(1);
  });

  test('revoked link is rejected; confirming twice gives one order', async () => {
    const issued = await post(FN('quote-schedule-link'), { action: 'issue', quote_id: quoteId }, sales.jwt);
    const token = new URLSearchParams(issued.body.path.split('?')[1]).get('t')!;
    const rev = await post(FN('quote-schedule-link'), { action: 'revoke', quote_id: quoteId }, sales.jwt);
    expect(rev.body.revoked).toBeGreaterThanOrEqual(1);
    const p = await post(FN('quote-schedule-link'), { action: 'preview', token });
    expect(p.status).toBe(410);
    expect(p.body.code).toBe('link_revoked');

    const fresh = await post(FN('quote-schedule-link'), { action: 'issue', quote_id: quoteId }, sales.jwt);
    const t2 = new URLSearchParams(fresh.body.path.split('?')[1]).get('t')!;
    const la = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
    const d = new Date(`${la}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 3);
    if (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
    const conf = { action: 'confirm', confirm: true, token: t2, delivery_date: d.toISOString().slice(0, 10), delivery_window: 'morning' };
    const [c1, c2, c3] = await Promise.all([post(FN('quote-schedule-link'), conf), post(FN('quote-schedule-link'), conf), post(FN('quote-schedule-link'), conf)]);
    const ids = new Set([c1, c2, c3].map((c) => c.body.orderId).filter(Boolean));
    expect(ids.size).toBe(1);
    const inv = await get(REST(`invoices?select=id&order_id=eq.${[...ids][0]}`), sales.jwt);
    expect((inv.body ?? []).length).toBeLessThanOrEqual(1);
    // Write the link for the expiry check (expired by the operator in a separate step).
    await Bun.write('/tmp/cal011_expiry.json', JSON.stringify({ quoteId }));
  });
});
