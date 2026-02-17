// Calsan Dumpster AI Chat Hook - with persistence and lead capture
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickReplies?: string[];
}

export interface ChatContext {
  zip?: string;
  material?: 'general' | 'heavy';
  size?: number;
  projectType?: string;
  city?: string;
}

const STORAGE_KEY = 'calsan_chat_v1';

interface PersistedState {
  conversationId: string | null;
  messages: Array<{ role: string; content: string; quickReplies?: string[] }>;
  context: ChatContext;
  leadCaptured: boolean;
  timestamp: number;
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as PersistedState;
    // Expire after 24 hours
    if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

export function useCalsanChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);

  // Persist state on changes
  useEffect(() => {
    if (messages.length > 0) {
      savePersistedState({
        conversationId,
        messages: messages.map(m => ({ role: m.role, content: m.content, quickReplies: m.quickReplies })),
        context,
        leadCaptured: isLeadCaptured,
        timestamp: Date.now(),
      });
    }
  }, [messages, context, conversationId, isLeadCaptured]);

  // Parse quick replies from AI response
  const parseQuickReplies = (content: string): { clean: string; replies: string[] } => {
    const match = content.match(/\[QUICK_REPLIES:\s*\[(.*?)\]\]/);
    if (match) {
      try {
        const replies = JSON.parse(`[${match[1]}]`);
        return { clean: content.replace(/\[QUICK_REPLIES:.*?\]\]/g, '').trim(), replies };
      } catch { /* fall through */ }
    }
    return { clean: content, replies: [] };
  };

  // Extract context from user messages
  const extractContext = (text: string, current: ChatContext): ChatContext => {
    const ctx = { ...current };
    const zipMatch = text.match(/\b(9[0-5]\d{3})\b/);
    if (zipMatch) ctx.zip = zipMatch[1];
    if (/concrete|dirt|rock|asphalt|brick|soil|heavy|inert/i.test(text)) ctx.material = 'heavy';
    else if (/junk|furniture|general|mixed|debris|cleanout|remodel|roofing|wood|drywall/i.test(text)) ctx.material = 'general';
    const sizeMatch = text.match(/(\d+)\s*yard/i);
    if (sizeMatch) ctx.size = parseInt(sizeMatch[1]);
    if (/kitchen/i.test(text)) ctx.projectType = 'Kitchen Remodel';
    else if (/bathroom/i.test(text)) ctx.projectType = 'Bathroom Remodel';
    else if (/garage/i.test(text)) ctx.projectType = 'Garage Cleanout';
    else if (/roof/i.test(text)) ctx.projectType = 'Roofing';
    else if (/demo|demolition/i.test(text)) ctx.projectType = 'Demolition';
    return ctx;
  };

  // Create a new conversation in DB
  const createConversation = async (): Promise<string> => {
    const { data } = await supabase.from('chat_conversations').insert([{
      source: 'website',
      context_json: JSON.parse(JSON.stringify(context)),
    }]).select('id').single();
    return data?.id || crypto.randomUUID();
  };

  // Initialize chat - restore or create new
  const initializeChat = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const persisted = loadPersistedState();
    if (persisted && persisted.messages.length > 0) {
      setMessages(persisted.messages.map((m, i) => ({
        id: `restored-${i}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(),
        quickReplies: m.quickReplies,
      })));
      setContext(persisted.context);
      setConversationId(persisted.conversationId);
      setIsLeadCaptured(persisted.leadCaptured);
      return;
    }

    // Fresh welcome
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to Calsan Dumpsters Pro. I can help you find the right dumpster size, get an instant price estimate, or answer questions about our services.\n\nWhat can I help you with today?',
      timestamp: new Date(),
      quickReplies: ['I need a dumpster', 'Get an instant quote', 'What sizes do you have?', 'Talk to a human'],
    }]);
  }, []);

  // Send message
  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const newContext = extractContext(userInput, context);
    setContext(newContext);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Ensure conversation exists
    let convId = conversationId;
    if (!convId) {
      convId = await createConversation();
      setConversationId(convId);
    }

    const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    abortRef.current = new AbortController();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calsan-dumpster-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            context: newContext,
            conversation_id: convId,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      const assistantId = `assistant-${Date.now()}`;

      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Parse quick replies
      const { clean, replies } = parseQuickReplies(assistantContent);
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: clean, quickReplies: replies.length > 0 ? replies : undefined } : m
      ));

      // Save assistant message to DB
      if (convId) {
        await supabase.from('chat_messages').insert({
          conversation_id: convId,
          role: 'assistant',
          content: clean,
          quick_replies: replies.length > 0 ? replies : null,
        });
        // Update conversation context
        await supabase.from('chat_conversations').update({ context_json: JSON.parse(JSON.stringify(newContext)) }).eq('id', convId);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize for the inconvenience. Please try again or call us directly at (510) 680-2150.',
          timestamp: new Date(),
          quickReplies: ['Try again', 'Call (510) 680-2150'],
        }]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, context, conversationId, isLoading]);

  // Capture lead
  const captureLead = useCallback(async (data: { name: string; phone: string; email?: string }) => {
    setIsLeadCaptured(true);

    if (conversationId) {
      await supabase.from('chat_conversations').update({
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email || null,
        status: 'escalated',
        escalation_reason: 'Lead captured via chat',
      }).eq('id', conversationId);
    }

    // Create lead via existing edge function
    const transcript = messages.slice(-20).map(m =>
      `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`
    ).join('\n\n');

    try {
      await supabase.functions.invoke('lead-capture', {
        body: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          source: 'ai_chat',
          zip: context.zip,
          material: context.material,
          size: context.size,
          project_type: context.projectType,
          notes: `AI Chat Lead\n\nTranscript:\n${transcript}`,
        },
      });
    } catch (err) {
      console.error('Lead capture failed:', err);
    }
  }, [conversationId, messages, context]);

  // Reset chat
  const resetChat = useCallback(() => {
    setMessages([]);
    setContext({});
    setConversationId(null);
    setIsLeadCaptured(false);
    initializedRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isLoading,
    context,
    conversationId,
    isLeadCaptured,
    sendMessage,
    captureLead,
    initializeChat,
    resetChat,
  };
}
