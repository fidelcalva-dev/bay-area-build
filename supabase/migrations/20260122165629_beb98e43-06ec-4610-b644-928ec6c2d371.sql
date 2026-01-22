-- Alerts table for tracking system alerts
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'low_inventory', 'schedule_overload', 'overdue_invoice', 'high_risk_quote', 'repeat_customer'
  entity_type TEXT NOT NULL, -- 'inventory', 'schedule', 'invoice', 'quote', 'customer'
  entity_id UUID NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recommendations table for tracking suggested actions
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rec_type TEXT NOT NULL, -- 'prepay_upsell', 'contractor_program', 'size_upgrade', 'schedule_adjustment'
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  title TEXT NOT NULL,
  description TEXT,
  action_label TEXT,
  action_data JSONB DEFAULT '{}'::jsonb,
  shown_at TIMESTAMP WITH TIME ZONE,
  accepted BOOLEAN,
  accepted_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automation runs log for tracking when automations execute
CREATE TABLE public.automation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_type TEXT NOT NULL,
  triggered_by TEXT, -- 'schedule', 'manual', 'event'
  alerts_created INTEGER DEFAULT 0,
  recommendations_created INTEGER DEFAULT 0,
  notifications_sent INTEGER DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alerts
CREATE POLICY "Staff can view alerts"
ON public.alerts FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role, 'sales'::app_role]));

CREATE POLICY "Staff can update alerts"
ON public.alerts FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

CREATE POLICY "System can create alerts"
ON public.alerts FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

-- RLS Policies for recommendations
CREATE POLICY "Staff can view recommendations"
ON public.recommendations FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'finance'::app_role, 'sales'::app_role]));

CREATE POLICY "Staff can update recommendations"
ON public.recommendations FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'sales'::app_role]));

CREATE POLICY "System can create recommendations"
ON public.recommendations FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role, 'sales'::app_role]));

-- RLS Policies for automation_runs
CREATE POLICY "Admins can view automation runs"
ON public.automation_runs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create automation runs"
ON public.automation_runs FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

-- Indexes
CREATE INDEX idx_alerts_type_unresolved ON public.alerts(alert_type) WHERE is_resolved = false;
CREATE INDEX idx_alerts_severity ON public.alerts(severity, created_at DESC);
CREATE INDEX idx_alerts_entity ON public.alerts(entity_type, entity_id);
CREATE INDEX idx_recommendations_type ON public.recommendations(rec_type) WHERE accepted IS NULL;
CREATE INDEX idx_recommendations_entity ON public.recommendations(entity_type, entity_id);