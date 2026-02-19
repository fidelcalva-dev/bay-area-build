import { supabase } from '@/integrations/supabase/client';

// ============================================================
// UNIFIED LIFECYCLE SERVICE
// Full pipeline: Lead → Quote → Contract → Verification → Payment →
// Scheduled → Delivered → Pickup → Dump Ticket → Final Bill → Closed
// ============================================================

export type LifecycleEntityType = 'LEAD' | 'QUOTE' | 'ORDER';
export type LifecycleDepartment = 'SALES' | 'BILLING' | 'LOGISTICS' | 'DRIVER' | 'ADMIN' | 'VERIFICATION';
export type LifecycleEventType = 'ENTER_STAGE' | 'EXIT_STAGE' | 'NOTE' | 'AUTO_TRIGGER' | 'MANUAL_MOVE' | 'SLA_BREACH';

// ---- Types ----

export interface LifecycleStage {
  id: string;
  stage_key: string;
  stage_name: string;
  department: LifecycleDepartment;
  stage_order: number;
  auto_trigger: boolean;
  sla_minutes: number | null;
  is_active: boolean;
}

export interface LifecycleEntity {
  id: string;
  entity_type: LifecycleEntityType;
  entity_id: string;
  current_stage_key: string;
  current_department: string;
  owner_user_id: string | null;
  entered_stage_at: string;
  updated_at: string;
}

export interface LifecycleEvent {
  id: string;
  entity_type: LifecycleEntityType;
  entity_id: string;
  stage_key: string;
  department: string;
  event_type: LifecycleEventType;
  performed_by_user_id: string | null;
  performed_by_role: string | null;
  notes: string | null;
  meta_json: Record<string, unknown> | null;
  created_at: string;
}

export interface LifecycleAlert {
  id: string;
  entity_type: string;
  entity_id: string;
  stage_key: string;
  department: string;
  alert_type: string;
  severity: string;
  assigned_to_user_id: string | null;
  is_resolved: boolean;
  created_at: string;
}

// ---- Department colors ----

const DEPARTMENT_COLORS: Record<string, string> = {
  SALES: 'bg-blue-100 text-blue-700 border-blue-200',
  BILLING: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  LOGISTICS: 'bg-orange-100 text-orange-700 border-orange-200',
  DRIVER: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
  VERIFICATION: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function getDepartmentColor(dept: string): string {
  return DEPARTMENT_COLORS[dept] || DEPARTMENT_COLORS.ADMIN;
}

// ---- Stage definitions cache ----

let _stagesCache: LifecycleStage[] | null = null;

export async function getAllStages(): Promise<LifecycleStage[]> {
  if (_stagesCache) return _stagesCache;
  const { data, error } = await supabase
    .from('lifecycle_stages' as never)
    .select('*')
    .eq('is_active', true)
    .order('stage_order', { ascending: true });
  if (error) {
    console.error('Failed to fetch lifecycle stages:', error);
    return [];
  }
  _stagesCache = (data || []) as unknown as LifecycleStage[];
  return _stagesCache;
}

export function invalidateStagesCache() {
  _stagesCache = null;
}

export function getStagesByDepartment(stages: LifecycleStage[], dept: string): LifecycleStage[] {
  return stages.filter(s => s.department === dept);
}

// ---- Core operations ----

/**
 * Advance an entity to a new stage via DB function (atomic)
 */
export async function advanceStage(params: {
  entityType: LifecycleEntityType;
  entityId: string;
  toStageKey: string;
  performedByUserId?: string | null;
  performedByRole?: string | null;
  notes?: string | null;
  eventType?: LifecycleEventType;
  meta?: Record<string, unknown>;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('lifecycle_advance_stage', {
      p_entity_type: params.entityType,
      p_entity_id: params.entityId,
      p_to_stage_key: params.toStageKey,
      p_performed_by_user_id: params.performedByUserId || null,
      p_performed_by_role: params.performedByRole || null,
      p_notes: params.notes || null,
      p_event_type: params.eventType || 'MANUAL_MOVE',
      p_meta: params.meta ? JSON.stringify(params.meta) : null,
    });
    if (error) {
      console.error('Stage advance failed:', error);
      return { success: false, error: error.message };
    }
    return { success: true, eventId: data as string };
  } catch (err) {
    console.error('Stage advance error:', err);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Get the current lifecycle state for an entity
 */
export async function getEntityState(
  entityType: LifecycleEntityType,
  entityId: string
): Promise<LifecycleEntity | null> {
  const { data, error } = await supabase
    .from('lifecycle_entities' as never)
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch entity state:', error);
    return null;
  }
  return data as unknown as LifecycleEntity | null;
}

/**
 * Get the full event history for an entity (append-only timeline)
 */
export async function getEntityEvents(
  entityType: LifecycleEntityType,
  entityId: string,
  options?: { limit?: number }
): Promise<LifecycleEvent[]> {
  const limit = options?.limit || 100;
  const { data, error } = await supabase
    .from('lifecycle_events' as never)
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Failed to fetch entity events:', error);
    return [];
  }
  return (data || []) as unknown as LifecycleEvent[];
}

/**
 * Add a note to the lifecycle timeline
 */
export async function addLifecycleNote(params: {
  entityType: LifecycleEntityType;
  entityId: string;
  stageKey: string;
  department: string;
  notes: string;
  performedByUserId?: string | null;
  performedByRole?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('lifecycle_events' as never)
    .insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      stage_key: params.stageKey,
      department: params.department,
      event_type: 'NOTE',
      notes: params.notes,
      performed_by_user_id: params.performedByUserId || null,
      performed_by_role: params.performedByRole || null,
    } as never);
  if (error) {
    console.error('Failed to add lifecycle note:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Get unresolved alerts for a department
 */
export async function getDepartmentAlerts(department?: string): Promise<LifecycleAlert[]> {
  let query = supabase
    .from('lifecycle_alerts' as never)
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });
  if (department) {
    query = query.eq('department', department);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Failed to fetch lifecycle alerts:', error);
    return [];
  }
  return (data || []) as unknown as LifecycleAlert[];
}

/**
 * Resolve a lifecycle alert
 */
export async function resolveAlert(alertId: string, resolvedByUserId?: string): Promise<boolean> {
  const { error } = await supabase
    .from('lifecycle_alerts' as never)
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by_user_id: resolvedByUserId || null,
    } as never)
    .eq('id', alertId);
  if (error) {
    console.error('Failed to resolve alert:', error);
    return false;
  }
  return true;
}

