import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, Loader2, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO } from '@/lib/shared-data';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';

// ============================================================
// TYPES
// ============================================================

type FlowMode = 'menu' | 'ai' | 'photo_upload' | 'photo_analyzing' | 'dispatch' | 'callback_collect';

interface ConversationMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  quickReplies?: string[];
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

const STORAGE_KEY = 'calsan_conv_hero_v3';
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
// QUICK REPLY PARSER
// ============================================================

function parseQuickReplies(text: string): { clean: string; replies: string[] } {
  const match = text.match(/\[QUICK_REPLIES:\s*\[([^\]]+)\]\]/);
  if (!match) return { clean: text, replies: [] };
  const clean = text.replace(/\[QUICK_REPLIES:\s*\[[^\]]+\]\]/, '').trim();
  const replies = match[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  return { clean, replies };
}

// ============================================================
// CONTEXT EXTRACTION
// ============================================================

function extractContext(text: string, existing: AIContext): AIContext {
  const updated = { ...existing };
  const lower = text.toLowerCase();

  // ZIP
  const zipMatch = text.match(ZIP_RE);
  if (zipMatch) updated.zip = zipMatch[1];

  // Material detection
  if (/concrete|dirt|brick|asphalt|rock|soil|gravel/.test(lower)) {
    updated.material = 'heavy';
    updated.heavy = true;
  } else if (/debris|trash|junk|furniture|wood|drywall|shingle|roofing/.test(lower)) {
    updated.material = 'general';
  }

  // Project type detection
  if (/kitchen|bathroom|remodel/.test(lower)) updated.projectType = 'remodel';
  else if (/garage|cleanout|clean.?out/.test(lower)) updated.projectType = 'cleanout';
  else if (/roof/.test(lower)) updated.projectType = 'roofing';
  else if (/demo|demolition/.test(lower)) updated.projectType = 'demolition';
  else if (/yard|landscap/.test(lower)) updated.projectType = 'landscaping';
  else if (/construction/.test(lower)) updated.projectType = 'construction';

  // Customer type
  if (/contractor/.test(lower)) updated.customerType = 'contractor';
  else if (/commercial|business|company/.test(lower)) updated.customerType = 'commercial';
  else if (/homeowner|home.?owner|my home|my house/.test(lower)) updated.customerType = 'homeowner';

  // Size
  const sizeMatch = lower.match(/(\d{1,2})\s*(?:yard|yd)/);
  if (sizeMatch) updated.size = parseInt(sizeMatch[1]);

  // Urgency
  if (/today|asap|urgent|immediately|right now|tomorrow/.test(lower)) {
    updated.urgencyScore = (updated.urgencyScore || 0) + 30;
  }
  if (/ready|book|reserve|schedule|pay/.test(lower)) {
    updated.readinessScore = (updated.readinessScore || 0) + 20;
  }

  return updated;
}

// ============================================================
// MENU OPTIONS
// ============================================================

const MENU_OPTIONS = [
  { id: 'instant_price', label: 'Get Instant Price', initialMsg: 'I want to get an instant price for a dumpster rental.' },
  { id: 'schedule', label: 'Schedule a Dumpster', initialMsg: 'I want to schedule a dumpster delivery.' },
  { id: 'contractor', label: "I'm a Contractor", initialMsg: "I'm a contractor and need dumpster service." },
  { id: 'size_help', label: 'I Need Help Choosing Size', initialMsg: 'I need help choosing the right dumpster size for my project.' },
  { id: 'photo', label: 'Upload a Photo for Recommendation', initialMsg: '' },
  { id: 'dispatch', label: 'Talk to Dispatch', initialMsg: '' },
];

const INITIAL_MESSAGE: ConversationMessage = {
  id: 'sys-0',
  role: 'system',
  content: 'Select an option below to begin.',
};

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
// STREAMING
// ============================================================

