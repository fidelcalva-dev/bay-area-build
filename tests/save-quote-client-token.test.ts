// CAL 009 — the website must hand the server-signed quote token back to the
// browser so the order step can prove it is the same visitor.
// Uses a mocked network call; nothing is sent to the backend.
// Run: bun test tests/save-quote-client-token.test.ts
import { expect, test } from 'bun:test';

process.env.VITE_SUPABASE_URL ||= 'https://example.supabase.co';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||= 'test-key';

test('saveQuote returns the draft token issued by the server', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({
      success: true,
      quote_id: '11111111-1111-4111-8111-111111111111',
      draft_token: '11111111-1111-4111-8111-111111111111.9999999999.sig',
    }), { status: 200 })) as typeof fetch;
  try {
    const { saveQuote } = await import('../src/lib/vendorSelection');
    const r = await saveQuote({ userType: 'homeowner', zipCode: '94607', materialType: 'general', rentalDays: 7, extras: [], subtotal: 390, estimatedMin: 390, estimatedMax: 390 } as never);
    expect(r.success).toBe(true);
    expect(r.draftToken).toBe('11111111-1111-4111-8111-111111111111.9999999999.sig');
  } finally {
    globalThis.fetch = realFetch;
  }
});
