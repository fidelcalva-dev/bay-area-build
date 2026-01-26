-- Add LIVE_INTERNAL to notifications_outbox mode check constraint
ALTER TABLE public.notifications_outbox 
DROP CONSTRAINT notifications_outbox_mode_check;

ALTER TABLE public.notifications_outbox 
ADD CONSTRAINT notifications_outbox_mode_check 
CHECK (mode = ANY (ARRAY['DRY_RUN'::text, 'LIVE'::text, 'LIVE_INTERNAL'::text]));

-- Add SKIPPED status to notifications_outbox
ALTER TABLE public.notifications_outbox 
DROP CONSTRAINT notifications_outbox_status_check;

ALTER TABLE public.notifications_outbox 
ADD CONSTRAINT notifications_outbox_status_check 
CHECK (status = ANY (ARRAY['PENDING'::text, 'SENT'::text, 'FAILED'::text, 'DRAFTED'::text, 'SKIPPED'::text]));

-- Add GOOGLE_CHAT to channel options
ALTER TABLE public.notifications_outbox 
DROP CONSTRAINT notifications_outbox_channel_check;

ALTER TABLE public.notifications_outbox 
ADD CONSTRAINT notifications_outbox_channel_check 
CHECK (channel = ANY (ARRAY['IN_APP'::text, 'EMAIL'::text, 'SMS'::text, 'SLACK'::text, 'GOOGLE_CHAT'::text, 'CALL'::text]));

-- Add DRIVER and FINANCE to target teams
ALTER TABLE public.notifications_outbox 
DROP CONSTRAINT notifications_outbox_target_team_check;

ALTER TABLE public.notifications_outbox 
ADD CONSTRAINT notifications_outbox_target_team_check 
CHECK (target_team = ANY (ARRAY['SALES'::text, 'CS'::text, 'DISPATCH'::text, 'BILLING'::text, 'ADMIN'::text, 'EXECUTIVE'::text, 'DRIVER'::text, 'FINANCE'::text, 'OPERATIONS'::text]));