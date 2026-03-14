
-- Social Links Configuration Table
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  public_url TEXT NOT NULL DEFAULT '',
  icon_key TEXT NOT NULL DEFAULT '',
  show_in_footer BOOLEAN NOT NULL DEFAULT false,
  show_in_schema BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Location Configuration Table
CREATE TABLE public.location_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL DEFAULT 'YARD',
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT NOT NULL,
  lat NUMERIC(10,6) NOT NULL DEFAULT 0,
  lng NUMERIC(10,6) NOT NULL DEFAULT 0,
  address TEXT,
  is_active_for_quotes BOOLEAN NOT NULL DEFAULT false,
  is_active_for_dispatch BOOLEAN NOT NULL DEFAULT false,
  is_visible_publicly BOOLEAN NOT NULL DEFAULT true,
  nearest_fallback_yard_id TEXT,
  service_radius_miles INTEGER NOT NULL DEFAULT 0,
  market_type TEXT NOT NULL DEFAULT 'CORE_DIRECT',
  priority_rank INTEGER NOT NULL DEFAULT 99,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_configs ENABLE ROW LEVEL SECURITY;

-- Public read for both (these drive public website rendering)
CREATE POLICY "Anyone can read social_links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Anyone can read location_configs" ON public.location_configs FOR SELECT USING (true);

-- Authenticated users with admin role can modify
CREATE POLICY "Admins can manage social_links" ON public.social_links
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage location_configs" ON public.location_configs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed social links from current config
INSERT INTO public.social_links (platform, label, public_url, icon_key, show_in_footer, show_in_schema, is_active, sort_order) VALUES
  ('facebook', 'Facebook', 'https://facebook.com/calsandumpsterspro', 'facebook', true, true, true, 1),
  ('instagram', 'Instagram', 'https://instagram.com/calsandumpsterspro', 'instagram', true, true, true, 2),
  ('youtube', 'YouTube', 'https://youtube.com/@calsandumpsterspro', 'youtube', true, true, true, 3),
  ('tiktok', 'TikTok', 'https://tiktok.com/@calsandumpsterspro', 'tiktok', true, true, true, 4),
  ('linkedin', 'LinkedIn', 'https://linkedin.com/company/calsan-dumpsters-pro', 'linkedin', true, true, true, 5),
  ('twitter', 'X (Twitter)', 'https://x.com/calsandumpsters', 'twitter', false, true, true, 6),
  ('pinterest', 'Pinterest', 'https://pinterest.com/calsandumpsterspro', 'pinterest', false, true, true, 7),
  ('yelp', 'Yelp', 'https://yelp.com/biz/calsan-dumpsters-pro-oakland', 'yelp', true, true, true, 8),
  ('google', 'Google Business', 'https://g.page/calsan-dumpsters-pro', 'google', false, true, true, 9);

-- Seed location configs from current config
INSERT INTO public.location_configs (location_id, name, location_type, city, state, zip, lat, lng, address, is_active_for_quotes, is_active_for_dispatch, is_visible_publicly, nearest_fallback_yard_id, service_radius_miles, market_type, priority_rank) VALUES
  ('oakland-office', 'Oakland HQ (Mailing/Public)', 'OFFICE', 'Oakland', 'CA', '94606', 37.7979, -122.2369, '1930 12th Ave #201, Oakland, CA 94606', false, false, true, NULL, 0, 'CORE_DIRECT', 0),
  ('oakland-yard', 'Oakland Operational Yard', 'YARD', 'Oakland', 'CA', '94601', 37.7692, -122.2189, '1000 46th Ave, Oakland, CA 94601', true, true, true, NULL, 35, 'CORE_DIRECT', 1),
  ('sanjose-yard', 'San Jose Operational Yard', 'YARD', 'San Jose', 'CA', '95131', 37.3861, -121.9187, '2071 Ringwood Ave, San Jose, CA 95131', true, true, true, 'oakland-yard', 30, 'CORE_DIRECT', 2),
  ('sf-yard', 'San Francisco Yard', 'YARD', 'San Francisco', 'CA', '94107', 37.7650, -122.3964, '1200 17th St, San Francisco, CA 94107', true, true, true, 'oakland-yard', 20, 'CORE_DIRECT', 3);
