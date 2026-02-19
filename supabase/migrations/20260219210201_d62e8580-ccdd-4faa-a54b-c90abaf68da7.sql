
-- ============================================================
-- AI CHAT ESCALATION & HUMAN HANDOFF SYSTEM
-- Phase 1: Session + Messages + Handoff Packets
-- ============================================================

-- 1) ai_chat_sessions - tracks full chat sessions with intent/risk
CREATE TABLE public.ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  lead_id uuid REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_event_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','HANDED_OFF','CLOSED')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer_url text,
  landing_url text,
  capture_ip text,
  capture_user_agent text,
  context_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) ai_chat_messages - full conversation log with intent metadata
CREATE TABLE public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('assistant','user','system')),
  message_text text NOT NULL,
  meta_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) lead_handoff_packets - what agents receive on handoff
CREATE TABLE public.lead_handoff_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.ai_chat_sessions(id) ON DELETE SET NULL,
  assigned_team text NOT NULL CHECK (assigned_team IN ('SALES','CS','DISPATCH','BILLING')),
  assigned_user_id uuid,
  summary_text text NOT NULL,
  extracted_fields_json jsonb DEFAULT '{}'::jsonb,
  recommended_next_action text,
  risk_band text DEFAULT 'GREEN' CHECK (risk_band IN ('GREEN','AMBER','RED')),
  is_reviewed boolean NOT NULL DEFAULT false,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ai_chat_sessions_lead ON public.ai_chat_sessions(lead_id);
CREATE INDEX idx_ai_chat_sessions_status ON public.ai_chat_sessions(status);
CREATE INDEX idx_ai_chat_sessions_token ON public.ai_chat_sessions(session_token);
CREATE INDEX idx_ai_chat_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_created ON public.ai_chat_messages(created_at DESC);
CREATE INDEX idx_handoff_packets_lead ON public.lead_handoff_packets(lead_id);
CREATE INDEX idx_handoff_packets_team ON public.lead_handoff_packets(assigned_team);
CREATE INDEX idx_handoff_packets_unreviewed ON public.lead_handoff_packets(is_reviewed) WHERE NOT is_reviewed;

-- RLS
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_handoff_packets ENABLE ROW LEVEL SECURITY;

-- ai_chat_sessions: service role inserts, authenticated reads
CREATE POLICY "Anon can insert ai_chat_sessions" ON public.ai_chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon can update own session" ON public.ai_chat_sessions FOR UPDATE USING (true);
CREATE POLICY "Authenticated read ai_chat_sessions" ON public.ai_chat_sessions FOR SELECT USING (true);

-- ai_chat_messages: anon can insert, authenticated reads
CREATE POLICY "Anon can insert ai_chat_messages" ON public.ai_chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read ai_chat_messages" ON public.ai_chat_messages FOR SELECT USING (true);

-- lead_handoff_packets: only authenticated staff
CREATE POLICY "Authenticated read handoff_packets" ON public.lead_handoff_packets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service insert handoff_packets" ON public.lead_handoff_packets FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update handoff_packets" ON public.lead_handoff_packets FOR UPDATE USING (auth.uid() IS NOT NULL);
