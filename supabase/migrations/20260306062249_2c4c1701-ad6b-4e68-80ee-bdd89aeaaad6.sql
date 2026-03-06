
-- Phase 1: Page Discovery Index
CREATE TABLE public.seo_page_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL UNIQUE,
  page_type text NOT NULL DEFAULT 'CITY',
  city text,
  service text,
  yard text,
  word_count integer DEFAULT 0,
  last_scanned_at timestamptz,
  last_updated timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'DISCOVERED',
  seo_score integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Phase 2: Audit Results
CREATE TABLE public.seo_audit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES public.seo_page_index(id) ON DELETE CASCADE NOT NULL,
  seo_score integer NOT NULL DEFAULT 0,
  has_h1 boolean DEFAULT false,
  has_h2_structure boolean DEFAULT false,
  has_meta_title boolean DEFAULT false,
  has_meta_description boolean DEFAULT false,
  word_count integer DEFAULT 0,
  city_mentions integer DEFAULT 0,
  internal_link_count integer DEFAULT 0,
  has_quote_cta boolean DEFAULT false,
  has_schema boolean DEFAULT false,
  duplicate_risk boolean DEFAULT false,
  missing_meta text[],
  missing_schema text[],
  thin_content boolean DEFAULT false,
  internal_link_score integer DEFAULT 0,
  recommended_actions jsonb DEFAULT '[]'::jsonb,
  audited_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_seo_page_index_status ON public.seo_page_index(status);
CREATE INDEX idx_seo_page_index_score ON public.seo_page_index(seo_score);
CREATE INDEX idx_seo_page_index_type ON public.seo_page_index(page_type);
CREATE INDEX idx_seo_audit_results_page ON public.seo_audit_results(page_id);
CREATE INDEX idx_seo_audit_results_score ON public.seo_audit_results(seo_score);

-- RLS
ALTER TABLE public.seo_page_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read seo_page_index"
  ON public.seo_page_index FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage seo_page_index"
  ON public.seo_page_index FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read seo_audit_results"
  ON public.seo_audit_results FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage seo_audit_results"
  ON public.seo_audit_results FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow service role full access (edge functions)
CREATE POLICY "Service role full access seo_page_index"
  ON public.seo_page_index FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access seo_audit_results"
  ON public.seo_audit_results FOR ALL TO service_role USING (true) WITH CHECK (true);
