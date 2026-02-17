// ============================================================
// GA4 Analytics Module — Central tracking for all GA4 events
// No PII (phone/email) ever sent. Only non-sensitive params.
// ============================================================

// Use window-level gtag reference (typed loosely to avoid conflicts with trackingService.ts)
const getGtag = (): ((...args: unknown[]) => void) | undefined =>
  (window as unknown as Record<string, unknown>).gtag as ((...args: unknown[]) => void) | undefined;

// Debug mode: ?ga_debug=1 in URL
const isDebugMode = (): boolean => {
  try {
    return new URLSearchParams(window.location.search).get('ga_debug') === '1';
  } catch {
    return false;
  }
};

// Event log buffer for debug panel
const EVENT_LOG_MAX = 50;
const eventLog: GA4EventLogEntry[] = [];

export interface GA4EventLogEntry {
  timestamp: number;
  eventName: string;
  params: Record<string, unknown>;
}

export function getEventLog(): GA4EventLogEntry[] {
  return [...eventLog];
}

function pushToLog(eventName: string, params: Record<string, unknown>) {
  eventLog.unshift({ timestamp: Date.now(), eventName, params });
  if (eventLog.length > EVENT_LOG_MAX) eventLog.pop();
}

// Strip PII from params as a safety net
const PII_KEYS = ['email', 'phone', 'name', 'customer_name', 'customer_email', 'customer_phone', 'address'];

function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (PII_KEYS.includes(key.toLowerCase())) continue;
    if (value !== undefined && value !== null && value !== '') {
      clean[key] = value;
    }
  }
  return clean;
}

/** Get ZIP prefix (first 3 digits only — no PII) */
export function zipPrefix(zip: string): string {
  return zip ? zip.slice(0, 3) + 'xx' : '';
}

// ============================================================
// Core tracking functions
// ============================================================

/** Track a GA4 event */
export function track(eventName: string, params: Record<string, unknown> = {}): void {
  const sanitized = sanitizeParams(params);

  // Always log to debug buffer
  pushToLog(eventName, sanitized);

  if (isDebugMode() || import.meta.env.DEV) {
    console.log(`[GA4] ${eventName}`, sanitized);
  }

  const gtag = getGtag();
  if (gtag) {
    gtag('event', eventName, sanitized);
  }
}

/** Track SPA page view */
export function trackPageView(path: string, title: string): void {
  track('page_view', {
    page_location: window.location.origin + path,
    page_path: path,
    page_title: title,
  });
}

/** Set user properties (NO PII) */
export function setUserProperties(props: Record<string, string | number | boolean>): void {
  const sanitized = sanitizeParams(props);
  const gtag = getGtag();
  if (gtag) {
    gtag('set', 'user_properties', sanitized);
  }
  if (isDebugMode() || import.meta.env.DEV) {
    console.log('[GA4] user_properties', sanitized);
  }
}

/** Set consent status */
export function setConsent(granted: boolean): void {
  const gtag = getGtag();
  if (gtag) {
    gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}

// ============================================================
// Quote Funnel Events
// ============================================================

export const ga4 = {
  // A) Lead / Quote Funnel
  quoteStarted: (params: {
    flow_version: 'v2' | 'v3';
    entry_point: string;
    city?: string;
    zip?: string;
    source_channel?: string;
  }) =>
    track('quote_started', {
      ...params,
      zip_prefix: params.zip ? zipPrefix(params.zip) : undefined,
      zip: undefined, // remove full zip
    }),

  quoteStepViewed: (params: {
    flow_version: 'v2' | 'v3';
    step_name: string;
    step_index: number;
  }) => track('quote_step_viewed', params),

  quoteStepCompleted: (params: {
    flow_version: 'v2' | 'v3';
    step_name: string;
    time_on_step_sec: number;
  }) => track('quote_step_completed', params),

  quoteRecommendedSizeShown: (params: {
    size_yd: number;
    material_category: string;
    customer_type: string;
  }) => track('quote_recommended_size_shown', params),

  quoteSizeSelected: (params: {
    size_yd: number;
    was_recommended: boolean;
  }) => track('quote_size_selected', params),

  quotePriceViewed: (params: {
    size_yd: number;
    material_category: string;
    value_estimated: number;
    included_tons: number;
  }) => track('quote_price_viewed', params),

  quoteSubmitted: (params: {
    flow_version: 'v2' | 'v3';
    size_yd: number;
    material_category: string;
    value_estimated: number;
    city?: string;
    zip?: string;
    serviceable: boolean;
  }) =>
    track('quote_submitted', {
      ...params,
      zip_prefix: params.zip ? zipPrefix(params.zip) : undefined,
      zip: undefined,
    }),

  // B) Scheduling / Payment / Portal
  scheduleOpened: (params: { source: string; order_or_quote: string }) =>
    track('schedule_opened', params),

  scheduleSelected: (params: { window: string; days_from_today: number }) =>
    track('schedule_selected', params),

  paymentStarted: (params: { payment_type: string; value: number; order_or_quote: string }) =>
    track('payment_started', params),

  paymentCompleted: (params: { value: number; method?: string; order_or_quote: string }) =>
    track('payment_completed', params),

  portalOpened: (params: { order_or_quote: string; source: string }) =>
    track('portal_opened', params),

  // C) Engagement / Contact
  clickCall: (params: { page: string; city?: string }) =>
    track('click_call', params),

  clickSms: (params: { page: string }) =>
    track('click_sms', params),

  clickGetQuote: (params: { page: string }) =>
    track('click_get_quote', params),

  // D) Risk / Quality Signals
  leadRiskBandAssigned: (params: { band: string; reason_codes_count: number; source_channel: string }) =>
    track('lead_risk_band_assigned', params),

  zipOutOfServiceArea: (params: { zip?: string; city_guess?: string }) =>
    track('zip_out_of_service_area', {
      zip_prefix: params.zip ? zipPrefix(params.zip) : undefined,
      city_guess: params.city_guess,
    }),

  // Placement events
  placementOpened: () => track('placement_opened'),
  placementSkipped: () => track('placement_skipped'),
  placementSaved: () => track('placement_saved'),
};

export default ga4;
