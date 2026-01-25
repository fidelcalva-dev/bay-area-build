-- Phase 1: Ads Engine Data Model

-- Ads Accounts (Google Ads account configuration)
CREATE TABLE public.ads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_customer_id TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
  daily_budget NUMERIC NOT NULL DEFAULT 100,
  currency TEXT NOT NULL DEFAULT 'USD',
  refresh_token_encrypted TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Markets (geographic targeting)
CREATE TABLE public.ads_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip_list TEXT[] NOT NULL DEFAULT '{}',
  yard_id UUID REFERENCES public.yards(id),
  priority INTEGER NOT NULL DEFAULT 1,
  daily_budget NUMERIC NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  inventory_threshold INTEGER NOT NULL DEFAULT 3,
  utilization_pause_threshold INTEGER NOT NULL DEFAULT 90,
  utilization_premium_threshold INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Campaigns
CREATE TABLE public.ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.ads_accounts(id) ON DELETE CASCADE,
  google_campaign_id TEXT,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'SEARCH' CHECK (campaign_type IN ('SEARCH', 'PMAX', 'DISPLAY')),
  market_code TEXT REFERENCES public.ads_markets(market_code),
  service_type TEXT NOT NULL DEFAULT 'dumpster_rental' CHECK (service_type IN ('dumpster_rental', 'material_disposal', 'heavy_hauling')),
  size_yd INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended', 'capacity_paused')),
  daily_budget NUMERIC NOT NULL DEFAULT 25,
  target_roas NUMERIC,
  target_cpa NUMERIC,
  messaging_tier TEXT NOT NULL DEFAULT 'BASE' CHECK (messaging_tier IN ('BASE', 'CORE', 'PREMIUM')),
  last_synced_at TIMESTAMPTZ,
  pause_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Ad Groups
CREATE TABLE public.ads_adgroups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ads_campaigns(id) ON DELETE CASCADE NOT NULL,
  google_adgroup_id TEXT,
  adgroup_name TEXT NOT NULL,
  keyword_theme TEXT NOT NULL,
  size_yd INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed')),
  max_cpc NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads (individual ad creatives)
CREATE TABLE public.ads_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adgroup_id UUID REFERENCES public.ads_adgroups(id) ON DELETE CASCADE NOT NULL,
  google_ad_id TEXT,
  ad_type TEXT NOT NULL DEFAULT 'responsive_search' CHECK (ad_type IN ('responsive_search', 'call_only', 'display')),
  headline_1 TEXT NOT NULL,
  headline_2 TEXT,
  headline_3 TEXT,
  description_1 TEXT NOT NULL,
  description_2 TEXT,
  final_url TEXT NOT NULL,
  display_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disapproved', 'removed')),
  disapproval_reason TEXT,
  quality_score INTEGER,
  last_refreshed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Keywords
CREATE TABLE public.ads_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adgroup_id UUID REFERENCES public.ads_adgroups(id) ON DELETE CASCADE NOT NULL,
  google_keyword_id TEXT,
  keyword TEXT NOT NULL,
  match_type TEXT NOT NULL DEFAULT 'phrase' CHECK (match_type IN ('exact', 'phrase', 'broad')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed')),
  max_cpc NUMERIC,
  quality_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Negative Keywords
CREATE TABLE public.ads_negative_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ads_campaigns(id) ON DELETE CASCADE,
  adgroup_id UUID REFERENCES public.ads_adgroups(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  match_type TEXT NOT NULL DEFAULT 'exact' CHECK (match_type IN ('exact', 'phrase', 'broad')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT negative_keyword_scope CHECK (campaign_id IS NOT NULL OR adgroup_id IS NOT NULL)
);

-- Ads Metrics (daily performance data)
CREATE TABLE public.ads_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads_ads(id) ON DELETE CASCADE,
  keyword_id UUID REFERENCES public.ads_keywords(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.ads_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  conversion_value NUMERIC NOT NULL DEFAULT 0,
  avg_position NUMERIC,
  ctr NUMERIC GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN (clicks::NUMERIC / impressions) * 100 ELSE 0 END) STORED,
  cpc NUMERIC GENERATED ALWAYS AS (CASE WHEN clicks > 0 THEN cost / clicks ELSE 0 END) STORED,
  cpa NUMERIC GENERATED ALWAYS AS (CASE WHEN conversions > 0 THEN cost / conversions ELSE 0 END) STORED,
  roas NUMERIC GENERATED ALWAYS AS (CASE WHEN cost > 0 THEN conversion_value / cost ELSE 0 END) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Rules (automation rules)
CREATE TABLE public.ads_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('inventory', 'budget', 'performance', 'time', 'pricing')),
  conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Alerts
CREATE TABLE public.ads_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('budget_exceeded', 'cpa_high', 'capacity_low', 'performance_drop', 'disapproval')),
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ads Sync Log (audit trail)
CREATE TABLE public.ads_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('campaigns', 'adgroups', 'ads', 'keywords', 'metrics', 'capacity_check', 'performance_optimize')),
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_paused INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_ads_campaigns_market ON public.ads_campaigns(market_code);
CREATE INDEX idx_ads_campaigns_status ON public.ads_campaigns(status);
CREATE INDEX idx_ads_metrics_date ON public.ads_metrics(date);
CREATE INDEX idx_ads_metrics_campaign ON public.ads_metrics(campaign_id, date);
CREATE INDEX idx_ads_alerts_unresolved ON public.ads_alerts(is_resolved) WHERE is_resolved = false;

