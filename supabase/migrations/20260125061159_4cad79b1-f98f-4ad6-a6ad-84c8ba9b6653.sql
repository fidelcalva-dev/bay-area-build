-- Add composite indices for performance
CREATE INDEX IF NOT EXISTS idx_ads_metrics_date_campaign ON public.ads_metrics(date, campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_campaigns_market_status ON public.ads_campaigns(market_code, status);

-- Add ads.mode config setting (DRY_RUN / LIVE)
INSERT INTO public.config_settings (category, key, value, description, is_locked)
VALUES 
  ('ads', 'mode', '"DRY_RUN"', 'Ads engine mode: DRY_RUN (DB only) or LIVE (syncs with Google Ads API)', false),
  ('ads', 'default_campaign_status', '"draft"', 'Default status for newly created campaigns', false),
  ('ads', 'require_landing_page_check', 'true', 'Require landing page URL validation before activating campaigns', false)
ON CONFLICT (category, key) DO NOTHING;