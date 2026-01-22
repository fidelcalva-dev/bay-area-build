import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ConfigVersion {
  id: string;
  module: string;
  entityId: string | null;
  beforeData: Json;
  afterData: Json;
  proposedBy: string | null;
  proposedByEmail: string | null;
  approvedBy: string | null;
  approvedByEmail: string | null;
  status: 'proposed' | 'approved' | 'applied' | 'rejected' | 'rolled_back';
  reasonNote: string;
  isCritical: boolean;
  createdAt: string;
  appliedAt: string | null;
  rolledBackAt: string | null;
}

export interface PendingChange {
  id: string;
  module: string;
  entityId: string | null;
  entityType: string;
  currentData: Json;
  proposedData: Json;
  proposedBy: string;
  proposedByEmail: string | null;
  reasonNote: string;
  isCritical: boolean;
  expiresAt: string;
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewNote: string | null;
}

/**
 * Create a version record for a config change
 */
export async function createConfigVersion(params: {
  module: string;
  entityId?: string;
  beforeData?: Json;
  afterData: Json;
  reasonNote: string;
  isCritical?: boolean;
  status?: ConfigVersion['status'];
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('config_versions')
      .insert({
        module: params.module,
        entity_id: params.entityId || null,
        before_data: params.beforeData || null,
        after_data: params.afterData,
        proposed_by: user.id,
        proposed_by_email: user.email,
        reason_note: params.reasonNote,
        is_critical: params.isCritical || false,
        status: params.status || 'applied',
        applied_at: params.status === 'applied' ? new Date().toISOString() : null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, id: data.id };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to create version' 
    };
  }
}

/**
 * Create a pending change request for critical config updates
 */
export async function createPendingChange(params: {
  module: string;
  entityId?: string;
  entityType: string;
  currentData?: Json;
  proposedData: Json;
  reasonNote: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('config_pending_changes')
      .insert({
        module: params.module,
        entity_id: params.entityId || null,
        entity_type: params.entityType,
        current_data: params.currentData || null,
        proposed_data: params.proposedData,
        proposed_by: user.id,
        proposed_by_email: user.email,
        reason_note: params.reasonNote,
        is_critical: true,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, id: data.id };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to create pending change' 
    };
  }
}

/**
 * Approve a pending change and apply it
 */
export async function approvePendingChange(
  changeId: string,
  reviewNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('config_pending_changes')
      .update({
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_status: 'approved',
        review_note: reviewNote || null,
      })
      .eq('id', changeId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to approve change' 
    };
  }
}

/**
 * Reject a pending change
 */
export async function rejectPendingChange(
  changeId: string,
  reviewNote: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('config_pending_changes')
      .update({
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_status: 'rejected',
        review_note: reviewNote,
      })
      .eq('id', changeId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to reject change' 
    };
  }
}

/**
 * Rollback to a previous version
 */
export async function rollbackToVersion(
  versionId: string,
  reasonNote: string
): Promise<{ success: boolean; error?: string; rolledBackData?: Json }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Get the version to rollback to
    const { data: version, error: fetchError } = await supabase
      .from('config_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (fetchError) throw fetchError;
    if (!version) return { success: false, error: 'Version not found' };

    // Mark the version as rolled back
    const { error: updateError } = await supabase
      .from('config_versions')
      .update({
        status: 'rolled_back',
        rolled_back_at: new Date().toISOString(),
      })
      .eq('id', versionId);

    if (updateError) throw updateError;

    // Create a new version record for the rollback
    await createConfigVersion({
      module: version.module,
      entityId: version.entity_id,
      beforeData: version.after_data,
      afterData: version.before_data || {},
      reasonNote: `Rollback: ${reasonNote}`,
      isCritical: version.is_critical,
      status: 'applied',
    });

    return { 
      success: true, 
      rolledBackData: version.before_data 
    };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to rollback' 
    };
  }
}

/**
 * Get version history for a module
 */
export async function getVersionHistory(
  module: string,
  entityId?: string,
  limit = 20
): Promise<ConfigVersion[]> {
  let query = supabase
    .from('config_versions')
    .select('*')
    .eq('module', module)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (entityId) {
    query = query.eq('entity_id', entityId);
  }

  const { data } = await query;

  return (data || []).map((v) => ({
    id: v.id,
    module: v.module,
    entityId: v.entity_id,
    beforeData: v.before_data,
    afterData: v.after_data,
    proposedBy: v.proposed_by,
    proposedByEmail: v.proposed_by_email,
    approvedBy: v.approved_by,
    approvedByEmail: v.approved_by_email,
    status: v.status as ConfigVersion['status'],
    reasonNote: v.reason_note,
    isCritical: v.is_critical,
    createdAt: v.created_at,
    appliedAt: v.applied_at,
    rolledBackAt: v.rolled_back_at,
  }));
}

/**
 * Get pending changes for review
 */
export async function getPendingChanges(
  module?: string
): Promise<PendingChange[]> {
  let query = supabase
    .from('config_pending_changes')
    .select('*')
    .eq('review_status', 'pending')
    .order('created_at', { ascending: false });

  if (module) {
    query = query.eq('module', module);
  }

  const { data } = await query;

  return (data || []).map((c) => ({
    id: c.id,
    module: c.module,
    entityId: c.entity_id,
    entityType: c.entity_type,
    currentData: c.current_data,
    proposedData: c.proposed_data,
    proposedBy: c.proposed_by,
    proposedByEmail: c.proposed_by_email,
    reasonNote: c.reason_note,
    isCritical: c.is_critical,
    expiresAt: c.expires_at,
    createdAt: c.created_at,
    reviewedBy: c.reviewed_by,
    reviewedAt: c.reviewed_at,
    reviewStatus: c.review_status as PendingChange['reviewStatus'],
    reviewNote: c.review_note,
  }));
}
