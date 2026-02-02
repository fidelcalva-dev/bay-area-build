-- ============================================================
-- CUSTOMER HEALTH SCORE SYSTEM - COMPLETE SETUP
-- ============================================================

-- Create enums if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'health_status') THEN
    CREATE TYPE public.health_status AS ENUM ('GREEN', 'AMBER', 'RED');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'health_event_severity') THEN
    CREATE TYPE public.health_event_severity AS ENUM ('LOW', 'MED', 'HIGH');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'health_event_type') THEN
    CREATE TYPE public.health_event_type AS ENUM (
      'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 'CHARGEBACK', 'REFUND', 'DISPUTE',
      'CANCELLATION', 'NO_SHOW', 'BLOCKED_ACCESS', 'RESCHEDULE',
      'CONTAMINATION', 'OVERWEIGHT', 'POD_MISSING',
      'REPEAT_ORDER', 'HIGH_VOLUME', 'FAST_PAY', 'CLEAN_COMPLIANCE',
      'REVIEW_POSITIVE', 'REVIEW_NEGATIVE', 'INITIAL_SCORE'
    );
  END IF;
END $$;

-- ============================================================
-- 1) customer_health_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 70 CHECK (score >= 0 AND score <= 100),
  status health_status NOT NULL DEFAULT 'AMBER',
  score_breakdown_json JSONB DEFAULT '{}'::jsonb,
  positive_drivers JSONB DEFAULT '[]'::jsonb,
  negative_drivers JSONB DEFAULT '[]'::jsonb,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id)
);

-- ============================================================
-- 2) customer_health_events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  event_type health_event_type NOT NULL,
  severity health_event_severity NOT NULL DEFAULT 'LOW',
  delta_score INTEGER NOT NULL DEFAULT 0,
  score_before INTEGER,
  score_after INTEGER,
  details_json JSONB DEFAULT '{}'::jsonb,
  source_entity_type TEXT,
  source_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3) customer_health_rules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customer_health_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT NOT NULL UNIQUE,
  event_type health_event_type NOT NULL,
  description TEXT NOT NULL,
  weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  delta_score INTEGER NOT NULL,
  threshold_json JSONB DEFAULT '{}'::jsonb,
  category TEXT NOT NULL DEFAULT 'other',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_health_scores_customer ON public.customer_health_scores(customer_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_status ON public.customer_health_scores(status);
CREATE INDEX IF NOT EXISTS idx_health_scores_score ON public.customer_health_scores(score);
CREATE INDEX IF NOT EXISTS idx_health_events_customer ON public.customer_health_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_health_events_type ON public.customer_health_events(event_type);
CREATE INDEX IF NOT EXISTS idx_health_events_created_at ON public.customer_health_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_rules_event_type ON public.customer_health_rules(event_type);

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE public.customer_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_health_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_health_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================
DROP POLICY IF EXISTS "Staff can view health scores" ON public.customer_health_scores;
CREATE POLICY "Staff can view health scores"
  ON public.customer_health_scores FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

DROP POLICY IF EXISTS "System can manage health scores" ON public.customer_health_scores;
CREATE POLICY "System can manage health scores"
  ON public.customer_health_scores FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

DROP POLICY IF EXISTS "Staff can view health events" ON public.customer_health_events;
CREATE POLICY "Staff can view health events"
  ON public.customer_health_events FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance', 'dispatcher']::app_role[]));

DROP POLICY IF EXISTS "System can insert health events" ON public.customer_health_events;
CREATE POLICY "System can insert health events"
  ON public.customer_health_events FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

DROP POLICY IF EXISTS "Staff can view health rules" ON public.customer_health_rules;
CREATE POLICY "Staff can view health rules"
  ON public.customer_health_rules FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'sales', 'cs', 'finance']::app_role[]));

DROP POLICY IF EXISTS "Admin can manage health rules" ON public.customer_health_rules;
CREATE POLICY "Admin can manage health rules"
  ON public.customer_health_rules FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin']::app_role[]));

-- ============================================================
-- Helper function
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_health_status(p_score INTEGER)
RETURNS health_status
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score >= 80 THEN 'GREEN'::health_status
    WHEN p_score >= 60 THEN 'AMBER'::health_status
    ELSE 'RED'::health_status
  END;
$$;

