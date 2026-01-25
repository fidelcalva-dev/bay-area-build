-- =========================================================
-- Phase 1: CRM Pipeline + Messaging Engine Tables
-- =========================================================

-- 1) Create pipeline stages enum for the sales funnel
CREATE TYPE public.pipeline_stage_type AS ENUM (
  'new_lead', 'quoted', 'follow_up', 'won_paid', 'scheduled',
  'delivered', 'pickup_requested', 'completed', 'overdue', 'lost'
);

-- 2) Pipelines table - Default "Dumpster Rental" pipeline
CREATE TABLE public.pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3) Pipeline Stages - Ordered stages within a pipeline
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  stage_type public.pipeline_stage_type NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  auto_advance_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4) Opportunities - Sales pipeline tracking (replaces GHL opportunities)
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id),
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id),
  stage_type public.pipeline_stage_type NOT NULL DEFAULT 'new_lead',
  value_estimate DECIMAL(10,2) DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  assigned_user_id UUID REFERENCES auth.users(id),
  source TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  lost_reason TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5) Tasks - Internal work tracking for remote team
CREATE TABLE public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'opportunity', 'order', 'contact', 'run', 'call', 'general')),
  entity_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),
  assigned_team TEXT,
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  due_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6) Notes - Internal notes on any entity
CREATE TABLE public.crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'opportunity', 'order', 'contact', 'run', 'call', 'general')),
  entity_id UUID NOT NULL,
  body TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7) Message Templates - SMS/Email templates
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'both')),
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'both')),
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8) Message Queue - Outbound message queue with DRY_RUN support
CREATE TABLE public.message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_address TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  contact_id UUID REFERENCES public.customers(id),
  entity_type TEXT,
  entity_id UUID,
  template_key TEXT REFERENCES public.message_templates(key),
  subject TEXT,
  body TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  mode TEXT DEFAULT 'DRY_RUN' CHECK (mode IN ('DRY_RUN', 'LIVE')),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9) Message Logs - Full history of sent messages
CREATE TABLE public.message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES public.message_queue(id),
  channel TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  provider TEXT,
  provider_message_id TEXT,
  status TEXT NOT NULL,
  response JSONB,
  error_message TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10) Call Routing Rules - How calls are routed
CREATE TABLE public.call_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose public.phone_purpose NOT NULL,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  business_hours_only BOOLEAN DEFAULT true,
  overflow_to_voicemail BOOLEAN DEFAULT true,
  max_ring_time INTEGER DEFAULT 30,
  round_robin BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =========================================================
-- Indexes for Performance
-- =========================================================
CREATE INDEX idx_opportunities_contact ON public.opportunities(contact_id);
CREATE INDEX idx_opportunities_lead ON public.opportunities(lead_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage_id);
CREATE INDEX idx_opportunities_assigned ON public.opportunities(assigned_user_id);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_crm_tasks_entity ON public.crm_tasks(entity_type, entity_id);
CREATE INDEX idx_crm_tasks_assigned ON public.crm_tasks(assigned_user_id, status);
CREATE INDEX idx_crm_tasks_due ON public.crm_tasks(due_at) WHERE completed_at IS NULL;
CREATE INDEX idx_crm_notes_entity ON public.crm_notes(entity_type, entity_id);
CREATE INDEX idx_message_queue_status ON public.message_queue(status, scheduled_for);
CREATE INDEX idx_message_queue_contact ON public.message_queue(contact_id);
CREATE INDEX idx_message_logs_queue ON public.message_logs(queue_id);

-- =========================================================
-- Enable RLS on All Tables
-- =========================================================
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_routing_rules ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS Policies - Staff access only
-- =========================================================

-- Pipelines (read for all authenticated, write for admin)
CREATE POLICY "Staff can view pipelines" ON public.pipelines
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage pipelines" ON public.pipelines
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Pipeline Stages (read for all authenticated, write for admin)
CREATE POLICY "Staff can view pipeline stages" ON public.pipeline_stages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage pipeline stages" ON public.pipeline_stages
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Opportunities (sales/cs/admin can manage)
CREATE POLICY "Staff can view opportunities" ON public.opportunities
  FOR SELECT TO authenticated 
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Staff can manage opportunities" ON public.opportunities
  FOR ALL TO authenticated 
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));

-- CRM Tasks (assigned user or staff can view/manage)
CREATE POLICY "Staff can view tasks" ON public.crm_tasks
  FOR SELECT TO authenticated 
  USING (
    assigned_user_id = auth.uid() OR 
    public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[])
  );

CREATE POLICY "Staff can manage tasks" ON public.crm_tasks
  FOR ALL TO authenticated 
  USING (
    assigned_user_id = auth.uid() OR 
    public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[])
  );

-- CRM Notes (staff only)
CREATE POLICY "Staff can view notes" ON public.crm_notes
  FOR SELECT TO authenticated 
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Staff can create notes" ON public.crm_notes
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

-- Message Templates (read for staff, write for admin)
CREATE POLICY "Staff can view message templates" ON public.message_templates
  FOR SELECT TO authenticated 
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Admins can manage message templates" ON public.message_templates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Message Queue (staff can view/create)
CREATE POLICY "Staff can view message queue" ON public.message_queue
  FOR SELECT TO authenticated 
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Staff can create messages" ON public.message_queue
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Admins can manage message queue" ON public.message_queue
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Message Logs (read only for staff)
CREATE POLICY "Staff can view message logs" ON public.message_logs
  FOR SELECT TO authenticated 
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

