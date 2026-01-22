-- KPI Targets table for storing target values
CREATE TABLE public.kpi_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_key TEXT NOT NULL UNIQUE,
  kpi_category TEXT NOT NULL, -- 'sales', 'ops', 'finance', 'customer'
  kpi_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  warning_threshold NUMERIC, -- yellow zone
  unit TEXT DEFAULT '%', -- '%', '$', 'days', 'count'
  higher_is_better BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily KPI Snapshots for trend analysis
CREATE TABLE public.kpi_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  kpi_key TEXT NOT NULL,
  actual_value NUMERIC NOT NULL,
  target_value NUMERIC,
  status TEXT, -- 'green', 'yellow', 'red'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date, kpi_key)
);

-- Enable RLS
ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kpi_targets
CREATE POLICY "Admins can manage KPI targets"
ON public.kpi_targets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view KPI targets"
ON public.kpi_targets FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

-- RLS Policies for kpi_snapshots
CREATE POLICY "Staff can view KPI snapshots"
ON public.kpi_snapshots FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'sales'::app_role, 'dispatcher'::app_role, 'finance'::app_role]));

CREATE POLICY "System can insert KPI snapshots"
ON public.kpi_snapshots FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'dispatcher'::app_role]));

-- Index for fast lookups
CREATE INDEX idx_kpi_snapshots_date_key ON public.kpi_snapshots(snapshot_date DESC, kpi_key);
CREATE INDEX idx_kpi_snapshots_key_date ON public.kpi_snapshots(kpi_key, snapshot_date DESC);

-- Insert default KPI targets
INSERT INTO public.kpi_targets (kpi_key, kpi_category, kpi_name, target_value, warning_threshold, unit, higher_is_better) VALUES
-- Sales KPIs
('conversion_rate', 'sales', 'Quote-to-Order Conversion', 25, 15, '%', true),
('avg_ticket', 'sales', 'Average Ticket Value', 650, 500, '$', true),
('time_to_book', 'sales', 'Time to Book (hours)', 24, 48, 'hours', false),
('quotes_per_day', 'sales', 'Quotes Per Day', 20, 10, 'count', true),

-- Operations KPIs
('inventory_utilization', 'ops', 'Fleet Utilization', 75, 50, '%', true),
('schedule_load', 'ops', 'Schedule Load', 80, 60, '%', true),
('on_time_delivery', 'ops', 'On-Time Delivery Rate', 95, 85, '%', true),
('on_time_pickup', 'ops', 'On-Time Pickup Rate', 95, 85, '%', true),

-- Finance KPIs
('ar_days', 'finance', 'AR Days Outstanding', 14, 21, 'days', false),
('collection_rate', 'finance', 'Collection Rate', 95, 85, '%', true),
('overage_rate', 'finance', 'Overage Capture Rate', 90, 75, '%', true),
('prepay_adoption', 'finance', 'Prepay Adoption', 30, 15, '%', true),

-- Customer KPIs
('repeat_rate', 'customer', 'Repeat Customer Rate', 40, 25, '%', true),
('contractor_share', 'customer', 'Contractor Revenue Share', 60, 40, '%', true),
('nps_score', 'customer', 'NPS Score', 70, 50, 'score', true);