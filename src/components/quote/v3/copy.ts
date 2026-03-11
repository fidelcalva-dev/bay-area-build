// ============================================================
// V3 QUOTE FLOW — Centralized Copy Pack (English, no emojis)
// All UI strings in one place for i18n readiness
// ============================================================

import type { CustomerType } from './types';

// ============================================================
// 1) STEP TITLES
// ============================================================

export function getStepTitles() {
  return {
    ZIP_STEP_TITLE: 'Where do you need it?',
    ZIP_STEP_SUBTITLE: "We'll match you with the nearest local yard",
    TYPE_STEP_TITLE: 'What describes you best?',
    TYPE_STEP_SUBTITLE: 'This helps us show the right options',
    PROJECT_STEP_TITLE: "What's your project?",
    PROJECT_STEP_SUBTITLE: 'Pick the closest match',
    SIZE_STEP_TITLE: 'Recommended for your project',
    PRICE_STEP_TITLE: 'Your exact price for this ZIP',
    CONFIRM_STEP_TITLE: 'Confirm your order',
  } as const;
}

// ============================================================
// 2) TRUST MICROCOPY
// ============================================================

export const TRUST_LINE = 'Transparent pricing · Delivery & pickup included · Local yard service';
export const YARD_SELECTED_LINE = 'Local yard selected for faster delivery and better availability.';

// ============================================================
// 3 + 4) PRICE MOMENT COPY
// ============================================================

interface PriceMomentCopy {
  headline: string;
  subheadline: string;
  includedTitle: string;
  includedItems: string[];
  overageNote: string;
  etaLine: (etaMin: number, etaMax: number) => string;
  deliveryLikely: string;
  primaryButton: string;
  secondaryButton: string;
}

interface HeavyPriceMomentCopy {
  headline: string;
  subheadline: string;
  includedTitle: string;
  includedItems: string[];
  ruleLine: string;
  etaLine: (etaMin: number, etaMax: number) => string;
  primaryButton: string;
  secondaryLink: string;
}

const HOMEOWNER_COPY = (includedTons: number): PriceMomentCopy => ({
  headline: 'Your exact price for this ZIP',
  subheadline: 'Local yard selected for faster delivery and better availability.',
  includedTitle: 'Included',
  includedItems: [
    'Delivery & pickup',
    '7-day rental',
    `${includedTons} tons included`,
    'Local support',
  ],
  overageNote: `Additional weight beyond ${includedTons}T is billed at $165/ton after scale ticket.`,
  etaLine: (min, max) => `Estimated delivery: ${min}–${max} min from our local yard`,
  deliveryLikely: 'Next-day delivery likely (based on availability)',
  primaryButton: 'Reserve this dumpster',
  secondaryButton: 'Call now',
});

const CONTRACTOR_COPY = (includedTons: number): PriceMomentCopy => ({
  headline: 'Exact contractor pricing for this ZIP',
  subheadline: 'Local yard selected for faster delivery and better availability.',
  includedTitle: 'Included',
  includedItems: [
    'Delivery & pickup',
    '7 days included',
    `${includedTons} tons included`,
    'Dispatch coordination',
  ],
  overageNote: `Overage billed at $165/ton (scale ticket).`,
  etaLine: (min, max) => `Estimated delivery window: ${min}–${max} min from yard`,
  deliveryLikely: 'Priority scheduling available (subject to inventory)',
  primaryButton: 'Reserve & schedule',
  secondaryButton: 'Call dispatch',
});

const COMMERCIAL_COPY = (includedTons: number): PriceMomentCopy => ({
  headline: 'Exact commercial pricing for this ZIP',
  subheadline: 'Local yard selected for faster delivery and better availability.',
  includedTitle: 'Included',
  includedItems: [
    'Delivery & pickup',
    '7-day rental',
    `${includedTons} tons included`,
    'Business-ready invoicing',
  ],
  overageNote: `Overage billed at $165/ton after scale ticket.`,
  etaLine: (min, max) => `Estimated delivery window: ${min}–${max} min`,
  deliveryLikely: 'Need recurring service? Request an account.',
  primaryButton: 'Reserve this dumpster',
  secondaryButton: 'Call now',
});

const HEAVY_COPY: HeavyPriceMomentCopy = {
  headline: 'Flat-rate heavy dumpster pricing',
  subheadline: 'Designed for clean heavy materials. Fill-line limits apply for safe transport.',
  includedTitle: 'Included',
  includedItems: [
    'Delivery & pickup',
    'Disposal included (flat fee)',
    'Local facility routing',
  ],
  ruleLine: 'Clean loads only. If contamination is found, the load may be reclassified to standard debris pricing.',
  etaLine: (min, max) => `Estimated delivery: ${min}–${max} min from yard`,
  primaryButton: 'Reserve heavy dumpster',
  secondaryLink: 'Learn heavy material rules',
};

