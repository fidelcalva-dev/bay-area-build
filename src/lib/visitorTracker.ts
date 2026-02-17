/**
 * Visitor Intelligence — Lightweight client-side tracker
 * Privacy-safe: no fingerprinting, respects DNT and consent
 */

import { supabase } from '@/integrations/supabase/client';
import { getAttribution } from './attributionTracker';

const VID_KEY = 'calsan_vid';
const SID_KEY = 'calsan_sid';
const SID_TS_KEY = 'calsan_sid_ts';
const CONSENT_KEY = 'calsan_consent';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min

let initialized = false;
let visitorId: string;
let sessionId: string;
let consentStatus: 'GRANTED' | 'DENIED' | 'UNKNOWN' = 'UNKNOWN';

function uuid(): string {
  return crypto.randomUUID();
}

function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem(VID_KEY);
    if (!vid) {
      vid = uuid();
      localStorage.setItem(VID_KEY, vid);
    }
    return vid;
  } catch {
    return uuid(); // storage unavailable
  }
}

function getOrCreateSessionId(): { sid: string; isNew: boolean } {
  try {
    const existing = sessionStorage.getItem(SID_KEY);
    const lastTs = sessionStorage.getItem(SID_TS_KEY);
    const now = Date.now();

    if (existing && lastTs && now - parseInt(lastTs) < SESSION_TIMEOUT_MS) {
      sessionStorage.setItem(SID_TS_KEY, String(now));
      return { sid: existing, isNew: false };
    }

    const sid = uuid();
    sessionStorage.setItem(SID_KEY, sid);
    sessionStorage.setItem(SID_TS_KEY, String(now));
    return { sid, isNew: true };
  } catch {
    return { sid: uuid(), isNew: true };
  }
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua);
  return {
    ua: ua.substring(0, 200),
    device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser: /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Other',
    os: /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iOS|iPhone/i.test(ua) ? 'iOS' : 'Other',
  };
}

function respectsDNT(): boolean {
  return navigator.doNotTrack === '1';
}

export function getConsentStatus(): 'GRANTED' | 'DENIED' | 'UNKNOWN' {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'GRANTED' || stored === 'DENIED') return stored;
  } catch {}
  return 'UNKNOWN';
}

export function setConsent(status: 'GRANTED' | 'DENIED'): void {
  try {
    localStorage.setItem(CONSENT_KEY, status);
    consentStatus = status;
  } catch {}
}

async function sendEvent(
  eventName: string,
  extras: Record<string, unknown> = {}
) {
  if (respectsDNT() && consentStatus !== 'GRANTED') return;

  try {
    const attribution = getAttribution();
    const utmJson =
      attribution.utm_source || attribution.utm_campaign
        ? {
            utm_source: attribution.utm_source,
            utm_campaign: attribution.utm_campaign,
            utm_medium: attribution.utm_medium,
            utm_term: attribution.utm_term,
            utm_content: attribution.utm_content,
          }
        : null;

    await supabase.functions.invoke('track-event', {
      body: {
        visitor_id: visitorId,
        session_id: sessionId,
        event_name: eventName,
        page_url: window.location.pathname + window.location.search,
        consent_status: consentStatus,
        utm_json: utmJson,
        gclid: attribution.gclid || null,
        referrer_url: document.referrer || null,
        device_json: getDeviceInfo(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        properties: extras.properties || null,
        is_session_start: extras.is_session_start || false,
        landing_url: extras.landing_url || null,
      },
    });
  } catch {
    // Silent fail — tracking should never break the app
  }
}

/**
 * Initialize visitor tracking. Call once on app mount.
 */
export function initVisitorTracking(): void {
  if (initialized) return;
  initialized = true;

  consentStatus = getConsentStatus();

  // If DNT is on and no explicit consent, treat as denied
  if (respectsDNT() && consentStatus === 'UNKNOWN') {
    consentStatus = 'DENIED';
  }

  visitorId = getOrCreateVisitorId();
  const { sid, isNew } = getOrCreateSessionId();
  sessionId = sid;

  if (isNew) {
    sendEvent('session_start', {
      is_session_start: true,
      landing_url: window.location.pathname + window.location.search,
    });
  }

  // Track initial page view
  sendEvent('page_view');

  // Refresh session timestamp on activity
  const refreshSession = () => {
    try {
      sessionStorage.setItem(SID_TS_KEY, String(Date.now()));
    } catch {}
  };
  document.addEventListener('click', refreshSession, { passive: true });
  document.addEventListener('scroll', refreshSession, { passive: true });
}

/**
 * Track a custom event (conversion, interaction, etc.)
 */
export function trackVisitorEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!initialized) return;
  sendEvent(eventName, { properties });
}

/**
 * Track page view — call on route changes
 */
export function trackPageView(): void {
  if (!initialized) return;

  // Check if session timed out
  const { sid, isNew } = getOrCreateSessionId();
  if (isNew) {
    sessionId = sid;
    sendEvent('session_start', {
      is_session_start: true,
      landing_url: window.location.pathname + window.location.search,
    });
  }

  sendEvent('page_view');
}

/**
 * Link current visitor to a lead
 */
export function linkVisitorToLead(
  leadId: string,
  source: 'FORM_SUBMIT' | 'PHONE_CAPTURE' | 'EMAIL_CAPTURE'
): void {
  if (!initialized) return;
  sendEvent('lead_linked', {
    properties: { lead_id: leadId, link_source: source },
  });
}

/**
 * Get current visitor + session IDs (for embedding in forms)
 */
export function getVisitorIds(): { visitorId: string; sessionId: string } {
  return {
    visitorId: visitorId || getOrCreateVisitorId(),
    sessionId: sessionId || getOrCreateSessionId().sid,
  };
}
