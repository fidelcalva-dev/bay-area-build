// Internal Calculator Service

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type {
  CalculatorInputs,
  CalculatorEstimate,
  CalculatorLog,
  CalculatorResult,
  ZoneRestriction,
  MarginClass,
  Recommendation,
} from '@/types/calculator';

// Fetch zone restrictions for a market
export async function getZoneRestrictions(marketCode: string): Promise<ZoneRestriction[]> {
  const { data, error } = await supabase
    .from('zone_restrictions')
    .select('*')
    .eq('market_code', marketCode)
    .eq('is_active', true);

  if (error) {
    console.error('Failed to fetch zone restrictions:', error);
    return [];
  }

  return data as ZoneRestriction[];
}

// Check if service is blocked by zone restrictions
export function checkRestrictions(
  inputs: CalculatorInputs,
  restrictions: ZoneRestriction[]
): { isBlocked: boolean; reason?: string; suggestions?: Recommendation[] } {
  for (const restriction of restrictions) {
    // Check if restriction applies to this service type
    if (!restriction.applies_to.includes(inputs.service_type) && 
        !restriction.applies_to.includes(inputs.material_category)) {
      continue;
    }

    switch (restriction.restriction_type) {
      case 'NO_SAME_DAY_SWAP':
        if (inputs.is_same_day && inputs.service_type === 'SWAP') {
          return {
            isBlocked: true,
            reason: restriction.reason || 'Same-day swaps not available in this zone',
            suggestions: [{
              type: 'ALTERNATIVE',
              label: 'Schedule for Next Day',
              description: 'Swaps in this zone require next-day scheduling',
            }],
          };
        }
        break;

      case 'NO_HEAVY':
        if (inputs.material_category === 'HEAVY' || inputs.material_category === 'DEBRIS_HEAVY') {
          return {
            isBlocked: true,
            reason: restriction.reason || 'Heavy materials not accepted in this zone',
            suggestions: [{
              type: 'ALTERNATIVE',
              label: 'Standard Debris Only',
              description: 'Consider using a different disposal site for heavy materials',
            }],
          };
        }
        break;

      case 'NO_LARGE_SIZE':
        if (restriction.max_size_yd && inputs.dumpster_size > restriction.max_size_yd) {
          return {
            isBlocked: true,
            reason: restriction.reason || `Max size ${restriction.max_size_yd}yd in this zone`,
            suggestions: [{
              type: 'ALTERNATIVE',
              label: `Use ${restriction.max_size_yd}yd Container`,
              description: `Maximum allowed size for this material in this zone is ${restriction.max_size_yd}yd`,
              dumpster_size: restriction.max_size_yd,
            }],
          };
        }
        break;

      case 'TIME_WINDOW':
        // Would check against current time or requested time window
        break;
    }
  }

  return { isBlocked: false };
}

// Save calculator estimate
export async function saveEstimate(estimate: Partial<CalculatorEstimate>): Promise<CalculatorEstimate | null> {
  const { data, error } = await supabase
    .from('calculator_estimates')
    .insert([{
      market_code: estimate.market_code,
      service_type: estimate.service_type,
      material_category: estimate.material_category,
      dumpster_size: estimate.dumpster_size,
      customer_type: estimate.customer_type,
      customer_tier: estimate.customer_tier,
      yard_id: estimate.yard_id,
      destination_address: estimate.destination_address,
      destination_lat: estimate.destination_lat,
      destination_lng: estimate.destination_lng,
      facility_id: estimate.facility_id,
      is_same_day: estimate.is_same_day,
      traffic_mode: estimate.traffic_mode,
      total_time_minutes: estimate.total_time_minutes,
      time_breakdown: estimate.time_breakdown ? JSON.parse(JSON.stringify(estimate.time_breakdown)) : null,
      sla_class: estimate.sla_class,
      is_feasible: estimate.is_feasible,
      blocked_reason: estimate.blocked_reason,
      customer_price: estimate.customer_price,
      internal_cost: estimate.internal_cost,
      margin_pct: estimate.margin_pct,
      margin_class: estimate.margin_class,
      final_price: estimate.final_price,
      final_margin_pct: estimate.final_margin_pct,
      requires_approval: estimate.requires_approval,
      approval_status: estimate.approval_status,
      route_details: estimate.route_details ? JSON.parse(JSON.stringify(estimate.route_details)) : null,
      recommendations: estimate.recommendations ? JSON.parse(JSON.stringify(estimate.recommendations)) : null,
      warnings: estimate.warnings,
    }])
    .select()
    .single();

  if (error) {
    console.error('Failed to save estimate:', error);
    return null;
  }

  return data as unknown as CalculatorEstimate;
}

