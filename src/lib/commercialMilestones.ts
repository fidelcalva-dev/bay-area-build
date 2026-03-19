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
  // Progressive quote milestones
  address_saved:             { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Address saved',                  visibility: 'INTERNAL' as TimelineVisibility },
  material_selected:         { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Material type selected',         visibility: 'INTERNAL' as TimelineVisibility },
  size_selected:             { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Dumpster size selected',         visibility: 'INTERNAL' as TimelineVisibility },
  price_shown:               { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Price shown to customer',        visibility: 'INTERNAL' as TimelineVisibility },
  contact_captured:          { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Contact information captured',   visibility: 'INTERNAL' as TimelineVisibility },
  delivery_preference_saved: { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Delivery preference saved',      visibility: 'INTERNAL' as TimelineVisibility },
  placement_marked:          { eventType: 'PLACEMENT' as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Placement details marked',       visibility: 'INTERNAL' as TimelineVisibility },
  quote_ready:               { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Quote ready for review',         visibility: 'INTERNAL' as TimelineVisibility },
  // Quote document events
  quote_pdf_generated:       { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'CREATED'   as TimelineEventAction, summary: 'Quote PDF generated',            visibility: 'INTERNAL' as TimelineVisibility },
  quote_sent_email:          { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'SENT'      as TimelineEventAction, summary: 'Quote sent via email',           visibility: 'CUSTOMER' as TimelineVisibility },
  quote_sent_sms:            { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'SENT'      as TimelineEventAction, summary: 'Quote sent via SMS',             visibility: 'CUSTOMER' as TimelineVisibility },
  // Contract events
  contract_sent:             { eventType: 'SYSTEM'    as TimelineEventType, eventAction: 'SENT'      as TimelineEventAction, summary: 'Contract sent to customer',      visibility: 'CUSTOMER' as TimelineVisibility },
  contract_viewed:           { eventType: 'SYSTEM'    as TimelineEventType, eventAction: 'RECEIVED'  as TimelineEventAction, summary: 'Contract viewed by customer',    visibility: 'INTERNAL' as TimelineVisibility },
  contract_signed:           { eventType: 'SYSTEM'    as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Contract signed',                visibility: 'CUSTOMER' as TimelineVisibility },
  // Payment events
  payment_link_sent:         { eventType: 'PAYMENT'   as TimelineEventType, eventAction: 'SENT'      as TimelineEventAction, summary: 'Payment link sent',              visibility: 'CUSTOMER' as TimelineVisibility },
  payment_received:          { eventType: 'PAYMENT'   as TimelineEventType, eventAction: 'RECEIVED'  as TimelineEventAction, summary: 'Payment received',               visibility: 'CUSTOMER' as TimelineVisibility },
  // Order events
  order_created:             { eventType: 'ORDER'     as TimelineEventType, eventAction: 'CREATED'   as TimelineEventAction, summary: 'Order created from quote',       visibility: 'INTERNAL' as TimelineVisibility },
  order_ready_for_dispatch:  { eventType: 'ORDER'     as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Order ready for dispatch',       visibility: 'INTERNAL' as TimelineVisibility },
  // Placement events
  placement_pending_review:  { eventType: 'PLACEMENT' as TimelineEventType, eventAction: 'FLAGGED'   as TimelineEventAction, summary: 'Placement pending review',       visibility: 'INTERNAL' as TimelineVisibility },
  placement_approved:        { eventType: 'PLACEMENT' as TimelineEventType, eventAction: 'APPROVED'  as TimelineEventAction, summary: 'Placement approved',             visibility: 'INTERNAL' as TimelineVisibility },
  // Operational events
  driver_issue_reported:     { eventType: 'DISPATCH'  as TimelineEventType, eventAction: 'FLAGGED'   as TimelineEventAction, summary: 'Driver reported an issue',       visibility: 'INTERNAL' as TimelineVisibility },
  extra_approved:            { eventType: 'BILLING'   as TimelineEventType, eventAction: 'APPROVED'  as TimelineEventAction, summary: 'Extra charge approved',          visibility: 'INTERNAL' as TimelineVisibility },
  invoice_ready:             { eventType: 'BILLING'   as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Invoice ready',                  visibility: 'CUSTOMER' as TimelineVisibility },
  // Abandonment/resume events
  quote_abandoned:           { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'CANCELLED' as TimelineEventAction, summary: 'Quote abandoned',                visibility: 'INTERNAL' as TimelineVisibility },
  quote_resumed:             { eventType: 'QUOTE'     as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Quote resumed from draft',       visibility: 'INTERNAL' as TimelineVisibility },
  price_override_applied:    { eventType: 'BILLING'   as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Price override applied',         visibility: 'INTERNAL' as TimelineVisibility },
  // Heavy material events
  heavy_material_selected:       { eventType: 'QUOTE'  as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Heavy material group selected',     visibility: 'INTERNAL' as TimelineVisibility },
  heavy_material_group_selected: { eventType: 'QUOTE'  as TimelineEventType, eventAction: 'UPDATED'   as TimelineEventAction, summary: 'Heavy material classification set', visibility: 'INTERNAL' as TimelineVisibility },
  heavy_material_quote_calculated: { eventType: 'QUOTE' as TimelineEventType, eventAction: 'COMPLETED' as TimelineEventAction, summary: 'Heavy material quote calculated', visibility: 'INTERNAL' as TimelineVisibility },
  // Notification events
  notification_sent:        { eventType: 'SYSTEM'   as TimelineEventType, eventAction: 'SENT'      as TimelineEventAction, summary: 'Notification sent',              visibility: 'INTERNAL' as TimelineVisibility },
  notification_failed:      { eventType: 'SYSTEM'   as TimelineEventType, eventAction: 'FAILED'    as TimelineEventAction, summary: 'Notification delivery failed',    visibility: 'INTERNAL' as TimelineVisibility },
} as const;

export type CommercialMilestone = keyof typeof COMMERCIAL_MILESTONES;

// ─── Ordered lifecycle sequence (for pipeline UIs) ─────────────
export const MILESTONE_ORDER: CommercialMilestone[] = [
  'lead_created',
  'quote_started',
  'address_saved',
  'material_selected',
  'size_selected',
  'price_shown',
  'contact_captured',
  'delivery_preference_saved',
  'placement_marked',
  'quote_ready',
  'quote_sent_email',
  'quote_sent_sms',
  'contract_sent',
  'contract_viewed',
  'contract_signed',
  'payment_link_sent',
  'payment_received',
  'order_created',
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
