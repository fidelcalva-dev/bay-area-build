import { useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  suggestedActions?: AiSuggestedAction[];
  riskFlags?: AiRiskFlag[];
  confidence?: number;
}

interface AiSuggestedAction {
  type: string;
  label: string;
  payload: Record<string, unknown>;
  requires_confirmation: boolean;
  id?: string;
  status?: string;
}

interface AiRiskFlag {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
}

interface KnowledgeArticle {
  id: string;
  category: string;
  title: string;
  content_markdown: string;
}

export type AiMode = 'SALES' | 'DISPATCH' | 'FINANCE' | 'CS' | 'ADMIN' | 'DRIVER' | 'MAINTENANCE';

export function useAiControlBrain() {
  const location = useLocation();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<AiSuggestedAction[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeArticle[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const msgCounter = useRef(0);

  const detectMode = useCallback((): AiMode => {
    const path = location.pathname;
    if (path.startsWith('/sales')) return 'SALES';
    if (path.startsWith('/dispatch')) return 'DISPATCH';
    if (path.startsWith('/finance')) return 'FINANCE';
    if (path.startsWith('/cs') || path.startsWith('/billing')) return 'CS';
    if (path.startsWith('/driver')) return 'DRIVER';
    if (path.includes('maintenance')) return 'MAINTENANCE';
    return 'ADMIN';
  }, [location.pathname]);

  const sendMessage = useCallback(async (
    text: string,
    entityType?: string,
    entityId?: string,
  ) => {
    setIsLoading(true);
    const userMsgId = `user-${++msgCounter.current}`;
    const userMsg: AiMessage = { id: userMsgId, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-control-brain', {
        body: {
          session_id: sessionId,
          user_message: text,
          current_route: location.pathname,
          entity_type: entityType || null,
          entity_id: entityId || null,
        },
      });

      if (error) throw error;

      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }

      const assistantMsg: AiMessage = {
        id: `assistant-${++msgCounter.current}`,
        role: 'assistant',
        text: data.answer || 'No response generated.',
        suggestedActions: data.suggested_actions || [],
        riskFlags: data.risk_flags || [],
        confidence: data.confidence,
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.suggested_actions?.length > 0) {
        setPendingActions(prev => [...prev, ...data.suggested_actions]);
      }
    } catch (err) {
      console.error('AI Control Brain error:', err);
      const errorMsg: AiMessage = {
        id: `error-${++msgCounter.current}`,
        role: 'assistant',
        text: 'Unable to process request. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error('AI assistant encountered an error');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, location.pathname]);

  const handleAction = useCallback(async (actionId: string, decision: 'CONFIRMED' | 'REJECTED') => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-action-runner', {
        body: { action_id: actionId, decision },
      });

      if (error) throw error;

      setPendingActions(prev =>
        prev.map(a => a.id === actionId ? { ...a, status: decision } : a)
      );

      toast.success(`Action ${decision.toLowerCase()}`);
      return data;
    } catch (err) {
      console.error('Action runner error:', err);
      toast.error('Failed to process action');
    }
  }, []);

  const searchKnowledge = useCallback(async (query?: string) => {
    setKnowledgeLoading(true);
    try {
      let q = supabase
        .from('ai_control_knowledge')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (query) {
        q = q.or(`title.ilike.%${query}%,content_markdown.ilike.%${query}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      setKnowledge((data as KnowledgeArticle[]) || []);
    } catch (err) {
      console.error('Knowledge search error:', err);
    } finally {
      setKnowledgeLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setPendingActions([]);
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    pendingActions,
    knowledge,
    knowledgeLoading,
    mode: detectMode(),
    sendMessage,
    handleAction,
    searchKnowledge,
    clearSession,
  };
}
