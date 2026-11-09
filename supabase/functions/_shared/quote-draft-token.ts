// CAL 001A / CAL 009 — Signed quote tokens (HMAC-SHA256, quote-scoped, expiring).
// Format: <quoteId>.<expiresEpochSec>.<base64url(sig)>
// Issued by save-quote; accepted by save-quote (updates) and
// create-order-from-quote (proves the caller is the visitor who saved the quote).
// The secret QUOTE_DRAFT_SIGNING_SECRET lives only on the server.

export const DRAFT_TOKEN_TTL_SEC = 72 * 60 * 60;

function b64url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(message: string): Promise<string> {
  const secret = Deno.env.get('QUOTE_DRAFT_SIGNING_SECRET');
  if (!secret) throw new Error('signing secret missing');
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

export async function signDraftToken(quoteId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + DRAFT_TOKEN_TTL_SEC;
  return `${quoteId}.${exp}.${await hmac(`${quoteId}.${exp}`)}`;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export type TokenCheck = { ok: true } | { ok: false; status: number; code: string };

export async function verifyDraftToken(token: unknown, quoteId: string): Promise<TokenCheck> {
  if (typeof token !== 'string' || !token) return { ok: false, status: 401, code: 'missing_token' };
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, status: 401, code: 'invalid_token' };
  const [tid, expStr, sig] = parts;
  const expected = await hmac(`${tid}.${expStr}`);
  if (!safeEqual(sig, expected)) return { ok: false, status: 401, code: 'invalid_token' };
  if (tid !== quoteId) return { ok: false, status: 403, code: 'token_quote_mismatch' };
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, status: 401, code: 'expired_token' };
  }
  return { ok: true };
}
