-- ============================================================
-- QA CONTROL CENTER TABLES
-- ============================================================

-- Create severity enum
CREATE TYPE public.qa_severity AS ENUM ('P0', 'P1', 'P2');

-- Create check status enum
CREATE TYPE public.qa_check_status AS ENUM ('PASS', 'FAIL', 'WARN', 'SKIP');

-- Create run status enum
CREATE TYPE public.qa_run_status AS ENUM ('RUNNING', 'DONE', 'FAILED');

-- Create category enum
CREATE TYPE public.qa_category AS ENUM (
  'WEBSITE', 'CALCULATOR', 'PRICING', 'HEAVY', 'CRM', 'LEADS', 
  'MESSAGING', 'TELEPHONY', 'DISPATCH', 'DRIVER', 'BILLING', 
  'ADS', 'MASTER_AI', 'GOOGLE', 'SECURITY'
);

-- ============================================================
-- 1) qa_checks - Check definitions
-- ============================================================
CREATE TABLE public.qa_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category qa_category NOT NULL,
  check_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  severity qa_severity NOT NULL DEFAULT 'P1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2) qa_runs - Test run sessions
-- ============================================================
CREATE TABLE public.qa_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_by_user_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status qa_run_status NOT NULL DEFAULT 'RUNNING',
  summary_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3) qa_results - Individual check results
-- ============================================================
CREATE TABLE public.qa_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qa_run_id UUID NOT NULL REFERENCES qa_runs(id) ON DELETE CASCADE,
  check_key TEXT NOT NULL,
  status qa_check_status NOT NULL,
  details_json JSONB DEFAULT '{}',
  fix_suggestion TEXT,
  evidence TEXT,
  admin_route TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_qa_checks_category ON qa_checks(category);
CREATE INDEX idx_qa_checks_severity ON qa_checks(severity);
CREATE INDEX idx_qa_results_run_id ON qa_results(qa_run_id);
CREATE INDEX idx_qa_results_status ON qa_results(status);
CREATE INDEX idx_qa_runs_status ON qa_runs(status);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.qa_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_results ENABLE ROW LEVEL SECURITY;

-- Admin read/write for qa_checks
CREATE POLICY "Admins can manage qa_checks" ON public.qa_checks
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role]));

-- Admin read/write for qa_runs
CREATE POLICY "Admins can manage qa_runs" ON public.qa_runs
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role]));

-- Admin read/write for qa_results
CREATE POLICY "Admins can manage qa_results" ON public.qa_results
  FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role]));

-- Service role access for edge functions
CREATE POLICY "Service role can manage qa_checks" ON public.qa_checks
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage qa_runs" ON public.qa_runs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage qa_results" ON public.qa_results
  FOR ALL TO service_role USING (true);

-- ============================================================
-- SEED QA CHECKS
-- ============================================================

-- WEBSITE checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('WEBSITE', 'website_no_emojis', 'No emojis on public pages', 'Verify no emoji characters appear in public-facing content', 'P1'),
('WEBSITE', 'website_from_pricing', 'From/range pricing only', 'Public pages show "From $X" pricing, not exact prices', 'P0'),
('WEBSITE', 'website_quote_route', 'Quote route loads', 'The /quote route loads without errors', 'P0'),
('WEBSITE', 'website_seo_meta', 'SEO meta tags present', 'All public routes have proper title and meta description', 'P1');

-- CALCULATOR checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('CALCULATOR', 'calc_step_flow', 'Step flow loads', 'Calculator step progression works correctly', 'P0'),
('CALCULATOR', 'calc_chips_present', 'Material chips present', 'Smart materials list (chips) displays correctly', 'P1'),
('CALCULATOR', 'calc_recommendation', 'AI recommendation works', 'Recommendation engine returns size + alternatives', 'P0'),
('CALCULATOR', 'calc_step4_price', 'Step 4 shows exact price', 'Step 4 displays ZIP-based exact pricing', 'P0'),
('CALCULATOR', 'calc_step5_notice', 'Step 5 notices trigger', 'Conditional notices display for heavy/grass materials', 'P1'),
('CALCULATOR', 'calc_step6_confirm', 'Step 6 requires checkbox', 'Confirmation step requires terms acceptance', 'P1');

-- PRICING checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('PRICING', 'pricing_db_code_sync', 'DB vs code values match', 'Database prices match shared-data.ts canonical values', 'P0'),
('PRICING', 'pricing_grass_debris', 'Grass routes to debris heavy', 'Grass/yard waste correctly routes to DEBRIS_HEAVY', 'P0'),
('PRICING', 'pricing_heavy_sizes', 'Heavy sizes only 5-10yd', 'Heavy materials restricted to 5/6/8/10yd sizes', 'P0'),
('PRICING', 'pricing_standard_sizes', 'Standard sizes available', 'General debris has 10/20/30/40yd available', 'P1'),
('PRICING', 'pricing_overage_rate', 'Overage rate $165/ton', 'Extra ton rate is exactly $165 for all sizes', 'P0');