/**
 * Get all entities stuck at a department (for dashboards)
 */
export async function getEntitiesByDepartment(department: string): Promise<LifecycleEntity[]> {
  const { data, error } = await supabase
    .from('lifecycle_entities' as never)
    .select('*')
    .eq('current_department', department)
    .order('entered_stage_at', { ascending: true });
  if (error) {
    console.error('Failed to fetch entities by department:', error);
    return [];
  }
  return (data || []) as unknown as LifecycleEntity[];
}

/**
 * Get entities stuck (SLA breached) across all departments
 */
export async function getStuckEntities(): Promise<(LifecycleEntity & { sla_minutes: number | null; stage_name: string })[]> {
  const [entities, stages] = await Promise.all([
    supabase.from('lifecycle_entities' as never).select('*').then(r => (r.data || []) as unknown as LifecycleEntity[]),
    getAllStages(),
  ]);
  const now = Date.now();
  return entities
    .map(e => {
      const stage = stages.find(s => s.stage_key === e.current_stage_key);
      return { ...e, sla_minutes: stage?.sla_minutes || null, stage_name: stage?.stage_name || e.current_stage_key };
    })
    .filter(e => {
      if (!e.sla_minutes) return false;
      const elapsed = (now - new Date(e.entered_stage_at).getTime()) / 60000;
      return elapsed > e.sla_minutes;
    });
}

// ---- Helpers ----

export function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

export function getLiveDurationMinutes(enteredAt: string): number {
  return (Date.now() - new Date(enteredAt).getTime()) / 60000;
}

/**
 * Check if an entity is SLA breached for its current stage
 */
export function isSlaBreached(entity: LifecycleEntity, slaMinutes: number | null): boolean {
  if (!slaMinutes) return false;
  return getLiveDurationMinutes(entity.entered_stage_at) > slaMinutes;
}

// Keep backward compat exports for existing LifecycleTimeline references
export type { LifecycleStage as StageHistoryRecord };
export type LifecycleEntityType_Old = 'LEAD' | 'QUOTE' | 'ORDER' | 'JOB' | 'INVOICE';
export { getDepartmentColor as getDepartmentColorLegacy };