async function streamAI({
  messages,
  context,
  onDelta,
  onDone,
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
    const status = resp.status;
    if (status === 429) throw new Error('rate_limited');
    if (status === 402) throw new Error('payment_required');
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

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') break;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          fullText += content;
          onDelta(content);
        }
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  // Flush remaining
  if (buffer.trim()) {
    for (let raw of buffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) { fullText += content; onDelta(content); }
      } catch { /* ignore */ }
    }
  }

  onDone(fullText);
}

// ============================================================
// LEAD SCORING & INGESTION
// ============================================================

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
          ctx.urgencyScore ? `Urgency: ${ctx.urgencyScore}` : null,
          ctx.readinessScore ? `Readiness: ${ctx.readinessScore}` : null,
        ].filter(Boolean).join('. '),
      },
    });
  } catch { /* silent */ }
}

// ============================================================
// COMPONENT
// ============================================================

interface ConversationalHeroProps {
  cityName?: string;
  countyName?: string;
}

export function ConversationalHero({ cityName, countyName }: ConversationalHeroProps) {
  const persisted = useRef(loadState());
  const [mode, setMode] = useState<FlowMode>(persisted.current?.mode || 'menu');
  const [messages, setMessages] = useState<ConversationMessage[]>(
    persisted.current?.messages || [INITIAL_MESSAGE]
  );
  const [aiContext, setAIContext] = useState<AIContext>(persisted.current?.context || {});
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
  const navigate = useNavigate();
  const { logEvent } = useSessionTracker();

  // Persist
  useEffect(() => {
    saveState({ mode, messages, context: aiContext, callbackData, aiHistory });
  }, [mode, messages, aiContext, callbackData, aiHistory]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, streaming]);

  // Helpers
  const addSystem = useCallback((content: string, quickReplies?: string[]) => {
    setMessages(prev => [...prev, { id: `s-${Date.now()}-${Math.random()}`, role: 'system', content, quickReplies }]);
  }, []);

  const addUser = useCallback((content: string) => {
    setMessages(prev => [...prev, { id: `u-${Date.now()}-${Math.random()}`, role: 'user', content }]);
  }, []);

  const resetConversation = useCallback(() => {
    setMode('menu');
    setMessages([INITIAL_MESSAGE]);
    setAIContext({});
    setAIHistory([]);
    setCallbackData({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ========= AI SEND =========
  const sendToAI = useCallback(async (userText: string, contextOverride?: AIContext) => {
    const ctx = contextOverride || aiContext;
    const newHistory = [...aiHistory, { role: 'user', content: userText }];
    setAIHistory(newHistory);
    setStreaming(true);
    setLoading(true);

    // Add placeholder for streaming
    const streamMsgId = `s-stream-${Date.now()}`;
    setMessages(prev => [...prev, { id: streamMsgId, role: 'system', content: '' }]);

    try {
      await streamAI({
        messages: newHistory,
        context: ctx,
        onDelta: (chunk) => {
          setMessages(prev =>
            prev.map(m => m.id === streamMsgId ? { ...m, content: m.content + chunk } : m)
          );
        },
        onDone: (fullText) => {
          const { clean, replies } = parseQuickReplies(fullText);
          setMessages(prev =>
            prev.map(m => m.id === streamMsgId ? { ...m, content: clean, quickReplies: replies.length > 0 ? replies : undefined } : m)
          );
          setAIHistory(h => [...h, { role: 'assistant', content: fullText }]);

          // Lead creation on meaningful interaction
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
      setMessages(prev =>
        prev.map(m => m.id === streamMsgId ? { ...m, content: fallback } : m)
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }, [aiContext, aiHistory]);

  // ========= MENU SELECT =========
  const handleMenuSelect = useCallback((optionId: string) => {
    const opt = MENU_OPTIONS.find(o => o.id === optionId);
    if (!opt) return;

    logEvent('option_clicked', { path: optionId });

    if (optionId === 'photo') {
      addUser('Upload a Photo for Recommendation');
      addSystem('Upload a photo of your debris or project area.');
      setMode('photo_upload');
      return;
    }

    if (optionId === 'dispatch') {
      addUser('Talk to Dispatch');
      addSystem('Call us directly or request a call back.');
      setMode('dispatch');
      return;
    }

    // AI-driven flow
    addUser(opt.label);
    setMode('ai');

    // Extract initial context from the selection
    let ctx = { ...aiContext };
    if (optionId === 'contractor') ctx.customerType = 'contractor';
    setAIContext(ctx);

    sendToAI(opt.initialMsg, ctx);
  }, [logEvent, addUser, addSystem, aiContext, sendToAI]);

  // ========= TEXT SUBMIT =========
  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || streaming) return;
    setInput('');
    addUser(text);

    if (mode === 'ai') {
      // Extract context from user message
      const newCtx = extractContext(text, aiContext);
      setAIContext(newCtx);
      sendToAI(text, newCtx);
      return;
    }

    // Callback collection
    if (mode === 'callback_collect') {
      if (!callbackData.name) {
        setCallbackData(p => ({ ...p, name: text }));
        addSystem('What is your phone number?');
      } else if (!callbackData.phone) {
        setCallbackData(p => ({ ...p, phone: text }));
        addSystem('And your ZIP code? (optional, type "skip" to skip)');
      } else {
        const zip = text.toLowerCase() !== 'skip' ? text : undefined;
        if (zip) setCallbackData(p => ({ ...p, zip }));
        setLoading(true);
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: {
              source_channel: 'AI_ASSISTANT',
              source_detail: 'callback_request',
              customer_name: callbackData.name,
              phone: callbackData.phone,
              zip_code: zip || null,
              notes: 'Callback requested from AI Conversational Hero',
              priority: 'HIGH',
            },
          });
          logEvent('callback_submitted', { zip });
          addSystem('Your request has been submitted. A team member will contact you shortly.', ['View Instant Pricing', 'Start Over']);
        } catch {
          addSystem('Something went wrong. Please call us directly at (510) 680-2150.');
        } finally {
          setLoading(false);
        }
      }
      return;
    }
  }, [input, loading, streaming, mode, aiContext, callbackData, addUser, addSystem, sendToAI, logEvent]);

  // ========= QUICK REPLY HANDLER =========
  const handleQuickReply = useCallback((reply: string) => {
    const lower = reply.toLowerCase();

    if (lower === 'start over') {
      resetConversation();
      return;
    }

    if (lower.includes('reserve now') || lower.includes('continue to booking') || lower.includes('schedule delivery')) {
      logEvent('routed_to_quote', { zip: aiContext.zip, from: 'ai_quick_reply' });
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

    if (lower === 'view instant pricing' || lower === 'open instant quote') {
      const params = new URLSearchParams({ v3: '1' });
      if (aiContext.zip) params.set('zip', aiContext.zip);
      navigate(`/quote?${params.toString()}`);
      return;
    }

    if (lower === 'compare sizes') {
      navigate('/sizes');
      return;
    }

    // Default: treat as AI input
    addUser(reply);
    if (mode !== 'ai') setMode('ai');
    const newCtx = extractContext(reply, aiContext);
    setAIContext(newCtx);
    sendToAI(reply, newCtx);
  }, [aiContext, navigate, resetConversation, addUser, addSystem, sendToAI, logEvent, mode]);

  // ========= PHOTO UPLOAD =========
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

      const { data, error } = await supabase.functions.invoke('analyze-waste', {
        body: { images: [base64] },
      });

      if (error) throw error;

      const size = data?.recommendation?.recommendedSize || 20;
      const material = data?.recommendation?.materialCategory || 'general';
      const confidence = data?.recommendation?.confidence || 0.8;

      const newCtx: AIContext = {
        ...aiContext,
        size,
        material: material === 'heavy' ? 'heavy' : 'general',
        heavy: material === 'heavy',
        readinessScore: (aiContext.readinessScore || 0) + 10,
      };
      setAIContext(newCtx);

      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== 'Analyzing your photo...');
        return [
          ...filtered,
          {
            id: `s-photo-${Date.now()}`,
            role: 'system' as const,
            content: `The uploaded image appears to contain ${material} material. A ${size}-yard dumpster is recommended. Confidence level: ${Math.round(confidence * 100)}%.${material === 'heavy' ? '\n\nHeavy materials require smaller containers with fill-line compliance.' : ''}`,
            quickReplies: ['See Exact Pricing', 'Compare Sizes', 'Upload Another Photo'],
          },
        ];
      });

      ensureLeadIngested(newCtx, 'photo_analysis');
      setMode('ai');
    } catch {
      setMessages(prev => prev.filter(m => m.content !== 'Analyzing your photo...'));
      addSystem(
        'For mixed debris cleanouts, a 20-yard dumpster is most common. Enter your ZIP code to see exact pricing.',
        ['See Exact Pricing', 'Compare Sizes']
      );
      setAIContext(prev => ({ ...prev, size: 20, material: 'general' }));
      setMode('ai');
    } finally {
      setLoading(false);
    }
  }, [logEvent, addSystem, aiContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Determine UI state
  const showMenu = mode === 'menu';
  const showInput = mode === 'ai' || mode === 'callback_collect';
  const showPhotoUpload = mode === 'photo_upload';
  const showDispatch = mode === 'dispatch';

  const getPlaceholder = () => {
    if (mode === 'callback_collect') {
      if (!callbackData.name) return 'Your name...';
      if (!callbackData.phone) return 'Your phone number...';
      return 'ZIP code (or type "skip")...';
    }
    return 'Describe your project or enter a ZIP code...';
  };

  return (
    <section className="bg-[hsl(150_10%_98%)] relative">
      <LocalSEOSchema cityName={cityName} countyName={countyName} includeFAQ includeService />

      <div className="container-wide py-16 md:py-24 lg:py-28">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <p className="text-sm font-medium tracking-widest uppercase text-primary">
            Calsan Dumpster Systems
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
            What do you need today?
          </h1>
          <p className="text-lg text-muted-foreground">
            We'll guide you step by step.
          </p>
        </div>

        {/* Conversation Panel */}
        <div className="max-w-[800px] mx-auto border border-border rounded-2xl bg-card overflow-hidden">
          {/* Panel Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">C</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">Calsan</span>
                {mode === 'ai' && (
                  <span className="text-xs text-muted-foreground ml-2">Dumpster Advisor</span>
                )}
              </div>
            </div>
            {mode !== 'menu' && (
              <button
                onClick={resetConversation}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Start over
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="px-6 py-6 overflow-y-auto space-y-4"
            style={{ minHeight: '280px', maxHeight: '520px' }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div className={cn('text-sm leading-relaxed', msg.role === 'user' ? 'text-right' : '')}>
                  {msg.role === 'system' ? (
                    <p className="text-foreground whitespace-pre-line">{msg.content}</p>
                  ) : (
                    <p className="inline-block bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-left">
                      {msg.content}
                    </p>
                  )}
                </div>
                {/* Quick Replies */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.quickReplies.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
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
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="border-t border-border px-6 py-5 bg-[hsl(150_10%_98%)]">
            {/* Menu */}
            {showMenu && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleMenuSelect(opt.id)}
                    className="text-left px-4 py-3 border border-border rounded-lg text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* AI / Callback Input */}
            {showInput && (
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholder()}
                  className="flex-1 bg-card border-border h-11 text-sm"
                  disabled={loading || streaming}
                  autoFocus
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || loading || streaming}
                  size="icon"
                  className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Photo Upload */}
            {showPhotoUpload && (
              <div>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-foreground">Drag and drop or tap to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG accepted</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                </div>
                <div className="mt-3 text-center">
                  <button
                    onClick={() => navigate('/sizes')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Or view our size guide
                  </button>
                </div>
              </div>
            )}

            {/* Dispatch */}
            {showDispatch && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
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
                  className="flex-1 border-border"
                >
                  Request Callback
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
