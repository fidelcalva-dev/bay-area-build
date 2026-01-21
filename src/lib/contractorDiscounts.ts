// Contractor Discount System - Conservative, Volume-Based (Calsan)
// Discounts ONLY apply with prepaid or contracted volume commitments

import { supabase } from '@/integrations/supabase/client';

export interface VolumeCommitment {
  id: string;
  count: number;
  agreementId?: string;
  validityStart?: Date;
  validityEnd?: Date;
  discountPct: number;
  tier: string;
  servicesRemaining: number;
}

export interface DiscountResult {
  discountPct: number;
  discountCapApplied: boolean;
  requiresApproval: boolean;
  tierLabel: string;
  commitmentId?: string;
}

// Volume commitment tiers (LOCKED)
export const VOLUME_TIERS = [
  { min: 3, max: 5, discountPct: 0.03, label: '3-5 services', tier: 'tier_a' },
  { min: 6, max: 10, discountPct: 0.05, label: '6-10 services', tier: 'tier_b' },
  { min: 11, max: 20, discountPct: 0.07, label: '11-20 services', tier: 'tier_c' },
  { min: 21, max: Infinity, discountPct: 0.10, label: '20+ services', tier: 'tier_d' },
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
 * Look up an active, approved volume commitment by customer email or phone
 * Returns null if no valid commitment found
 */
export async function lookupActiveCommitment(
  customerEmail?: string,
  customerPhone?: string
): Promise<VolumeCommitment | null> {
  if (!customerEmail && !customerPhone) return null;

  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('volume_commitments')
    .select('*')
    .eq('approval_status', 'approved')
    .gt('services_remaining', 0)
    .lte('validity_start_date', today)
    .gte('validity_end_date', today);

  // Build OR filter for email/phone
  const filters: string[] = [];
  if (customerEmail) filters.push(`customer_email.eq.${customerEmail}`);
  if (customerPhone) filters.push(`customer_phone.eq.${customerPhone}`);
  
  if (filters.length > 0) {
    query = query.or(filters.join(','));
  }

  const { data, error } = await query
    .order('discount_pct', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    count: data.service_count_committed,
    agreementId: data.agreement_id || undefined,
    validityStart: data.validity_start_date ? new Date(data.validity_start_date) : undefined,
    validityEnd: data.validity_end_date ? new Date(data.validity_end_date) : undefined,
    discountPct: Number(data.discount_pct),
    tier: data.volume_tier,
    servicesRemaining: data.services_remaining,
  };
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
  if (!volumeCommitment || volumeCommitment.servicesRemaining <= 0) {
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

  let discountPct = volumeCommitment.discountPct;
  let discountCapApplied = false;

  // Cap at maximum
  if (discountPct > MAX_DISCOUNT_PCT) {
    discountPct = MAX_DISCOUNT_PCT;
    discountCapApplied = true;
  }

  // Find tier label
  const tier = VOLUME_TIERS.find(t => t.tier === volumeCommitment.tier);
  const tierLabel = tier?.label || volumeCommitment.tier;

  // Wholesaler/broker guardrails: require manual approval for 7%+
  const requiresApproval =
    customerType === 'wholesaler_broker' && discountPct >= WHOLESALER_APPROVAL_THRESHOLD;

  return {
    discountPct,
    discountCapApplied,
    requiresApproval,
    tierLabel,
    commitmentId: volumeCommitment.id,
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

/**
 * Consume one service from a commitment after order completion
 */
export async function consumeService(commitmentId: string): Promise<boolean> {
  // First get current remaining
  const { data: current, error: fetchError } = await supabase
    .from('volume_commitments')
    .select('services_remaining')
    .eq('id', commitmentId)
    .single();

  if (fetchError || !current || current.services_remaining <= 0) {
    return false;
  }

  const { error } = await supabase
    .from('volume_commitments')
    .update({ services_remaining: current.services_remaining - 1 })
    .eq('id', commitmentId);

  return !error;
}
