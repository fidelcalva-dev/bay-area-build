-- =============================================
-- COMPENSATION ENGINE - DATA MODEL
-- =============================================

-- Enum for commission types
CREATE TYPE public.commission_type AS ENUM ('PERCENTAGE', 'FLAT', 'TIERED', 'KPI_BASED');

-- Enum for trigger events
CREATE TYPE public.compensation_trigger AS ENUM ('PAYMENT_CAPTURED', 'ORDER_COMPLETED', 'RUN_COMPLETED', 'KPI_PERIOD_END', 'MANUAL');

-- Enum for earning status
CREATE TYPE public.earning_status AS ENUM ('PENDING', 'APPROVED', 'PAID', 'VOIDED');

-- Enum for adjustment types
CREATE TYPE public.adjustment_type AS ENUM ('BONUS', 'PENALTY', 'CREDIT', 'CLAWBACK');

-- =============================================
-- 1) COMPENSATION PLANS
-- =============================================
CREATE TABLE public.compensation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  plan_name TEXT NOT NULL,
  commission_type commission_type NOT NULL DEFAULT 'PERCENTAGE',
  rules_json JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- 2) COMPENSATION RULES
-- =============================================
CREATE TABLE public.compensation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.compensation_plans(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  trigger_event compensation_trigger NOT NULL,
  condition_json JSONB NOT NULL DEFAULT '{}',
  payout_formula_json JSONB NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3) COMPENSATION EARNINGS
-- =============================================
CREATE TABLE public.compensation_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  plan_id UUID REFERENCES public.compensation_plans(id),
  rule_id UUID REFERENCES public.compensation_rules(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  gross_amount NUMERIC(12,2) NOT NULL,
  payout_amount NUMERIC(12,2) NOT NULL,
  calculation_details JSONB DEFAULT '{}',
  status earning_status NOT NULL DEFAULT 'PENDING',
  period TEXT NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  void_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 4) COMPENSATION ADJUSTMENTS
-- =============================================
CREATE TABLE public.compensation_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  adjustment_type adjustment_type NOT NULL,
  reason TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  period TEXT NOT NULL,
  status earning_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 5) COMPENSATION AUDIT LOG
-- =============================================
CREATE TABLE public.compensation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  entity_type TEXT,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  details_json JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6) COMPENSATION PERIODS (for reporting)
-- =============================================
CREATE TABLE public.compensation_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL UNIQUE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 7) USER COMPENSATION SUMMARY (materialized view helper)
-- =============================================
CREATE TABLE public.user_compensation_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  total_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_adjustments NUMERIC(12,2) NOT NULL DEFAULT 0,
  pending_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  approved_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  voided_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, period)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_compensation_earnings_user ON public.compensation_earnings(user_id);
CREATE INDEX idx_compensation_earnings_status ON public.compensation_earnings(status);
CREATE INDEX idx_compensation_earnings_period ON public.compensation_earnings(period);
CREATE INDEX idx_compensation_earnings_entity ON public.compensation_earnings(entity_type, entity_id);
CREATE INDEX idx_compensation_adjustments_user ON public.compensation_adjustments(user_id);
CREATE INDEX idx_compensation_adjustments_period ON public.compensation_adjustments(period);
CREATE INDEX idx_compensation_audit_log_actor ON public.compensation_audit_log(actor_user_id);
CREATE INDEX idx_compensation_audit_log_target ON public.compensation_audit_log(target_user_id);
CREATE INDEX idx_compensation_rules_plan ON public.compensation_rules(plan_id);
CREATE INDEX idx_compensation_plans_role ON public.compensation_plans(role);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.compensation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compensation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_compensation_summary ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Plans: Admin can manage, others can view active
CREATE POLICY "Admins can manage compensation plans"
  ON public.compensation_plans FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active compensation plans"
  ON public.compensation_plans FOR SELECT
  USING (is_active = true);

