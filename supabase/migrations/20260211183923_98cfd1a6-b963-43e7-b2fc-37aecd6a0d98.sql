
-- SEO City Engine tables

-- 1) seo_cities
CREATE TABLE public.seo_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  city_slug TEXT NOT NULL UNIQUE,
  county TEXT,
  market_code TEXT,
  primary_yard_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary_market BOOLEAN NOT NULL DEFAULT false,
  lat NUMERIC,
  lng NUMERIC,
  population TEXT,
  local_intro TEXT,
  dump_rules TEXT,
  pricing_note TEXT,
  permit_info TEXT,
  common_sizes_json JSONB NOT NULL DEFAULT '[10,20,30,40]',
  heavy_sizes_json JSONB NOT NULL DEFAULT '[6,8,10]',
  neighborhoods_json JSONB DEFAULT '[]',
  nearby_cities_json JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_cities ENABLE ROW LEVEL SECURITY;

-- Public read for active cities (SEO pages are public)
CREATE POLICY "Anyone can read active seo_cities"
  ON public.seo_cities FOR SELECT
  USING (is_active = true);

-- Admin write
CREATE POLICY "Admins can manage seo_cities"
  ON public.seo_cities FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) seo_pages
CREATE TABLE public.seo_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type TEXT NOT NULL CHECK (page_type IN ('CITY','CITY_SIZE','CITY_MATERIAL','CITY_COMMERCIAL')),
  city_id UUID REFERENCES public.seo_cities(id) ON DELETE CASCADE,
  url_path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1 TEXT NOT NULL,
  sections_json JSONB DEFAULT '[]',
  faq_json JSONB DEFAULT '[]',
  schema_json JSONB DEFAULT '[]',
  canonical_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  last_generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

-- Public read for published pages
CREATE POLICY "Anyone can read published seo_pages"
  ON public.seo_pages FOR SELECT
  USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage seo_pages"
  ON public.seo_pages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) seo_link_rules
CREATE TABLE public.seo_link_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_key TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('CITY_TO_CITY','CITY_TO_SERVICE','SERVICE_TO_SERVICE')),
  conditions_json JSONB DEFAULT '{}',
  output_json JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_link_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active seo_link_rules"
  ON public.seo_link_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage seo_link_rules"
  ON public.seo_link_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update trigger for seo_cities
CREATE TRIGGER update_seo_cities_updated_at
  BEFORE UPDATE ON public.seo_cities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for seo_pages
CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
