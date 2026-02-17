
-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT,
  session_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'handled', 'escalated', 'closed')),
  context_json JSONB DEFAULT '{}'::jsonb,
  lead_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  source TEXT DEFAULT 'website',
  handled_by UUID,
  handled_at TIMESTAMPTZ,
  escalation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  quick_replies JSONB,
  next_action TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public insert for anonymous visitors
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own conversation by session" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can update own conversation" ON public.chat_conversations FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read messages" ON public.chat_messages FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX idx_chat_conversations_created ON public.chat_conversations(created_at DESC);
CREATE INDEX idx_chat_conversations_phone ON public.chat_conversations(customer_phone);
CREATE INDEX idx_chat_conversations_email ON public.chat_conversations(customer_email);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);

-- Updated_at trigger
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
