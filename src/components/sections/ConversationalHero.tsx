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

type FlowStep =
  | 'menu'
  | 'price_zip'
  | 'price_ready'
  | 'schedule_zip'
  | 'schedule_ready'
  | 'contractor_zip'
  | 'contractor_ready'
  | 'size_help'
  | 'photo_upload'
  | 'photo_analyzing'
  | 'photo_result'
  | 'dispatch_options'
  | 'callback_name'
  | 'callback_phone'
  | 'callback_zip'
  | 'callback_sent';

interface ConversationMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
}

interface PersistedState {
  step: FlowStep;
  messages: ConversationMessage[];
  collected: Record<string, string>;
  timestamp: number;
}

const STORAGE_KEY = 'calsan_conv_hero_state';
const STATE_TTL_MS = 30 * 60 * 1000; // 30 min

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
  } catch {
    return null;
  }
}

function saveState(step: FlowStep, messages: ConversationMessage[], collected: Record<string, string>) {
  try {
    const state: PersistedState = { step, messages, collected, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* silent */ }
}

// ============================================================
// MENU OPTIONS
// ============================================================

const MENU_OPTIONS = [
  { id: 'instant_price', label: 'Get Instant Price' },
  { id: 'schedule', label: 'Schedule a Dumpster' },
  { id: 'contractor', label: "I'm a Contractor" },
  { id: 'size_help', label: 'I Need Help Choosing Size' },
  { id: 'photo', label: 'Upload a Photo for Recommendation' },
  { id: 'dispatch', label: 'Talk to Dispatch' },
];

const ZIP_RE = /\b(9[0-5]\d{3})\b/;

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
// COMPONENT
// ============================================================

interface ConversationalHeroProps {
  cityName?: string;
  countyName?: string;
}

export function ConversationalHero({ cityName, countyName }: ConversationalHeroProps) {
  const persisted = useRef(loadState());
  const [step, setStep] = useState<FlowStep>(persisted.current?.step || 'menu');
  const [messages, setMessages] = useState<ConversationMessage[]>(
    persisted.current?.messages || [INITIAL_MESSAGE]
  );
  const [collected, setCollected] = useState<Record<string, string>>(
    persisted.current?.collected || {}
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logEvent } = useSessionTracker();

  // Persist state
  useEffect(() => {
    saveState(step, messages, collected);
  }, [step, messages, collected]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Helpers
  const addSystem = useCallback((content: string) => {
    setMessages(prev => [...prev, { id: `s-${Date.now()}-${Math.random()}`, role: 'system', content }]);
  }, []);

  const addUser = useCallback((content: string) => {
    setMessages(prev => [...prev, { id: `u-${Date.now()}-${Math.random()}`, role: 'user', content }]);
  }, []);

  const resetConversation = useCallback(() => {
    setStep('menu');
    setMessages([INITIAL_MESSAGE]);
    setCollected({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ========= MENU HANDLER =========
  const handleMenuSelect = useCallback((optionId: string) => {
    switch (optionId) {
      case 'instant_price':
        logEvent('option_clicked', { path: 'instant_price' });
        addUser('Get Instant Price');
        addSystem('Enter your job ZIP code or address.');
        setStep('price_zip');
        break;

      case 'schedule':
        logEvent('option_clicked', { path: 'schedule' });
        addUser('Schedule a Dumpster');
        addSystem('Enter your delivery ZIP code.');
        setStep('schedule_zip');
        break;

      case 'contractor':
        logEvent('option_clicked', { path: 'contractor' });
        addUser("I'm a Contractor");
        addSystem('Welcome. Enter your project ZIP code to get started.');
        setStep('contractor_zip');
        break;

      case 'size_help':
        logEvent('option_clicked', { path: 'size_help' });
        addUser('I Need Help Choosing Size');
        addSystem('We can help you find the right size. You can upload a photo of your project area, or go directly to our size guide.');
        setStep('size_help');
        break;

      case 'photo':
        logEvent('option_clicked', { path: 'photo' });
        addUser('Upload a Photo for Recommendation');
        addSystem('Upload a photo of your debris or project area.');
        setStep('photo_upload');
        break;

      case 'dispatch':
        logEvent('option_clicked', { path: 'dispatch' });
        addUser('Talk to Dispatch');
        addSystem('Call us directly or request a call back.');
        setStep('dispatch_options');
        break;
    }
  }, [logEvent, addUser, addSystem]);

  // ========= TEXT SUBMIT =========
  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addUser(text);

    switch (step) {
      case 'price_zip': {
        const zip = text.match(ZIP_RE)?.[1] || text;
        setCollected(p => ({ ...p, zip }));
        logEvent('zip_entered', { zip });
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: { source_channel: 'AI_CHAT', source_detail: 'instant_price', zip_code: zip },
          });
        } catch { /* silent */ }
        addSystem(`ZIP ${zip} confirmed. Continue to see exact pricing.`);
        setStep('price_ready');
        break;
      }

      case 'schedule_zip': {
        const zip = text.match(ZIP_RE)?.[1] || text;
        setCollected(p => ({ ...p, zip }));
        logEvent('zip_entered', { zip, path: 'schedule' });
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: { source_channel: 'AI_CHAT', source_detail: 'schedule', zip_code: zip },
          });
        } catch { /* silent */ }
        addSystem(`ZIP ${zip} confirmed. Continue to schedule your delivery.`);
        setStep('schedule_ready');
        break;
      }

      case 'contractor_zip': {
        const zip = text.match(ZIP_RE)?.[1] || text;
        setCollected(p => ({ ...p, zip }));
        logEvent('zip_entered', { zip, path: 'contractor' });
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: { source_channel: 'AI_CHAT', source_detail: 'contractor', zip_code: zip, notes: 'Contractor inquiry' },
          });
        } catch { /* silent */ }
        addSystem(`ZIP ${zip} confirmed. Continue to get contractor pricing.`);
        setStep('contractor_ready');
        break;
      }

      case 'callback_name':
        setCollected(p => ({ ...p, name: text }));
        addSystem('What is your phone number?');
        setStep('callback_phone');
        break;

      case 'callback_phone':
        setCollected(p => ({ ...p, phone: text }));
        addSystem('And your ZIP code? (optional, type "skip" to skip)');
        setStep('callback_zip');
        break;

      case 'callback_zip': {
        if (text.toLowerCase() !== 'skip') {
          setCollected(p => ({ ...p, zip: text }));
        }
        setLoading(true);
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: {
              source_channel: 'AI_CHAT',
              source_detail: 'callback_request',
              customer_name: collected.name,
              phone: collected.phone,
              zip_code: text.toLowerCase() !== 'skip' ? text : collected.zip || null,
              notes: 'Callback requested from Conversational Hero',
              priority: 'HIGH',
            },
          });
          logEvent('callback_submitted', { zip: collected.zip });
          addSystem('Your request has been submitted. A team member will contact you shortly.');
          setStep('callback_sent');
        } catch {
          addSystem('Something went wrong. Please call us directly at (510) 680-2150.');
        } finally {
          setLoading(false);
        }
        break;
      }

      default:
        addSystem('Please select an option from the menu to get started.');
        setStep('menu');
        break;
    }
  }, [input, loading, step, collected, logEvent, addUser, addSystem]);

  // ========= PHOTO UPLOAD =========
  const handleFileUpload = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    logEvent('photo_uploaded');
    setStep('photo_analyzing');
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

      setCollected(p => ({ ...p, size: String(size), material }));

      // Remove analyzing message, add result
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== 'Analyzing your photo...');
        return [
          ...filtered,
          {
            id: `s-result-${Date.now()}`,
            role: 'system' as const,
            content: `Based on your photo, we recommend a ${size}-yard dumpster for ${material} material. Confidence: ${Math.round(confidence * 100)}%.`,
          },
        ];
      });

      try {
        await supabase.functions.invoke('lead-ingest', {
          body: {
            source_channel: 'AI_CHAT',
            source_detail: 'photo_upload',
            notes: `Photo analysis: ${size}yd ${material} (${Math.round(confidence * 100)}% confidence)`,
          },
        });
      } catch { /* silent */ }

      setStep('photo_result');
    } catch {
      setMessages(prev => prev.filter(m => m.content !== 'Analyzing your photo...'));
      addSystem('We recommend a 20-yard dumpster for most mixed cleanouts. Continue to get exact pricing.');
      setCollected(p => ({ ...p, size: '20', material: 'general' }));
      setStep('photo_result');
    } finally {
      setLoading(false);
    }
  }, [logEvent, addSystem]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Determine what to show
  const showInput = ['price_zip', 'schedule_zip', 'contractor_zip', 'callback_name', 'callback_phone', 'callback_zip'].includes(step);
  const showMenu = step === 'menu';

  const getPlaceholder = () => {
    switch (step) {
      case 'price_zip':
      case 'schedule_zip':
      case 'contractor_zip':
        return 'Enter ZIP code or address...';
      case 'callback_name':
        return 'Your name...';
      case 'callback_phone':
        return 'Your phone number...';
      case 'callback_zip':
        return 'ZIP code (or type "skip")...';
      default:
        return '';
    }
  };

  // Build CTA for quote routing
  const buildQuoteUrl = (extra?: Record<string, string>) => {
    const params = new URLSearchParams({ v3: '1' });
    if (collected.zip) params.set('zip', collected.zip);
    if (collected.size) params.set('size', collected.size);
    if (collected.material) params.set('material', collected.material);
    if (extra) Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return `/quote?${params.toString()}`;
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
              <span className="text-sm font-semibold text-foreground">Calsan</span>
            </div>
            {step !== 'menu' && (
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
            style={{ minHeight: '240px', maxHeight: '480px' }}
          >
            {messages.map((msg) => (
              <div key={msg.id} className={cn('text-sm leading-relaxed', msg.role === 'user' ? 'text-right' : '')}>
                {msg.role === 'system' ? (
                  <p className="text-foreground">{msg.content}</p>
                ) : (
                  <p className="inline-block bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-left">
                    {msg.content}
                  </p>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="border-t border-border px-6 py-5 bg-[hsl(150_10%_98%)]">
            {/* Menu Options */}
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

            {/* Input Field */}
            {showInput && (
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholder()}
                  className="flex-1 bg-card border-border h-11 text-sm"
                  disabled={loading}
                  autoFocus
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Photo Upload */}
            {step === 'photo_upload' && (
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
                    onClick={() => { addSystem('Opening size guide.'); navigate('/sizes'); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Or view our size guide
                  </button>
                </div>
              </div>
            )}

            {/* Size Help */}
            {step === 'size_help' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => { setStep('photo_upload'); addSystem('Upload a photo of your debris or project area.'); }}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button
                  onClick={() => navigate('/sizes')}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  View Size Guide
                </Button>
              </div>
            )}

            {/* Dispatch Options */}
            {step === 'dispatch_options' && (
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
                    setStep('callback_name');
                  }}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Request Callback
                </Button>
              </div>
            )}

            {/* Price / Schedule / Contractor Ready */}
            {(step === 'price_ready' || step === 'schedule_ready' || step === 'contractor_ready') && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    logEvent('routed_to_quote', { zip: collected.zip, path: step });
                    navigate(buildQuoteUrl(
                      step === 'contractor_ready' ? { type: 'contractor' } :
                      step === 'schedule_ready' ? { fast: '1' } : undefined
                    ));
                  }}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <button
                  onClick={resetConversation}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors self-center"
                >
                  Start over
                </button>
              </div>
            )}

            {/* Photo Result */}
            {step === 'photo_result' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    logEvent('routed_to_quote', { from: 'photo', size: collected.size });
                    navigate(buildQuoteUrl({ from: 'waste-vision' }));
                  }}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  See Exact Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate('/sizes')}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Compare All Sizes
                </Button>
              </div>
            )}

            {/* Callback Sent */}
            {step === 'callback_sent' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate(buildQuoteUrl())}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  View Instant Pricing
                </Button>
                <button
                  onClick={resetConversation}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors self-center"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
