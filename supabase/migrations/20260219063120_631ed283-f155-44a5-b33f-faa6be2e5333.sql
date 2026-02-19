
-- Lead Routing Rules table
CREATE TABLE IF NOT EXISTS public.lead_routing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  source_channel TEXT,
  customer_type TEXT,
  intent TEXT,
  market_zip_pattern TEXT,
  is_existing_customer BOOLEAN,
  priority INT NOT NULL DEFAULT 100,
  assign_team TEXT NOT NULL DEFAULT 'sales',
  assign_user_id UUID,
  sla_minutes INT NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view routing rules"
  ON public.lead_routing_rules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage routing rules"
  ON public.lead_routing_rules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'executive'))
  );

-- Add channel and provider to lead_events if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_events' AND column_name = 'channel') THEN
    ALTER TABLE public.lead_events ADD COLUMN channel TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_events' AND column_name = 'provider') THEN
    ALTER TABLE public.lead_events ADD COLUMN provider TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lead_events' AND column_name = 'performed_by_user_id') THEN
    ALTER TABLE public.lead_events ADD COLUMN performed_by_user_id UUID;
  END IF;
END $$;

-- Add last_followup_at and followup_count to sales_leads if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_leads' AND column_name = 'last_followup_at') THEN
    ALTER TABLE public.sales_leads ADD COLUMN last_followup_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_leads' AND column_name = 'followup_count') THEN
    ALTER TABLE public.sales_leads ADD COLUMN followup_count INT NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_leads' AND column_name = 'sla_minutes') THEN
    ALTER TABLE public.sales_leads ADD COLUMN sla_minutes INT NOT NULL DEFAULT 15;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_leads' AND column_name = 'routing_rule_id') THEN
    ALTER TABLE public.sales_leads ADD COLUMN routing_rule_id UUID REFERENCES public.lead_routing_rules(id);
  END IF;
END $$;

-- Seed default routing rules
INSERT INTO public.lead_routing_rules (rule_name, source_channel, is_existing_customer, priority, assign_team, sla_minutes)
VALUES
  ('Existing Customer -> CS', NULL, true, 10, 'cs', 30),
  ('Website Quote -> Sales', 'WEBSITE_QUOTE', NULL, 20, 'sales', 15),
  ('Website Form -> Sales', 'WEBSITE_FORM', NULL, 20, 'sales', 15),
  ('Phone Call -> Sales', 'PHONE_CALL', NULL, 20, 'sales', 5),
  ('SMS Inbound -> Sales', 'SMS_INBOUND', NULL, 25, 'sales', 15),
  ('Google Ads -> Sales', 'GOOGLE_ADS', NULL, 25, 'sales', 10),
  ('Meta/Social -> Sales', 'FB_MESSENGER', NULL, 30, 'sales', 30),
  ('Yelp -> Sales', 'YELP', NULL, 30, 'sales', 30),
  ('Nextdoor -> Sales', 'NEXTDOOR', NULL, 30, 'sales', 30),
  ('Default -> Sales', NULL, NULL, 999, 'sales', 15)
ON CONFLICT DO NOTHING;

-- Create apply_routing_rules function
CREATE OR REPLACE FUNCTION public.apply_routing_rules(p_lead_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead RECORD;
  v_rule RECORD;
BEGIN
  SELECT * INTO v_lead FROM sales_leads WHERE id = p_lead_id;
  IF v_lead IS NULL THEN RETURN 'LEAD_NOT_FOUND'; END IF;

  -- Find matching rule by priority
  SELECT * INTO v_rule
  FROM lead_routing_rules
  WHERE is_active = true
    AND (source_channel IS NULL OR source_channel = v_lead.channel_key)
    AND (is_existing_customer IS NULL OR is_existing_customer = COALESCE(v_lead.is_existing_customer, false))
    AND (customer_type IS NULL OR customer_type = v_lead.customer_type_detected)
  ORDER BY priority ASC
  LIMIT 1;

  IF v_rule IS NOT NULL THEN
    UPDATE sales_leads SET
      assignment_type = v_rule.assign_team,
      assigned_to = COALESCE(v_rule.assign_user_id, assigned_to),
      sla_minutes = v_rule.sla_minutes,
      routing_rule_id = v_rule.id,
      updated_at = now()
    WHERE id = p_lead_id;

    RETURN v_rule.assign_team;
  END IF;

  RETURN 'NO_RULE_MATCHED';
END;
$$;

-- Index for fast lead hub queries
CREATE INDEX IF NOT EXISTS idx_sales_leads_hub ON public.sales_leads (lead_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_leads_last_activity ON public.sales_leads (last_activity_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_sales_leads_quality ON public.sales_leads (lead_quality_label);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead ON public.lead_events (lead_id, created_at DESC);
