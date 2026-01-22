import { supabase } from '@/integrations/supabase/client';
import { createAuditLog } from './auditLog';
import type { Json } from '@/integrations/supabase/types';

// Type assertion helper for new tables not yet in generated types
const db = supabase as unknown as {
  from: (table: string) => ReturnType<typeof supabase.from>;
  auth: typeof supabase.auth;
  functions: typeof supabase.functions;
};

export type FraudFlagType = 
  | 'velocity_phone'
  | 'multi_address'
  | 'out_of_range'
  | 'identity_mismatch'
  | 'high_risk_combo';

export type FraudSeverity = 'low' | 'medium' | 'high';
export type FraudStatus = 'open' | 'reviewing' | 'resolved' | 'blocked';
export type FraudActionType = 
  | 'created'
  | 'reviewed'
  | 'resolved'
  | 'blocked'
  | 'require_deposit'
  | 'whitelist'
  | 'note_added'
  | 'escalated';

export interface FraudFlag {
  id: string;
  phone: string | null;
  customer_id: string | null;
  quote_id: string | null;
  order_id: string | null;
  flag_type: FraudFlagType;
  severity: FraudSeverity;
  status: FraudStatus;
  reason: string;
  evidence_json: Json;
  created_at: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolved_notes: string | null;
}

interface CreateFraudFlagParams {
  phone?: string;
  customerId?: string;
  quoteId?: string;
  orderId?: string;
  flagType: FraudFlagType;
  severity: FraudSeverity;
  reason: string;
  evidence?: Record<string, unknown>;
}

/**
 * Create a fraud flag and log the action
 */
