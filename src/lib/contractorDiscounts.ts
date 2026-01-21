// Contractor Discount System - Conservative, Volume-Based (Calsan)
// Discounts ONLY apply with prepaid or contracted volume commitments

export interface VolumeCommitment {
  count: number;
  agreementId?: string;
  validityStart?: Date;
  validityEnd?: Date;
}

export interface DiscountResult {
  discountPct: number;
  discountCapApplied: boolean;
  requiresApproval: boolean;
  tierLabel: string;
}

// Volume commitment tiers (LOCKED)
export const VOLUME_TIERS = [
  { min: 3, max: 5, discountPct: 0.03, label: '3-5 services' },
  { min: 6, max: 10, discountPct: 0.05, label: '6-10 services' },
  { min: 11, max: 20, discountPct: 0.07, label: '11-20 services' },
  { min: 21, max: Infinity, discountPct: 0.10, label: '20+ services' },
] as const;

// Maximum discount cap
export const MAX_DISCOUNT_PCT = 0.10;

// Eligible customer types for volume discounts
export const DISCOUNT_ELIGIBLE_TYPES = ['contractor', 'preferred_contractor', 'wholesaler_broker'] as const;
export type DiscountEligibleType = typeof DISCOUNT_ELIGIBLE_TYPES[number];

// Wholesaler/broker threshold requiring manual approval
export const WHOLESALER_APPROVAL_THRESHOLD = 0.07;

/**
 * Check if customer type is eligible for volume discounts
 */
export function isEligibleForDiscount(customerType: string): boolean {
  return DISCOUNT_ELIGIBLE_TYPES.includes(customerType as DiscountEligibleType);
}

/**
 * Calculate discount based on volume commitment
 * Returns 0% if no commitment or ineligible customer type
 */
export function calculateVolumeDiscount(
  customerType: string,
  volumeCommitment?: VolumeCommitment
): DiscountResult {
  // Default: no discount
  const noDiscount: DiscountResult = {
    discountPct: 0,
    discountCapApplied: false,
    requiresApproval: false,
    tierLabel: 'No volume commitment',
  };

  // Check eligibility
  if (!isEligibleForDiscount(customerType)) {
    return noDiscount;
  }

  // Require volume commitment
  if (!volumeCommitment || volumeCommitment.count < 3) {
    return noDiscount;
  }

  // Check validity window if defined
  if (volumeCommitment.validityEnd) {
    const now = new Date();
    if (now > volumeCommitment.validityEnd) {
      return {
        ...noDiscount,
        tierLabel: 'Volume commitment expired',
      };
    }
  }

  // Find applicable tier
  const tier = VOLUME_TIERS.find(
    t => volumeCommitment.count >= t.min && volumeCommitment.count <= t.max
  );

  if (!tier) {
    return noDiscount;
  }

  let discountPct = tier.discountPct;
  let discountCapApplied = false;

  // Cap at maximum
  if (discountPct > MAX_DISCOUNT_PCT) {
    discountPct = MAX_DISCOUNT_PCT;
    discountCapApplied = true;
  }

  // Wholesaler/broker guardrails: require manual approval for 7%+
  const requiresApproval =
    customerType === 'wholesaler_broker' && discountPct >= WHOLESALER_APPROVAL_THRESHOLD;

  return {
    discountPct,
    discountCapApplied,
    requiresApproval,
    tierLabel: tier.label,
  };
}

/**
 * Apply discount to base rental price ONLY
 * Does NOT apply to: dry run/trip fees, special disposal, permits, regulatory fees
 */
export function applyVolumeDiscount(basePrice: number, discountPct: number): number {
  if (discountPct <= 0 || discountPct > MAX_DISCOUNT_PCT) {
    return basePrice;
  }
  return Math.round(basePrice * (1 - discountPct) * 100) / 100;
}

/**
 * Get user-facing message for contractor programs
 * Does NOT show percentages publicly
 */
export function getContractorProgramMessage(): string {
  return 'Contractor programs available with volume commitment.';
}

/**
 * Get AI sales rep response for discount inquiries
 */
export function getAISalesRepDiscountResponse(): string {
  return 'We offer contractor programs with volume commitments. I can flag your account for review.';
}

/**
 * Items that discounts do NOT apply to
 */
export const NON_DISCOUNTABLE_ITEMS = [
  'trip-fee',
  'dry-run',
  'special-disposal-handling',
  'permit',
  'street-permit',
  'regulatory-fee',
  'dump-fee',
] as const;

/**
 * Check if an extra/add-on is discountable
 */
export function isItemDiscountable(itemId: string): boolean {
  return !NON_DISCOUNTABLE_ITEMS.includes(itemId as typeof NON_DISCOUNTABLE_ITEMS[number]);
}