-- HEAVY checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('HEAVY', 'heavy_fill_line', 'Fill line enforced', 'Heavy materials have fill line requirements', 'P0'),
('HEAVY', 'heavy_contamination', 'Contamination triggers reclassify', 'mark_order_contaminated function works correctly', 'P0'),
('HEAVY', 'heavy_included_tons', 'Debris heavy included tons', 'Included tonnage correct per size (5yd=0.5T, etc.)', 'P0'),
('HEAVY', 'heavy_photo_required', 'Driver photo requirements', 'Pre-pickup photos required for heavy materials', 'P1');

-- CRM/LEADS checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('LEADS', 'leads_capture_works', 'Lead capture works', 'Website lead capture creates sales_leads records', 'P0'),
('LEADS', 'leads_dedup_works', 'Dedup works', 'Duplicate leads within 30 days are deduplicated', 'P1'),
('LEADS', 'leads_ai_classify', 'AI classify DRY_RUN', 'AI classification logs to lead_events in DRY_RUN', 'P1'),
('LEADS', 'leads_routing_works', 'Lead routing works', 'New leads route to sales, existing customers to CS', 'P1');

-- MESSAGING checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('MESSAGING', 'msg_mode_dryrun', 'Messaging mode DRY_RUN', 'ghl.messaging_mode is set correctly', 'P0'),
('MESSAGING', 'msg_templates_exist', 'Templates exist', 'Message templates are seeded and active', 'P1'),
('MESSAGING', 'msg_sms_webhook', 'SMS webhook reachable', 'twilio-sms-webhook endpoint is configured', 'P1'),
('MESSAGING', 'msg_queue_works', 'Message queue works', 'Messages can be enqueued successfully', 'P1');

-- TELEPHONY checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('TELEPHONY', 'tel_mode_dryrun', 'Telephony mode DRY_RUN', 'telephony.mode is set correctly', 'P0'),
('TELEPHONY', 'tel_webhook_urls', 'Twilio webhook URLs configured', 'Inbound/outbound webhook endpoints exist', 'P0'),
('TELEPHONY', 'tel_test_call', 'Test call creates events', 'Test call tool creates call_events records', 'P1'),
('TELEPHONY', 'tel_ghl_forward', 'GHL forward tagging works', 'GHL forwarded calls tagged with metadata', 'P2');

-- DISPATCH checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('DISPATCH', 'dispatch_create_run', 'Create run works', 'Runs can be created from orders', 'P0'),
('DISPATCH', 'dispatch_status_flow', 'Status transitions work', 'Run status changes are valid and logged', 'P1'),
('DISPATCH', 'dispatch_late_alerts', 'Late-run alerts internal', 'Overdue runs trigger internal alerts', 'P1');

-- BILLING checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('BILLING', 'billing_overdue_cron', 'Overdue cron scheduled', 'overdue-billing-daily cron job is active', 'P0'),
('BILLING', 'billing_approval_queue', 'Approval queue works', 'High-value transactions create approval requests', 'P1'),
('BILLING', 'billing_invoices', 'Invoice generation works', 'Invoices are created from orders correctly', 'P1');

-- ADS checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('ADS', 'ads_mode_dryrun', 'Ads mode DRY_RUN', 'ads.mode is set to DRY_RUN', 'P0'),
('ADS', 'ads_capacity_guard', 'Capacity guard runs', 'Inventory-based pause logic is configured', 'P1'),
('ADS', 'ads_campaigns_exist', 'Campaigns exist', 'Ad campaigns are seeded in database', 'P2');

-- MASTER_AI checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('MASTER_AI', 'ai_mode_internal', 'Master AI LIVE_INTERNAL', 'master_ai.mode is LIVE_INTERNAL', 'P0'),
('MASTER_AI', 'ai_cron_scheduled', 'Control tower job scheduled', 'master-ai-control-tower cron is active', 'P0'),
('MASTER_AI', 'ai_no_customer_msg', 'No customer messages', 'allow_customer_messages is false', 'P0');

-- GOOGLE checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('GOOGLE', 'google_mode_dryrun', 'Google mode DRY_RUN', 'google.mode is set correctly', 'P1'),
('GOOGLE', 'google_oauth_endpoints', 'OAuth endpoints exist', 'google-oauth-start and callback functions exist', 'P1');

-- SECURITY checks
INSERT INTO public.qa_checks (category, check_key, title, description, severity) VALUES
('SECURITY', 'sec_rls_enabled', 'RLS enabled on sensitive tables', 'All sensitive tables have RLS enabled', 'P0'),
('SECURITY', 'sec_no_permissive', 'No permissive policies', 'No USING(true) on sensitive tables', 'P0'),
('SECURITY', 'sec_private_buckets', 'Private buckets configured', 'Sensitive storage buckets are private', 'P1'),
('SECURITY', 'sec_leaked_password', 'Leaked password protection', 'Manual: Enable in Supabase Auth settings', 'P0'),
('SECURITY', 'sec_extension_schema', 'pg_net extension schema', 'Manual: Move pg_net to extensions schema', 'P1');

-- Update trigger for qa_checks
CREATE OR REPLACE FUNCTION update_qa_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_qa_checks_timestamp
  BEFORE UPDATE ON qa_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_qa_checks_updated_at();