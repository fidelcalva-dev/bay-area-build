
-- Phase 1: Create missing SEO engine tables

-- seo_services: service types for page generation
CREATE TABLE IF NOT EXISTS public.seo_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL,
  size_yards INTEGER,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- seo_queue: job queue for page generation/refresh
CREATE TABLE IF NOT EXISTS public.seo_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL DEFAULT 'CREATE' CHECK (job_type IN ('CREATE','UPDATE','REFRESH')),
  page_id UUID REFERENCES public.seo_pages(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.seo_cities(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.seo_services(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','COMPLETE','FAILED')),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- seo_metrics: performance tracking per page
CREATE TABLE IF NOT EXISTS public.seo_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.seo_pages(id) ON DELETE CASCADE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(5,4) NOT NULL DEFAULT 0,
  avg_position NUMERIC(5,2),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- seo_rules: content generation rules and guardrails
CREATE TABLE IF NOT EXISTS public.seo_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value_json JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extend seo_pages with status workflow and body_content
ALTER TABLE public.seo_pages
  ADD COLUMN IF NOT EXISTS body_content TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.seo_services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.seo_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies: authenticated users can read all SEO tables
CREATE POLICY "Authenticated users can read seo_services" ON public.seo_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage seo_services" ON public.seo_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read seo_queue" ON public.seo_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage seo_queue" ON public.seo_queue FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read seo_metrics" ON public.seo_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage seo_metrics" ON public.seo_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read seo_rules" ON public.seo_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage seo_rules" ON public.seo_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default services
INSERT INTO public.seo_services (service_type, size_yards, slug, display_name) VALUES
  ('dumpster-rental', 10, 'dumpster-rental-10-yard', '10 Yard Dumpster Rental'),
  ('dumpster-rental', 15, 'dumpster-rental-15-yard', '15 Yard Dumpster Rental'),
  ('dumpster-rental', 20, 'dumpster-rental-20-yard', '20 Yard Dumpster Rental'),
  ('dumpster-rental', 30, 'dumpster-rental-30-yard', '30 Yard Dumpster Rental'),
  ('dumpster-rental', 40, 'dumpster-rental-40-yard', '40 Yard Dumpster Rental'),
  ('concrete-disposal', NULL, 'concrete-disposal', 'Concrete Disposal'),
  ('yard-waste-removal', NULL, 'yard-waste-removal', 'Yard Waste Removal'),
  ('debris-removal', NULL, 'debris-removal', 'Debris Removal')
ON CONFLICT (slug) DO NOTHING;

-- Seed default rules
INSERT INTO public.seo_rules (key, value_json, description) VALUES
  ('max_pages_per_day', '5', 'Maximum new pages generated per day'),
  ('min_word_count', '800', 'Minimum word count per generated page'),
  ('max_word_count', '1200', 'Maximum word count per generated page'),
  ('min_uniqueness_pct', '35', 'Minimum uniqueness score percentage'),
  ('approval_required', 'true', 'Require manual approval before publishing'),
  ('refresh_interval_days', '7', 'Days between automatic page refreshes'),
  ('pricing_disclaimer', '"Final pricing depends on material type, weight, and delivery location. Contact us for an exact quote."', 'Standard pricing disclaimer text')
ON CONFLICT (key) DO NOTHING;

-- Index for faster queue processing
CREATE INDEX IF NOT EXISTS idx_seo_queue_status ON public.seo_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_seo_metrics_page ON public.seo_metrics(page_id, captured_at DESC);
