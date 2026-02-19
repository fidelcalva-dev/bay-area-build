import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, Loader2, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO } from '@/lib/shared-data';

// ============================================================
// TYPES
// ============================================================

type FlowMode = 'welcome' | 'ai' | 'photo_upload' | 'photo_analyzing' | 'dispatch' | 'callback_collect';

export type ChatMode = 'default' | 'sales' | 'commercial' | 'contractor';

interface ConversationMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  quickReplies?: string[];
  isTyping?: boolean;
}

interface AIContext {
  zip?: string;
  material?: string;
  size?: number;
  projectType?: string;
  customerType?: string;
  heavy?: boolean;
  urgencyScore?: number;
  readinessScore?: number;
  leadCreated?: boolean;
}

interface PersistedState {
  mode: FlowMode;
  messages: ConversationMessage[];
  context: AIContext;
  callbackData: Record<string, string>;
  aiHistory: { role: string; content: string }[];
  timestamp: number;
}

const STORAGE_KEY = 'calsan_ai_chat_v4';
const STATE_TTL_MS = 30 * 60 * 1000;
const ZIP_RE = /\b(9[0-5]\d{3})\b/;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calsan-dumpster-ai`;

// ============================================================
// PERSISTENCE
// ============================================================

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state: PersistedState = JSON.parse(raw);
    if (Date.now() - state.timestamp > STATE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return state;
  } catch { return null; }
}

function saveState(state: Omit<PersistedState, 'timestamp'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
  } catch { /* silent */ }
}

// ============================================================
// HELPERS
// ============================================================

function parseQuickReplies(text: string): { clean: string; replies: string[] } {
  const match = text.match(/\[QUICK_REPLIES:\s*\[([^\]]+)\]\]/);
  if (!match) return { clean: text, replies: [] };
  const clean = text.replace(/\[QUICK_REPLIES:\s*\[[^\]]+\]\]/, '').trim();
  const replies = match[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  return { clean, replies };
}

function extractContext(text: string, existing: AIContext): AIContext {
  const updated = { ...existing };
  const lower = text.toLowerCase();
  const zipMatch = text.match(ZIP_RE);
  if (zipMatch) updated.zip = zipMatch[1];
  if (/concrete|dirt|brick|asphalt|rock|soil|gravel/.test(lower)) { updated.material = 'heavy'; updated.heavy = true; }
  else if (/debris|trash|junk|furniture|wood|drywall|shingle|roofing/.test(lower)) updated.material = 'general';
  if (/kitchen|bathroom|remodel/.test(lower)) updated.projectType = 'remodel';
  else if (/garage|cleanout|clean.?out/.test(lower)) updated.projectType = 'cleanout';
  else if (/roof/.test(lower)) updated.projectType = 'roofing';
  else if (/demo|demolition/.test(lower)) updated.projectType = 'demolition';
  else if (/yard|landscap/.test(lower)) updated.projectType = 'landscaping';
  else if (/construction/.test(lower)) updated.projectType = 'construction';
  if (/contractor/.test(lower)) updated.customerType = 'contractor';
  else if (/commercial|business|company/.test(lower)) updated.customerType = 'commercial';
  else if (/homeowner|home.?owner|my home|my house/.test(lower)) updated.customerType = 'homeowner';
  const sizeMatch = lower.match(/(\d{1,2})\s*(?:yard|yd)/);
  if (sizeMatch) updated.size = parseInt(sizeMatch[1]);
  if (/today|asap|urgent|immediately|right now|tomorrow/.test(lower)) updated.urgencyScore = (updated.urgencyScore || 0) + 30;
  if (/ready|book|reserve|schedule|pay/.test(lower)) updated.readinessScore = (updated.readinessScore || 0) + 20;
  return updated;
}

// ============================================================
// STREAMING
// ============================================================

async function streamAI({
  messages, context, onDelta, onDone,
}: {
  messages: { role: string; content: string }[];
  context: AIContext;
  onDelta: (text: string) => void;
  onDone: (fullText: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) throw new Error('rate_limited');
    if (resp.status === 402) throw new Error('payment_required');
    throw new Error('ai_error');
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') break;
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) { fullText += c; onDelta(c); }
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  if (buffer.trim()) {
    for (let raw of buffer.split('\n')) {
      if (!raw || !raw.startsWith('data: ')) continue;
      const json = raw.slice(6).trim();
      if (json === '[DONE]') continue;
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) { fullText += c; onDelta(c); }
      } catch { /* ignore */ }
    }
  }
  onDone(fullText);
}

async function ensureLeadIngested(ctx: AIContext, source: string) {
  try {
    await supabase.functions.invoke('lead-ingest', {
      body: {
        source_channel: 'AI_ASSISTANT',
        source_detail: source,
        zip_code: ctx.zip || null,
        notes: [
          ctx.projectType ? `Project: ${ctx.projectType}` : null,
          ctx.material ? `Material: ${ctx.material}` : null,
          ctx.size ? `Size: ${ctx.size}yd` : null,
          ctx.heavy ? 'Heavy material flag' : null,
        ].filter(Boolean).join('. '),
      },
    });
  } catch { /* silent */ }
}

// ============================================================
// SESSION TRACKER
// ============================================================

function useSessionTracker() {
  const startTime = useRef(Date.now());
  const logEvent = useCallback(async (eventType: string, meta?: Record<string, unknown>) => {
    try {
      const params = new URLSearchParams(window.location.search);
      await supabase.from('ai_entry_events').insert({
        action_type: eventType,
        time_on_page_ms: Date.now() - startTime.current,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term'),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        metadata: meta ? JSON.parse(JSON.stringify(meta)) : null,
      });
    } catch { /* silent */ }
  }, []);
  return { logEvent };
}

// ============================================================
// QUICK ACTION BUTTONS
// ============================================================

const QUICK_ACTIONS = [
  { id: 'quote', label: 'Instant Quote', msg: 'I want to get an instant price for a dumpster rental.' },
  { id: 'photo', label: 'Upload Photo', msg: '' },
  { id: 'schedule', label: 'Schedule Delivery', msg: 'I want to schedule a dumpster delivery.' },
  { id: 'speak', label: 'Speak to Team', msg: '' },
];

// ============================================================
// WELCOME MESSAGE
// ============================================================

const WELCOME_MESSAGE: ConversationMessage = {
  id: 'welcome-0',
  role: 'system',
  content: 'Welcome to Calsan Dumpsters Pro.\n\nTell me your ZIP code and I\'ll calculate your exact pricing.',
};

// ============================================================
// COMPONENT
// ============================================================

interface CalsanAIChatProps {
  chatMode?: ChatMode;
  className?: string;
}

export function CalsanAIChat({ chatMode = 'default', className }: CalsanAIChatProps) {
  const persisted = useRef(loadState());
  const [mode, setMode] = useState<FlowMode>(persisted.current?.mode || 'welcome');
  const [messages, setMessages] = useState<ConversationMessage[]>(
    persisted.current?.messages || [WELCOME_MESSAGE]
  );
  const [aiContext, setAIContext] = useState<AIContext>(
    persisted.current?.context || (chatMode === 'contractor' ? { customerType: 'contractor' } : {})
  );
  const [aiHistory, setAIHistory] = useState<{ role: string; content: string }[]>(
    persisted.current?.aiHistory || []
  );
  const [callbackData, setCallbackData] = useState<Record<string, string>>(
    persisted.current?.callbackData || {}
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logEvent } = useSessionTracker();

  // Persist state
  useEffect(() => {
    saveState({ mode, messages, context: aiContext, callbackData, aiHistory });
  }, [mode, messages, aiContext, callbackData, aiHistory]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, streaming]);

  // Typing animation for welcome
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => {
    if (!persisted.current) {
      const t = setTimeout(() => setShowWelcome(true), 400);
      return () => clearTimeout(t);
    }
    setShowWelcome(true);
  }, []);

  const addSystem = useCallback((content: string, quickReplies?: string[]) => {
    setMessages(prev => [...prev, { id: `s-${Date.now()}-${Math.random()}`, role: 'system', content, quickReplies }]);
  }, []);

  const addUser = useCallback((content: string) => {
    setMessages(prev => [...prev, { id: `u-${Date.now()}-${Math.random()}`, role: 'user', content }]);
  }, []);

  const resetConversation = useCallback(() => {
    setMode('welcome');
    setMessages([WELCOME_MESSAGE]);
    setAIContext({});
    setAIHistory([]);
    setCallbackData({});
    setShowWelcome(true);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // AI Send
  const sendToAI = useCallback(async (userText: string, contextOverride?: AIContext) => {
    const ctx = contextOverride || aiContext;
    const newHistory = [...aiHistory, { role: 'user', content: userText }];
    setAIHistory(newHistory);
    setStreaming(true);
    setLoading(true);

    const streamMsgId = `s-stream-${Date.now()}`;
    setMessages(prev => [...prev, { id: streamMsgId, role: 'system', content: '' }]);

    try {
      await streamAI({
        messages: newHistory,
        context: ctx,
        onDelta: (chunk) => {
          setMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: m.content + chunk } : m));
        },
        onDone: (fullText) => {
          const { clean, replies } = parseQuickReplies(fullText);
          setMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: clean, quickReplies: replies.length > 0 ? replies : undefined } : m));
          setAIHistory(h => [...h, { role: 'assistant', content: fullText }]);
          if (ctx.zip && !ctx.leadCreated) {
            ensureLeadIngested(ctx, 'ai_conversation');
            setAIContext(prev => ({ ...prev, leadCreated: true }));
          }
        },
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'unknown';
      let fallback = 'Our system is temporarily unavailable. Please call us at (510) 680-2150.';
      if (errMsg === 'rate_limited') fallback = 'We are experiencing high volume. Please try again in a moment.';
      setMessages(prev => prev.map(m => m.id === streamMsgId ? { ...m, content: fallback } : m));
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [aiContext, aiHistory]);

  // Quick Action Handler
  const handleQuickAction = useCallback((actionId: string) => {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    logEvent('quick_action_clicked', { action: actionId });

    if (actionId === 'photo') {
      addUser('Upload a Photo for Recommendation');
      addSystem('Upload a photo of your debris or project area.');
      setMode('photo_upload');
      return;
    }

    if (actionId === 'speak') {
      addUser('Speak to Team');
      addSystem('Call us directly or request a callback.');
      setMode('dispatch');
      return;
    }

    addUser(action.label);
    setMode('ai');
    sendToAI(action.msg, aiContext);
  }, [logEvent, addUser, addSystem, aiContext, sendToAI]);

  // Text Submit
  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || streaming) return;
    setInput('');
    addUser(text);

    if (mode === 'welcome') {
      setMode('ai');
      const newCtx = extractContext(text, aiContext);
      setAIContext(newCtx);
      sendToAI(text, newCtx);
      return;
    }

    if (mode === 'ai') {
      const newCtx = extractContext(text, aiContext);
      setAIContext(newCtx);
      sendToAI(text, newCtx);
      return;
    }

    if (mode === 'callback_collect') {
      if (!callbackData.name) {
        setCallbackData(p => ({ ...p, name: text }));
        addSystem('What is your phone number?');
      } else if (!callbackData.phone) {
        setCallbackData(p => ({ ...p, phone: text }));
        addSystem('And your ZIP code? (optional, type "skip" to skip)');
      } else {
        const zip = text.toLowerCase() !== 'skip' ? text : undefined;
        setLoading(true);
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: {
              source_channel: 'AI_ASSISTANT',
              source_detail: 'callback_request',
              customer_name: callbackData.name,
              phone: callbackData.phone,
              zip_code: zip || null,
              notes: 'Callback requested via AI Chat',
              priority: 'HIGH',
            },
          });
          logEvent('callback_submitted', { zip });
          addSystem('Your request has been submitted. A team member will contact you shortly.', ['Get Instant Quote', 'Start Over']);
        } catch {
          addSystem('Something went wrong. Please call us directly at (510) 680-2150.');
        } finally {
          setLoading(false);
        }
      }
    }
  }, [input, loading, streaming, mode, aiContext, callbackData, addUser, addSystem, sendToAI, logEvent]);

  // Quick Reply Handler
  const handleQuickReply = useCallback((reply: string) => {
    const lower = reply.toLowerCase();
    if (lower === 'start over') { resetConversation(); return; }
    if (lower.includes('reserve now') || lower.includes('continue to booking') || lower.includes('schedule delivery')) {
      logEvent('routed_to_quote', { zip: aiContext.zip });
      const params = new URLSearchParams({ v3: '1' });
      if (aiContext.zip) params.set('zip', aiContext.zip);
      if (aiContext.size) params.set('size', String(aiContext.size));
      if (aiContext.material) params.set('material', aiContext.material);
      navigate(`/quote?${params.toString()}`);
      return;
    }
    if (lower.includes('call') && lower.includes('510')) {
      window.location.href = `tel:${BUSINESS_INFO.phone.sales}`;
      return;
    }
    if (lower === 'request callback') {
      addUser(reply);
      addSystem('What is your name?');
      setMode('callback_collect');
      setCallbackData({});
      return;
    }
    if (lower.includes('instant') && lower.includes('quote')) {
      const params = new URLSearchParams({ v3: '1' });
      if (aiContext.zip) params.set('zip', aiContext.zip);
      navigate(`/quote?${params.toString()}`);
      return;
    }
    if (lower === 'compare sizes') { navigate('/sizes'); return; }

    addUser(reply);
    if (mode !== 'ai') setMode('ai');
    const newCtx = extractContext(reply, aiContext);
    setAIContext(newCtx);
    sendToAI(reply, newCtx);
  }, [aiContext, navigate, resetConversation, addUser, addSystem, sendToAI, logEvent, mode]);

  // Photo Upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    setMode('photo_analyzing');
    logEvent('photo_uploaded');
    addSystem('Analyzing your photo...');

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke('analyze-waste', { body: { images: [base64] } });
      if (error) throw error;

      const size = data?.recommendation?.recommendedSize || 20;
      const material = data?.recommendation?.materialCategory || 'general';
      const confidence = data?.recommendation?.confidence || 0.8;
      const newCtx: AIContext = { ...aiContext, size, material: material === 'heavy' ? 'heavy' : 'general', heavy: material === 'heavy' };
      setAIContext(newCtx);
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== 'Analyzing your photo...');
        return [...filtered, {
          id: `s-photo-${Date.now()}`, role: 'system' as const,
          content: `Analysis complete. The material appears to be ${material}. A ${size}-yard dumpster is recommended (${Math.round(confidence * 100)}% confidence).${material === 'heavy' ? '\n\nHeavy materials require smaller containers with fill-line compliance.' : ''}`,
          quickReplies: ['See Exact Pricing', 'Compare Sizes', 'Upload Another Photo'],
        }];
      });
      ensureLeadIngested(newCtx, 'photo_analysis');
      setMode('ai');
    } catch {
      setMessages(prev => prev.filter(m => m.content !== 'Analyzing your photo...'));
      addSystem('For mixed debris cleanouts, a 20-yard dumpster is most common. Enter your ZIP code to see exact pricing.', ['See Exact Pricing', 'Compare Sizes']);
      setAIContext(prev => ({ ...prev, size: 20, material: 'general' }));
      setMode('ai');
    } finally {
      setLoading(false);
    }
  }, [logEvent, addSystem, aiContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const showQuickActions = mode === 'welcome' && showWelcome;
  const showInput = mode === 'welcome' || mode === 'ai' || mode === 'callback_collect';
  const showPhotoUpload = mode === 'photo_upload';
  const showDispatch = mode === 'dispatch';

  const getPlaceholder = () => {
    if (mode === 'callback_collect') {
      if (!callbackData.name) return 'Your name...';
      if (!callbackData.phone) return 'Your phone number...';
      return 'ZIP code (or type "skip")...';
    }
    return 'Tell us your ZIP code or describe your project...';
  };

  return (
    <div className={cn("w-full max-w-[850px] mx-auto", className)}>
      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] border border-[hsl(220_10%_93%)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[hsl(220_10%_93%)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">C</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Calsan</span>
              <span className="text-xs text-muted-foreground ml-2">
                {mode === 'ai' || mode === 'welcome' ? 'Dumpster Advisor' : ''}
              </span>
            </div>
          </div>
          {mode !== 'welcome' && (
            <button onClick={resetConversation} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              New conversation
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="px-5 py-5 overflow-y-auto space-y-4"
          style={{ minHeight: '320px', maxHeight: 'calc(100vh - 380px)' }}
        >
          {messages.map((msg, i) => (
            <div key={msg.id} className={cn(
              "space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
              i === 0 && !showWelcome && 'opacity-0'
            )}>
              <div className={cn('text-sm leading-relaxed', msg.role === 'user' ? 'flex justify-end' : '')}>
                {msg.role === 'system' ? (
                  <div className="bg-[hsl(220_10%_97%)] rounded-xl px-4 py-3 max-w-[90%] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <p className="text-foreground whitespace-pre-line">{msg.content}</p>
                  </div>
                ) : (
                  <div className="bg-[hsl(220_10%_92%)] rounded-xl px-4 py-3 max-w-[85%]">
                    <p className="text-foreground">{msg.content}</p>
                  </div>
                )}
              </div>
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-1">
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1.5 border border-[hsl(220_10%_90%)] rounded-lg text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {(loading && !streaming) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions (Welcome state only) */}
        {showQuickActions && (
          <div className="px-5 pb-2">
            <div className="flex flex-wrap gap-2 md:grid md:grid-cols-4 md:gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="flex-1 min-w-[140px] px-4 py-2.5 border border-[hsl(220_10%_90%)] rounded-xl text-sm font-medium text-foreground hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200 text-center"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-[hsl(220_10%_93%)] px-5 py-4 bg-[hsl(210_20%_99%)]">
          {showInput && (
            <div className="relative flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                className="flex-1 bg-white border border-[hsl(220_10%_90%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                disabled={loading || streaming}
                autoFocus
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || loading || streaming}
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl bg-primary hover:bg-primary/90 transition-colors"
              >
                {loading || streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          )}

          {showPhotoUpload && (
            <div>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[hsl(220_10%_88%)] rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 transition-colors"
              >
                <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm font-medium text-foreground">Tap to upload a photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG accepted</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <button onClick={() => navigate('/sizes')} className="text-xs text-muted-foreground hover:text-foreground underline">
                  View size guide
                </button>
                <button onClick={() => { setMode('welcome'); }} className="text-xs text-muted-foreground hover:text-foreground">
                  Back
                </button>
              </div>
            </div>
          )}

          {showDispatch && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call (510) 680-2150
                </a>
              </Button>
              <Button
                onClick={() => {
                  addUser('Request Callback');
                  addSystem('What is your name?');
                  setMode('callback_collect');
                  setCallbackData({});
                }}
                variant="outline"
                className="flex-1 rounded-xl h-11 border-[hsl(220_10%_90%)]"
              >
                Request Callback
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalsanAIChat;
