// ============================================================
// useQuoteSessionTracker — Progressive anonymous quote session persistence
// Creates a server-side session on mount, progressively updates on step changes
// ============================================================
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAttribution } from '@/lib/attributionTracker';

// ---- Device detection helpers ----
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (/CriOS|Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Edg/i.test(ua)) return 'Edge';
  return 'Other';
}

function getOSName(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

// ---- Session token ----
const SESSION_TOKEN_KEY = 'qs_session_token';

function getOrCreateSessionToken(): string {
  let token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}

export function clearSessionToken(): void {
  try { sessionStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
}

// ---- Types ----
export interface QuoteSessionState {
  zip?: string;
  city?: string;
  customerType?: string;
  projectType?: string;
  materialType?: string;
  materialClass?: string;
  heavyGroup?: string;
  selectedSizeYd?: number;
  rentalDays?: number;
  currentStep?: string;
  completedSteps?: string[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  companyName?: string;
  customerNotes?: string;
  photosUploaded?: boolean;
  quoteId?: string;
  leadId?: string;
  // Service/brand
  brandOrigin?: string;
  serviceLine?: string;
  sourceChannel?: string;
  sourcePage?: string;
}

interface TrackerResult {
  sessionToken: string;
  sessionId: string | null;
  leadId: string | null;
}

// ---- Debounced fire-and-forget upsert ----
const DEBOUNCE_MS = 800;

export function useQuoteSessionTracker(sourcePage = '/quote') {
  const sessionToken = useRef(getOrCreateSessionToken());
  const sessionIdRef = useRef<string | null>(null);
  const leadIdRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initFired = useRef(false);
  const lastPayloadHash = useRef('');
  const completedStepsRef = useRef<Set<string>>(new Set());

  // Fire the initial session creation
  useEffect(() => {
    if (initFired.current) return;
    initFired.current = true;

    const attribution = getAttribution();
    const params = new URLSearchParams(window.location.search);

    const initPayload = {
      session_token: sessionToken.current,
      brand_origin: 'CALSAN_DUMPSTERS_PRO',
      service_line: 'DUMPSTER',
      source_channel: 'QUOTE_FLOW',
      source_page: sourcePage,
      landing_page: attribution.landing_page || window.location.pathname,
      referrer_url: attribution.referrer || document.referrer || null,
      utm_source: attribution.utm_source || null,
      utm_medium: attribution.utm_medium || null,
      utm_campaign: attribution.utm_campaign || null,
      utm_content: attribution.utm_content || null,
      utm_term: attribution.utm_term || null,
      gclid: attribution.gclid || params.get('gclid') || null,
      fbclid: params.get('fbclid') || null,
      device_type: getDeviceType(),
      browser_name: getBrowserName(),
      os_name: getOSName(),
      current_step: 'project-type',
    };

    supabase.functions.invoke('save-quote-session', { body: initPayload })
      .then(({ data }) => {
        if (data?.session_id) sessionIdRef.current = data.session_id;
        if (data?.lead_id) leadIdRef.current = data.lead_id;
      })
      .catch((err) => console.warn('Session init failed:', err));
  }, [sourcePage]);

  // Progressive update (debounced)
  const updateSession = useCallback((state: QuoteSessionState) => {
    // Track completed steps
    if (state.currentStep) {
      completedStepsRef.current.add(state.currentStep);
    }

    const payload: Record<string, unknown> = {
      session_token: sessionToken.current,
      current_step: state.currentStep || null,
      completed_steps_json: Array.from(completedStepsRef.current),
    };

    if (state.zip) payload.zip = state.zip;
    if (state.city) payload.city = state.city;
    if (state.customerType) payload.customer_type = state.customerType;
    if (state.projectType) payload.project_type = state.projectType;
    if (state.materialType) payload.material_type = state.materialType;
    if (state.materialClass) payload.material_class = state.materialClass;
    if (state.heavyGroup) payload.heavy_group = state.heavyGroup;
    if (state.selectedSizeYd) payload.selected_size_yd = state.selectedSizeYd;
    if (state.rentalDays) payload.rental_days = state.rentalDays;
    if (state.customerName) payload.customer_name = state.customerName;
    if (state.customerPhone) payload.customer_phone = state.customerPhone;
    if (state.customerEmail) payload.customer_email = state.customerEmail;
    if (state.companyName) payload.company_name = state.companyName;
    if (state.customerNotes) payload.customer_notes = state.customerNotes;
    if (state.photosUploaded) payload.photos_uploaded_flag = true;
    if (state.quoteId) payload.quote_id = state.quoteId;
    if (state.leadId) payload.lead_id = state.leadId;
    if (state.brandOrigin) payload.brand_origin = state.brandOrigin;
    if (state.serviceLine) payload.service_line = state.serviceLine;
    if (state.sourceChannel) payload.source_channel = state.sourceChannel;
    if (state.sourcePage) payload.source_page = state.sourcePage;

    // Dedup: skip if payload hasn't changed
    const hash = JSON.stringify(payload);
    if (hash === lastPayloadHash.current) return;
    lastPayloadHash.current = hash;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      supabase.functions.invoke('save-quote-session', { body: payload })
        .then(({ data }) => {
          if (data?.session_id) sessionIdRef.current = data.session_id;
          if (data?.lead_id) leadIdRef.current = data.lead_id;
        })
        .catch((err) => console.warn('Session update failed:', err));
    }, DEBOUNCE_MS);
  }, []);

  // Log a granular event
  const logEvent = useCallback((eventName: string, eventPayload?: Record<string, unknown>) => {
    supabase.functions.invoke('save-quote-session', {
      body: {
        action: 'log_event',
        session_id: sessionIdRef.current,
        lead_id: leadIdRef.current,
        event_name: eventName,
        event_payload: eventPayload || {},
      },
    }).catch((err) => console.warn('Event log failed:', err));
  }, []);

  // Mark abandoned on page unload
  useEffect(() => {
    const handleUnload = () => {
      // Use sendBeacon for reliability
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-quote-session`;
      const payload = JSON.stringify({
        action: 'abandon',
        session_token: sessionToken.current,
      });
      navigator.sendBeacon(url, payload);
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const getResult = useCallback((): TrackerResult => ({
    sessionToken: sessionToken.current,
    sessionId: sessionIdRef.current,
    leadId: leadIdRef.current,
  }), []);

  return {
    updateSession,
    logEvent,
    getResult,
    clearSession: clearSessionToken,
  };
}
