
-- =============================================
-- AI Control Brain — Phase 1: Data Model
-- =============================================

-- 1) ai_control_sessions
CREATE TABLE public.ai_control_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_role text NOT NULL,
  mode text NOT NULL DEFAULT 'DRY_RUN' CHECK (mode IN ('DRY_RUN','LIVE_ASSIST','AUTO_SUGGEST')),
  started_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  current_route text,
  current_entity_type text CHECK (current_entity_type IS NULL OR current_entity_type IN ('LEAD','QUOTE','ORDER','RUN','CUSTOMER','ASSET','TRUCK','FACILITY')),
  current_entity_id uuid,
  context_snapshot_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) ai_control_messages
CREATE TABLE public.ai_control_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.ai_control_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  message_text text NOT NULL,
  response_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) ai_control_actions
CREATE TABLE public.ai_control_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.ai_control_sessions(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.ai_control_messages(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}',
  requires_confirmation boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'SUGGESTED' CHECK (status IN ('SUGGESTED','CONFIRMED','REJECTED','EXECUTED','FAILED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) ai_control_knowledge
CREATE TABLE public.ai_control_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content_markdown text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_control_sessions_user ON public.ai_control_sessions(user_id);
CREATE INDEX idx_ai_control_messages_session ON public.ai_control_messages(session_id);
CREATE INDEX idx_ai_control_actions_session ON public.ai_control_actions(session_id);
CREATE INDEX idx_ai_control_knowledge_category ON public.ai_control_knowledge(category);

-- =============================================
-- Phase 2: RLS Policies
-- =============================================

ALTER TABLE public.ai_control_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_control_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_control_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_control_knowledge ENABLE ROW LEVEL SECURITY;

-- ai_control_sessions: user owns their sessions; admin reads all
CREATE POLICY "Users can read own AI sessions"
  ON public.ai_control_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own AI sessions"
  ON public.ai_control_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI sessions"
  ON public.ai_control_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ai_control_messages: user reads/writes in own sessions; admin reads all
CREATE POLICY "Users can read own AI messages"
  ON public.ai_control_messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.ai_control_sessions s WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

CREATE POLICY "Users can insert AI messages in own sessions"
  ON public.ai_control_messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.ai_control_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

-- ai_control_actions: user reads own; admin reads all
CREATE POLICY "Users can read own AI actions"
  ON public.ai_control_actions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.ai_control_sessions s WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

CREATE POLICY "Users can insert AI actions in own sessions"
  ON public.ai_control_actions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.ai_control_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

CREATE POLICY "Users can update own AI actions"
  ON public.ai_control_actions FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.ai_control_sessions s WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
  );

-- ai_control_knowledge: staff can read; admin can write
CREATE POLICY "Staff can read knowledge base"
  ON public.ai_control_knowledge FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can insert knowledge"
  ON public.ai_control_knowledge FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update knowledge"
  ON public.ai_control_knowledge FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete knowledge"
  ON public.ai_control_knowledge FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Seed: ai_control_knowledge
-- =============================================

INSERT INTO public.ai_control_knowledge (category, title, content_markdown) VALUES
-- CRM How-To
('CRM_HOWTO', 'How to Create a Quote', '## Creating a Quote\n\n1. Navigate to **Sales > New Quote**\n2. Enter customer ZIP code to auto-resolve pricing\n3. Select dumpster size and material category\n4. Review the calculated price (based on META 2026 rates)\n5. Add any applicable discounts (requires approval if below margin threshold)\n6. Click **Save Quote** to generate a quote ID\n7. Use **Send to Customer** to email or SMS the quote link'),

('CRM_HOWTO', 'How to Create a Run', '## Creating a Run\n\n1. Navigate to **Dispatch > Dashboard**\n2. Click **New Run** or drag an order into the calendar\n3. Select the driver and truck\n4. Add stops: delivery, pickup, swap, or relay\n5. Set the run date and priority\n6. Assign a facility for disposal stops\n7. Click **Save Run** -- the driver will see it in their app'),

('CRM_HOWTO', 'How to Process a Swap', '## Swap Process\n\n1. Open the active order\n2. Click **Request Swap**\n3. Select reason: full, wrong size, project change\n4. Dispatch creates a pickup run for current asset + delivery run for new asset\n5. Both runs appear in the dispatch calendar\n6. Billing auto-generates swap charge based on pricing rules'),

('CRM_HOWTO', 'How to Upload a Dump Ticket', '## Dump Ticket Upload\n\n1. Driver opens the run in the Driver App\n2. At the facility checkpoint, tap **Upload Dump Ticket**\n3. Take a photo of the ticket\n4. Enter the net weight in tons\n5. System auto-calculates overage if weight exceeds included tonnage\n6. Finance reviews in **Billing > Dump Tickets**'),

('CRM_HOWTO', 'How to Approve Charges', '## Charge Approval\n\n1. Navigate to **Finance > Approval Queue**\n2. Review pending charges: overages, discounts, adjustments\n3. Each item shows the order, customer, amount, and reason\n4. Click **Approve** or **Reject** with notes\n5. Approved charges auto-generate invoice line items'),

-- Sales Playbook
('SALES_PLAYBOOK', 'Inbound Call Script', '## Inbound Call Script\n\n**Opening:** "Thank you for calling Calsan Dumpsters, this is [Name]. How can I help you today?"\n\n**Qualify:**\n- What type of project? (renovation, cleanout, roofing, construction)\n- What ZIP code?\n- What material? (general debris, concrete, soil, mixed)\n- When do you need it?\n\n**Quote:** "Based on your ZIP code and project, a [size] yard dumpster is $[price] flat rate, which includes [tonnage] tons and [days] rental days."\n\n**Close:** "I can reserve that for you right now. Would you like to proceed?"'),

('SALES_PLAYBOOK', 'Follow-Up SMS Templates', '## Follow-Up SMS Templates\n\n**After Quote (1 hour):**\n"Hi [Name], this is [Agent] from Calsan Dumpsters. Your [size]yd quote for [ZIP] is ready: [link]. Any questions?"\n\n**Day 2 Follow-Up:**\n"Hi [Name], just checking in on your dumpster quote. We have availability for [date]. Want me to lock in that date?"\n\n**After No Response (Day 5):**\n"Hi [Name], your quote for [size]yd in [city] is still available. Pricing is valid for 7 days. Let me know if you need anything."'),

('SALES_PLAYBOOK', 'Objection Handling', '## Common Objections\n\n**"Too expensive":**\n"Our pricing includes delivery, pickup, disposal, and [tonnage] tons. Many competitors charge these separately. Let me break down what is included."\n\n**"I found a cheaper option":**\n"I understand. Be sure to ask about overage fees, rental day limits, and whether disposal is included. Our rate is all-inclusive with no surprises."\n\n**"I need it today":**\n"We offer same-day delivery for orders placed before 12:00 PM local time, subject to availability. Let me check your area."'),

-- Heavy Material Rules
('HEAVY_RULES', 'Heavy Material Policy', '## Heavy Material Rules\n\n**Applies to:** Clean Soil, Clean Concrete, Mixed Soil, Asphalt, Brick\n\n**Sizes allowed:** 8yd and 10yd ONLY\n\n**Why:** Heavy materials exceed weight limits for standard dumpsters. Larger sizes risk overweight trucks and road violations.\n\n**Overage:** $165/ton over included tonnage\n\n**Live Load:** Available for clean loads only. Customer must have material staged and ready. Driver waits max 30 minutes.\n\n**Contamination:** If heavy dumpster contains mixed debris, additional sorting fees apply at facility discretion.'),

-- Billing Rules
('BILLING_RULES', 'Overage Policy', '## Overage Policy\n\n**Standard Rate:** $165/ton for weight exceeding included tonnage\n\n**Calculation:** (Actual Weight - Included Tonnage) x $165\n\n**Dump Ticket Required:** Overage charges require an uploaded dump ticket with net weight\n\n**Customer Notification:** Customer must be notified of overage before invoice is finalized\n\n**Dispute Process:** Customer has 48 hours to dispute. Disputes escalate to Finance for review.'),

('BILLING_RULES', 'Rental Day Extensions', '## Rental Day Policy\n\n**Standard Rental:** 7 days for residential, 14 days for contractor accounts\n\n**Extension Rate:** Varies by size and market. Check pricing engine for exact rate.\n\n**Auto-Extension:** System flags orders exceeding rental period. CS contacts customer before billing.\n\n**Grace Period:** 1 calendar day grace before extension charges apply.'),

-- Dispatch SOPs
('DISPATCH_RULES', 'Run Creation SOP', '## Run Creation Standard Operating Procedure\n\n1. Check driver availability and truck assignment\n2. Verify asset availability at assigned yard\n3. Group stops by geographic proximity\n4. Assign facility based on material type and city rules\n5. Set realistic ETAs accounting for traffic patterns\n6. Notify driver via app push notification\n7. Monitor run progress via dispatch dashboard'),

('DISPATCH_RULES', 'Facility Selection Rules', '## Facility Selection\n\n**Primary Rule:** Match facility to material category\n- General Debris: nearest transfer station\n- Clean Concrete/Soil: recycling center (lower cost)\n- Mixed Heavy: certified facility with scale\n\n**Secondary Rule:** Minimize round-trip time\n\n**Compliance Mode:** When enabled, restrict to certified recycling centers only\n\n**Never:** Route hazardous or prohibited materials. Reject and flag.'),

('DISPATCH_RULES', 'Live Load Procedure', '## Live Load SOP\n\n1. Confirm with customer: material must be staged and ready\n2. Driver arrives and positions dumpster\n3. Customer loads material (max 30 min wait)\n4. Driver monitors fill level and weight estimate\n5. Once loaded, driver proceeds directly to facility\n6. No rental days charged for live loads'),

-- Pricing Policy
('PRICING_POLICY', 'META 2026 Pricing Standard', '## META 2026 Pricing\n\n**Resolution Order:**\n1. ZIP code exact match (~430 ZIPs, tiers GA-GJ)\n2. City-based fallback\n\n**Includes:**\n- Delivery and pickup\n- Standard rental days (7 residential, 14 contractor)\n- Included tonnage by size\n- Disposal at approved facility\n\n**Overage:** $165/ton universal\n\n**Discounts:** Require approval if margin drops below 30%\n\n**Never reveal:** Internal cost structure, vendor rates, facility contracts, yard addresses');
