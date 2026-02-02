-- =============================================
-- SALES AI CLOSER FEATURE - CONFIG SETTINGS FIX
-- =============================================

-- Insert config settings for Sales AI with category
INSERT INTO public.config_settings (key, value, description, is_sensitive, category)
VALUES 
  ('sales_ai.enabled', 'true', 'Enable/disable Sales AI Closer feature', false, 'ai'),
  ('sales_ai.mode', '"DRY_RUN"', 'DRY_RUN = drafts only, LIVE = can send', false, 'ai'),
  ('sales_ai.send_enabled', 'false', 'Allow sending messages via AI', false, 'ai'),
  ('sales_ai.max_discount_pct_sales', '5', 'Max discount % for sales role', false, 'ai'),
  ('sales_ai.preferred_customer_discount_pct', '5', 'Discount % for preferred customers', false, 'ai')
ON CONFLICT (key) DO NOTHING;

-- Helper function to log sales AI audit
CREATE OR REPLACE FUNCTION public.log_sales_ai_audit(
  p_action_type TEXT,
  p_lead_id UUID DEFAULT NULL,
  p_contact_id UUID DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_input_summary JSONB DEFAULT '{}'::jsonb,
  p_ai_output JSONB DEFAULT '{}'::jsonb,
  p_model_used TEXT DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT NULL,
  p_latency_ms INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
  v_user_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  INSERT INTO public.sales_ai_audit (
    user_id, user_role, lead_id, contact_id, entity_type, entity_id,
    action_type, input_summary_json, ai_output_json, model_used, tokens_used, latency_ms
  ) VALUES (
    auth.uid(), v_user_role, p_lead_id, p_contact_id, p_entity_type, p_entity_id,
    p_action_type, p_input_summary, p_ai_output, p_model_used, p_tokens_used, p_latency_ms
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;