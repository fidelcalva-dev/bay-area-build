
-- Expand lead_events event_type check to support all omnichannel event types
ALTER TABLE public.lead_events DROP CONSTRAINT IF EXISTS lead_events_event_type_check;

ALTER TABLE public.lead_events ADD CONSTRAINT lead_events_event_type_check CHECK (
  event_type = ANY (ARRAY[
    'lead_created', 'lead_assigned_sales', 'lead_assigned_cs', 'lead_sales_timeout',
    'lead_callback_scheduled', 'lead_converted', 'lead_lost', 'lead_responded',
    'lead_note_added',
    'CREATED', 'DEDUPLICATED', 'ASSIGNED', 'STATUS_CHANGED',
    'STATUS_CHANGED_TO_NEW', 'STATUS_CHANGED_TO_CONTACTED', 'STATUS_CHANGED_TO_QUALIFIED',
    'STATUS_CHANGED_TO_QUOTED', 'STATUS_CHANGED_TO_CONVERTED', 'STATUS_CHANGED_TO_LOST',
    'STATUS_CHANGED_TO_BOOKED',
    'INBOUND_MESSAGE', 'OUTBOUND_MESSAGE', 'CALL_IN', 'CALL_OUT',
    'FORM_SUBMIT', 'QUOTE_CREATED', 'ORDER_CREATED', 'NOTE', 'AI_CLASSIFICATION',
    'INGEST', 'ROUTING_APPLIED', 'SLA_BREACH', 'FOLLOWUP_SENT'
  ]::text[])
);
