// Analytics Event Tracking (Phase 6, Item 13)
// Centralized tracking for conversion and SEO analytics

type AnalyticsEvent =
  | 'homepage_cta_click'
  | 'quote_start'
  | 'quote_step1_complete'
  | 'quote_step_complete'
  | 'quote_step_time'
  | 'quote_completed'
  | 'quote_saved'
  | 'quote_abandoned'
  | 'same_day_indicator_shown'
  | 'premium_escalation_triggered'
  | 'size_recommendation_shown'
  | 'user_type_selected'
  | 'zip_entered'
  | 'material_selected'
  | 'size_selected'
  | 'extras_added'
  // AI Recommendation metrics
  | 'ai_recommendation_shown'
  | 'ai_recommendation_accepted'
  | 'ai_recommendation_changed'
  | 'ai_recommendation_preselected'
  | 'ai_size_override';

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

// Track analytics event
export function trackEvent(event: AnalyticsEvent, data?: EventData): void {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, data);
  }
  
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (cmd: string, event: string, params?: EventData) => void }).gtag(
      'event',
      event,
      data
    );
  }
  
  // Send to any other analytics providers here
  // e.g., Mixpanel, Amplitude, etc.
}

// Convenience wrappers for common events
export const analytics = {
  homepageCTAClick: (ctaType: string) => 
    trackEvent('homepage_cta_click', { cta_type: ctaType }),
  
  quoteStart: (source: string) => 
    trackEvent('quote_start', { source }),
  
  quoteStep1Complete: (userType: string, zip: string) => 
    trackEvent('quote_step1_complete', { user_type: userType, zip }),
  
  quoteCompleted: (size: number, material: string, total: number) => 
    trackEvent('quote_completed', { size, material, total }),
  
  quoteSaved: (quoteId: string) => 
    trackEvent('quote_saved', { quote_id: quoteId }),
  
  sameDayShown: (zip: string, distanceMiles: number) => 
    trackEvent('same_day_indicator_shown', { zip, distance_miles: distanceMiles }),
  
  premiumEscalation: (reason: string) => 
    trackEvent('premium_escalation_triggered', { reason }),
  
  sizeRecommendationShown: (recommendedSize: number, confidence: string) => 
    trackEvent('size_recommendation_shown', { recommended_size: recommendedSize, confidence }),
  
  userTypeSelected: (userType: string) => 
    trackEvent('user_type_selected', { user_type: userType }),
  
  zipEntered: (zip: string, isValid: boolean) => 
    trackEvent('zip_entered', { zip, is_valid: isValid }),
  
  materialSelected: (material: string) => 
    trackEvent('material_selected', { material }),
  
  sizeSelected: (size: number, material: string) =>
    trackEvent('size_selected', { size, material }),
  
  extrasAdded: (extraIds: string[]) => 
    trackEvent('extras_added', { extras: extraIds.join(','), count: extraIds.length }),
  
  quoteStepComplete: (step: string, durationMs: number) =>
    trackEvent('quote_step_complete', { step, duration_ms: durationMs }),
  
  quoteAbandoned: (step: string, durationMs: number) =>
    trackEvent('quote_abandoned', { step, duration_ms: durationMs }),
  
  // AI Recommendation metrics (Phase A-E rollout)
  aiRecommendationShown: (
    recommendedSize: number,
    category: string,
    confidenceScore: number,
    mode: string
  ) =>
    trackEvent('ai_recommendation_shown', {
      recommended_size: recommendedSize,
      category,
      confidence_score: confidenceScore,
      mode,
    }),
  
  aiRecommendationAccepted: (
    recommendedSize: number,
    wasPreselected: boolean,
    timeToDecisionMs: number
  ) =>
    trackEvent('ai_recommendation_accepted', {
      recommended_size: recommendedSize,
      was_preselected: wasPreselected,
      time_to_decision_ms: timeToDecisionMs,
    }),
  
  aiRecommendationChanged: (
    recommendedSize: number,
    selectedSize: number,
    reason: string
  ) =>
    trackEvent('ai_recommendation_changed', {
      recommended_size: recommendedSize,
      selected_size: selectedSize,
      reason,
    }),
  
  aiRecommendationPreselected: (size: number, mode: string) =>
    trackEvent('ai_recommendation_preselected', { size, mode }),
  
  aiSizeOverride: (fromSize: number, toSize: number, isSmaller: boolean) =>
    trackEvent('ai_size_override', {
      from_size: fromSize,
      to_size: toSize,
      is_smaller: isSmaller,
    }),
};

export default analytics;
