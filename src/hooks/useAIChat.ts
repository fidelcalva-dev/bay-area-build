// AI Chat Widget State Management Hook
import { useState, useCallback, useRef } from 'react';
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
}

export interface CapturedLead {
  name?: string;
  phone?: string;
  email?: string;
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const [capturedLead, setCapturedLead] = useState<CapturedLead>({});
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Parse quick replies from message content
  const parseQuickReplies = (content: string): { cleanContent: string; quickReplies: string[] } => {
    const quickReplyMatch = content.match(/\[QUICK_REPLIES:\s*\[(.*?)\]\]/);
    if (quickReplyMatch) {
      try {
        const replies = JSON.parse(`[${quickReplyMatch[1]}]`);
        const cleanContent = content.replace(/\[QUICK_REPLIES:.*?\]\]/g, '').trim();
        return { cleanContent, quickReplies: replies };
      } catch {
        return { cleanContent: content, quickReplies: [] };
      }
    }
    return { cleanContent: content, quickReplies: [] };
  };

  // Extract context from conversation
  const extractContext = (userMessage: string, currentContext: ChatContext): ChatContext => {
    const newContext = { ...currentContext };

    // Extract ZIP code
    const zipMatch = userMessage.match(/\b(9[0-5]\d{3})\b/);
    if (zipMatch) {
      newContext.zip = zipMatch[1];
    }

    // Extract material type hints
    if (/concrete|dirt|rock|asphalt|brick|soil|heavy/i.test(userMessage)) {
      newContext.material = 'heavy';
    } else if (/junk|furniture|general|mixed|debris|cleanout|remodel/i.test(userMessage)) {
      newContext.material = 'general';
    }

    // Extract size mentions
    const sizeMatch = userMessage.match(/(\d+)\s*yard/i);
    if (sizeMatch) {
      newContext.size = parseInt(sizeMatch[1]);
    }

    // Extract project types
    if (/kitchen/i.test(userMessage)) newContext.projectType = 'Kitchen Remodel';
    else if (/bathroom/i.test(userMessage)) newContext.projectType = 'Bathroom Remodel';
    else if (/garage/i.test(userMessage)) newContext.projectType = 'Garage Cleanout';
    else if (/roof/i.test(userMessage)) newContext.projectType = 'Roofing';
    else if (/demo|demolition/i.test(userMessage)) newContext.projectType = 'Demolition';
    else if (/construct/i.test(userMessage)) newContext.projectType = 'Construction';

    return newContext;
  };

  // Send message and stream response
  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    // Update context from user message
    const newContext = extractContext(userInput, context);
    setContext(newContext);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Prepare messages for API
    const apiMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-sales-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            context: newContext,
            capturedLead: isLeadCaptured ? capturedLead : undefined,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Chat error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      // Create assistant message placeholder
      const assistantId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

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
              
              // Update message with streamed content
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch {
            // Incomplete JSON, wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Parse quick replies from final content
      const { cleanContent, quickReplies } = parseQuickReplies(assistantContent);
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: cleanContent, quickReplies }
          : m
      ));

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again or call us at (510) 680-2150.",
          timestamp: new Date(),
          quickReplies: ['Try again', 'Call us'],
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, context, capturedLead, isLeadCaptured, isLoading]);

  // Capture lead info and send to HighLevel
  const captureLead = useCallback(async (lead: CapturedLead) => {
    setCapturedLead(lead);
    setIsLeadCaptured(true);

    // Build conversation transcript (last 20 messages)
    const transcript = messages
      .slice(-20)
      .map(m => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`)
      .join('\n\n');

    try {
      await supabase.functions.invoke('ai-chat-lead', {
        body: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          zip: context.zip,
          waste_type: context.material,
          recommended_size: context.size,
          included_tons: context.size ? getTonnage(context.size) : undefined,
          project_type: context.projectType,
          conversation_transcript: transcript,
          needs_human_followup: false,
        },
      });
    } catch (error) {
      console.error('Failed to capture lead:', error);
    }
  }, [messages, context]);

  // Request human callback
  const requestCallback = useCallback(async (phone: string, bestTime?: string) => {
    const transcript = messages
      .slice(-20)
      .map(m => `${m.role === 'user' ? 'Customer' : 'AI'}: ${m.content}`)
      .join('\n\n');

    try {
      await supabase.functions.invoke('ai-chat-lead', {
        body: {
          name: capturedLead.name || 'Unknown',
          phone,
          email: capturedLead.email,
          zip: context.zip,
          waste_type: context.material,
          recommended_size: context.size,
          project_type: context.projectType,
          notes: bestTime ? `Best time to call: ${bestTime}` : undefined,
          conversation_transcript: transcript,
          needs_human_followup: true,
        },
      });
    } catch (error) {
      console.error('Failed to request callback:', error);
    }
  }, [messages, context, capturedLead]);

  // Cancel current request
  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  // Reset chat
  const resetChat = useCallback(() => {
    setMessages([]);
    setContext({});
    setCapturedLead({});
    setIsLeadCaptured(false);
  }, []);

  // Initialize with welcome message
  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hey there! 👋 I'm here to help you get the right dumpster, fast. What can I help you with today?",
        timestamp: new Date(),
        quickReplies: [
          'Get an instant quote',
          'Help me choose a size',
          'Heavy materials (concrete/dirt)',
          'Contractor questions',
          'Talk to a human',
        ],
      }]);
    }
  }, [messages.length]);

  return {
    messages,
    isLoading,
    context,
    capturedLead,
    isLeadCaptured,
    sendMessage,
    captureLead,
    requestCallback,
    cancelRequest,
    resetChat,
    initializeChat,
  };
}

// Helper to get included tonnage
function getTonnage(size: number): number {
  const tonnageMap: Record<number, number> = {
    6: 0.5,
    8: 0.5,
    10: 1,
    20: 2,
    30: 3,
    40: 4,
    50: 5,
  };
  return tonnageMap[size] || 0;
}
