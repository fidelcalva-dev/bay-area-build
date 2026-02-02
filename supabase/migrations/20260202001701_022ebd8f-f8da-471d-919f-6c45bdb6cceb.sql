-- =============================================
-- SALES AI CLOSER - CREATE MISSING TABLES
-- =============================================

-- 1) sales_ai_insights - AI analysis results
CREATE TABLE IF NOT EXISTS public.sales_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('LEAD', 'QUOTE', 'ORDER')),
  entity_id UUID NOT NULL,
  intent_score INTEGER CHECK (intent_score >= 0 AND intent_score <= 100),
  urgency_score INTEGER CHECK (urgency_score >= 0 AND urgency_score <= 100),
  value_score INTEGER CHECK (value_score >= 0 AND value_score <= 100),
  churn_risk_score INTEGER CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  objections_json JSONB DEFAULT '{}'::jsonb,
  recommended_next_action TEXT CHECK (recommended_next_action IN ('CALL', 'SMS', 'EMAIL', 'QUOTE', 'FOLLOW_UP')),
  recommended_script_json JSONB DEFAULT '{}'::jsonb,
  recommended_offer_json JSONB DEFAULT '{}'::jsonb,
  reasoning TEXT,
  model_used TEXT DEFAULT 'google/gemini-3-flash-preview',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_ai_insights_lead ON public.sales_ai_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_ai_insights_entity ON public.sales_ai_insights(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sales_ai_insights_created ON public.sales_ai_insights(created_at DESC);

-- 2) sales_ai_messages_drafts - AI-generated message drafts
CREATE TABLE IF NOT EXISTS public.sales_ai_messages_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  insight_id UUID REFERENCES public.sales_ai_insights(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('SMS', 'EMAIL')),
  draft_type TEXT CHECK (draft_type IN ('SHORT_CLOSE', 'CLARIFY_CLOSE', 'FOLLOW_UP')),
  subject TEXT,
  draft_body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'DISCARDED')),
  sent_at TIMESTAMPTZ,
  discarded_at TIMESTAMPTZ,
  created_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_ai_drafts_lead ON public.sales_ai_messages_drafts(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_ai_drafts_status ON public.sales_ai_messages_drafts(status);

-- 3) sales_ai_audit - Full audit trail
CREATE TABLE IF NOT EXISTS public.sales_ai_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_role TEXT,
  lead_id UUID REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('ANALYZE', 'GENERATE_DRAFT', 'SEND_MESSAGE', 'APPLY_OFFER', 'COPY_SCRIPT')),
  input_summary_json JSONB DEFAULT '{}'::jsonb,
  ai_output_json JSONB DEFAULT '{}'::jsonb,
  model_used TEXT,
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_ai_audit_user ON public.sales_ai_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_ai_audit_lead ON public.sales_ai_audit(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_ai_audit_created ON public.sales_ai_audit(created_at DESC);

-- Enable RLS
ALTER TABLE public.sales_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_ai_messages_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_ai_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Staff can view insights" ON public.sales_ai_insights;
DROP POLICY IF EXISTS "Sales and admin can create insights" ON public.sales_ai_insights;
DROP POLICY IF EXISTS "Staff can view drafts" ON public.sales_ai_messages_drafts;
DROP POLICY IF EXISTS "Sales can manage drafts" ON public.sales_ai_messages_drafts;
DROP POLICY IF EXISTS "Admin can view all audit" ON public.sales_ai_audit;
DROP POLICY IF EXISTS "Users can view own audit" ON public.sales_ai_audit;
DROP POLICY IF EXISTS "Staff can create audit entries" ON public.sales_ai_audit;

-- RLS Policies for sales_ai_insights
CREATE POLICY "Staff can view insights" ON public.sales_ai_insights
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'dispatcher']::app_role[]));

CREATE POLICY "Sales and admin can create insights" ON public.sales_ai_insights
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[]));

-- RLS Policies for sales_ai_messages_drafts
CREATE POLICY "Staff can view drafts" ON public.sales_ai_messages_drafts
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));

CREATE POLICY "Sales can manage drafts" ON public.sales_ai_messages_drafts
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales']::app_role[]));

-- RLS Policies for sales_ai_audit
CREATE POLICY "Admin can view all audit" ON public.sales_ai_audit
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

CREATE POLICY "Users can view own audit" ON public.sales_ai_audit
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can create audit entries" ON public.sales_ai_audit
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs']::app_role[]));

-- Service role policy for edge functions
CREATE POLICY "Service role full access insights" ON public.sales_ai_insights
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access drafts" ON public.sales_ai_messages_drafts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access audit" ON public.sales_ai_audit
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);