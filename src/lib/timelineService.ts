import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Timeline types matching database enums
export type TimelineEntityType = 'CUSTOMER' | 'ORDER' | 'LEAD' | 'RUN' | 'INVOICE' | 'QUOTE' | 'ASSET';
export type TimelineEventType = 
  | 'CALL' | 'SMS' | 'EMAIL' | 'QUOTE' | 'ORDER' | 'PAYMENT' | 'DISPATCH'
  | 'DELIVERY' | 'PICKUP' | 'SWAP' | 'PLACEMENT' | 'NOTE' | 'SYSTEM'
  | 'AI' | 'BILLING' | 'OVERDUE' | 'CONTAMINATION' | 'DUMP_TICKET';
export type TimelineEventAction = 
  | 'CREATED' | 'UPDATED' | 'SENT' | 'RECEIVED' | 'COMPLETED' | 'FAILED'
  | 'FLAGGED' | 'SCHEDULED' | 'CANCELLED' | 'ASSIGNED' | 'UPLOADED'
  | 'APPROVED' | 'REJECTED' | 'REFUNDED';
export type TimelineSource = 'USER' | 'SYSTEM' | 'AI' | 'WEBHOOK' | 'TRIGGER' | 'CRON';
export type TimelineVisibility = 'INTERNAL' | 'CUSTOMER';

export interface TimelineEvent {
  id: string;
  entity_type: TimelineEntityType;
  entity_id: string;
  customer_id: string | null;
  order_id: string | null;
  event_type: TimelineEventType;
  event_action: TimelineEventAction;
  source: TimelineSource;
  summary: string;
  details_json: Json;
  source_table: string | null;
  source_id: string | null;
  visibility: TimelineVisibility;
  created_by_user_id: string | null;
  actor_role: string | null;
  created_at: string;
  is_correction: boolean;
  corrects_event_id: string | null;
  correction_reason: string | null;
}

export interface LogEventParams {
  entityType: TimelineEntityType;
  entityId: string;
  eventType: TimelineEventType;
  eventAction: TimelineEventAction;
  summary: string;
  customerId?: string | null;
  orderId?: string | null;
  source?: TimelineSource;
  details?: Json;
  sourceTable?: string | null;
  sourceId?: string | null;
  visibility?: TimelineVisibility;
  actorRole?: string;
}

/**
 * Log a timeline event
 */
export async function logTimelineEvent(params: LogEventParams): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const insertData = {
      entity_type: params.entityType,
      entity_id: params.entityId,
      event_type: params.eventType,
      event_action: params.eventAction,
      summary: params.summary,
      customer_id: params.customerId || null,
      order_id: params.orderId || null,
      source: params.source || 'USER',
      details_json: params.details || {},
      source_table: params.sourceTable || null,
      source_id: params.sourceId || null,
      visibility: params.visibility || 'INTERNAL',
      actor_role: params.actorRole || null,
    };

    const { data, error } = await supabase
      .from('timeline_events' as never)
      .insert(insertData as never)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log timeline event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, eventId: (data as { id: string } | null)?.id };
  } catch (err) {
    console.error('Timeline event logging error:', err);
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Fetch timeline events for a customer
 */
export async function getCustomerTimeline(customerId: string, options?: {
  limit?: number;
  offset?: number;
  eventTypes?: TimelineEventType[];
}): Promise<{ events: TimelineEvent[]; count: number }> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  
  const { data, error, count } = await supabase
    .from('timeline_events' as never)
    .select('*', { count: 'exact' })
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch customer timeline:', error);
    return { events: [], count: 0 };
  }

  let events = (data || []) as unknown as TimelineEvent[];
  
  if (options?.eventTypes && options.eventTypes.length > 0) {
    events = events.filter(e => options.eventTypes!.includes(e.event_type));
  }

  return { events, count: count || 0 };
}

/**
 * Fetch timeline events for an order
 */
export async function getOrderTimeline(orderId: string): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('timeline_events' as never)
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch order timeline:', error);
    return [];
  }

  return (data || []) as unknown as TimelineEvent[];
}

/**
 * Fetch recent activity feed (company-wide)
 */
export async function getActivityFeed(options?: {
  limit?: number;
  offset?: number;
  eventTypes?: TimelineEventType[];
}): Promise<{ events: TimelineEvent[]; count: number }> {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const { data, error, count } = await supabase
    .from('timeline_events' as never)
    .select('*', { count: 'exact' })
    .eq('visibility', 'INTERNAL')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch activity feed:', error);
    return { events: [], count: 0 };
  }

  let events = (data || []) as unknown as TimelineEvent[];
  
  if (options?.eventTypes && options.eventTypes.length > 0) {
    events = events.filter(e => options.eventTypes!.includes(e.event_type));
  }

  return { events, count: count || 0 };
}

/**
 * Add a manual note to an entity's timeline
 */
export async function addTimelineNote(params: {
  entityType: TimelineEntityType;
  entityId: string;
  note: string;
  customerId?: string;
  orderId?: string;
  visibility?: TimelineVisibility;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  return logTimelineEvent({
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: 'NOTE',
    eventAction: 'CREATED',
    summary: params.note,
    customerId: params.customerId,
    orderId: params.orderId,
    source: 'USER',
    visibility: params.visibility || 'INTERNAL',
  });
}

/**
 * Get customer-visible timeline for portal
 */
export async function getCustomerPortalTimeline(customerId: string): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('timeline_events' as never)
    .select('*')
    .eq('customer_id', customerId)
    .eq('visibility', 'CUSTOMER')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch customer portal timeline:', error);
    return [];
  }

  return (data || []) as unknown as TimelineEvent[];
}
