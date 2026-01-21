import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'status_change' 
  | 'config_edit'
  | 'schedule_confirm'
  | 'driver_status'
  | 'ticket_entry'
  | 'overage_approval'
  | 'discount_approval'
  | 'update_roles';

export type EntityType = 
  | 'order' 
  | 'quote' 
  | 'customer' 
  | 'driver' 
  | 'inventory'
  | 'config_settings'
  | 'pricing_zones'
  | 'dumpster_sizes'
  | 'pricing_extras'
  | 'city_rates'
  | 'toll_surcharges'
  | 'vendors'
  | 'yards'
  | 'user_roles'
  | 'service_receipt'
  | 'approval_request';

interface AuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  beforeData?: Json;
  afterData?: Json;
  changesSummary?: string;
}

/**
 * Create an audit log entry
 * Should be called after any significant action in the system
 */
export async function createAuditLog({
  action,
  entityType,
  entityId,
  beforeData,
  afterData,
  changesSummary,
}: AuditLogParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get user role if available
    let userRole: string | null = null;
    if (user) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .limit(1);
      
      userRole = roles?.[0]?.role || null;
    }

    const { error } = await supabase.from('audit_logs').insert([{
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_data: beforeData ?? null,
      after_data: afterData ?? null,
      changes_summary: changesSummary,
      user_id: user?.id,
      user_email: user?.email,
      user_role: userRole,
    }]);

    if (error) {
      console.error('Failed to create audit log:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Audit log error:', err);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Create a status change audit log
 */
export async function logStatusChange(
  entityType: EntityType,
  entityId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  await createAuditLog({
    action: 'status_change',
    entityType,
    entityId,
    beforeData: { status: oldStatus } as Json,
    afterData: { status: newStatus } as Json,
    changesSummary: `Status changed from "${oldStatus}" to "${newStatus}"`,
  });
}

/**
 * Create a config edit audit log
 */
export async function logConfigEdit(
  entityType: EntityType,
  entityId: string,
  field: string,
  oldValue: unknown,
  newValue: unknown
): Promise<void> {
  await createAuditLog({
    action: 'config_edit',
    entityType,
    entityId,
    beforeData: { [field]: oldValue } as Json,
    afterData: { [field]: newValue } as Json,
    changesSummary: `${field} changed from "${oldValue}" to "${newValue}"`,
  });
}
