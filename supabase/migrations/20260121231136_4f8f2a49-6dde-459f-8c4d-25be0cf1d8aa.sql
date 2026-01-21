-- =====================================================
-- PHASE 2: SERVICE REQUESTS, CS QUEUE, SMS TEMPLATES
-- =====================================================

-- 1) Create SMS Templates table for CS
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  template_body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general', -- confirmation, reminder, receipt, marketing
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage SMS templates"
ON public.sms_templates FOR ALL
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

CREATE POLICY "Anyone can read SMS templates"
ON public.sms_templates FOR SELECT
USING (is_active = true);

-- Insert default SMS templates
INSERT INTO public.sms_templates (template_key, template_name, template_body, variables, category) VALUES
('quote_saved', 'Quote Saved', 'Hi {{name}}, your dumpster quote has been saved! View it at {{link}}. Questions? Call us at (510) 370-5600. - Calsan', ARRAY['name', 'link'], 'confirmation'),
('schedule_confirmed', 'Schedule Confirmed', 'Your dumpster delivery is confirmed for {{date}} ({{window}}). Address: {{address}}. We''ll text before arrival. - Calsan', ARRAY['date', 'window', 'address'], 'confirmation'),
('en_route', 'Driver En Route', 'Your driver is on the way! Estimated arrival: {{eta}}. Please ensure the placement area is clear. - Calsan', ARRAY['eta'], 'notification'),
('delivered', 'Delivery Complete', 'Your dumpster has been delivered! Rental period: {{days}} days. Questions? Call (510) 370-5600. - Calsan', ARRAY['days'], 'confirmation'),
('pickup_scheduled', 'Pickup Scheduled', 'Pickup confirmed for {{date}} ({{window}}). Please ensure dumpster is accessible. - Calsan', ARRAY['date', 'window'], 'confirmation'),
('receipt_sent', 'Receipt Ready', 'Your service receipt is ready: {{link}}. Total: ${{amount}}. Thank you for choosing Calsan! - Calsan', ARRAY['link', 'amount'], 'receipt'),
('after_hours', 'After Hours Auto-Reply', 'Thanks for reaching out! Our office hours are 6am-9pm daily. We''ll respond first thing. For emergencies: (510) 370-5600. - Calsan', ARRAY[]::text[], 'system'),
('weekend_request', 'Weekend Request', 'Weekend delivery requests require confirmation. We''ll follow up within 1 business day. - Calsan', ARRAY[]::text[], 'system')
ON CONFLICT (template_key) DO NOTHING;

-- 2) Add CS-specific fields to service_requests if not exists
ALTER TABLE public.service_requests 
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'portal',
ADD COLUMN IF NOT EXISTS response_sent_at TIMESTAMPTZ;

-- 3) Create message history table for CS
CREATE TABLE IF NOT EXISTS public.message_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_phone TEXT,
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  channel TEXT NOT NULL DEFAULT 'sms', -- 'sms', 'email'
  template_key TEXT,
  message_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed'
  sent_by UUID,
  external_id TEXT, -- Twilio message SID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view message history"
ON public.message_history FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'sales'::app_role]));

CREATE POLICY "Staff can send messages"
ON public.message_history FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'sales'::app_role]));

-- 4) Create ZIP warnings table for distance caps
CREATE TABLE IF NOT EXISTS public.distance_caps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bracket_name TEXT NOT NULL,
  min_miles NUMERIC NOT NULL DEFAULT 0,
  max_miles NUMERIC,
  action TEXT NOT NULL DEFAULT 'manual_review', -- 'allow', 'manual_review', 'reject'
  surcharge_amount NUMERIC DEFAULT 0,
  message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.distance_caps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view distance caps"
ON public.distance_caps FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage distance caps"
ON public.distance_caps FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default distance caps
INSERT INTO public.distance_caps (bracket_name, min_miles, max_miles, action, surcharge_amount, message) VALUES
('Standard', 0, 25, 'allow', 0, NULL),
('Extended', 25, 40, 'allow', 50, 'Extended distance surcharge applies'),
('Far', 40, 60, 'manual_review', 100, 'Requires manual review for scheduling'),
('Out of Range', 60, NULL, 'reject', 0, 'Currently outside service area')
ON CONFLICT DO NOTHING;

-- 5) Add HighLevel integration fields to quotes
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS highlevel_contact_id TEXT,
ADD COLUMN IF NOT EXISTS highlevel_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- 6) Create trigger for updated_at on new tables
CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON public.sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_assigned ON public.service_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_message_history_order ON public.message_history(order_id);
CREATE INDEX IF NOT EXISTS idx_message_history_customer ON public.message_history(customer_id);