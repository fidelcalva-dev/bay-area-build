import { supabase } from '@/integrations/supabase/client';
import { createAuditLog } from './auditLog';
import type { Json } from '@/integrations/supabase/types';

// Table name aliases for type bypass
const TRUSTED_CUSTOMERS_TABLE = 'trusted_customers' as 'orders';
const RISK_SCORE_EVENTS_TABLE = 'risk_score_events' as 'orders';
const FRAUD_FLAGS_TABLE = 'fraud_flags' as 'orders';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskScoreResult {
  totalScore: number;
  riskLevel: RiskLevel;
  isWhitelisted: boolean;
  events: RiskScoreEvent[];
}

export interface RiskScoreEvent {
  rule_name: string;
  score_delta: number;
  description: string;
}

interface TrustedCustomer {
  id: string;
  customer_id: string | null;
  phone: string | null;
  reason: string;
  status: string;
}

// Score deltas from requirements
const SCORE_DELTAS = {
  velocity_phone: 25,      // >3 quote_saved in 24h
  multi_address: 20,       // 2+ distinct addresses in 24h
  high_risk_combo: 30,     // new customer + street + unpaid
  out_of_range: 15,        // >25 miles
  identity_mismatch: 10,   // same phone, multiple names
  custom_disposal: 10,     // special routing request
  whitelisted: -20,        // trusted customer
  paid_history: -15,       // >=2 paid completed orders
  msa_signed: -10,         // MSA + addendum signed
};

/**
 * Get risk level from score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

/**
 * Check if phone or customer is whitelisted
 */
export async function isWhitelisted(
  phone?: string,
  customerId?: string
): Promise<{ whitelisted: boolean; reason?: string }> {
  try {
    let queryBuilder = supabase
      .from(TRUSTED_CUSTOMERS_TABLE)
      .select('*')
      .eq('status' as 'id', 'active');
    
    const conditions: string[] = [];
    if (phone) conditions.push(`phone.eq.${phone}`);
    if (customerId) conditions.push(`customer_id.eq.${customerId}`);
    
    if (conditions.length === 0) {
      return { whitelisted: false };
    }

    const { data } = await queryBuilder.or(conditions.join(','));
    
    if (data && data.length > 0) {
      const trusted = data[0] as unknown as TrustedCustomer;
      return { whitelisted: true, reason: trusted.reason };
    }
    
    return { whitelisted: false };
  } catch (err) {
    console.error('Whitelist check error:', err);
    return { whitelisted: false };
  }
}

/**
 * Add to whitelist
 */
