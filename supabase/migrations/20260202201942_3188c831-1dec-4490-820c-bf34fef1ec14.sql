-- =============================================
-- CUSTOMER 360 TIMELINE & NOTIFICATION SYSTEM
-- =============================================

-- Create enums for the timeline system
CREATE TYPE public.timeline_entity_type AS ENUM (
  'CUSTOMER', 'ORDER', 'LEAD', 'RUN', 'INVOICE', 'QUOTE', 'ASSET'
);

CREATE TYPE public.timeline_event_type AS ENUM (
  'CALL', 'SMS', 'EMAIL', 'QUOTE', 'ORDER', 'PAYMENT', 'DISPATCH', 
  'DELIVERY', 'PICKUP', 'SWAP', 'PLACEMENT', 'NOTE', 'SYSTEM', 
  'AI', 'BILLING', 'OVERDUE', 'CONTAMINATION', 'DUMP_TICKET'
);

CREATE TYPE public.timeline_event_action AS ENUM (
  'CREATED', 'UPDATED', 'SENT', 'RECEIVED', 'COMPLETED', 'FAILED', 
  'FLAGGED', 'SCHEDULED', 'CANCELLED', 'ASSIGNED', 'UPLOADED', 
  'APPROVED', 'REJECTED', 'REFUNDED'
);

CREATE TYPE public.timeline_source AS ENUM (
  'USER', 'SYSTEM', 'AI', 'WEBHOOK', 'TRIGGER', 'CRON'
);

CREATE TYPE public.timeline_visibility AS ENUM (
  'INTERNAL', 'CUSTOMER'
);

CREATE TYPE public.notification_priority AS ENUM (
  'LOW', 'NORMAL', 'HIGH', 'CRITICAL'
);

CREATE TYPE public.notification_channel AS ENUM (
  'IN_APP', 'SMS', 'EMAIL', 'SLACK', 'GOOGLE_CHAT'
);

-- =============================================
-- MASTER TIMELINE EVENTS TABLE
-- =============================================
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type timeline_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  event_type timeline_event_type NOT NULL,
  event_action timeline_event_action NOT NULL,
  source timeline_source NOT NULL DEFAULT 'SYSTEM',
  summary TEXT NOT NULL,
  details_json JSONB DEFAULT '{}'::jsonb,
  source_table TEXT,
  source_id UUID,
  visibility timeline_visibility NOT NULL DEFAULT 'INTERNAL',
  created_by_user_id UUID,
  actor_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_correction BOOLEAN DEFAULT false,
  corrects_event_id UUID REFERENCES public.timeline_events(id),
  correction_reason TEXT
);

CREATE INDEX idx_timeline_events_customer ON public.timeline_events(customer_id, created_at DESC) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_timeline_events_order ON public.timeline_events(order_id, created_at DESC) WHERE order_id IS NOT NULL;
CREATE INDEX idx_timeline_events_entity ON public.timeline_events(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_timeline_events_type ON public.timeline_events(event_type, created_at DESC);
CREATE INDEX idx_timeline_events_visibility ON public.timeline_events(visibility, created_at DESC);
CREATE INDEX idx_timeline_events_created ON public.timeline_events(created_at DESC);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies using user_id (correct column name)
CREATE POLICY "Staff can view internal events" ON public.timeline_events
  FOR SELECT TO authenticated
  USING (
    visibility = 'INTERNAL' 
    AND public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'dispatcher', 'finance', 'ops_admin']::app_role[])
  );

CREATE POLICY "Staff can insert events" ON public.timeline_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'dispatcher', 'finance', 'ops_admin']::app_role[])
  );

CREATE POLICY "Customers can view their own customer-visible events" ON public.timeline_events
  FOR SELECT TO authenticated
  USING (
    visibility = 'CUSTOMER'
    AND customer_id IN (
      SELECT id FROM public.customers WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- STAFF NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.staff_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID REFERENCES public.timeline_events(id) ON DELETE CASCADE,
  notification_type timeline_event_type NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'NORMAL',
  channel notification_channel NOT NULL DEFAULT 'IN_APP',
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_notifications_user ON public.staff_notifications(user_id, created_at DESC);
CREATE INDEX idx_staff_notifications_unread ON public.staff_notifications(user_id, read_at) WHERE read_at IS NULL;

ALTER TABLE public.staff_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON public.staff_notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.staff_notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.staff_notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- =============================================
-- NOTIFICATION RULES TABLE
-- =============================================
CREATE TABLE public.notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  event_type timeline_event_type NOT NULL,
  event_action timeline_event_action,
  priority notification_priority NOT NULL DEFAULT 'NORMAL',
  channels JSONB NOT NULL DEFAULT '["IN_APP"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, event_type, event_action)
);

ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notification rules" ON public.notification_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view notification rules" ON public.notification_rules
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'dispatcher', 'finance', 'ops_admin']::app_role[]));

