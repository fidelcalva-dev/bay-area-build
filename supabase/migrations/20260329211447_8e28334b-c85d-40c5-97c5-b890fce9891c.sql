
-- ============================================================
-- 1. Add missing SEO attribution + intent columns to sales_leads
-- ============================================================
ALTER TABLE public.sales_leads
  ADD COLUMN IF NOT EXISTS msclkid text,
  ADD COLUMN IF NOT EXISTS city_intent text,
  ADD COLUMN IF NOT EXISTS service_intent text,
  ADD COLUMN IF NOT EXISTS debris_type text,
  ADD COLUMN IF NOT EXISTS same_day boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS needs_permit boolean,
  ADD COLUMN IF NOT EXISTS lead_type text DEFAULT 'residential',
  ADD COLUMN IF NOT EXISTS project_description text,
  ADD COLUMN IF NOT EXISTS booked_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'new';

-- Index for pipeline stage filtering
CREATE INDEX IF NOT EXISTS idx_sales_leads_pipeline_stage ON public.sales_leads (pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_sales_leads_city_intent ON public.sales_leads (city_intent) WHERE city_intent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_leads_service_intent ON public.sales_leads (service_intent) WHERE service_intent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_leads_msclkid ON public.sales_leads (msclkid) WHERE msclkid IS NOT NULL;

-- ============================================================
-- 2. Create lead_stage_history table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_stage_history_lead_id ON public.lead_stage_history (lead_id);
CREATE INDEX idx_lead_stage_history_to_stage ON public.lead_stage_history (to_stage);

ALTER TABLE public.lead_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view stage history" ON public.lead_stage_history
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role) OR has_role(auth.uid(), 'cs'::app_role));

CREATE POLICY "Staff can insert stage history" ON public.lead_stage_history
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role) OR has_role(auth.uid(), 'cs'::app_role));

CREATE POLICY "Service role full access on lead_stage_history"
  ON public.lead_stage_history TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 3. Create lead_notes table (with follow-up task support)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  author_id uuid,
  note_type text NOT NULL DEFAULT 'note',
  content text NOT NULL,
  is_followup boolean DEFAULT false,
  followup_due_at timestamptz,
  followup_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_notes_lead_id ON public.lead_notes (lead_id);
CREATE INDEX idx_lead_notes_followup ON public.lead_notes (followup_due_at) WHERE is_followup = true AND followup_completed_at IS NULL;

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view lead notes" ON public.lead_notes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role) OR has_role(auth.uid(), 'cs'::app_role));

CREATE POLICY "Staff can insert lead notes" ON public.lead_notes
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role) OR has_role(auth.uid(), 'cs'::app_role));

CREATE POLICY "Staff can update lead notes" ON public.lead_notes
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role) OR has_role(auth.uid(), 'cs'::app_role));

CREATE POLICY "Service role full access on lead_notes"
  ON public.lead_notes TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 4. Trigger: auto-log stage changes to lead_stage_history
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_pipeline_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
    INSERT INTO public.lead_stage_history (lead_id, from_stage, to_stage)
    VALUES (NEW.id, OLD.pipeline_stage, NEW.pipeline_stage);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_pipeline_stage_change
  AFTER UPDATE ON public.sales_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pipeline_stage_change();

-- ============================================================
-- 5. Dashboard view: SEO lead performance by landing page/city/service
-- ============================================================
CREATE OR REPLACE VIEW public.seo_lead_dashboard_vw AS
SELECT
  sl.id,
  sl.customer_name,
  sl.customer_email,
  sl.customer_phone,
  sl.city,
  sl.zip,
  sl.pipeline_stage,
  sl.lead_status,
  sl.lead_quality_label,
  sl.lead_quality_score,
  sl.source_channel,
  sl.source_page,
  sl.landing_url,
  sl.referrer_url,
  sl.utm_source,
  sl.utm_medium,
  sl.utm_campaign,
  sl.utm_term,
  sl.utm_content,
  sl.gclid,
  sl.msclkid,
  sl.city_intent,
  sl.service_intent,
  sl.debris_type,
  sl.size_preference,
  sl.selected_size,
  sl.same_day,
  sl.needs_permit,
  sl.lead_type,
  sl.project_description,
  sl.quote_amount,
  sl.booked_value,
  sl.owner_user_id,
  sl.created_at,
  sl.first_touch_at,
  sl.latest_touch_at,
  sl.last_activity_at,
  sl.next_best_action,
  sl.material_category,
  sl.placement_type
FROM public.sales_leads sl
WHERE sl.source_channel IS NOT NULL
ORDER BY sl.created_at DESC;

-- Enable realtime on stage history for live CRM updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_stage_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_notes;
