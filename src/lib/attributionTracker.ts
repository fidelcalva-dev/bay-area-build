// Attribution Tracker — captures gclid, msclkid + UTMs from URL params
// Stores session-scoped (sessionStorage) and first-touch (localStorage)

const ATTRIBUTION_KEYS = [
  'gclid', 'msclkid', 'utm_source', 'utm_campaign', 'utm_medium', 'utm_term', 'utm_content'
] as const;

export type AttributionData = {
  gclid?: string | null;
  msclkid?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  first_seen_at?: string | null;
};

const SESSION_PREFIX = 'attr_';
const FIRST_TOUCH_PREFIX = 'attr_ft_';

/**
 * Capture attribution params from URL and store in session/localStorage.
 * Call once on app mount.
 */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const hasAny = ATTRIBUTION_KEYS.some(k => params.has(k));

    // Always capture landing page + referrer on first visit
    if (!sessionStorage.getItem(`${SESSION_PREFIX}landing_page`)) {
      sessionStorage.setItem(`${SESSION_PREFIX}landing_page`, window.location.pathname + window.location.search);
    }
    if (!sessionStorage.getItem(`${SESSION_PREFIX}referrer`) && document.referrer) {
      sessionStorage.setItem(`${SESSION_PREFIX}referrer`, document.referrer);
    }
    // First-touch timestamp
    if (!localStorage.getItem(`${FIRST_TOUCH_PREFIX}first_seen_at`)) {
      localStorage.setItem(`${FIRST_TOUCH_PREFIX}first_seen_at`, new Date().toISOString());
    }

    if (!hasAny) return;

    for (const key of ATTRIBUTION_KEYS) {
      const value = params.get(key);
      if (value) {
        // Always update session (last-touch)
        sessionStorage.setItem(`${SESSION_PREFIX}${key}`, value);
        // Only set first-touch if not already present
        if (!localStorage.getItem(`${FIRST_TOUCH_PREFIX}${key}`)) {
          localStorage.setItem(`${FIRST_TOUCH_PREFIX}${key}`, value);
        }
      }
    }
  } catch {
    // Storage may be unavailable (private browsing, etc.)
  }
}

/**
 * Get current attribution data (session-scoped / last-touch).
 * Falls back to first-touch if no session data.
 */
export function getAttribution(): AttributionData {
  const data: AttributionData = {};
  try {
    for (const key of ATTRIBUTION_KEYS) {
      const sessionVal = sessionStorage.getItem(`${SESSION_PREFIX}${key}`);
      const ftVal = localStorage.getItem(`${FIRST_TOUCH_PREFIX}${key}`);
      data[key] = sessionVal || ftVal || null;
    }
    data.landing_page = sessionStorage.getItem(`${SESSION_PREFIX}landing_page`) || null;
    data.referrer = sessionStorage.getItem(`${SESSION_PREFIX}referrer`) || null;
    data.first_seen_at = localStorage.getItem(`${FIRST_TOUCH_PREFIX}first_seen_at`) || null;
  } catch {
    // Storage unavailable
  }
  return data;
}

/**
 * Build full lead context payload from current page + stored attribution.
 * Use this when calling lead-ingest from any SEO page or form.
 */
export function buildLeadContext(overrides?: Record<string, unknown>): Record<string, unknown> {
  const attr = getAttribution();
  const ctx: Record<string, unknown> = {
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    utm_term: attr.utm_term,
    utm_content: attr.utm_content,
    gclid: attr.gclid,
    msclkid: attr.msclkid,
    landing_url: attr.landing_page,
    referrer_url: attr.referrer,
    first_seen_at: attr.first_seen_at,
    source_page: window.location.pathname,
  };

  // Infer city_intent from URL path
  const path = window.location.pathname;
  const cityMatch = path.match(/dumpster-rental[-/]([a-z-]+?)(?:-ca)?$/);
  if (cityMatch) {
    ctx.city_intent = cityMatch[1].replace(/-/g, ' ');
  }

  // Infer service_intent from URL path
  const serviceMatch = path.match(/services\/([a-z-]+)/);
  if (serviceMatch) {
    ctx.service_intent = serviceMatch[1].replace(/-/g, ' ');
  }

  // Strip null/undefined values
  for (const key of Object.keys(ctx)) {
    if (ctx[key] == null) delete ctx[key];
  }

  return { ...ctx, ...overrides };
}
