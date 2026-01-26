-- Create help scope enum
CREATE TYPE public.help_scope AS ENUM ('GLOBAL', 'SALES', 'CS', 'DISPATCH', 'DRIVER', 'BILLING', 'ADMIN');

-- Create help severity enum
CREATE TYPE public.help_severity AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- Create document key enum
CREATE TYPE public.doc_key_type AS ENUM ('NON_NEGOTIABLE_RULES', 'CEO_WEEKLY_CHECKLIST', 'PLAYBOOK_EXCEPTIONS');

-- Create internal_documents table
CREATE TABLE public.internal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_key doc_key_type NOT NULL,
  title TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1.0',
  description TEXT,
  file_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internal_documents ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can view internal documents
CREATE POLICY "Admins can view internal documents"
  ON public.internal_documents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Only admins can insert internal documents
CREATE POLICY "Admins can insert internal documents"
  ON public.internal_documents FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: Only admins can update internal documents
CREATE POLICY "Admins can update internal documents"
  ON public.internal_documents FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create help_content table
CREATE TABLE public.help_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  help_key TEXT UNIQUE NOT NULL,
  scopes help_scope[] NOT NULL DEFAULT ARRAY['GLOBAL']::help_scope[],
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  severity help_severity NOT NULL DEFAULT 'INFO',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_content ENABLE ROW LEVEL SECURITY;

-- RLS: All authenticated users can view active help content
CREATE POLICY "Authenticated users can view help content"
  ON public.help_content FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS: Only admins can manage help content
CREATE POLICY "Admins can manage help content"
  ON public.help_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create user_help_acknowledgements table
CREATE TABLE public.user_help_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  help_key TEXT NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, help_key)
);

-- Enable RLS
ALTER TABLE public.user_help_acknowledgements ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own acknowledgements
CREATE POLICY "Users can view own acknowledgements"
  ON public.user_help_acknowledgements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS: Users can insert their own acknowledgements
CREATE POLICY "Users can insert own acknowledgements"
  ON public.user_help_acknowledgements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create private storage bucket for internal docs
