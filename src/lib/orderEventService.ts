import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type OrderEventType =
  | 'ORDER_CREATED'
  | 'SCHEDULE_REQUESTED'
  | 'SCHEDULE_CONFIRMED'
  | 'SCHEDULE_CHANGED'
  | 'INVENTORY_RESERVED'
  | 'INVENTORY_RELEASED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_STATUS_UPDATED'
  | 'TICKET_UPLOADED'
  | 'RECEIPT_SENT'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_STATUS_UPDATED'
  | 'STATUS_CHANGED'
  | 'NOTE_ADDED'
  | 'CANCELLED';

export type ScheduleAction = 'requested' | 'confirmed' | 'changed' | 'cancelled';

interface EventParams {
  orderId: string;
  eventType: OrderEventType;
  message?: string;
  beforeJson?: Json;
  afterJson?: Json;
}

interface ScheduleLogParams {
  orderId: string;
  action: ScheduleAction;
  oldDate?: string | null;
  oldWindow?: string | null;
  newDate?: string | null;
  newWindow?: string | null;
  reason?: string;
}

async function getCurrentActor(): Promise<{ actorId: string | null; actorRole: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { actorId: null, actorRole: null };

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .limit(1);

    return {
      actorId: user.id,
      actorRole: roles?.[0]?.role || null,
    };
  } catch {
    return { actorId: null, actorRole: null };
  }
}

/**
 * Log an order event to the order_events table
 */
export async function logOrderEvent({
  orderId,
  eventType,
  message,
  beforeJson,
  afterJson,
}: EventParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { actorId, actorRole } = await getCurrentActor();

    const { error } = await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: eventType,
      actor_role: actorRole,
      actor_id: actorId,
      message: message || generateDefaultMessage(eventType, beforeJson, afterJson),
      before_json: beforeJson ?? null,
      after_json: afterJson ?? null,
    });

    if (error) {
      console.error('Failed to log order event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Order event logging error:', err);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Log a schedule change to the schedule_logs table
 */
export async function logScheduleChange({
  orderId,
  action,
  oldDate,
  oldWindow,
  newDate,
  newWindow,
  reason,
}: ScheduleLogParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { actorId, actorRole } = await getCurrentActor();

    const { error } = await supabase.from('schedule_logs').insert({
      order_id: orderId,
      action,
      old_date: oldDate,
      old_window: oldWindow,
      new_date: newDate,
      new_window: newWindow,
      reason,
      actor_role: actorRole,
      actor_id: actorId,
    });

    if (error) {
      console.error('Failed to log schedule change:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Schedule log error:', err);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Fetch order events for display in UI
 */
export async function getOrderEvents(orderId: string): Promise<{
  events: Array<{
    id: string;
    event_type: string;
    actor_role: string | null;
    message: string | null;
    before_json: Json | null;
    after_json: Json | null;
    created_at: string;
  }>;
  scheduleLogs: Array<{
    id: string;
    action: string;
    old_date: string | null;
    old_window: string | null;
    new_date: string | null;
    new_window: string | null;
    reason: string | null;
    actor_role: string | null;
    created_at: string;
  }>;
}> {
  const [eventsResult, logsResult] = await Promise.all([
    supabase
      .from('order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false }),
    supabase
      .from('schedule_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false }),
  ]);

  return {
    events: eventsResult.data || [],
    scheduleLogs: logsResult.data || [],
  };
}

function generateDefaultMessage(
  eventType: OrderEventType,
  beforeJson?: Json,
  afterJson?: Json
): string {
  const messages: Record<OrderEventType, string> = {
    ORDER_CREATED: 'Order was created',
    SCHEDULE_REQUESTED: 'Schedule was requested',
    SCHEDULE_CONFIRMED: 'Schedule was confirmed',
    SCHEDULE_CHANGED: 'Schedule was changed',
    INVENTORY_RESERVED: 'Inventory was reserved',
    INVENTORY_RELEASED: 'Inventory was released',
    DRIVER_ASSIGNED: 'Driver was assigned',
    DRIVER_STATUS_UPDATED: 'Driver status was updated',
    TICKET_UPLOADED: 'Dump ticket was uploaded',
    RECEIPT_SENT: 'Service receipt was sent',
    PAYMENT_STATUS_UPDATED: 'Payment status was updated',
    PAYMENT_UPDATED: 'Payment was recorded',
    STATUS_CHANGED: `Status changed${beforeJson && afterJson ? ` from "${(beforeJson as any).status}" to "${(afterJson as any).status}"` : ''}`,
    NOTE_ADDED: 'Note was added',
    CANCELLED: 'Order was cancelled',
  };

  return messages[eventType] || `Event: ${eventType}`;
}