-- ============================================================
-- Update customer health score function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_customer_health_score(
  p_customer_id UUID,
  p_event_type health_event_type,
  p_severity health_event_severity DEFAULT 'LOW',
  p_delta_score INTEGER DEFAULT NULL,
  p_details_json JSONB DEFAULT '{}'::jsonb,
  p_source_entity_type TEXT DEFAULT NULL,
  p_source_entity_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_current_score INTEGER;
  v_new_score INTEGER;
  v_rule_delta INTEGER;
  v_health_id UUID;
BEGIN
  SELECT id, score INTO v_health_id, v_current_score
  FROM public.customer_health_scores
  WHERE customer_id = p_customer_id;
  
  IF v_health_id IS NULL THEN
    INSERT INTO public.customer_health_scores (customer_id, score, status)
    VALUES (p_customer_id, 70, 'AMBER')
    RETURNING id, score INTO v_health_id, v_current_score;
  END IF;
  
  IF p_delta_score IS NULL THEN
    SELECT delta_score INTO v_rule_delta
    FROM public.customer_health_rules
    WHERE event_type = p_event_type AND is_active = true
    ORDER BY weight DESC LIMIT 1;
    v_rule_delta := COALESCE(v_rule_delta, 0);
  ELSE
    v_rule_delta := p_delta_score;
  END IF;
  
  v_new_score := GREATEST(0, LEAST(100, v_current_score + v_rule_delta));
  
  INSERT INTO public.customer_health_events (
    customer_id, event_type, severity, delta_score,
    score_before, score_after, details_json,
    source_entity_type, source_entity_id
  ) VALUES (
    p_customer_id, p_event_type, p_severity, v_rule_delta,
    v_current_score, v_new_score, p_details_json,
    p_source_entity_type, p_source_entity_id
  )
  RETURNING id INTO v_event_id;
  
  UPDATE public.customer_health_scores SET
    score = v_new_score,
    status = public.compute_health_status(v_new_score),
    last_updated_at = now()
  WHERE id = v_health_id;
  
  IF v_current_score >= 60 AND v_new_score < 60 THEN
    INSERT INTO public.alerts (entity_type, entity_id, alert_type, severity, title, message, metadata)
    VALUES ('customer', p_customer_id::text, 'HEALTH_RED', 'warn',
      'Customer Health Score Critical',
      'Customer score dropped to RED (' || v_new_score || '). Review required.',
      jsonb_build_object('customer_id', p_customer_id, 'score_before', v_current_score, 'score_after', v_new_score));
  END IF;
  
  RETURN v_event_id;
END;
$$;

-- ============================================================
-- Recalculate health score function
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_customer_health(p_customer_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 70;
  v_positive_drivers JSONB := '[]'::jsonb;
  v_negative_drivers JSONB := '[]'::jsonb;
  v_breakdown JSONB := '{}'::jsonb;
  v_payment_score INTEGER := 0;
  v_compliance_score INTEGER := 0;
  v_loyalty_score INTEGER := 0;
  v_order_count INTEGER;
  v_paid_revenue NUMERIC;
  v_overdue_count INTEGER;
  v_contamination_count INTEGER;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(amount_paid), 0)
  INTO v_order_count, v_paid_revenue
  FROM public.orders WHERE customer_id = p_customer_id AND created_at > now() - INTERVAL '90 days';
  
  SELECT COUNT(*) INTO v_overdue_count
  FROM public.invoices i JOIN public.orders o ON o.id = i.order_id
  WHERE o.customer_id = p_customer_id AND i.payment_status = 'overdue';
  
  SELECT COUNT(*) INTO v_contamination_count
  FROM public.orders WHERE customer_id = p_customer_id AND contamination_detected = true
    AND created_at > now() - INTERVAL '90 days';
  
  IF v_overdue_count = 0 THEN
    v_payment_score := 10;
    v_positive_drivers := v_positive_drivers || jsonb_build_array(jsonb_build_object('driver', 'No overdue invoices', 'impact', '+10'));
  ELSE
    v_payment_score := -5 * v_overdue_count;
    v_negative_drivers := v_negative_drivers || jsonb_build_array(jsonb_build_object('driver', v_overdue_count || ' overdue invoice(s)', 'impact', v_payment_score));
  END IF;
  
  IF v_order_count >= 5 THEN
    v_loyalty_score := 15;
    v_positive_drivers := v_positive_drivers || jsonb_build_array(jsonb_build_object('driver', 'High-frequency customer', 'impact', '+15'));
  ELSIF v_order_count >= 3 THEN
    v_loyalty_score := 8;
    v_positive_drivers := v_positive_drivers || jsonb_build_array(jsonb_build_object('driver', 'Repeat customer', 'impact', '+8'));
  END IF;
  
  IF v_paid_revenue >= 5000 THEN
    v_loyalty_score := v_loyalty_score + 10;
    v_positive_drivers := v_positive_drivers || jsonb_build_array(jsonb_build_object('driver', 'High-value customer', 'impact', '+10'));
  END IF;
  
  IF v_contamination_count > 0 THEN
    v_compliance_score := -10 * v_contamination_count;
    v_negative_drivers := v_negative_drivers || jsonb_build_array(jsonb_build_object('driver', 'Contamination events', 'impact', v_compliance_score));
  ELSE
    v_compliance_score := 5;
    v_positive_drivers := v_positive_drivers || jsonb_build_array(jsonb_build_object('driver', 'Clean compliance', 'impact', '+5'));
  END IF;
  
  v_score := GREATEST(0, LEAST(100, 70 + v_payment_score + v_compliance_score + v_loyalty_score));
  
  v_breakdown := jsonb_build_object('base_score', 70, 'payment_adjustment', v_payment_score,
    'compliance_adjustment', v_compliance_score, 'loyalty_adjustment', v_loyalty_score, 'final_score', v_score);
  
  INSERT INTO public.customer_health_scores (customer_id, score, status, score_breakdown_json, positive_drivers, negative_drivers, last_updated_at)
  VALUES (p_customer_id, v_score, public.compute_health_status(v_score), v_breakdown, v_positive_drivers, v_negative_drivers, now())
  ON CONFLICT (customer_id) DO UPDATE SET
    score = EXCLUDED.score, status = EXCLUDED.status, score_breakdown_json = EXCLUDED.score_breakdown_json,
    positive_drivers = EXCLUDED.positive_drivers, negative_drivers = EXCLUDED.negative_drivers, last_updated_at = now();
  
  RETURN v_score;
END;
$$;

-- ============================================================
-- Seed default rules
-- ============================================================
INSERT INTO public.customer_health_rules (rule_key, event_type, description, weight, delta_score, category) VALUES
  ('payment_on_time', 'PAYMENT_RECEIVED', 'Payment received on time', 1.0, 2, 'payment'),
  ('chargeback', 'CHARGEBACK', 'Chargeback or dispute', 1.5, -25, 'payment'),
  ('contamination', 'CONTAMINATION', 'Contamination detected', 1.5, -10, 'compliance'),
  ('cancel_24h', 'CANCELLATION', 'Order cancelled within 24h', 1.0, -5, 'operations'),
  ('repeat_order', 'REPEAT_ORDER', 'Repeat customer (3+ orders)', 1.0, 6, 'loyalty')
ON CONFLICT (rule_key) DO NOTHING;

-- ============================================================
-- Triggers for automatic health updates
-- ============================================================
CREATE OR REPLACE FUNCTION public.trg_payment_health()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_customer_id UUID;
BEGIN
  SELECT customer_id INTO v_customer_id FROM public.orders WHERE id = NEW.order_id;
  IF v_customer_id IS NOT NULL THEN
    PERFORM public.update_customer_health_score(v_customer_id, 'PAYMENT_RECEIVED', 'LOW', NULL,
      jsonb_build_object('amount', NEW.amount), 'payment', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_health ON public.payments;
CREATE TRIGGER trg_payment_health AFTER INSERT ON public.payments
  FOR EACH ROW WHEN (NEW.status = 'successful') EXECUTE FUNCTION public.trg_payment_health();

CREATE OR REPLACE FUNCTION public.trg_contamination_health()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.contamination_detected = true AND (OLD.contamination_detected IS NULL OR OLD.contamination_detected = false) THEN
    PERFORM public.update_customer_health_score(NEW.customer_id, 'CONTAMINATION', 'HIGH', NULL,
      jsonb_build_object('order_id', NEW.id), 'order', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contamination_health ON public.orders;
CREATE TRIGGER trg_contamination_health AFTER UPDATE ON public.orders
  FOR EACH ROW WHEN (NEW.contamination_detected = true) EXECUTE FUNCTION public.trg_contamination_health();

CREATE OR REPLACE FUNCTION public.trg_cancellation_health()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM public.update_customer_health_score(NEW.customer_id, 'CANCELLATION', 'MED', NULL,
      jsonb_build_object('order_id', NEW.id), 'order', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cancellation_health ON public.orders;
CREATE TRIGGER trg_cancellation_health AFTER UPDATE ON public.orders
  FOR EACH ROW WHEN (NEW.status = 'cancelled') EXECUTE FUNCTION public.trg_cancellation_health();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_health_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_health_events;