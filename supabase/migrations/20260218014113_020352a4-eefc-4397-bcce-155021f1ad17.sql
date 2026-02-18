
-- Add ETA tracking columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS eta_min_minutes integer,
  ADD COLUMN IF NOT EXISTS eta_max_minutes integer,
  ADD COLUMN IF NOT EXISTS eta_confidence text DEFAULT 'MED' CHECK (eta_confidence IN ('HIGH', 'MED', 'LOW')),
  ADD COLUMN IF NOT EXISTS eta_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_tier text DEFAULT 'STANDARD' CHECK (sla_tier IN ('HIGH', 'STANDARD', 'LOW'));

-- Add traffic mode setting
INSERT INTO public.config_settings (category, key, value, description)
VALUES (
  'logistics',
  'logistics.traffic_mode',
  '"STATIC"',
  'Traffic mode for ETA calculations: LIVE or STATIC'
)
ON CONFLICT (key) DO NOTHING;
