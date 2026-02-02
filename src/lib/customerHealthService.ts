import { supabase } from '@/integrations/supabase/client';

export type HealthStatus = 'GREEN' | 'AMBER' | 'RED';
export type HealthEventSeverity = 'LOW' | 'MED' | 'HIGH';
export type HealthEventType = 
  | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'CHARGEBACK' | 'REFUND' | 'DISPUTE'
  | 'CANCELLATION' | 'NO_SHOW' | 'BLOCKED_ACCESS' | 'RESCHEDULE'
  | 'CONTAMINATION' | 'OVERWEIGHT' | 'POD_MISSING'
  | 'REPEAT_ORDER' | 'HIGH_VOLUME' | 'FAST_PAY' | 'CLEAN_COMPLIANCE'
  | 'REVIEW_POSITIVE' | 'REVIEW_NEGATIVE' | 'INITIAL_SCORE';

export interface HealthDriver {
  driver: string;
  impact: string;
}

export interface CustomerHealthScore {
  id: string;
  customer_id: string;
  score: number;
  status: HealthStatus;
  score_breakdown_json: {
    base_score?: number;
    payment_adjustment?: number;
    operations_adjustment?: number;
    compliance_adjustment?: number;
    loyalty_adjustment?: number;
    final_score?: number;
    recalculated_at?: string;
  };
  positive_drivers: HealthDriver[];
  negative_drivers: HealthDriver[];
  last_updated_at: string;
  created_at: string;
}

export interface CustomerHealthEvent {
  id: string;
  customer_id: string;
  event_type: HealthEventType;
  severity: HealthEventSeverity;
  delta_score: number;
  score_before: number | null;
  score_after: number | null;
  details_json: Record<string, unknown>;
  source_entity_type: string | null;
  source_entity_id: string | null;
  created_at: string;
}

export interface HealthRule {
  id: string;
  rule_key: string;
  event_type: HealthEventType;
  description: string;
  weight: number;
  delta_score: number;
  threshold_json: Record<string, unknown>;
  category: string;
  is_active: boolean;
}

/**
 * Get health score for a customer
 */
export async function getCustomerHealthScore(customerId: string): Promise<CustomerHealthScore | null> {
  const { data, error } = await supabase
    .from('customer_health_scores' as never)
    .select('*')
    .eq('customer_id', customerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Failed to fetch health score:', error);
    return null;
  }

  return data as unknown as CustomerHealthScore;
}

/**
 * Get health events for a customer
 */
export async function getCustomerHealthEvents(
  customerId: string,
  options?: { limit?: number }
): Promise<CustomerHealthEvent[]> {
  const { data, error } = await supabase
    .from('customer_health_events' as never)
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(options?.limit || 50);

  if (error) {
    console.error('Failed to fetch health events:', error);
    return [];
  }

  return (data || []) as unknown as CustomerHealthEvent[];
}

/**
 * Get all health rules
 */
export async function getHealthRules(): Promise<HealthRule[]> {
  const { data, error } = await supabase
    .from('customer_health_rules' as never)
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    console.error('Failed to fetch health rules:', error);
    return [];
  }

  return (data || []) as unknown as HealthRule[];
}

/**
 * Get health distribution (count by status)
 */
export async function getHealthDistribution(): Promise<{ status: HealthStatus; count: number }[]> {
  const { data, error } = await supabase
    .from('customer_health_scores' as never)
    .select('status');

  if (error) {
    console.error('Failed to fetch health distribution:', error);
    return [];
  }

  const counts: Record<HealthStatus, number> = { GREEN: 0, AMBER: 0, RED: 0 };
  (data || []).forEach((row: { status: HealthStatus }) => {
    counts[row.status] = (counts[row.status] || 0) + 1;
  });

  return [
    { status: 'GREEN', count: counts.GREEN },
    { status: 'AMBER', count: counts.AMBER },
    { status: 'RED', count: counts.RED },
  ];
}

/**
 * Get customers by health status
 */
export async function getCustomersByHealthStatus(
  status: HealthStatus,
  options?: { limit?: number }
): Promise<(CustomerHealthScore & { customer?: { company_name: string | null } })[]> {
  const { data, error } = await supabase
    .from('customer_health_scores' as never)
    .select(`
      *,
      customer:customers(company_name)
    `)
    .eq('status', status)
    .order('score', { ascending: status === 'RED' })
    .limit(options?.limit || 20);

  if (error) {
    console.error('Failed to fetch customers by status:', error);
    return [];
  }

  return (data || []) as unknown as (CustomerHealthScore & { customer?: { company_name: string | null } })[];
}

/**
 * Get top risky customers (RED status, lowest scores)
 */
export async function getRiskyCustomers(limit = 10): Promise<(CustomerHealthScore & { customer?: { company_name: string | null; billing_phone: string | null } })[]> {
  const { data, error } = await supabase
    .from('customer_health_scores' as never)
    .select(`
      *,
      customer:customers(company_name, billing_phone)
    `)
    .eq('status', 'RED')
    .order('score', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch risky customers:', error);
    return [];
  }

  return (data || []) as unknown as (CustomerHealthScore & { customer?: { company_name: string | null; billing_phone: string | null } })[];
}

/**
 * Get top valuable customers (GREEN status, highest scores)
 */
export async function getValuableCustomers(limit = 10): Promise<(CustomerHealthScore & { customer?: { company_name: string | null } })[]> {
  const { data, error } = await supabase
    .from('customer_health_scores' as never)
    .select(`
      *,
      customer:customers(company_name)
    `)
    .eq('status', 'GREEN')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch valuable customers:', error);
    return [];
  }

  return (data || []) as unknown as (CustomerHealthScore & { customer?: { company_name: string | null } })[];
}

/**
 * Request recalculation of customer health score
 */
export async function recalculateHealthScore(customerId: string): Promise<number | null> {
  const { data, error } = await supabase
    .rpc('recalculate_customer_health', { p_customer_id: customerId });

  if (error) {
    console.error('Failed to recalculate health score:', error);
    return null;
  }

  return data as number;
}

/**
 * Get recent health score changes
 */
export async function getRecentHealthChanges(
  days = 30,
  limit = 50
): Promise<CustomerHealthEvent[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('customer_health_events' as never)
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch recent health changes:', error);
    return [];
  }

  return (data || []) as unknown as CustomerHealthEvent[];
}
