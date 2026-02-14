
-- Follow-Up Templates table
CREATE TABLE public.followup_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL CHECK (channel IN ('CALL','SMS','EMAIL')),
  customer_type TEXT NOT NULL DEFAULT 'any',
  lead_quality_band TEXT NOT NULL DEFAULT 'any',
  stage TEXT NOT NULL DEFAULT 'NEW',
  subject TEXT,
  body_text TEXT NOT NULL,
  variables_json JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.followup_templates ENABLE ROW LEVEL SECURITY;

-- Staff can read templates
CREATE POLICY "Authenticated users can read templates"
  ON public.followup_templates FOR SELECT
  TO authenticated USING (true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON public.followup_templates FOR ALL
  TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