export async function createFraudFlag({
  phone,
  customerId,
  quoteId,
  orderId,
  flagType,
  severity,
  reason,
  evidence = {},
}: CreateFraudFlagParams): Promise<{ success: boolean; flagId?: string; error?: string }> {
  try {
    // Check if similar flag already exists (avoid duplicates)
    const { data: existing } = await db
      .from('fraud_flags')
      .select('id')
      .eq('flag_type', flagType)
      .eq('status', 'open')
      .or(`phone.eq.${phone},quote_id.eq.${quoteId},order_id.eq.${orderId}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: true, flagId: (existing[0] as { id: string }).id }; // Already flagged
    }

    const { data, error } = await db
      .from('fraud_flags')
      .insert([{
        phone: phone || null,
        customer_id: customerId || null,
        quote_id: quoteId || null,
        order_id: orderId || null,
        flag_type: flagType,
        severity,
        reason,
        evidence_json: evidence as Json,
      }])
      .select('id')
      .single();

    if (error) throw error;

    const flagId = (data as { id: string }).id;

    // Log the action
    await db.from('fraud_actions').insert([{
      flag_id: flagId,
      action_type: 'created',
      notes: reason,
      metadata: evidence as Json,
    }]);

    // Create audit log
    await createAuditLog({
      action: 'create',
      entityType: 'approval_request',
      entityId: flagId,
      afterData: { flag_type: flagType, severity, reason } as Json,
      changesSummary: `Fraud flag created: ${flagType} (${severity})`,
    });

    // Update quote/order fraud count
    if (quoteId) {
      await supabase
        .from('quotes')
        .update({ fraud_flags_count: 1 } as never)
        .eq('id', quoteId);
    }

    if (orderId) {
      const updates: Record<string, unknown> = { fraud_flags_count: 1 };
      if (severity === 'high') {
        updates.fraud_blocked = true;
        updates.requires_manual_review = true;
      } else if (severity === 'medium') {
        updates.requires_deposit = true;
        updates.deposit_required_reason = reason;
      }
      await supabase.from('orders').update(updates as never).eq('id', orderId);
    }

    // Create alert for high severity
    if (severity === 'high') {
      await supabase.from('alerts').insert([{
        alert_type: 'fraud_high_risk',
        entity_type: 'fraud_flag',
        entity_id: flagId,
        severity: 'critical',
        title: `High Risk Fraud Flag: ${flagType}`,
        message: reason,
        metadata: { phone, quoteId, orderId, evidence } as Json,
      }]);
    }

    return { success: true, flagId };
  } catch (err) {
    console.error('Failed to create fraud flag:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Run fraud velocity checks for a phone number
 */
export async function runVelocityCheck(phone: string): Promise<FraudFlag[]> {
  const flags: FraudFlag[] = [];
  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Rule D1: velocity_phone - >3 quotes in 24 hours
    const { data: recentQuotes } = await supabase
      .from('quotes')
      .select('id, customer_name, delivery_address, created_at')
      .eq('customer_phone', phone)
      .gte('created_at', past24h);

    if (recentQuotes && recentQuotes.length > 3) {
      const result = await createFraudFlag({
        phone,
        quoteId: recentQuotes[recentQuotes.length - 1]?.id,
        flagType: 'velocity_phone',
        severity: 'medium',
        reason: `Phone has ${recentQuotes.length} quotes in 24 hours (threshold: 3)`,
        evidence: { quote_count: recentQuotes.length, quotes: recentQuotes.map(q => q.id) },
      });
      if (result.flagId) {
        const { data: flag } = await db.from('fraud_flags').select('*').eq('id', result.flagId).single();
        if (flag) flags.push(flag as FraudFlag);
      }
    }

    // Rule D2: multi_address - >=2 distinct addresses in 24 hours
    if (recentQuotes && recentQuotes.length >= 2) {
      const uniqueAddresses = new Set(recentQuotes.map(q => q.delivery_address?.toLowerCase().trim()).filter(Boolean));
      if (uniqueAddresses.size >= 2) {
        const result = await createFraudFlag({
          phone,
          quoteId: recentQuotes[recentQuotes.length - 1]?.id,
          flagType: 'multi_address',
          severity: 'medium',
          reason: `Phone used with ${uniqueAddresses.size} different addresses in 24 hours`,
          evidence: { addresses: Array.from(uniqueAddresses), quote_ids: recentQuotes.map(q => q.id) },
        });
        if (result.flagId) {
          const { data: flag } = await db.from('fraud_flags').select('*').eq('id', result.flagId).single();
          if (flag) flags.push(flag as FraudFlag);
        }
      }
    }

    // Rule D5: identity_mismatch - multiple names in 30 days
    const { data: monthQuotes } = await supabase
      .from('quotes')
      .select('id, customer_name')
      .eq('customer_phone', phone)
      .gte('created_at', past30d);

    if (monthQuotes && monthQuotes.length >= 2) {
      const uniqueNames = new Set(
        monthQuotes
          .map(q => q.customer_name?.toLowerCase().trim())
          .filter(Boolean)
      );
      if (uniqueNames.size >= 3) {
        const result = await createFraudFlag({
          phone,
          flagType: 'identity_mismatch',
          severity: uniqueNames.size >= 4 ? 'medium' : 'low',
          reason: `Phone used with ${uniqueNames.size} different names in 30 days`,
          evidence: { names: Array.from(uniqueNames) },
        });
        if (result.flagId) {
          const { data: flag } = await db.from('fraud_flags').select('*').eq('id', result.flagId).single();
          if (flag) flags.push(flag as FraudFlag);
        }
      }
    }
  } catch (err) {
    console.error('Velocity check error:', err);
  }

  return flags;
}

/**
 * Check for high-risk combo (new customer + street placement + no deposit)
 */
export async function checkHighRiskCombo(orderId: string): Promise<FraudFlag | null> {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select(`
        id, customer_id, amount_paid, payment_status,
        quotes (
          id, customer_phone, placement_type, customer_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (!order) return null;

    const quote = order.quotes as { id: string; customer_phone: string; placement_type: string; customer_id: string } | null;
    const isStreetPlacement = quote?.placement_type === 'street';
    const noPayment = (order.amount_paid || 0) <= 0;

    // Check if new customer (no previous completed orders)
    let isNewCustomer = true;
    if (order.customer_id) {
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', order.customer_id)
        .eq('status', 'completed')
        .neq('id', orderId);
      isNewCustomer = (count || 0) === 0;
    }

    if (isNewCustomer && isStreetPlacement && noPayment) {
      const result = await createFraudFlag({
        phone: quote?.customer_phone,
        orderId,
        quoteId: quote?.id,
        customerId: order.customer_id || undefined,
        flagType: 'high_risk_combo',
        severity: 'high',
        reason: 'New customer with street placement and no payment/deposit',
        evidence: {
          is_new_customer: true,
          placement_type: quote?.placement_type,
          amount_paid: order.amount_paid,
        },
      });

      if (result.flagId) {
        const { data: flag } = await db.from('fraud_flags').select('*').eq('id', result.flagId).single();
        return flag as FraudFlag;
      }
    }
  } catch (err) {
    console.error('High risk combo check error:', err);
  }
  return null;
}

/**
 * Check for out of range distance
 */
export async function checkOutOfRange(
  quoteId: string,
  distanceMiles: number,
  zipCode: string
): Promise<FraudFlag | null> {
  const MAX_DISTANCE = 25;

  if (distanceMiles > MAX_DISTANCE) {
    const result = await createFraudFlag({
      quoteId,
      flagType: 'out_of_range',
      severity: 'medium',
      reason: `Distance ${distanceMiles.toFixed(1)} miles exceeds ${MAX_DISTANCE} mile threshold`,
      evidence: { distance_miles: distanceMiles, zip_code: zipCode },
    });

    if (result.flagId) {
      const { data: flag } = await db.from('fraud_flags').select('*').eq('id', result.flagId).single();
      return flag as FraudFlag;
    }
  }
  return null;
}

/**
 * Resolve a fraud flag
 */
export async function resolveFraudFlag(
  flagId: string,
  notes: string,
  unblockOrder = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: flag, error: fetchError } = await db
      .from('fraud_flags')
      .select('*')
      .eq('id', flagId)
      .single();

    if (fetchError || !flag) throw new Error('Flag not found');

    const { error } = await db
      .from('fraud_flags')
      .update({
        status: 'resolved',
        resolved_by: user?.id,
        resolved_at: new Date().toISOString(),
        resolved_notes: notes,
      })
      .eq('id', flagId);

    if (error) throw error;

    // Log the action
    await db.from('fraud_actions').insert([{
      flag_id: flagId,
      action_type: 'resolved',
      performed_by: user?.id,
      notes,
    }]);

    // Unblock order if requested
    if (unblockOrder && flag.order_id) {
      await supabase
        .from('orders')
        .update({
          fraud_blocked: false,
          requires_manual_review: false,
        })
        .eq('id', flag.order_id);
    }

    await createAuditLog({
      action: 'update',
      entityType: 'approval_request',
      entityId: flagId,
      afterData: { status: 'resolved', notes } as Json,
      changesSummary: `Fraud flag resolved: ${notes}`,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to resolve fraud flag:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Require deposit for an order
 */
export async function requireDeposit(
  flagId: string,
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('orders')
      .update({
        requires_deposit: true,
        deposit_required_reason: reason,
      })
      .eq('id', orderId);

    await db
      .from('fraud_flags')
      .update({ status: 'reviewing' })
      .eq('id', flagId);

    await db.from('fraud_actions').insert([{
      flag_id: flagId,
      action_type: 'require_deposit',
      performed_by: user?.id,
      notes: reason,
    }]);

    return { success: true };
  } catch (err) {
    console.error('Failed to require deposit:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Block scheduling for an order
 */
export async function blockScheduling(
  flagId: string,
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from('orders')
      .update({
        fraud_blocked: true,
        requires_manual_review: true,
      })
      .eq('id', orderId);

    await db
      .from('fraud_flags')
      .update({ status: 'blocked' })
      .eq('id', flagId);

    await db.from('fraud_actions').insert([{
      flag_id: flagId,
      action_type: 'blocked',
      performed_by: user?.id,
      notes: reason,
    }]);

    return { success: true };
  } catch (err) {
    console.error('Failed to block scheduling:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Whitelist a phone/customer
 */
export async function whitelistEntity(
  flagId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: flag } = await db
      .from('fraud_flags')
      .select('*')
      .eq('id', flagId)
      .single();

    if (!flag) throw new Error('Flag not found');
    const flagData = flag as FraudFlag;

    // Resolve all open flags for this phone
    if (flagData.phone) {
      await db
        .from('fraud_flags')
        .update({
          status: 'resolved',
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolved_notes: `Whitelisted: ${notes}`,
        })
        .eq('phone', flagData.phone)
        .eq('status', 'open');
    }

    await db.from('fraud_actions').insert([{
      flag_id: flagId,
      action_type: 'whitelist',
      performed_by: user?.id,
      notes,
    }]);

    // Unblock order if exists
    if (flag.order_id) {
      await supabase
        .from('orders')
        .update({
          fraud_blocked: false,
          requires_manual_review: false,
          requires_deposit: false,
        })
        .eq('id', flag.order_id);
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to whitelist:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
