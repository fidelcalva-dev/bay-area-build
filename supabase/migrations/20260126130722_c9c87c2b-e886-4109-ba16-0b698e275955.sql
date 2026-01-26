-- =====================================================
-- CALSAN MASTER AI - Phase 1: Database Schema (Fixed v2)
-- =====================================================

-- 1) ai_jobs (Event Queue)
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN (
    'CONTROL_TOWER', 'DAILY_BRIEF', 'EOD_REPORT', 'KPI_SNAPSHOT', 
    'OVERDUE_CHECK', 'DISPATCH_HEALTH', 'ADS_HEALTH', 'SEO_HEALTH',
    'LEAD_FOLLOWUP', 'BILLING_CHECK', 'APPROVAL_REVIEW'
  )),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'DONE', 'FAILED', 'RETRYING')),
  priority INT NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  last_error TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) ai_decisions (Auditable Decision Log)
CREATE TABLE IF NOT EXISTS public.ai_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.ai_jobs(id) ON DELETE SET NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN (
    'ALERT', 'TASK', 'MESSAGE_DRAFT', 'KPI_REPORT', 'PRICING_SUGGESTION', 
    'APPROVAL_REQUIRED', 'INSIGHT', 'RECOMMENDATION', 'ESCALATION'
  )),
  severity TEXT NOT NULL DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MED', 'HIGH', 'CRITICAL')),
  entity_type TEXT CHECK (entity_type IN (
    'lead', 'contact', 'quote', 'order', 'run', 'asset', 
    'invoice', 'campaign', 'system', 'driver', 'yard', 'customer'
  )),
  entity_id TEXT,
  summary TEXT NOT NULL,
  recommendation TEXT,
  actions_json JSONB DEFAULT '[]'::jsonb,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) ai_actions (Executed vs Drafted Actions)
CREATE TABLE IF NOT EXISTS public.ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.ai_decisions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'CREATE_TASK', 'CREATE_ALERT', 'ENQUEUE_MESSAGE', 'UPDATE_STATUS', 
    'CREATE_APPROVAL_REQUEST', 'SEND_NOTIFICATION', 'LOG_INSIGHT', 'NONE'
  )),
  status TEXT NOT NULL DEFAULT 'DRAFTED' CHECK (status IN ('DRAFTED', 'EXECUTED', 'FAILED', 'SKIPPED', 'PENDING_APPROVAL')),
  request_json JSONB DEFAULT '{}'::jsonb,
  result_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) notifications_outbox
