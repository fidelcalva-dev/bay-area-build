// ============================================================
// SEO Conversion Tracking — extends GA4 + dataLayer
// All seo_* events pushed to both gtag and window.dataLayer
// ============================================================
import { track } from './ga4';
import { getAttribution } from '@/lib/attributionTracker';

/** Push to dataLayer (GTM) if present, in addition to GA4 */
function pushDataLayer(eventName: string, params: Record<string, unknown>) {
  try {
    window.dataLayer = window.dataLayer || [];
    const attr = getAttribution();
    window.dataLayer.push({
      event: eventName,
      ...params,
      utm_source: attr.utm_source || undefined,
      utm_medium: attr.utm_medium || undefined,
      utm_campaign: attr.utm_campaign || undefined,
      utm_term: attr.utm_term || undefined,
      utm_content: attr.utm_content || undefined,
      gclid: attr.gclid || undefined,
      landing_page: attr.landing_page || undefined,
      referrer: attr.referrer || undefined,
    });
  } catch {
    // dataLayer unavailable
  }
}

/** Track both GA4 + dataLayer */
function trackSeo(eventName: string, params: Record<string, unknown> = {}) {
  track(eventName, params);
  pushDataLayer(eventName, params);
}

// ============================================================
// Named SEO events
// ============================================================

export function trackPhoneClick(page: string, city?: string) {
  trackSeo('seo_phone_click', { page, city });
}

export function trackQuoteClick(page: string, city?: string) {
  trackSeo('seo_quote_click', { page, city });
}

export function trackFormStart(page: string, formId?: string) {
  trackSeo('seo_form_start', { page, form_id: formId });
}

export function trackFormSubmit(page: string, formId?: string) {
  trackSeo('seo_form_submit', { page, form_id: formId });
}

export function trackQuoteSuccess(page: string, sizeYd?: number, value?: number) {
  trackSeo('seo_quote_success', { page, size_yd: sizeYd, value });
}

export function trackStickyCTAClick(page: string, ctaType: 'phone' | 'quote') {
  trackSeo('seo_sticky_cta_click', { page, cta_type: ctaType });
}

export function trackSizeSelect(page: string, sizeYd: number) {
  trackSeo('seo_size_select', { page, size_yd: sizeYd });
}

export function trackServiceCTAClick(page: string, service: string) {
  trackSeo('seo_service_cta_click', { page, service });
}
