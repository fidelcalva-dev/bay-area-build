
-- Marketing Intelligence System

-- 1) marketing_snapshots — cache for API responses
CREATE TABLE public.marketing_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('GA4', 'GSC', 'GBP')),
  market text,
  date_range text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_marketing_snapshots_source ON public.marketing_snapshots(source, created_at DESC);
CREATE INDEX idx_marketing_snapshots_market ON public.marketing_snapshots(market);

ALTER TABLE public.marketing_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read marketing_snapshots"
  ON public.marketing_snapshots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'executive'));

CREATE POLICY "Service insert marketing_snapshots"
  ON public.marketing_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Config settings for GA4/GSC/GBP
INSERT INTO public.config_settings (category, key, value, is_sensitive)
VALUES
  ('google', 'marketing_mode', '"DRY_RUN"', false),
  ('google', 'ga4_property_id', '""', false),
  ('google', 'gsc_site_url', '"https://calsandumpsterspro.com/"', false),
  ('google', 'gbp_account_id', '""', false),
  ('google', 'gbp_locations_json', '[]', false)
ON CONFLICT DO NOTHING;
