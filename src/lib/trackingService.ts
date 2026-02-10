// Tracking Service — GTM/GA4 dataLayer integration
// Loads GTM dynamically based on config_settings, pushes conversion events

import { supabase } from '@/integrations/supabase/client';
import { getAttribution } from './attributionTracker';

type TrackingMode = 'GTM' | 'SERVER' | 'OFF';

let initialized = false;
let trackingMode: TrackingMode = 'OFF';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Initialize tracking: fetch config, inject GTM if needed.
 * Safe to call multiple times — only runs once.
 */
export async function initTracking(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const { data: configs } = await supabase
      .from('config_settings')
      .select('key, value')
      .eq('category', 'ads')
      .in('key', ['tracking_mode', 'gtm_container_id', 'ga4_measurement_id']);

    if (!configs) return;

    const configMap: Record<string, string> = {};
    for (const c of configs) {
      try {
        configMap[c.key] = JSON.parse(c.value as string);
      } catch {
        configMap[c.key] = (c.value as string) || '';
      }
    }

    trackingMode = (configMap['tracking_mode'] as TrackingMode) || 'OFF';

    if (trackingMode === 'GTM') {
      const containerId = configMap['gtm_container_id'];
      if (containerId) {
        injectGTM(containerId);
      }
    }
  } catch (err) {
    console.warn('[trackingService] Failed to initialize:', err);
  }
}

function injectGTM(containerId: string): void {
  if (document.getElementById('gtm-script')) return;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // GTM snippet
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');
  `;
  document.head.appendChild(script);
}

/**
 * Push a conversion event to the dataLayer.
 * Events: lead_submitted, quote_saved, order_confirmed, payment_captured
 */
export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {}
): void {
  if (trackingMode === 'OFF') return;

  try {
    const attribution = getAttribution();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
      gclid: attribution.gclid || undefined,
      utm_source: attribution.utm_source || undefined,
      utm_campaign: attribution.utm_campaign || undefined,
      utm_medium: attribution.utm_medium || undefined,
      utm_term: attribution.utm_term || undefined,
      utm_content: attribution.utm_content || undefined,
    });
  } catch {
    // Silent fail
  }
}
