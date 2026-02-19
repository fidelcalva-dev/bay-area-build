-- Backfill NULL channel_key values in sales_leads
UPDATE public.sales_leads SET channel_key = 'WEBSITE' WHERE channel_key IS NULL;

-- Ensure email config keys exist (with required category column)
INSERT INTO public.config_settings (key, value, description, category) VALUES
  ('email.mode', '"DRY_RUN"', 'Email sending mode: DRY_RUN or LIVE', 'email'),
  ('email.domain_verified', 'false', 'Whether the sending domain is verified in Resend', 'email'),
  ('email.from_email', '"noreply@calsandumpsterspro.com"', 'Default from email address', 'email'),
  ('email.from_name', '"Calsan Dumpsters Pro"', 'Default from display name', 'email'),
  ('email.reply_to', '"info@calsandumpsterspro.com"', 'Default reply-to address', 'email')
ON CONFLICT (key) DO NOTHING;