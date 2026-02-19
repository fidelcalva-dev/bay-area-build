import { supabase } from '@/integrations/supabase/client';

// ============================================================
// LIFECYCLE SERVICE
// Manages entity stage transitions across Lead → Quote → Order → Job → Invoice
// ============================================================

export type LifecycleEntityType = 'LEAD' | 'QUOTE' | 'ORDER' | 'JOB' | 'INVOICE';
export type LifecycleDepartment = 'SALES' | 'BILLING' | 'LOGISTICS' | 'DISPATCH' | 'CS' | 'ADMIN';
export type LifecycleTrigger = 'MANUAL' | 'SYSTEM' | 'AUTOMATION' | 'WEBHOOK' | 'CRON';

export interface StageHistoryRecord {
  id: string;
  entity_type: LifecycleEntityType;
  entity_id: string;
  lead_id: string | null;
  quote_id: string | null;
  order_id: string | null;
  customer_id: string | null;
  from_stage: string | null;
  to_stage: string;
  department: LifecycleDepartment;
  assigned_user_id: string | null;
  assigned_user_email: string | null;
  trigger_type: LifecycleTrigger;
  triggered_by_user_id: string | null;
  notes: string | null;
  details_json: Record<string, unknown>;
  sla_deadline_at: string | null;
  is_sla_breached: boolean;
  entered_at: string;
  exited_at: string | null;
  duration_minutes: number | null;
  created_at: string;
}

// Stage definitions per entity type
export const LIFECYCLE_STAGES: Record<LifecycleEntityType, { stage: string; label: string; department: LifecycleDepartment }[]> = {
  LEAD: [
    { stage: 'new', label: 'New Lead', department: 'SALES' },
    { stage: 'contacted', label: 'Contacted', department: 'SALES' },
    { stage: 'qualified', label: 'Qualified', department: 'SALES' },
    { stage: 'quoted', label: 'Quoted', department: 'SALES' },
    { stage: 'converted', label: 'Converted', department: 'SALES' },
    { stage: 'lost', label: 'Lost', department: 'SALES' },
  ],
  QUOTE: [
    { stage: 'draft', label: 'Draft', department: 'SALES' },
    { stage: 'sent', label: 'Sent', department: 'SALES' },
    { stage: 'viewed', label: 'Viewed', department: 'SALES' },
    { stage: 'accepted', label: 'Accepted', department: 'SALES' },
    { stage: 'rejected', label: 'Rejected', department: 'SALES' },
    { stage: 'expired', label: 'Expired', department: 'SALES' },
  ],
  ORDER: [
    { stage: 'pending', label: 'Pending', department: 'LOGISTICS' },
    { stage: 'scheduled', label: 'Scheduled', department: 'DISPATCH' },
    { stage: 'in_progress', label: 'In Progress', department: 'LOGISTICS' },
    { stage: 'delivered', label: 'Delivered', department: 'LOGISTICS' },
    { stage: 'pickup_scheduled', label: 'Pickup Scheduled', department: 'DISPATCH' },
    { stage: 'completed', label: 'Completed', department: 'LOGISTICS' },
    { stage: 'cancelled', label: 'Cancelled', department: 'CS' },
  ],
  JOB: [
    { stage: 'assigned', label: 'Assigned', department: 'DISPATCH' },
    { stage: 'en_route', label: 'En Route', department: 'DISPATCH' },
    { stage: 'arrived', label: 'Arrived', department: 'DISPATCH' },
    { stage: 'completed', label: 'Completed', department: 'DISPATCH' },
    { stage: 'failed', label: 'Failed', department: 'DISPATCH' },
  ],
  INVOICE: [
    { stage: 'draft', label: 'Draft', department: 'BILLING' },
    { stage: 'sent', label: 'Sent', department: 'BILLING' },
    { stage: 'partial', label: 'Partial Payment', department: 'BILLING' },
    { stage: 'paid', label: 'Paid', department: 'BILLING' },
    { stage: 'overdue', label: 'Overdue', department: 'BILLING' },
    { stage: 'void', label: 'Void', department: 'BILLING' },
  ],
};