CREATE TABLE IF NOT EXISTS public.notifications_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'SLACK')),
  target_team TEXT CHECK (target_team IN ('SALES', 'CS', 'DISPATCH', 'BILLING', 'ADMIN', 'EXECUTIVE')),
  target_user_id UUID,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'DRAFTED')),
  mode TEXT NOT NULL DEFAULT 'DRY_RUN' CHECK (mode IN ('DRY_RUN', 'LIVE')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extend existing kpi_snapshots if needed
ALTER TABLE public.kpi_snapshots ADD COLUMN IF NOT EXISTS snapshot_type TEXT DEFAULT 'DAILY';

-- =====================================================
-- INDEXES
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_jobs_status_scheduled') THEN
    CREATE INDEX idx_ai_jobs_status_scheduled ON public.ai_jobs(status, scheduled_for);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_jobs_type_scheduled') THEN
    CREATE INDEX idx_ai_jobs_type_scheduled ON public.ai_jobs(job_type, scheduled_for);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_jobs_locked') THEN
    CREATE INDEX idx_ai_jobs_locked ON public.ai_jobs(locked_at) WHERE locked_at IS NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_decisions_created') THEN
    CREATE INDEX idx_ai_decisions_created ON public.ai_decisions(created_at DESC);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_decisions_job') THEN
    CREATE INDEX idx_ai_decisions_job ON public.ai_decisions(job_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_decisions_severity') THEN
    CREATE INDEX idx_ai_decisions_severity ON public.ai_decisions(severity) WHERE severity IN ('HIGH', 'CRITICAL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_actions_decision') THEN
    CREATE INDEX idx_ai_actions_decision ON public.ai_actions(decision_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_actions_status') THEN
    CREATE INDEX idx_ai_actions_status ON public.ai_actions(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_outbox_status') THEN
    CREATE INDEX idx_notifications_outbox_status ON public.notifications_outbox(status, created_at);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_outbox_team') THEN
    CREATE INDEX idx_notifications_outbox_team ON public.notifications_outbox(target_team, status);
  END IF;
END $$;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS update_ai_jobs_updated_at ON public.ai_jobs;
CREATE TRIGGER update_ai_jobs_updated_at
  BEFORE UPDATE ON public.ai_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS POLICIES (Using correct app_role enum values)
-- =====================================================

ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_outbox ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Staff can view ai_jobs" ON public.ai_jobs;
DROP POLICY IF EXISTS "Admins can manage ai_jobs" ON public.ai_jobs;
DROP POLICY IF EXISTS "Staff can view ai_decisions" ON public.ai_decisions;
DROP POLICY IF EXISTS "Admins can manage ai_decisions" ON public.ai_decisions;
DROP POLICY IF EXISTS "Staff can view ai_actions" ON public.ai_actions;
DROP POLICY IF EXISTS "Admins can manage ai_actions" ON public.ai_actions;
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications_outbox;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications_outbox;

-- ai_jobs: Staff with admin/ops_admin/finance/executive roles
CREATE POLICY "Staff can view ai_jobs"
  ON public.ai_jobs FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'ops_admin', 'finance', 'executive']::app_role[]));

CREATE POLICY "Admins can manage ai_jobs"
  ON public.ai_jobs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ai_decisions: Staff can view
CREATE POLICY "Staff can view ai_decisions"
  ON public.ai_decisions FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'ops_admin', 'finance', 'executive', 'sales', 'cs']::app_role[]));

CREATE POLICY "Admins can manage ai_decisions"
  ON public.ai_decisions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ai_actions: Staff can view
CREATE POLICY "Staff can view ai_actions"
  ON public.ai_actions FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'ops_admin', 'finance', 'executive']::app_role[]));

CREATE POLICY "Admins can manage ai_actions"
  ON public.ai_actions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- notifications_outbox: Team-based access
CREATE POLICY "Users can view their notifications"
  ON public.notifications_outbox FOR SELECT
  USING (
    target_user_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    (target_team = 'SALES' AND public.has_role(auth.uid(), 'sales')) OR
    (target_team = 'CS' AND public.has_any_role(auth.uid(), ARRAY['cs', 'cs_agent']::app_role[])) OR
    (target_team = 'DISPATCH' AND public.has_any_role(auth.uid(), ARRAY['ops_admin', 'dispatcher']::app_role[])) OR
    (target_team = 'BILLING' AND public.has_any_role(auth.uid(), ARRAY['finance', 'billing_specialist']::app_role[])) OR
    (target_team IN ('ADMIN', 'EXECUTIVE') AND public.has_any_role(auth.uid(), ARRAY['admin', 'executive']::app_role[]))
  );

CREATE POLICY "Admins can manage notifications"
  ON public.notifications_outbox FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to enqueue AI jobs