-- Rules: Admin can manage, others can view active
CREATE POLICY "Admins can manage compensation rules"
  ON public.compensation_rules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active compensation rules"
  ON public.compensation_rules FOR SELECT
  USING (is_active = true);

-- Earnings: Users see own, admins see all
CREATE POLICY "Users can view own earnings"
  ON public.compensation_earnings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all earnings"
  ON public.compensation_earnings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage earnings"
  ON public.compensation_earnings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Adjustments: Users see own, admins manage
CREATE POLICY "Users can view own adjustments"
  ON public.compensation_adjustments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage adjustments"
  ON public.compensation_adjustments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Audit Log: Admin only
CREATE POLICY "Admins can view audit log"
  ON public.compensation_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit log"
  ON public.compensation_audit_log FOR INSERT
  WITH CHECK (true);

-- Periods: Admin manages, users view
CREATE POLICY "Users can view compensation periods"
  ON public.compensation_periods FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage periods"
  ON public.compensation_periods FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Summary: Users see own, admins see all
CREATE POLICY "Users can view own summary"
  ON public.user_compensation_summary FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all summaries"
  ON public.user_compensation_summary FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to calculate current period
CREATE OR REPLACE FUNCTION public.get_current_compensation_period()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT to_char(now(), 'YYYY-MM');
$$;

