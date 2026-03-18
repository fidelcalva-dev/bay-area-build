/**
 * Canonical Commercial Milestones
 * 
 * These 14 milestones represent the complete commercial lifecycle.
 * Each maps to the timeline_events schema (event_type + event_action).
 * Use logMilestone() for consistent, traceable timeline entries.
 */

import { logTimelineEvent, type TimelineEntityType, type TimelineEventType, type TimelineEventAction, type TimelineVisibility, type TimelineSource } from './timelineService';
import type { Json } from '@/integrations/supabase/types';

// ─── Canonical milestone definitions ───────────────────────────
export const COMMERCIAL_MILESTONES = {
  lead_created:              { eventType: 'SYSTEM'    as TimelineEventType, eventAction: 'CREATED'   as TimelineEventAction, summary: 'Lead created',                   visibility: 'INTERNAL' as TimelineVisibility },
  quote_started:             { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'CREATED'   as TimelineEventAction, summary: 'Quote started',                  visibility: 'INTERNAL' as TimelineVisibility },
  quote_ready:               { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Quote ready for review',         visibility: 'INTERNAL' as TimelineVisibility },
  contract_sent:             { eventType: 'SYSTEM'    as TimelineEventType, eventAction: 'SENT'      as TimelineEventAction, summary: 'Contract sent to customer',      visibility: 'CUSTOMER' as TimelineVisibility },
  contract_viewed:           { eventType: 'SYSTEM'    as TimelineEventType, eventAction: 'RECEIVED'  as TimelineEventAction, summary: 'Contract viewed by customer',    visibility: 'INTERNAL' as TimelineVisibility },
  contract_signed:           { eventType: 'SYSTEM'    as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Contract signed',                visibility: 'CUSTOMER' as TimelineVisibility },
  payment_link_sent:         { eventType: 'PAYMENT'   as TimelineEventType, eventAction: 'SENT'      as TimelineEventAction, summary: 'Payment link sent',              visibility: 'CUSTOMER' as TimelineVisibility },
  payment_received:          { eventType: 'PAYMENT'   as TimelineEventType, eventAction: 'RECEIVED'  as TimelineEventAction, summary: 'Payment received',               visibility: 'CUSTOMER' as TimelineVisibility },
  order_ready_for_dispatch:  { eventType: 'ORDER'     as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Order ready for dispatch',       visibility: 'INTERNAL' as TimelineVisibility },
  placement_pending_review:  { eventType: 'PLACEMENT' as TimelineEventType, eventAction: 'FLAGGED'   as TimelineEventAction, summary: 'Placement pending review',       visibility: 'INTERNAL' as TimelineVisibility },
  placement_approved:        { eventType: 'PLACEMENT' as TimelineEventType, eventAction: 'APPROVED'  as TimelineEventAction, summary: 'Placement approved',             visibility: 'INTERNAL' as TimelineVisibility },
  driver_issue_reported:     { eventType: 'DISPATCH'  as TimelineEventType, eventAction: 'FLAGGED'   as TimelineEventAction, summary: 'Driver reported an issue',       visibility: 'INTERNAL' as TimelineVisibility },
  extra_approved:            { eventType: 'BILLING'   as TimelineEventType, eventAction: 'APPROVED'  as TimelineEventAction, summary: 'Extra charge approved',          visibility: 'INTERNAL' as TimelineVisibility },
  invoice_ready:             { eventType: 'BILLING'   as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Invoice ready',                  visibility: 'CUSTOMER' as TimelineVisibility },
} as const;

export type CommercialMilestone = keyof typeof COMMERCIAL_MILESTONES;

// ─── Ordered lifecycle sequence (for pipeline UIs) ─────────────
export const MILESTONE_ORDER: CommercialMilestone[] = [
  'lead_created',
  'quote_started',
  'quote_ready',
  'contract_sent',
  'contract_viewed',
  'contract_signed',
  'payment_link_sent',
  'payment_received',
  'order_ready_for_dispatch',
  'placement_pending_review',
  'placement_approved',
  'driver_issue_reported',
  'extra_approved',
  'invoice_ready',
];

// ─── Helper: log a milestone to the timeline ───────────────────
export interface MilestoneParams {
  milestone: CommercialMilestone;
  entityType: TimelineEntityType;
  entityId: string;
  customerId?: string | null;
  orderId?: string | null;
  details?: Record<string, unknown>;
  summaryOverride?: string;
  source?: TimelineSource;
}

export async function logMilestone(params: MilestoneParams) {
  const def = COMMERCIAL_MILESTONES[params.milestone];

  return logTimelineEvent({
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: def.eventType,
    eventAction: def.eventAction,
    summary: params.summaryOverride || def.summary,
    customerId: params.customerId,
    orderId: params.orderId,
    source: params.source || 'SYSTEM',
    visibility: def.visibility,
    details: {
      milestone: params.milestone,
      ...(params.details || {}),
    } as Json,
  });
}

export default COMMERCIAL_MILESTONES;