-- Enable RLS
ALTER TABLE public.ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_adgroups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_negative_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only for ads management)
CREATE POLICY "Admins can manage ads_accounts" ON public.ads_accounts
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role]));

CREATE POLICY "Admins can manage ads_markets" ON public.ads_markets
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'ops_admin'::app_role]));

CREATE POLICY "Admins can manage ads_campaigns" ON public.ads_campaigns
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role]));

CREATE POLICY "Admins can manage ads_adgroups" ON public.ads_adgroups
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role]));

CREATE POLICY "Admins can manage ads_ads" ON public.ads_ads
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role]));

CREATE POLICY "Admins can manage ads_keywords" ON public.ads_keywords
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role]));

CREATE POLICY "Admins can manage ads_negative_keywords" ON public.ads_negative_keywords
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role]));

CREATE POLICY "Admins can view ads_metrics" ON public.ads_metrics
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role, 'sales'::app_role]));

CREATE POLICY "System can insert ads_metrics" ON public.ads_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage ads_rules" ON public.ads_rules
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role]));

CREATE POLICY "Admins can manage ads_alerts" ON public.ads_alerts
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role, 'sales_admin'::app_role]));

CREATE POLICY "Admins can view ads_sync_log" ON public.ads_sync_log
  FOR SELECT USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'system_admin'::app_role]));

CREATE POLICY "System can insert ads_sync_log" ON public.ads_sync_log
  FOR INSERT WITH CHECK (true);

-- Seed default negative keywords
INSERT INTO public.ads_rules (rule_name, rule_type, conditions, actions, priority) VALUES
  ('Inventory Low - Pause Campaigns', 'inventory', 
   '{"threshold": 3, "comparison": "less_than"}', 
   '{"action": "pause_campaigns", "reason": "Low inventory"}', 1),
  ('Utilization High - Switch to PREMIUM', 'inventory',
   '{"utilization_threshold": 90, "comparison": "greater_than"}',
   '{"action": "switch_messaging_tier", "tier": "PREMIUM"}', 2),
  ('Utilization Medium - Switch to CORE', 'inventory',
   '{"utilization_threshold": 80, "comparison": "greater_than"}',
   '{"action": "switch_messaging_tier", "tier": "CORE"}', 3),
  ('High CPA Alert', 'performance',
   '{"cpa_threshold": 150, "days": 7}',
   '{"action": "create_alert", "severity": "warning"}', 4),
  ('After Hours - Reduce Bids', 'time',
   '{"start_hour": 21, "end_hour": 6}',
   '{"action": "reduce_bids", "percentage": 30}', 5);

-- Seed Oakland and San Jose markets
INSERT INTO public.ads_markets (market_code, city, state, zip_list, priority, daily_budget) VALUES
  ('oakland_east_bay', 'Oakland', 'CA', 
   ARRAY['94601', '94602', '94603', '94605', '94606', '94607', '94608', '94609', '94610', '94611', '94612', '94613', '94618', '94619', '94621'],
   1, 75),
  ('san_jose_south_bay', 'San Jose', 'CA',
   ARRAY['95110', '95111', '95112', '95113', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95138', '95139', '95140', '95148'],
   2, 50);

-- Updated_at trigger
CREATE TRIGGER update_ads_campaigns_updated_at
  BEFORE UPDATE ON public.ads_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_adgroups_updated_at
  BEFORE UPDATE ON public.ads_adgroups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_ads_updated_at
  BEFORE UPDATE ON public.ads_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_markets_updated_at
  BEFORE UPDATE ON public.ads_markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();