CREATE OR REPLACE FUNCTION public.enqueue_ai_job(
  p_job_type TEXT,
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_priority INT DEFAULT 3,
  p_scheduled_for TIMESTAMPTZ DEFAULT now()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO public.ai_jobs (job_type, payload, priority, scheduled_for)
  VALUES (p_job_type, p_payload, p_priority, p_scheduled_for)
  RETURNING id INTO v_job_id;
  
  RETURN v_job_id;
END;
$$;

-- Function to claim next job (atomic lock)
CREATE OR REPLACE FUNCTION public.claim_next_ai_job(p_worker_id TEXT)
RETURNS TABLE(
  id UUID,
  job_type TEXT,
  payload JSONB,
  attempt_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
BEGIN
  SELECT j.id, j.job_type, j.payload, j.attempt_count
  INTO v_job
  FROM public.ai_jobs j
  WHERE j.status IN ('PENDING', 'RETRYING')
    AND j.scheduled_for <= now()
    AND (j.locked_at IS NULL OR j.locked_at < now() - INTERVAL '10 minutes')
  ORDER BY j.priority ASC, j.scheduled_for ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_job.id IS NULL THEN
    RETURN;
  END IF;
  
  UPDATE public.ai_jobs
  SET locked_at = now(),
      locked_by = p_worker_id,
      status = 'RUNNING',
      attempt_count = attempt_count + 1
  WHERE ai_jobs.id = v_job.id;
  
  RETURN QUERY SELECT v_job.id, v_job.job_type, v_job.payload, v_job.attempt_count + 1;
END;
$$;

-- Function to complete a job
CREATE OR REPLACE FUNCTION public.complete_ai_job(
  p_job_id UUID,
  p_success BOOLEAN,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
BEGIN
  SELECT * INTO v_job FROM public.ai_jobs WHERE id = p_job_id;
  
  IF v_job IS NULL THEN
    RAISE EXCEPTION 'Job not found: %', p_job_id;
  END IF;
  
  IF p_success THEN
    UPDATE public.ai_jobs
    SET status = 'DONE',
        locked_at = NULL,
        locked_by = NULL,
        last_error = NULL
    WHERE id = p_job_id;
  ELSE
    IF v_job.attempt_count >= v_job.max_attempts THEN
      UPDATE public.ai_jobs
      SET status = 'FAILED',
          locked_at = NULL,
          locked_by = NULL,
          last_error = p_error
      WHERE id = p_job_id;
    ELSE
      UPDATE public.ai_jobs
      SET status = 'RETRYING',
          locked_at = NULL,
          locked_by = NULL,
          last_error = p_error,
          scheduled_for = now() + (POWER(2, v_job.attempt_count) * INTERVAL '1 minute')
      WHERE id = p_job_id;
    END IF;
  END IF;
END;
$$;

-- Function to log AI decision
CREATE OR REPLACE FUNCTION public.log_ai_decision(
  p_job_id UUID,
  p_decision_type TEXT,
  p_severity TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_summary TEXT,
  p_recommendation TEXT DEFAULT NULL,
  p_actions_json JSONB DEFAULT '[]'::jsonb,
  p_requires_approval BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_decision_id UUID;
BEGIN
  INSERT INTO public.ai_decisions (
    job_id, decision_type, severity, entity_type, entity_id,
    summary, recommendation, actions_json, requires_approval
  ) VALUES (
    p_job_id, p_decision_type, p_severity, p_entity_type, p_entity_id,
    p_summary, p_recommendation, p_actions_json, p_requires_approval
  )
  RETURNING id INTO v_decision_id;
  
  RETURN v_decision_id;
END;
$$;

-- Function to enqueue notification
CREATE OR REPLACE FUNCTION public.enqueue_notification(
  p_channel TEXT,
  p_target_team TEXT,
  p_title TEXT,
  p_body TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'NORMAL',
  p_target_user_id UUID DEFAULT NULL,
  p_mode TEXT DEFAULT 'DRY_RUN'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications_outbox (
    channel, target_team, target_user_id, title, body,
    entity_type, entity_id, priority, mode
  ) VALUES (
    p_channel, p_target_team, p_target_user_id, p_title, p_body,
    p_entity_type, p_entity_id, p_priority, p_mode
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to record KPI snapshot
CREATE OR REPLACE FUNCTION public.record_kpi_snapshot(
  p_date DATE,
  p_market_code TEXT,
  p_metrics JSONB,
  p_type TEXT DEFAULT 'DAILY'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_snapshot_id UUID;
BEGIN
  INSERT INTO public.kpi_snapshots (snapshot_date, market_code, metrics)
  VALUES (p_date, p_market_code, p_metrics)
  ON CONFLICT (snapshot_date, market_code) DO UPDATE SET metrics = EXCLUDED.metrics
  RETURNING id INTO v_snapshot_id;
  
  RETURN v_snapshot_id;
END;
$$;