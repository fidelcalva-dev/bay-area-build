// Attribution Tracker — captures gclid + UTMs from URL params
// Stores session-scoped (sessionStorage) and first-touch (localStorage)

const ATTRIBUTION_KEYS = [
  'gclid', 'utm_source', 'utm_campaign', 'utm_medium', 'utm_term', 'utm_content'
] as const;

export type AttributionData = {
  gclid?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_medium?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
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
  } catch {
    // Storage unavailable
  }
  return data;
}
