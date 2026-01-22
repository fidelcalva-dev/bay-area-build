-- Create order_events table for full event history
CREATE TABLE public.order_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_role TEXT,
  actor_id UUID,
  message TEXT,
  before_json JSONB,
  after_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_order_events_order_id ON public.order_events(order_id);
CREATE INDEX idx_order_events_created_at ON public.order_events(created_at DESC);

-- Enable RLS
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Staff can view and create events
CREATE POLICY "Staff can view order events"
ON public.order_events FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role, 'sales'::app_role]));

CREATE POLICY "Staff can create order events"
ON public.order_events FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'driver'::app_role, 'sales'::app_role]));

-- Create schedule_logs table for schedule change tracking
CREATE TABLE public.schedule_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'requested', 'confirmed', 'changed', 'cancelled'
  old_date DATE,
  old_window TEXT,
  new_date DATE,
  new_window TEXT,
  reason TEXT,
  actor_role TEXT,
  actor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_schedule_logs_order_id ON public.schedule_logs(order_id);
CREATE INDEX idx_schedule_logs_created_at ON public.schedule_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.schedule_logs ENABLE ROW LEVEL SECURITY;

-- Staff can view and create schedule logs
CREATE POLICY "Staff can view schedule logs"
ON public.schedule_logs FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role, 'sales'::app_role]));

CREATE POLICY "Staff can create schedule logs"
ON public.schedule_logs FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'driver'::app_role, 'sales'::app_role]));