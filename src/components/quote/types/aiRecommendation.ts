// ============================================================
// AI RECOMMENDATION SCHEMA - Structured Output Contract
// ============================================================

export interface AIRecommendationNotice {
  type: 'INFO' | 'WARNING';
  code: 'FILL_LINE' | 'RECLASSIFY' | 'CLEAN_ONLY' | 'WEIGHT_LIMIT' | 'YARD_WASTE';
  text: string;
}

export interface AIRecommendationEnforcement {
  allowed_sizes: number[];
  hide_green_halo: boolean;
  force_debris_heavy: boolean;
}

export interface AIRecommendationOutput {
  category: 'GENERAL_DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
  material_code: string | null;
  recommended_size_yd: number;
  alternatives: number[];
  service_type: 'HEAVY_BASE' | 'GREEN_HALO' | null;
  confidence_score: number;
  reason_short: string;
  notices: AIRecommendationNotice[];
  must_enforce: AIRecommendationEnforcement;
}

export interface AIRecommendationInput {
  zip: string;
  market_code: string | null;
  yard_id: string | null;
  available_sizes: number[];
  customer_type_detected: 'homeowner' | 'contractor' | 'commercial' | 'unknown';
  selected_chips: {
    code: string;
    quantity: 'SMALL' | 'MED' | 'LARGE';
  }[];
  free_text_note?: string;
  requested_speed?: 'same-day' | 'next-day' | 'anytime';
  recycling_receipt_required?: boolean;
  constraints?: {
    driveway_tight?: boolean;
    space_limited?: boolean;
  };
}

// Default empty recommendation
export const DEFAULT_AI_RECOMMENDATION: AIRecommendationOutput = {
  category: 'GENERAL_DEBRIS',
  material_code: null,
  recommended_size_yd: 20,
  alternatives: [10, 30],
  service_type: null,
  confidence_score: 75,
  reason_short: 'Most customers choose 20 yard for general projects.',
  notices: [],
  must_enforce: {
    allowed_sizes: [10, 20, 30, 40],
    hide_green_halo: false,
    force_debris_heavy: false,
  },
};