-- Call Routing Rules (admin only)
CREATE POLICY "Staff can view routing rules" ON public.call_routing_rules
  FOR SELECT TO authenticated 
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

CREATE POLICY "Admins can manage routing rules" ON public.call_routing_rules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- Seed Default Pipeline & Stages
-- =========================================================
INSERT INTO public.pipelines (name, description, is_default) VALUES 
  ('Dumpster Rental', 'Primary sales pipeline for dumpster rentals', true);

INSERT INTO public.pipeline_stages (pipeline_id, stage_type, name, position, color) 
SELECT 
  p.id,
  stage.stage_type::pipeline_stage_type,
  stage.name,
  stage.position,
  stage.color
FROM public.pipelines p
CROSS JOIN (VALUES
  ('new_lead', 'New Lead', 1, '#6366F1'),
  ('quoted', 'Quoted', 2, '#8B5CF6'),
  ('follow_up', 'Follow-Up', 3, '#EC4899'),
  ('won_paid', 'Won/Paid', 4, '#10B981'),
  ('scheduled', 'Scheduled', 5, '#3B82F6'),
  ('delivered', 'Delivered', 6, '#14B8A6'),
  ('pickup_requested', 'Pickup Requested', 7, '#F59E0B'),
  ('completed', 'Completed', 8, '#22C55E'),
  ('overdue', 'Overdue', 9, '#EF4444'),
  ('lost', 'Lost', 10, '#6B7280')
) AS stage(stage_type, name, position, color)
WHERE p.is_default = true;

-- =========================================================
-- Seed Core Message Templates
-- =========================================================
INSERT INTO public.message_templates (key, channel, name, subject, body, variables, category, language) VALUES
  ('quote_created', 'sms', 'Quote Created', NULL, 
   'Hi {{customer_name}}! Your dumpster quote is ready: {{quote_link}} - Reply or call (510) 680-2150 with questions. - Calsan Dumpsters', 
   '["customer_name", "quote_link"]'::jsonb, 'sales', 'en'),
  
  ('quote_created_es', 'sms', 'Cotización Creada', NULL, 
   'Hola {{customer_name}}! Su cotización está lista: {{quote_link}} - Responda o llame al (510) 680-2150. - Calsan Dumpsters', 
   '["customer_name", "quote_link"]'::jsonb, 'sales', 'es'),
  
  ('order_confirmed', 'sms', 'Order Confirmed', NULL, 
   'Your dumpster order #{{order_number}} is confirmed! Delivery: {{delivery_date}} {{delivery_window}}. Track at: {{portal_link}} - Calsan', 
   '["order_number", "delivery_date", "delivery_window", "portal_link"]'::jsonb, 'operations', 'en'),
  
  ('delivery_reminder', 'sms', 'Delivery Reminder', NULL, 
   'Reminder: Your dumpster delivery is tomorrow {{delivery_date}} during {{delivery_window}}. Questions? (510) 680-2150 - Calsan', 
   '["delivery_date", "delivery_window"]'::jsonb, 'operations', 'en'),
  
  ('pickup_scheduled', 'sms', 'Pickup Scheduled', NULL, 
   'Your dumpster pickup is scheduled for {{pickup_date}}. Make sure the area is accessible. Questions? (510) 680-2150 - Calsan', 
   '["pickup_date"]'::jsonb, 'operations', 'en'),
  
  ('overdue_notice', 'sms', 'Overdue Notice', NULL, 
   'Your dumpster rental is overdue. Daily charges of ${{daily_rate}} apply. Schedule pickup: {{portal_link}} or call (510) 680-2150 - Calsan', 
   '["daily_rate", "portal_link"]'::jsonb, 'billing', 'en'),
  
  ('payment_received', 'sms', 'Payment Received', NULL, 
   'Thank you! We received your payment of ${{amount}} for order #{{order_number}}. Receipt: {{receipt_link}} - Calsan Dumpsters', 
   '["amount", "order_number", "receipt_link"]'::jsonb, 'billing', 'en'),
  
  ('payment_request', 'sms', 'Payment Request', NULL, 
   'Invoice ready for order #{{order_number}}: ${{amount}} due. Pay securely: {{payment_link}} - Calsan Dumpsters', 
   '["order_number", "amount", "payment_link"]'::jsonb, 'billing', 'en'),
  
  ('lead_followup', 'sms', 'Lead Follow-Up', NULL, 
   'Hi {{customer_name}}! Following up on your dumpster inquiry. Ready to schedule? Reply YES or call (510) 680-2150 - Calsan', 
   '["customer_name"]'::jsonb, 'sales', 'en'),
  
  ('missed_call', 'sms', 'Missed Call', NULL, 
   'Sorry we missed your call! A team member will call you back shortly. Need immediate help? Text us here. - Calsan Dumpsters', 
   '[]'::jsonb, 'general', 'en');

-- =========================================================
-- Enable Realtime for key tables
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_queue;

-- =========================================================
-- Updated Triggers
-- =========================================================
CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_call_routing_rules_updated_at
  BEFORE UPDATE ON public.call_routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();