-- =============================================
-- HELPER FUNCTION: LOG TIMELINE EVENT
-- =============================================
CREATE OR REPLACE FUNCTION public.log_timeline_event(
  p_entity_type timeline_entity_type,
  p_entity_id UUID,
  p_event_type timeline_event_type,
  p_event_action timeline_event_action,
  p_summary TEXT,
  p_customer_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_source timeline_source DEFAULT 'SYSTEM',
  p_details_json JSONB DEFAULT '{}'::jsonb,
  p_source_table TEXT DEFAULT NULL,
  p_source_id UUID DEFAULT NULL,
  p_visibility timeline_visibility DEFAULT 'INTERNAL',
  p_actor_role TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  INSERT INTO public.timeline_events (
    entity_type, entity_id, customer_id, order_id,
    event_type, event_action, source, summary, details_json,
    source_table, source_id, visibility, created_by_user_id, actor_role
  ) VALUES (
    p_entity_type, p_entity_id, p_customer_id, p_order_id,
    p_event_type, p_event_action, p_source, p_summary, p_details_json,
    p_source_table, p_source_id, p_visibility, v_user_id, p_actor_role
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- =============================================
-- HELPER FUNCTION: CREATE NOTIFICATION
-- =============================================
CREATE OR REPLACE FUNCTION public.create_staff_notification(
  p_user_id UUID,
  p_event_id UUID,
  p_notification_type timeline_event_type,
  p_priority notification_priority,
  p_channel notification_channel,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.staff_notifications (
    user_id, event_id, notification_type, priority, channel,
    title, message, action_url
  ) VALUES (
    p_user_id, p_event_id, p_notification_type, p_priority, p_channel,
    p_title, p_message, p_action_url
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- =============================================
-- TRIGGER: AUTO-LOG CALL EVENTS
-- =============================================
CREATE OR REPLACE FUNCTION public.auto_log_call_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_summary TEXT;
  v_action timeline_event_action;
BEGIN
  v_action := CASE NEW.call_status
    WHEN 'COMPLETED' THEN 'COMPLETED'
    WHEN 'ANSWERED' THEN 'RECEIVED'
    WHEN 'MISSED' THEN 'FAILED'
    WHEN 'VOICEMAIL' THEN 'RECEIVED'
    WHEN 'FAILED' THEN 'FAILED'
    ELSE 'CREATED'
  END;
  
  v_summary := CASE NEW.direction
    WHEN 'INBOUND' THEN 'Inbound call from ' || COALESCE(NEW.caller_name, NEW.from_number)
    ELSE 'Outbound call to ' || NEW.to_number
  END;
  
  IF NEW.duration_seconds IS NOT NULL AND NEW.duration_seconds > 0 THEN
    v_summary := v_summary || ' (' || (NEW.duration_seconds / 60) || 'm ' || (NEW.duration_seconds % 60) || 's)';
  END IF;
  
  v_customer_id := NEW.contact_id;
  
  PERFORM public.log_timeline_event(
    p_entity_type := CASE WHEN v_customer_id IS NOT NULL THEN 'CUSTOMER'::timeline_entity_type ELSE 'ORDER'::timeline_entity_type END,
    p_entity_id := COALESCE(v_customer_id, NEW.order_id, NEW.id),
    p_event_type := 'CALL'::timeline_event_type,
    p_event_action := v_action,
    p_summary := v_summary,
    p_customer_id := v_customer_id,
    p_order_id := NEW.order_id,
    p_source := 'TRIGGER'::timeline_source,
    p_details_json := jsonb_build_object(
      'direction', NEW.direction,
      'status', NEW.call_status,
      'duration_seconds', NEW.duration_seconds,
      'from_number', NEW.from_number,
      'to_number', NEW.to_number,
      'call_source', NEW.call_source
    ),
    p_source_table := 'call_events',
    p_source_id := NEW.id,
    p_visibility := 'INTERNAL'::timeline_visibility
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_call_timeline
  AFTER UPDATE OF call_status ON public.call_events
  FOR EACH ROW
  WHEN (OLD.call_status IS DISTINCT FROM NEW.call_status)
  EXECUTE FUNCTION public.auto_log_call_timeline();

-- =============================================
-- TRIGGER: AUTO-LOG ORDER EVENTS
-- =============================================
CREATE OR REPLACE FUNCTION public.auto_log_order_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_summary TEXT;
  v_action timeline_event_action;
  v_event_type timeline_event_type := 'ORDER';
BEGIN
  v_customer_id := NEW.customer_id;
  
  IF TG_OP = 'INSERT' THEN
    v_action := 'CREATED';
    v_summary := 'Order created';
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_action := CASE NEW.status
      WHEN 'scheduled' THEN 'SCHEDULED'
      WHEN 'delivered' THEN 'COMPLETED'
      WHEN 'completed' THEN 'COMPLETED'
      WHEN 'cancelled' THEN 'CANCELLED'
      ELSE 'UPDATED'
    END;
    
    v_event_type := CASE NEW.status
      WHEN 'delivered' THEN 'DELIVERY'
      WHEN 'scheduled' THEN 'DISPATCH'
      ELSE 'ORDER'
    END;
    
    v_summary := CASE NEW.status
      WHEN 'scheduled' THEN 'Order scheduled for delivery'
      WHEN 'delivered' THEN 'Dumpster delivered'
      WHEN 'completed' THEN 'Order completed'
      WHEN 'cancelled' THEN 'Order cancelled'
      ELSE 'Order status updated to ' || NEW.status
    END;
  ELSE
    RETURN NEW;
  END IF;
  
  PERFORM public.log_timeline_event(
    p_entity_type := 'ORDER'::timeline_entity_type,
    p_entity_id := NEW.id,
    p_event_type := v_event_type,
    p_event_action := v_action,
    p_summary := v_summary,
    p_customer_id := v_customer_id,
    p_order_id := NEW.id,
    p_source := 'TRIGGER'::timeline_source,
    p_details_json := jsonb_build_object(
      'status', NEW.status,
      'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END
    ),
    p_source_table := 'orders',
    p_source_id := NEW.id,
    p_visibility := 'CUSTOMER'::timeline_visibility
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_timeline_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_log_order_timeline();

CREATE TRIGGER trg_order_timeline_update
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.auto_log_order_timeline();

-- =============================================
-- TRIGGER: AUTO-LOG PAYMENT EVENTS
-- =============================================
CREATE OR REPLACE FUNCTION public.auto_log_payment_timeline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_summary TEXT;
BEGIN
  SELECT o.*, c.id as cust_id
  INTO v_order
  FROM public.orders o
  LEFT JOIN public.customers c ON c.id = o.customer_id
  WHERE o.id = NEW.order_id;
  
  v_summary := 'Payment of $' || NEW.amount || ' received via ' || COALESCE(NEW.payment_method, 'card');
  
  PERFORM public.log_timeline_event(
    p_entity_type := 'ORDER'::timeline_entity_type,
    p_entity_id := NEW.order_id,
    p_event_type := 'PAYMENT'::timeline_event_type,
    p_event_action := 'RECEIVED'::timeline_event_action,
    p_summary := v_summary,
    p_customer_id := v_order.cust_id,
    p_order_id := NEW.order_id,
    p_source := 'TRIGGER'::timeline_source,
    p_details_json := jsonb_build_object(
      'amount', NEW.amount,
      'payment_method', NEW.payment_method,
      'transaction_id', NEW.transaction_id
    ),
    p_source_table := 'payments',
    p_source_id := NEW.id,
    p_visibility := 'CUSTOMER'::timeline_visibility
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_payment_timeline
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_log_payment_timeline();

-- =============================================
-- SEED DEFAULT NOTIFICATION RULES
-- =============================================
INSERT INTO public.notification_rules (role, event_type, event_action, priority, channels, description) VALUES
('sales', 'CALL', 'RECEIVED', 'HIGH', '["IN_APP"]', 'Notify sales on incoming calls'),
('sales', 'QUOTE', 'CREATED', 'NORMAL', '["IN_APP"]', 'Notify sales on new quotes'),
('sales', 'ORDER', 'CREATED', 'NORMAL', '["IN_APP"]', 'Notify sales on new orders'),
('dispatcher', 'ORDER', 'SCHEDULED', 'NORMAL', '["IN_APP"]', 'Notify dispatch when orders are scheduled'),
('dispatcher', 'DELIVERY', 'COMPLETED', 'NORMAL', '["IN_APP"]', 'Notify dispatch on deliveries'),
('dispatcher', 'PICKUP', 'COMPLETED', 'NORMAL', '["IN_APP"]', 'Notify dispatch on pickups'),
('cs', 'CALL', 'FAILED', 'HIGH', '["IN_APP"]', 'Notify CS on missed calls'),
('finance', 'PAYMENT', 'RECEIVED', 'NORMAL', '["IN_APP"]', 'Notify finance on payments'),
('finance', 'OVERDUE', 'FLAGGED', 'HIGH', '["IN_APP"]', 'Notify finance on overdue orders'),
('admin', 'AI', 'FLAGGED', 'HIGH', '["IN_APP"]', 'Notify admin on AI alerts'),
('admin', 'CONTAMINATION', 'FLAGGED', 'CRITICAL', '["IN_APP"]', 'Notify admin on contamination');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_notifications;