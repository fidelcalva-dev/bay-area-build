INSERT INTO public.config_settings (key, value, category, description)
VALUES
  ('ghl.pipeline_stage_mapping', '{"lead_new":"New Lead","lead_contacted":"Contacted","quote_started":"Quote Started","price_shown":"Price Shown","contract_pending":"Contract Pending","payment_pending":"Payment Pending","ready_for_dispatch":"Ready for Dispatch","won":"Won","lost":"Lost"}', 'ghl', 'Calsan stage to GHL pipeline stage name mapping'),
  ('ghl.pipeline_id', '""', 'ghl', 'GHL Pipeline ID for opportunity sync'),
  ('ghl.workflow_routing', '{"lead_created":"","quote_started":"","contract_sent":"","payment_pending":"","order_completed":""}', 'ghl', 'Calsan event to GHL Workflow ID mapping'),
  ('ghl.contact_sync_enabled', 'true', 'ghl', 'Enable automatic contact sync to GHL'),
  ('ghl.inbound_sync_enabled', 'true', 'ghl', 'Enable inbound message call sync from GHL'),
  ('ghl.callback_calendar_id', '""', 'ghl', 'GHL Calendar ID for callback scheduling')
ON CONFLICT (key) DO NOTHING;