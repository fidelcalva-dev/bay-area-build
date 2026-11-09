// CAL 010 — Continue a saved quote after reload, and add logistics details to it.
// The signed quote token (issued by save-quote, valid 72 h, bound to one quote) is
// the visitor's own proof for that quote. It is kept in this browser only so the
// visitor can continue after a reload; the server re-checks it on every request.
const STORAGE_KEY = 'calsan_quick_quote_v1';
const MAX_AGE_MS = 72 * 60 * 60 * 1000;

export interface StoredQuickQuote {
  quoteId: string;
  draftToken: string;
  zipCode: string;
  sizeLabel: string;
  contact: { name: string; phone: string; email: string; company: string; customerType: 'homeowner' | 'contractor' };
  savedAt: number;
}

export function loadQuickQuote(match: { zipCode: string; sizeLabel: string }): StoredQuickQuote | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredQuickQuote;
    if (!v?.quoteId || !v?.draftToken || Date.now() - v.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (v.zipCode !== match.zipCode || v.sizeLabel !== match.sizeLabel) return null;
    return v;
  } catch {
    return null;
  }
}

export function storeQuickQuote(v: Omit<StoredQuickQuote, 'savedAt'>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...v, savedAt: Date.now() }));
  } catch { /* storage unavailable: the flow still works without resume */ }
}

export function clearQuickQuote(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export interface QuoteDetails {
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  placement_lat?: number;
  placement_lng?: number;
  placement_type?: string;
  placement_notes?: string | null;
  preferred_delivery_date?: string;
  preferred_delivery_window?: string;
  suggested_pickup_date?: string;
  is_weekend_delivery?: boolean;
}

/** Adds address / pin / schedule details to a saved quote through the protected endpoint. */
export async function saveQuoteDetails(
  quoteId: string,
  draftToken: string,
  details: QuoteDetails,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  try {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify({ details_only: true, existing_quote_id: quoteId, draft_token: draftToken, ...details }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body?.success) return { ok: true };
    return { ok: false, code: body?.code || `http_${res.status}`, message: quoteErrorMessage(body?.code) };
  } catch {
    return { ok: false, code: 'network', message: quoteErrorMessage('network') };
  }
}

/** Customer-facing explanation for a save-quote error code. */
export function quoteErrorMessage(code?: string): string {
  switch (code) {
    case 'expired_token':
    case 'invalid_token':
    case 'missing_token':
    case 'token_quote_mismatch':
      return 'Your saved quote session expired. Please start a new quote or call (510) 680-2150.';
    case 'quote_locked':
      return 'This quote was already turned into an order. Call (510) 680-2150 to make changes.';
    case 'network':
      return 'Connection problem. Your details are still here; please try again.';
    default:
      return 'We could not save this step. Please try again or call (510) 680-2150.';
  }
}
