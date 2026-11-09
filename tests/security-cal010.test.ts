// CAL 010 — anonymous access regression tests (live backend, read-only except
// one chat session row created through the public function).
// Run: bun test tests/security-cal010.test.ts
import { describe, expect, test } from 'bun:test';

const URL = process.env.VITE_SUPABASE_URL || 'https://tvcwzohfycwfaqjyruow.supabase.co';
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const headers = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` };

async function anonSelect(table: string) {
  const r = await fetch(`${URL}/rest/v1/${table}?select=*&limit=5`, { headers });
  const body = await r.json().catch(() => null);
  return { status: r.status, rows: Array.isArray(body) ? body : [] };
}
async function rpc(fn: string, args: unknown) {
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) });
  return { status: r.status, body: await r.json().catch(() => null) };
}

// Tables that held personal data, access keys or internal records and were readable
// by anyone before CAL 010. Each must now return no rows to an anonymous visitor.
const PRIVATE_TABLES = [
  'activation_tokens', 'contracts', 'customer_profiles', 'chat_conversations', 'chat_messages',
  'ai_chat_sessions', 'ai_chat_messages', 'quote_drafts', 'entity_google_links', 'ghl_sync_log',
  'internal_alerts', 'internal_alert_deliveries', 'compensation_periods',
  'customer_contacts', 'customer_sites', 'lead_card_info', 'payment_requests', 'contractor_accounts',
];

describe('CAL 010 anonymous access', () => {
  for (const t of PRIVATE_TABLES) {
    test(`anon cannot list ${t}`, async () => {
      const r = await anonSelect(t);
      expect(r.rows.length).toBe(0);
    });
  }

  test('anon cannot update a pending contract directly', async () => {
    const r = await fetch(`${URL}/rest/v1/contracts?status=eq.pending`, {
      method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ signer_name: 'attacker' }),
    });
    const body = await r.json().catch(() => []);
    expect(Array.isArray(body) ? body.length : 0).toBe(0);
  });

  test('contract_for_signing with unknown id returns nothing', async () => {
    const r = await rpc('contract_for_signing', { p_contract_id: crypto.randomUUID() });
    expect(r.status).toBe(200);
    expect(r.body).toBeNull();
  });

  test('chat session: token required to update or read lead', async () => {
    const c = await rpc('chat_session_create', { p_landing_url: 'https://test.invalid/cal010' });
    expect(c.status).toBe(200);
    expect(typeof c.body.id).toBe('string');
    expect(typeof c.body.session_token).toBe('string');
    const wrong = await rpc('chat_session_lead', { p_session_id: c.body.id, p_session_token: 'wrong' });
    expect(wrong.body).toBeNull();
    const bad = await rpc('chat_session_update', { p_session_id: c.body.id, p_session_token: c.body.session_token, p_status: 'ACTIVE' });
    expect(bad.status).toBeGreaterThanOrEqual(400); // only HANDED_OFF / CLOSED allowed
    const ok = await rpc('chat_session_update', { p_session_id: c.body.id, p_session_token: c.body.session_token, p_status: 'CLOSED' });
    expect(ok.status).toBe(200);
  });
});
