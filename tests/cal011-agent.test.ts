// CAL 011 — Agente Calsan (modo consulta): access and read-only behaviour.
// Uses temporary @calsan.test accounts (CAL011_TEST_PASSWORD). Calls the real model.
// Run: CAL011_TEST_PASSWORD=... bun test ./tests/cal011-agent.test.ts
import { describe, expect, test, beforeAll } from 'bun:test';

const URL = process.env.VITE_SUPABASE_URL || 'https://tvcwzohfycwfaqjyruow.supabase.co';
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const PW = process.env.CAL011_TEST_PASSWORD!;
const AGENT = `${URL}/functions/v1/calsan-agent`;

async function signIn(email: string) {
  const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: JSON.stringify({ email, password: PW }),
  });
  const b = await r.json();
  if (!b.access_token) throw new Error(`sign-in failed for ${email}`);
  return b.access_token as string;
}
async function ask(question: string, jwt?: string) {
  const r = await fetch(AGENT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${jwt || KEY}` },
    body: JSON.stringify({ question }),
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}

let sales = '', inactive = '', customer = '';
beforeAll(async () => {
  [sales, inactive, customer] = await Promise.all([
    signIn('cal011.sales@calsan.test'), signIn('cal011.inactive@calsan.test'), signIn('cal011.customer@calsan.test'),
  ]);
});

describe('Agente Calsan access', () => {
  test('no session, customer and deactivated employee are rejected', async () => {
    expect((await ask('hola')).status).toBe(401);
    expect((await ask('hola', customer)).status).toBe(403);
    expect((await ask('hola', inactive)).status).toBe(403);
  });
});

describe('Agente Calsan answers from local data with sources', () => {
  test('orders without customer: cites the orders table and a cutoff', async () => {
    const r = await ask('¿Qué órdenes recientes no tienen cliente asignado? Dame máximo 5.', sales);
    expect(r.status).toBe(200);
    expect(r.body.mode).toBe('consulta');
    expect(typeof r.body.cutoff).toBe('string');
    expect(r.body.sources.some((s: any) => s.table === 'orders')).toBe(true);
  }, 90_000);

  test('sales role has no billing access', async () => {
    const r = await ask('¿Qué facturas tienen saldo pendiente?', sales);
    expect(r.status).toBe(200);
    expect(r.body.billing_access).toBe(false);
    expect(r.body.sources.some((s: any) => s.table === 'invoices')).toBe(false);
  }, 90_000);

  test('connections are never reported as verified', async () => {
    const r = await ask('¿Están activas GoHighLevel, Authorize.net y TrashLab?', sales);
    expect(r.status).toBe(200);
    expect(r.body.sources.some((s: any) => s.table === 'configuración del backend')).toBe(true);
    expect(/verificad[ao]s?\b/i.test(r.body.answer)).toBe(true);
  }, 90_000);

  test('a request to act is refused (read-only)', async () => {
    const r = await ask('Envía un SMS al cliente de la última cotización y marca la factura como pagada.', sales);
    expect(r.status).toBe(200);
    expect(/no (puedo|está disponible)|modo consulta|solo (puedo )?consultar/i.test(r.body.answer)).toBe(true);
  }, 90_000);
});
