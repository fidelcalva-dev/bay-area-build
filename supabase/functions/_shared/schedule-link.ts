// CAL 010 — Schedule links bound to one quote.
// The raw token is random (32 bytes, base64url) and only travels in the link URL.
// The database stores its SHA-256 hash, expiry and revocation. Every function that
// trusts a schedule link must call checkScheduleLink().

export interface ScheduleLinkRow {
  id: string;
  quote_id: string;
  outbound_quote_id: string | null;
  expires_at: string;
  revoked_at: string | null;
  confirmed_at: string | null;
  order_id: string | null;
  requested_delivery_date: string | null;
  requested_delivery_window: string | null;
}

export type LinkCheck =
  | { ok: true; row: ScheduleLinkRow }
  | { ok: false; status: number; code: string };

export const TOKEN_RE = /^[A-Za-z0-9_-]{40,60}$/;

export function newScheduleToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashScheduleToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// deno-lint-ignore no-explicit-any
export async function checkScheduleLink(admin: any, token: unknown): Promise<LinkCheck> {
  if (typeof token !== "string" || !TOKEN_RE.test(token)) {
    return { ok: false, status: 401, code: "invalid_link" };
  }
  const hash = await hashScheduleToken(token);
  const { data, error } = await admin
    .from("quote_schedule_links")
    .select("id, quote_id, outbound_quote_id, expires_at, revoked_at, confirmed_at, order_id, requested_delivery_date, requested_delivery_window")
    .eq("token_hash", hash)
    .maybeSingle();
  if (error) return { ok: false, status: 500, code: "db_error" };
  if (!data) return { ok: false, status: 401, code: "invalid_link" };
  if (data.revoked_at) return { ok: false, status: 410, code: "link_revoked" };
  // A confirmed link keeps working so retries return the same result.
  if (!data.confirmed_at && new Date(data.expires_at).getTime() < Date.now()) {
    return { ok: false, status: 410, code: "link_expired" };
  }
  return { ok: true, row: data as ScheduleLinkRow };
}