INSERT INTO storage.buckets (id, name, public)
VALUES ('internal-docs', 'internal-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Only admins can read internal docs
CREATE POLICY "Admins can read internal docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'internal-docs' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: Only admins can upload internal docs
CREATE POLICY "Admins can upload internal docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'internal-docs' AND public.has_role(auth.uid(), 'admin'));

-- Add index for help_key lookups
CREATE INDEX idx_help_content_help_key ON public.help_content(help_key);
CREATE INDEX idx_help_content_scopes ON public.help_content USING GIN(scopes);

-- Add trigger for updated_at
CREATE TRIGGER update_help_content_updated_at
  BEFORE UPDATE ON public.help_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed help_content with canonical rules
INSERT INTO public.help_content (help_key, scopes, title, body, severity) VALUES
-- Critical Material Rules
('GRASS_DEBRIS_RULE', ARRAY['GLOBAL', 'SALES', 'CS', 'DRIVER']::help_scope[], 
 'Grass is Billed as Debris Heavy',
 'Grass and yard waste are ALWAYS treated as mixed debris due to soil content. Green Halo does NOT apply. Fill line rules apply. This is a non-negotiable rule.',
 'CRITICAL'),

('FILL_LINE_RULE', ARRAY['GLOBAL', 'SALES', 'DISPATCH', 'DRIVER']::help_scope[],
 'Fill Line Required for Heavy Materials',
 'Heavy dumpsters (concrete, dirt, rock, etc.) must NOT be filled above the marked fill line due to 10-ton weight limits. Overfilling results in safety hazards and extra fees.',
 'WARNING'),

('GREEN_HALO_ELIGIBILITY', ARRAY['GLOBAL', 'SALES', 'CS']::help_scope[],
 'Green Halo™ Eligibility',
 'Green Halo applies ONLY to: Clean Concrete, Clean Asphalt, Clean Brick/Block, Clean Wood (no paint), Wood Chips. Does NOT apply to: Grass, Yard Waste, Mixed Materials, Painted Wood.',
 'INFO'),

('CONTAMINATION_RECLASSIFICATION', ARRAY['GLOBAL', 'SALES', 'CS', 'DRIVER', 'BILLING']::help_scope[],
 'Contamination Reclassification Rule',
 'If trash is found in a heavy clean load, the entire order is reclassified to Mixed Debris pricing. This triggers extra ton billing at $165/ton. Photos are mandatory for documentation.',
 'CRITICAL'),

-- Driver & Dispatch Rules
('PHOTO_REQUIREMENT_HEAVY', ARRAY['DISPATCH', 'DRIVER']::help_scope[],
 'Mandatory Photos for Heavy Material Pickup',
 'Before completing a heavy material pickup: 1) Take wide-angle photo showing fill level. 2) Take close-up photo of material type. 3) Report any contamination. Photos are required for run completion.',
 'CRITICAL'),

('RUN_LATE_ESCALATION', ARRAY['DISPATCH']::help_scope[],
 'Late Run Escalation Protocol',
 'If a run is 30+ minutes past scheduled start: 1) Contact driver immediately. 2) Update ETA in system. 3) Notify customer proactively. 4) Create alert if no response within 15 minutes.',
 'WARNING'),

('DRIVER_CONTAMINATION_REPORT', ARRAY['DRIVER']::help_scope[],
 'Contamination Reporting for Drivers',
 'If you see trash/prohibited items in a heavy load: 1) Take photos immediately. 2) Tap "Report Contamination" in app. 3) Do NOT proceed with haul until logged. Dispatch will handle reclassification.',
 'WARNING'),

-- Sales & CS Rules
('QUOTE_FOLLOWUP_RULE', ARRAY['SALES', 'CS']::help_scope[],
 'Quote Follow-Up Protocol',
 'All unpaid quotes require follow-up within 60 minutes. Mark as contacted or set callback. If no response after 3 attempts over 24h, move to "No Response" status.',
 'INFO'),

('PREPAY_DISCOUNT', ARRAY['SALES', 'CS']::help_scope[],
 'Pre-Pay Discount Policy',
 'Pre-payment gets 5% off extra ton rate ($156.75 vs $165). Offer this for high-risk estimates where tonnage is uncertain. Must be collected before delivery.',
 'INFO'),

('EXISTING_CUSTOMER_ROUTING', ARRAY['SALES', 'CS']::help_scope[],
 'Existing Customer Routing',
 'Leads from phone/email matching existing customers route to CS, not Sales. This ensures continuity and faster service. Check order history before quoting.',
 'INFO'),

-- Billing & Finance Rules
('EXTRA_TON_BILLING', ARRAY['BILLING', 'CS']::help_scope[],
 'Extra Ton Billing',
 'Extra tons billed at $165/ton (Oakland/SJ market). Included tons vary by size: 5yd=0.5T, 6yd=0.6T, 8yd=0.8T, 10yd=1.0T. Only bill after scale ticket received.',
 'INFO'),

('OVERDUE_BILLING_POLICY', ARRAY['BILLING', 'DISPATCH']::help_scope[],
 'Overdue Billing Policy',
 'Overdue rate: $35/day. Auto-bill limit: $250 for contractors. Homeowners require approval for any auto-billing. Escalate to dispatch after 3 overdue days.',
 'WARNING'),

('APPROVAL_THRESHOLD', ARRAY['BILLING', 'ADMIN']::help_scope[],
 'Approval Required Thresholds',
 'Approval required for: 1) Price adjustments over $250. 2) Homeowner overdue charges. 3) Reclassification billing over $250. 4) Any refund or credit. Route to Admin queue.',
 'WARNING'),

-- Admin & CEO Rules
('CEO_WEEKLY_CHECKLIST', ARRAY['ADMIN']::help_scope[],
 'CEO Weekly Focus',
 'Weekly review: 1) KPI Dashboard - revenue/utilization trends. 2) Overdue > 7 days - approve actions. 3) Failed runs - review root causes. 4) Approval queue - clear backlog. Do NOT micromanage ops.',
 'INFO'),

('MASTER_AI_INTERVENTION', ARRAY['ADMIN']::help_scope[],
 'When to Override Master AI',
 'Let AI handle: routine alerts, standard escalations, draft messages. Human required for: customer complaints, refund decisions, policy exceptions, any money movement.',
 'INFO'),

('CONFIG_CHANGE_APPROVAL', ARRAY['ADMIN']::help_scope[],
 'Critical Config Changes',
 'The following require owner approval before changing: 1) Pricing tables. 2) Messaging mode (DRY_RUN→LIVE). 3) Auto-billing thresholds. 4) RLS policies. Document reason in version history.',
 'CRITICAL'),

-- Add feature flag for help tooltips
('HELP_TOOLTIPS_ENABLED', ARRAY['ADMIN']::help_scope[],
 'Help Tooltips Feature Flag',
 'When disabled, contextual help tooltips will not appear throughout the application. PDFs remain accessible. Toggle in config_settings: help_tooltips.enabled',
 'INFO');

-- Add config setting for help tooltips feature flag
INSERT INTO public.config_settings (category, key, value, description, is_locked)
VALUES ('help', 'tooltips_enabled', 'true'::jsonb, 'Enable/disable contextual help tooltips throughout the application', false)
ON CONFLICT (category, key) DO UPDATE SET value = EXCLUDED.value;