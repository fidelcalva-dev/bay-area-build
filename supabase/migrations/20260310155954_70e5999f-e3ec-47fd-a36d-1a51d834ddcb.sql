
-- Lead Intelligence table for AI lead scoring
CREATE TABLE public.lead_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  intent_score INTEGER DEFAULT 0 CHECK (intent_score >= 0 AND intent_score <= 100),
  budget_score INTEGER DEFAULT 0 CHECK (budget_score >= 0 AND budget_score <= 100),
  overall_grade TEXT DEFAULT 'MEDIUM' CHECK (overall_grade IN ('HOT', 'MEDIUM', 'LOW')),
  project_type TEXT,
  recommended_size INTEGER,
  recommended_price NUMERIC(10,2),
  signals_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage lead_intelligence"
  ON public.lead_intelligence FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','owner','sales_admin','sales_rep','ops_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','owner','sales_admin','sales_rep','ops_admin')));

CREATE INDEX idx_lead_intelligence_lead_id ON public.lead_intelligence(lead_id);
CREATE INDEX idx_lead_intelligence_grade ON public.lead_intelligence(overall_grade);

-- Pricing Intelligence table for market analysis
CREATE TABLE public.pricing_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  material_category TEXT NOT NULL,
  dumpster_size INTEGER,
  avg_dump_fee NUMERIC(10,2) DEFAULT 0,
  avg_revenue NUMERIC(10,2) DEFAULT 0,
  avg_margin NUMERIC(10,2) DEFAULT 0,
  job_count INTEGER DEFAULT 0,
  ai_recommendation TEXT,
  recommendation_type TEXT CHECK (recommendation_type IN ('ADJUST_PRICE','ADD_SURCHARGE','RUN_PROMOTION','HOLD')),
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read pricing_intelligence"
  ON public.pricing_intelligence FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','owner','sales_admin','finance','ops_admin')));

CREATE POLICY "Admin can manage pricing_intelligence"
  ON public.pricing_intelligence FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','owner')));

CREATE INDEX idx_pricing_intelligence_city ON public.pricing_intelligence(city);
CREATE INDEX idx_pricing_intelligence_material ON public.pricing_intelligence(material_category);