export function getPriceMomentCopy(
  customerType: CustomerType | null,
  isHeavy: boolean,
  includedTons: number,
): { general: PriceMomentCopy; heavy: HeavyPriceMomentCopy } {
  const type = customerType ?? 'homeowner';
  let general: PriceMomentCopy;
  switch (type) {
    case 'contractor':
      general = CONTRACTOR_COPY(includedTons);
      break;
    case 'commercial':
      general = COMMERCIAL_COPY(includedTons);
      break;
    default:
      general = HOMEOWNER_COPY(includedTons);
      break;
  }
  return { general, heavy: HEAVY_COPY };
}

// ============================================================
// 5) SERVICE TIMING COPY
// ============================================================

export function getEtaCopy() {
  return {
    TIMING_TITLE: 'Service timing (estimated)',
    TIMING_PUBLIC_DELIVERY: (etaMin: number, etaMax: number) =>
      `Delivery: ${etaMin}–${etaMax} minutes from yard`,
    TIMING_PUBLIC_PICKUP: 'Pickup: scheduled on request',
    TIMING_PUBLIC_DISPOSAL: 'Disposal handled by our team',
    TIMING_INTERNAL_TITLE: 'Full time breakdown',
  } as const;
}

// ============================================================
// 6) PLACEMENT STEP COPY
// ============================================================

export function getPlacementCopy() {
  return {
    PLACEMENT_TITLE: 'Choose placement on the map',
    PLACEMENT_SUBTITLE: 'Drop a pin and rotate the dumpster outline. Your driver will follow it.',
    PLACEMENT_PRIMARY_BUTTON: 'Choose placement on map',
    PLACEMENT_SKIP_BUTTON: 'Skip for now',
    PLACEMENT_NOTE_LABEL: 'Placement notes (optional)',
    PLACEMENT_NOTE_PLACEHOLDER: 'Gate code, driveway note, preferred spot',
  } as const;
}

// ============================================================
// 7) CONFIRM STEP + BUTTONS
// ============================================================

export function getButtons() {
  return {
    CONTINUE: 'Continue',
    BACK: 'Back',
    CONFIRM_ORDER: 'Confirm Order',
    PROCESSING: 'Processing...',
    CONFIRM_HELP: "We'll text you the details during business hours.",
    CONFIRM_FINEPRINT: 'By confirming, you agree to receive order updates by SMS.',
    TERMS_TEXT: 'I understand additional charges may apply for overage, extra days, or prohibited items.',
  } as const;
}

// ============================================================
// MISC
// ============================================================

export const ZIP_NOT_SERVICEABLE = 'This ZIP code is outside our current service area. Call us for availability.';
export const PLACEMENT_MAP_UNAVAILABLE = 'Placement map is available after address verification. Our team will contact you to confirm placement.';
export const QUOTE_SAVED_TITLE = 'Quote saved successfully';
export const ORDER_CONFIRMED_TITLE = 'Order Confirmed';
export const ORDER_CONFIRMED_SUBTITLE = "We'll contact you within 15 minutes. Meanwhile, help our driver find the perfect spot.";
export const SWAP_ACTIVE = 'Swap requested — full dumpster replaced with empty';
export const SWAP_PROMPT = 'Need a swap? (replace full dumpster)';
export const SWAP_NOTE = 'Swap includes pickup + delivery of a replacement container.';
export const HEAVY_FILL_LINE_TITLE = 'Fill-line required';
export const HEAVY_FILL_LINE_DESC = 'Heavy materials must stay below the fill line for safe transport. If contamination (trash mixed in) is found, the load is reclassified to general debris at $165/ton overage.';
export const HEAVY_SIZE_NOTE = 'heavy materials require smaller dumpsters';
export const FLAT_FEE_LABEL = 'Flat fee — disposal included';
export const FACILITY_AUTO_SELECTED = 'Nearest transfer station selected automatically';
export const DELIVERY_TIME_FALLBACK = 'Delivery time calculated at checkout';

// ============================================================
// LIVE LOAD POLICY
// ============================================================

export const LIVE_LOAD_POLICY = {
  title: 'Live Load Policy',
  items: [
    'First 30 minutes included',
    'After 30 minutes: $180 per hour',
    'Time begins once container is positioned',
    'Subject to driver wait time conditions',
  ],
  disclaimer: 'Timer logic supports structured tracking. Actual billing confirmed by dispatch.',
} as const;

// ============================================================
// HEAVY MATERIAL SERVICE STRUCTURE
// ============================================================

export const HEAVY_MATERIAL_STRUCTURE = {
  title: 'Heavy Material Service Structure',
  items: [
    '5, 8, and 10 yard containers only',
    'Fill-line compliance required',
    'Clean loads only',
    'Flat-fee disposal included',
    'Contaminated loads reclassified to general debris',
  ],
} as const;

// ============================================================
// SERVICE TIMING DISCLAIMER
// ============================================================

export const SERVICE_TIMING_DISCLAIMER = 'Service times are estimated and may vary based on traffic conditions, facility wait times, and on-site access.';
