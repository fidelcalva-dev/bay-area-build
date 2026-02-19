
-- Add missing columns to sales_leads
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS lng double precision;
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS material_category text;
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS size_preference text;
ALTER TABLE public.sales_leads ADD COLUMN IF NOT EXISTS last_contacted_by_user_id uuid;

-- Insert missing lead_channels
INSERT INTO public.lead_channels (channel_key, display_name, icon, description, is_active) VALUES
  ('WEBSITE_ORDER_NOW', 'Website Order Now', '🛒', 'Direct order now form submission', true),
  ('WEBSITE_CONTACT', 'Website Contact', '📝', 'Website contact form submission', true),
  ('AI_CHAT', 'AI Chat', '🤖', 'AI chatbot conversation', true),
  ('PORTAL', 'Customer Portal', '🏠', 'Customer portal requests (schedule/pay/pickup)', true),
  ('EMAIL_INBOUND', 'Email Inbound', '📧', 'Inbound email from customers', true),
  ('LEAD_PLATFORM', 'Lead Platform', '📋', 'Third-party lead platforms (Angi, Thumbtack, etc.)', true),
  ('MANUAL_ENTRY', 'Manual Entry', '✏️', 'Manually entered by staff', true),
  ('ANGI', 'Angi', '🔧', 'Angi / HomeAdvisor leads', true),
  ('THUMBTACK', 'Thumbtack', '📌', 'Thumbtack leads', true)
ON CONFLICT (channel_key) DO NOTHING;

-- Insert missing routing rules
INSERT INTO public.lead_routing_rules (rule_name, source_channel, assign_team, sla_minutes, priority, is_active) VALUES
  ('Website Order Now -> Sales', 'WEBSITE_ORDER_NOW', 'sales', 10, 15, true),
  ('Website Contact -> Sales', 'WEBSITE_CONTACT', 'sales', 15, 22, true),
  ('AI Chat -> Sales', 'AI_CHAT', 'sales', 15, 23, true),
  ('Portal Request -> CS', 'PORTAL', 'cs', 30, 18, true),
  ('Email Inbound -> Sales', 'EMAIL_INBOUND', 'sales', 30, 28, true),
  ('Lead Platform -> Sales', 'LEAD_PLATFORM', 'sales', 15, 24, true),
  ('Manual Entry -> Sales', 'MANUAL_ENTRY', 'sales', 60, 50, true),
  ('Angi -> Sales', 'ANGI', 'sales', 15, 26, true),
  ('Thumbtack -> Sales', 'THUMBTACK', 'sales', 15, 27, true)
ON CONFLICT DO NOTHING;