-- Function to log compensation audit
CREATE OR REPLACE FUNCTION public.log_compensation_audit(
  p_action TEXT,
  p_target_user_id UUID,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_before_data JSONB DEFAULT NULL,
  p_after_data JSONB DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.compensation_audit_log (
    action, actor_user_id, target_user_id,
    entity_type, entity_id, before_data, after_data, details_json
  ) VALUES (
    p_action, auth.uid(), p_target_user_id,
    p_entity_type, p_entity_id, p_before_data, p_after_data, p_details
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Function to create compensation earning
CREATE OR REPLACE FUNCTION public.create_compensation_earning(
  p_user_id UUID,
  p_role app_role,
  p_plan_id UUID,
  p_rule_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_gross_amount NUMERIC,
  p_payout_amount NUMERIC,
  p_calculation_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_earning_id UUID;
  v_period TEXT;
  v_mode TEXT;
BEGIN
  v_period := public.get_current_compensation_period();
  
  -- Check if earning already exists for this entity
  SELECT id INTO v_earning_id
  FROM public.compensation_earnings
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id AND user_id = p_user_id;
  
  IF v_earning_id IS NOT NULL THEN
    RETURN v_earning_id;
  END IF;
  
  INSERT INTO public.compensation_earnings (
    user_id, role, plan_id, rule_id,
    entity_type, entity_id,
    gross_amount, payout_amount,
    calculation_details, period
  ) VALUES (
    p_user_id, p_role, p_plan_id, p_rule_id,
    p_entity_type, p_entity_id,
    p_gross_amount, p_payout_amount,
    p_calculation_details, v_period
  )
  RETURNING id INTO v_earning_id;
  
  -- Log audit
  PERFORM public.log_compensation_audit(
    'EARNING_CREATED',
    p_user_id,
    'compensation_earnings',
    v_earning_id,
    NULL,
    jsonb_build_object(
      'gross_amount', p_gross_amount,
      'payout_amount', p_payout_amount,
      'entity_type', p_entity_type,
      'entity_id', p_entity_id
    )
  );
  
  RETURN v_earning_id;
END;
$$;

-- Function to void earning (for refunds/chargebacks)
CREATE OR REPLACE FUNCTION public.void_compensation_earning(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_earning RECORD;
BEGIN
  FOR v_earning IN 
    SELECT * FROM public.compensation_earnings
    WHERE entity_type = p_entity_type AND entity_id = p_entity_id
    AND status IN ('PENDING', 'APPROVED')
  LOOP
    UPDATE public.compensation_earnings SET
      status = 'VOIDED',
      voided_at = now(),
      void_reason = p_reason,
      updated_at = now()
    WHERE id = v_earning.id;
    
    -- Log audit
    PERFORM public.log_compensation_audit(
      'EARNING_VOIDED',
      v_earning.user_id,
      'compensation_earnings',
      v_earning.id,
      jsonb_build_object('status', v_earning.status),
      jsonb_build_object('status', 'VOIDED', 'reason', p_reason)
    );
  END LOOP;
  
  RETURN true;
END;
$$;

-- Function to approve earnings
CREATE OR REPLACE FUNCTION public.approve_compensation_earning(
  p_earning_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_earning RECORD;
BEGIN
  SELECT * INTO v_earning FROM public.compensation_earnings WHERE id = p_earning_id;
  
  IF v_earning IS NULL OR v_earning.status != 'PENDING' THEN
    RETURN false;
  END IF;
  
  UPDATE public.compensation_earnings SET
    status = 'APPROVED',
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now()
  WHERE id = p_earning_id;
  
  -- Log audit
  PERFORM public.log_compensation_audit(
    'EARNING_APPROVED',
    v_earning.user_id,
    'compensation_earnings',
    p_earning_id,
    jsonb_build_object('status', 'PENDING'),
    jsonb_build_object('status', 'APPROVED')
  );
  
  RETURN true;
END;
$$;

-- Function to update compensation summary
CREATE OR REPLACE FUNCTION public.update_user_compensation_summary(p_user_id UUID, p_period TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_earnings RECORD;
  v_adjustments RECORD;
BEGIN
  SELECT 
    COALESCE(SUM(payout_amount) FILTER (WHERE status != 'VOIDED'), 0) as total,
    COALESCE(SUM(payout_amount) FILTER (WHERE status = 'PENDING'), 0) as pending,
    COALESCE(SUM(payout_amount) FILTER (WHERE status = 'APPROVED'), 0) as approved,
    COALESCE(SUM(payout_amount) FILTER (WHERE status = 'PAID'), 0) as paid,
    COALESCE(SUM(payout_amount) FILTER (WHERE status = 'VOIDED'), 0) as voided
  INTO v_earnings
  FROM public.compensation_earnings
  WHERE user_id = p_user_id AND period = p_period;
  
  SELECT COALESCE(SUM(
    CASE WHEN adjustment_type IN ('BONUS', 'CREDIT') THEN amount
         ELSE -amount END
  ) FILTER (WHERE status != 'VOIDED'), 0) as total
  INTO v_adjustments
  FROM public.compensation_adjustments
  WHERE user_id = p_user_id AND period = p_period;
  
  INSERT INTO public.user_compensation_summary (
    user_id, period, total_earnings, total_adjustments,
    pending_amount, approved_amount, paid_amount, voided_amount, updated_at
  ) VALUES (
    p_user_id, p_period, v_earnings.total, v_adjustments.total,
    v_earnings.pending, v_earnings.approved, v_earnings.paid, v_earnings.voided, now()
  )
  ON CONFLICT (user_id, period) DO UPDATE SET
    total_earnings = v_earnings.total,
    total_adjustments = v_adjustments.total,
    pending_amount = v_earnings.pending,
    approved_amount = v_earnings.approved,
    paid_amount = v_earnings.paid,
    voided_amount = v_earnings.voided,
    updated_at = now();
END;
$$;

-- =============================================
-- ADD CONFIG SETTINGS
-- =============================================
INSERT INTO public.config_settings (category, key, value, description, is_sensitive)
VALUES 
  ('compensation', 'compensation.mode', '"DRY_RUN"', 'Compensation engine mode: DRY_RUN or LIVE', false),
  ('compensation', 'compensation.auto_approve', 'false', 'Auto-approve earnings without admin review', false),
  ('compensation', 'compensation.auto_approve_threshold', '100', 'Max amount for auto-approval (if enabled)', false),
  ('compensation', 'compensation.payment_grace_days', '3', 'Days after payment before commission eligible', false)
ON CONFLICT (key) DO NOTHING;