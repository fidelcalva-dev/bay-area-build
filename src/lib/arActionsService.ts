import { supabase } from '@/integrations/supabase/client';
import { createAuditLog } from './auditLog';
import type { Json } from '@/integrations/supabase/types';

export type ARActionType = 
  | 'reminder_sent'
  | 'payment_request_sent'
  | 'dispute_marked'
  | 'dispute_resolved'
  | 'collections_flagged'
  | 'note_added'
  | 'payment_received'
  | 'call_logged';

export type ARChannel = 'sms' | 'email' | 'phone' | 'system';

interface CreateARActionParams {
  invoiceId: string;
  orderId?: string;
  customerId?: string;
  actionType: ARActionType;
  channel?: ARChannel;
  notes?: string;
  metadata?: Json;
}

export async function createARAction({
  invoiceId,
  orderId,
  customerId,
  actionType,
  channel,
  notes,
  metadata = {},
}: CreateARActionParams): Promise<{ success: boolean; error?: string; actionId?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('ar_actions')
      .insert([{
        invoice_id: invoiceId,
        order_id: orderId || null,
        customer_id: customerId || null,
        action_type: actionType,
        channel: channel || null,
        performed_by: user?.id || null,
        notes: notes || null,
        metadata,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create AR action:', error);
      return { success: false, error: error.message };
    }

    // Create audit log
    const auditActionMap: Record<ARActionType, string> = {
      reminder_sent: 'AR_REMINDER_SENT',
      payment_request_sent: 'AR_PAYMENT_REQUEST_SENT',
      dispute_marked: 'AR_DISPUTE_MARKED',
      dispute_resolved: 'AR_DISPUTE_RESOLVED',
      collections_flagged: 'AR_COLLECTIONS_FLAGGED',
      note_added: 'AR_NOTE_ADDED',
      payment_received: 'AR_PAYMENT_RECEIVED',
      call_logged: 'AR_CALL_LOGGED',
    };

    await createAuditLog({
      action: 'create',
      entityType: 'approval_request', // Using existing entity type for audit
      entityId: invoiceId,
      afterData: {
        ar_action_type: auditActionMap[actionType],
        channel,
        notes,
        metadata: metadata ?? null,
      },
      changesSummary: `AR Action: ${actionType} on invoice ${invoiceId}`,
    });

    return { success: true, actionId: data.id };
  } catch (err) {
    console.error('AR action error:', err);
    return { success: false, error: 'Unknown error creating AR action' };
  }
}

export async function markInvoiceDisputed(
  invoiceId: string,
  disputeReason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({
        payment_status: 'disputed',
        dispute_reason: disputeReason,
      })
      .eq('id', invoiceId);

    if (error) throw error;

    await createARAction({
      invoiceId,
      actionType: 'dispute_marked',
      channel: 'system',
      notes: disputeReason,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to mark invoice disputed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function flagForCollections(
  invoiceId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({
        collections_flagged: true,
      })
      .eq('id', invoiceId);

    if (error) throw error;

    await createARAction({
      invoiceId,
      actionType: 'collections_flagged',
      channel: 'system',
      notes,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to flag for collections:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function getARActionsForInvoice(
  invoiceId: string
): Promise<{ data: unknown[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('ar_actions')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  } catch (err) {
    console.error('Failed to fetch AR actions:', err);
    return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