export async function addToWhitelist(params: {
  phone?: string;
  customerId?: string;
  reason: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from(TRUSTED_CUSTOMERS_TABLE)
      .insert([{
        phone: params.phone || null,
        customer_id: params.customerId || null,
        reason: params.reason,
        added_by: user?.id || null,
        status: 'active',
      }] as never)
      .select('id')
      .single();

    if (error) throw error;

    await createAuditLog({
      action: 'create',
      entityType: 'approval_request',
      entityId: (data as unknown as { id: string }).id,
      afterData: { phone: params.phone, customer_id: params.customerId, reason: params.reason, type: 'trusted_customer' } as Json,
      changesSummary: `Added to whitelist: ${params.phone || params.customerId}`,
    });

    return { success: true, id: (data as unknown as { id: string }).id };
  } catch (err) {
    console.error('Failed to add to whitelist:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Remove from whitelist
 */
export async function removeFromWhitelist(
  trustedId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(TRUSTED_CUSTOMERS_TABLE)
      .update({ status: 'inactive' } as never)
      .eq('id' as 'id', trustedId);

    if (error) throw error;

    await createAuditLog({
      action: 'update',
      entityType: 'approval_request',
      entityId: trustedId,
      afterData: { status: 'inactive', type: 'trusted_customer' } as Json,
      changesSummary: 'Removed from whitelist',
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to remove from whitelist:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Calculate risk score for a phone/customer
 */
export async function calculateRiskScore(params: {
  phone: string;
  customerId?: string;
  quoteId?: string;
  orderId?: string;
  distanceMiles?: number;
  placementType?: string;
  amountPaid?: number;
}): Promise<RiskScoreResult> {
  const events: RiskScoreEvent[] = [];
  let totalScore = 0;

  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Check whitelist first
    const whitelistCheck = await isWhitelisted(params.phone, params.customerId);
    if (whitelistCheck.whitelisted) {
      events.push({
        rule_name: 'whitelisted',
        score_delta: SCORE_DELTAS.whitelisted,
        description: `Trusted customer: ${whitelistCheck.reason}`,
      });
      totalScore += SCORE_DELTAS.whitelisted;
    }

    // Rule 1: velocity_phone - >3 quotes in 24h
    const { data: recentQuotes } = await supabase
      .from('quotes')
      .select('id, customer_name, delivery_address')
      .eq('customer_phone', params.phone)
      .gte('created_at', past24h);

    if (recentQuotes && recentQuotes.length > 3) {
      events.push({
        rule_name: 'velocity_phone',
        score_delta: SCORE_DELTAS.velocity_phone,
        description: `${recentQuotes.length} quotes in last 24h (threshold: 3)`,
      });
      totalScore += SCORE_DELTAS.velocity_phone;
    }

    // Rule 2: multi_address - 2+ distinct addresses in 24h
    if (recentQuotes && recentQuotes.length >= 2) {
      const uniqueAddresses = new Set(
        recentQuotes.map(q => q.delivery_address?.toLowerCase().trim()).filter(Boolean)
      );
      if (uniqueAddresses.size >= 2) {
        events.push({
          rule_name: 'multi_address',
          score_delta: SCORE_DELTAS.multi_address,
          description: `${uniqueAddresses.size} different addresses in 24h`,
        });
        totalScore += SCORE_DELTAS.multi_address;
      }
    }

    // Rule 3: high_risk_combo - new customer + street + unpaid
    if (params.orderId && params.placementType === 'street' && (params.amountPaid || 0) <= 0) {
      let isNewCustomer = true;
      if (params.customerId) {
        const { count } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('customer_id', params.customerId)
          .eq('status', 'completed')
          .neq('id', params.orderId);
        isNewCustomer = (count || 0) === 0;
      }

      if (isNewCustomer) {
        events.push({
          rule_name: 'high_risk_combo',
          score_delta: SCORE_DELTAS.high_risk_combo,
          description: 'New customer + street placement + no payment',
        });
        totalScore += SCORE_DELTAS.high_risk_combo;
      }
    }

    // Rule 4: out_of_range - >25 miles
    if (params.distanceMiles && params.distanceMiles > 25) {
      events.push({
        rule_name: 'out_of_range',
        score_delta: SCORE_DELTAS.out_of_range,
        description: `Distance ${params.distanceMiles.toFixed(1)} miles exceeds 25 mile threshold`,
      });
      totalScore += SCORE_DELTAS.out_of_range;
    }

    // Rule 5: identity_mismatch - multiple names in 30 days
    const { data: monthQuotes } = await supabase
      .from('quotes')
      .select('customer_name')
      .eq('customer_phone', params.phone)
      .gte('created_at', past30d);

    if (monthQuotes && monthQuotes.length >= 2) {
      const uniqueNames = new Set(
        monthQuotes.map(q => q.customer_name?.toLowerCase().trim()).filter(Boolean)
      );
      if (uniqueNames.size >= 3) {
        events.push({
          rule_name: 'identity_mismatch',
          score_delta: SCORE_DELTAS.identity_mismatch,
          description: `${uniqueNames.size} different names used in 30 days`,
        });
        totalScore += SCORE_DELTAS.identity_mismatch;
      }
    }

    // Credit: paid history - >=2 paid completed orders
    if (params.customerId) {
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', params.customerId)
        .eq('status', 'completed')
        .gt('amount_paid', 0);

      if ((count || 0) >= 2) {
        events.push({
          rule_name: 'paid_history',
          score_delta: SCORE_DELTAS.paid_history,
          description: `${count} completed paid orders`,
        });
        totalScore += SCORE_DELTAS.paid_history;
      }
    }

    // Credit: MSA signed
    if (params.customerId) {
      const { data: contracts } = await supabase
        .from('contracts')
        .select('contract_type')
        .eq('customer_id', params.customerId)
        .eq('status', 'signed');

      const hasMSA = contracts?.some(c => c.contract_type === 'msa');
      const hasAddendum = contracts?.some(c => c.contract_type === 'addendum');

      if (hasMSA && hasAddendum) {
        events.push({
          rule_name: 'msa_signed',
          score_delta: SCORE_DELTAS.msa_signed,
          description: 'MSA and addendum signed',
        });
        totalScore += SCORE_DELTAS.msa_signed;
      }
    }

    // Clamp score
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Log score event
    if (events.length > 0) {
      await supabase.from(RISK_SCORE_EVENTS_TABLE).insert(
        events.map(e => ({
          phone: params.phone,
          customer_id: params.customerId || null,
          quote_id: params.quoteId || null,
          order_id: params.orderId || null,
          score_delta: e.score_delta,
          rule_name: e.rule_name,
          total_score: totalScore,
        })) as never
      );
    }

    return {
      totalScore,
      riskLevel: getRiskLevel(totalScore),
      isWhitelisted: whitelistCheck.whitelisted,
      events,
    };
  } catch (err) {
    console.error('Risk score calculation error:', err);
    return {
      totalScore: 0,
      riskLevel: 'low',
      isWhitelisted: false,
      events: [],
    };
  }
}

/**
 * Apply risk-based actions to an order
 */
export async function applyRiskActions(
  orderId: string,
  riskResult: RiskScoreResult
): Promise<void> {
  const updates: Record<string, unknown> = {};

  if (riskResult.riskLevel === 'high') {
    updates.fraud_blocked = true;
    updates.requires_manual_review = true;
    updates.requires_deposit = true;
    updates.deposit_required_reason = 'High risk score: ' + riskResult.events.map(e => e.rule_name).join(', ');
  } else if (riskResult.riskLevel === 'medium') {
    // Whitelist can downgrade medium to low unless specific combos
    const hasBlockingCombo = riskResult.events.some(e => 
      ['high_risk_combo', 'multi_address', 'out_of_range'].includes(e.rule_name)
    ) && riskResult.events.filter(e => e.score_delta > 0).length >= 2;

    if (!riskResult.isWhitelisted || hasBlockingCombo) {
      updates.requires_deposit = true;
      updates.deposit_required_reason = 'Medium risk: ' + riskResult.events.map(e => e.rule_name).join(', ');
    }
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('orders').update(updates as never).eq('id', orderId);
  }
}

/**
 * Update fraud flag with risk score
 */
export async function updateFlagWithRiskScore(
  flagId: string,
  riskResult: RiskScoreResult
): Promise<void> {
  await supabase.from(FRAUD_FLAGS_TABLE).update({
    risk_score: riskResult.totalScore,
    risk_level: riskResult.riskLevel,
    is_whitelisted: riskResult.isWhitelisted,
  } as never).eq('id' as 'id', flagId);
}