const DEPARTMENT_COLORS: Record<LifecycleDepartment, string> = {
  SALES: 'bg-blue-100 text-blue-700 border-blue-200',
  BILLING: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  LOGISTICS: 'bg-orange-100 text-orange-700 border-orange-200',
  DISPATCH: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  CS: 'bg-purple-100 text-purple-700 border-purple-200',
  ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function getDepartmentColor(dept: LifecycleDepartment): string {
  return DEPARTMENT_COLORS[dept] || DEPARTMENT_COLORS.ADMIN;
}

export function getStageLabel(entityType: LifecycleEntityType, stage: string): string {
  const found = LIFECYCLE_STAGES[entityType]?.find(s => s.stage === stage);
  return found?.label || stage;
}

export function getStageDepartment(entityType: LifecycleEntityType, stage: string): LifecycleDepartment {
  const found = LIFECYCLE_STAGES[entityType]?.find(s => s.stage === stage);
  return found?.department || 'ADMIN';
}

/**
 * Transition an entity to a new stage via the DB function
 */
export async function transitionStage(params: {
  entityType: LifecycleEntityType;
  entityId: string;
  toStage: string;
  department: LifecycleDepartment;
  trigger?: LifecycleTrigger;
  assignedUserId?: string;
  notes?: string;
  leadId?: string;
  quoteId?: string;
  orderId?: string;
  customerId?: string;
}): Promise<{ success: boolean; stageId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('transition_entity_stage', {
      p_entity_type: params.entityType,
      p_entity_id: params.entityId,
      p_to_stage: params.toStage,
      p_department: params.department,
      p_trigger: params.trigger || 'MANUAL',
      p_assigned_user_id: params.assignedUserId || null,
      p_notes: params.notes || null,
      p_lead_id: params.leadId || null,
      p_quote_id: params.quoteId || null,
      p_order_id: params.orderId || null,
      p_customer_id: params.customerId || null,
    });

    if (error) {
      console.error('Stage transition failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, stageId: data as string };
  } catch (err) {
    console.error('Stage transition error:', err);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Get full stage history for an entity
 */
export async function getEntityStageHistory(
  entityType: LifecycleEntityType,
  entityId: string
): Promise<StageHistoryRecord[]> {
  const { data, error } = await supabase
    .from('entity_stage_history' as never)
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('entered_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch stage history:', error);
    return [];
  }

  return (data || []) as unknown as StageHistoryRecord[];
}

/**
 * Get the current active stage for an entity
 */
export async function getCurrentStage(
  entityType: LifecycleEntityType,
  entityId: string
): Promise<StageHistoryRecord | null> {
  const { data, error } = await supabase
    .from('entity_stage_history' as never)
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .is('exited_at', null)
    .order('entered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch current stage:', error);
    return null;
  }

  return data as unknown as StageHistoryRecord | null;
}

/**
 * Get full lifecycle chain for a customer (across all entity types)
 */
export async function getCustomerLifecycle(customerId: string): Promise<StageHistoryRecord[]> {
  const { data, error } = await supabase
    .from('entity_stage_history' as never)
    .select('*')
    .eq('customer_id', customerId)
    .order('entered_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch customer lifecycle:', error);
    return [];
  }

  return (data || []) as unknown as StageHistoryRecord[];
}

/**
 * Get all SLA-breached stages (stuck detection)
 */
export async function getBreachedStages(): Promise<StageHistoryRecord[]> {
  const { data, error } = await supabase
    .from('entity_stage_history' as never)
    .select('*')
    .is('exited_at', null)
    .lt('sla_deadline_at', new Date().toISOString())
    .order('sla_deadline_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch breached stages:', error);
    return [];
  }

  return (data || []) as unknown as StageHistoryRecord[];
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

/**
 * Calculate live duration for active stages
 */
export function getLiveDurationMinutes(enteredAt: string): number {
  return (Date.now() - new Date(enteredAt).getTime()) / 60000;
}