// Update estimate with discount
export async function applyDiscount(
  estimateId: string,
  discountType: string,
  discountValue: number,
  reason?: string
): Promise<boolean> {
  // Calculate new final price and margin
  const { data: estimate, error: fetchError } = await supabase
    .from('calculator_estimates')
    .select('customer_price, internal_cost')
    .eq('id', estimateId)
    .single();

  if (fetchError || !estimate) {
    console.error('Failed to fetch estimate:', fetchError);
    return false;
  }

  const customerPrice = estimate.customer_price || 0;
  const internalCost = estimate.internal_cost || 0;
  
  let finalPrice = customerPrice;
  if (discountType === 'PERCENTAGE') {
    finalPrice = customerPrice * (1 - discountValue / 100);
  } else if (discountType === 'FLAT') {
    finalPrice = customerPrice - discountValue;
  }

  const finalMargin = finalPrice - internalCost;
  const finalMarginPct = finalPrice > 0 ? (finalMargin / finalPrice) * 100 : 0;
  const requiresApproval = finalMarginPct < 20;

  const { error: updateError } = await supabase
    .from('calculator_estimates')
    .update({
      discount_type: discountType,
      discount_value: discountValue,
      discount_reason: reason,
      final_price: finalPrice,
      final_margin_pct: finalMarginPct,
      margin_class: getMarginClass(finalMarginPct),
      requires_approval: requiresApproval,
      approval_status: requiresApproval ? 'PENDING' : 'NOT_REQUIRED',
    })
    .eq('id', estimateId);

  if (updateError) {
    console.error('Failed to apply discount:', updateError);
    return false;
  }

  return true;
}

// Log calculator action
export async function logCalculatorAction(log: Partial<CalculatorLog>): Promise<boolean> {
  const { error } = await supabase
    .from('calculator_logs')
    .insert([{
      action_type: log.action_type || 'CALCULATE',
      estimate_id: log.estimate_id,
      user_id: log.user_id,
      user_role: log.user_role,
      inputs_json: log.inputs_json ? JSON.parse(JSON.stringify(log.inputs_json)) : {},
      outputs_json: log.outputs_json ? JSON.parse(JSON.stringify(log.outputs_json)) : null,
      discount_applied: log.discount_applied ? JSON.parse(JSON.stringify(log.discount_applied)) : null,
      override_details: log.override_details ? JSON.parse(JSON.stringify(log.override_details)) : null,
      linked_entity_type: log.linked_entity_type,
      linked_entity_id: log.linked_entity_id,
      notes: log.notes,
    }]);

  if (error) {
    console.error('Failed to log calculator action:', error);
    return false;
  }

  return true;
}

// Get calculator logs for admin view
export async function getCalculatorLogs(filters?: {
  userId?: string;
  marketCode?: string;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<CalculatorLog[]> {
  let query = supabase
    .from('calculator_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.actionType) {
    query = query.eq('action_type', filters.actionType);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch calculator logs:', error);
    return [];
  }

  return data as unknown as CalculatorLog[];
}

// Get margin class based on percentage
export function getMarginClass(marginPct: number): MarginClass {
  if (marginPct >= 30) return 'GREEN';
  if (marginPct >= 20) return 'AMBER';
  return 'RED';
}

// Get margin display info
export function getMarginDisplayInfo(marginClass: MarginClass): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (marginClass) {
    case 'GREEN':
      return { label: 'Healthy Margin', color: 'text-green-700', bgColor: 'bg-green-100', icon: '✓' };
    case 'AMBER':
      return { label: 'Low Margin', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: '⚠' };
    case 'RED':
      return { label: 'Critical - Needs Approval', color: 'text-red-700', bgColor: 'bg-red-100', icon: '✕' };
  }
}

// Get discount limits by role
export function getDiscountLimits(role: string): {
  maxPercentage: number;
  canApplyFlat: boolean;
  canApplyFreeDay: boolean;
} {
  switch (role) {
    case 'admin':
      return { maxPercentage: 100, canApplyFlat: true, canApplyFreeDay: true };
    case 'sales':
      return { maxPercentage: 5, canApplyFlat: false, canApplyFreeDay: false };
    case 'cs':
      return { maxPercentage: 0, canApplyFlat: false, canApplyFreeDay: true }; // Free day for preferred
    case 'dispatcher':
      return { maxPercentage: 0, canApplyFlat: false, canApplyFreeDay: false };
    default:
      return { maxPercentage: 0, canApplyFlat: false, canApplyFreeDay: false };
  }
}

// Check if user can apply discount for customer tier
export function canApplyDiscount(role: string, customerTier: string): boolean {
  if (role === 'admin') return true;
  if (role === 'sales' && (customerTier === 'preferred' || customerTier === 'vip')) return true;
  if (role === 'cs' && customerTier === 'vip') return true; // CS can only give free day to VIP
  return false;
}
