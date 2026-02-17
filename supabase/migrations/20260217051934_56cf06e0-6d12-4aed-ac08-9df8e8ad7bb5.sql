-- Add San Francisco market
INSERT INTO public.ads_markets (
  market_code, city, state, priority, daily_budget, is_active,
  inventory_threshold, utilization_pause_threshold, utilization_premium_threshold,
  zip_list
) VALUES (
  'san_francisco_peninsula', 'San Francisco', 'CA', 3, 60, true,
  3, 90, 80,
  ARRAY[
    '94102','94103','94104','94105','94107','94108','94109','94110',
    '94111','94112','94114','94115','94116','94117','94118','94121',
    '94122','94123','94124','94127','94129','94130','94131','94132',
    '94133','94134','94158'
  ]
)
ON CONFLICT (market_code) DO NOTHING;

-- Add expanded negative keywords for all campaigns (campaign-level)
-- These will be applied by the generate-campaigns function
-- No action needed here since the edge function already seeds them.

-- Update ads config: add conversion_actions mapping
UPDATE public.config_settings
SET value = '{"primary":"payment_completed","secondary":"quote_submitted","tertiary":"click_call"}'
WHERE category = 'ads' AND key = 'conversion_actions';
