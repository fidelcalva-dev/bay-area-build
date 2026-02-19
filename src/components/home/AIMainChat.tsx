import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, Loader2, ArrowRight, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// ============================================================
// TYPES
// ============================================================

type ChatStep =
  | 'welcome'
  | 'price_zip'
  | 'price_confirmed'
  | 'photo_upload'
  | 'photo_result'
  | 'expert_name'
  | 'expert_phone'
  | 'expert_zip'
  | 'expert_done'
  | 'book_zip'
  | 'book_type'
  | 'book_material'
  | 'book_done'
  | 'free_text';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  buttons?: { label: string; action: string; variant?: 'primary' | 'secondary' }[];
  uploadCard?: boolean;
  photoResult?: { size: number; material: string; confidence: number };
}

// ============================================================
// SESSION TRACKER
// ============================================================

function useSessionTracker() {
  const sessionId = useRef(crypto.randomUUID());
  const startTime = useRef(Date.now());
  const logged = useRef(false);

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

  const logSession = useCallback(async (path: string, leadId?: string) => {
    try {
      const params = new URLSearchParams(window.location.search);
      await supabase.from('ai_entry_sessions' as any).insert({
        session_id: sessionId.current,
        path_selected: path,
        lead_id: leadId || null,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term'),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!logged.current) {
      logged.current = true;
      logEvent('chat_opened');
    }
  }, [logEvent]);

  return { logEvent, logSession, sessionId: sessionId.current };
}

// ============================================================
// CHAT BUBBLE
// ============================================================

function ChatBubble({ message, onButton, onFilesSelected }: {
  message: ChatMessage;
  onButton: (action: string) => void;
  onFilesSelected: (files: FileList) => void;
}) {
  const isUser = message.role === 'user';
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <span className="text-xs font-bold text-primary">C</span>
        </div>
      )}
      <div className={cn('max-w-[85%] space-y-2')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border text-foreground rounded-bl-md'
        )}>
          {message.content}
        </div>

        {/* Photo result */}
        {message.photoResult && (
          <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Recommended</p>
            <p className="text-2xl font-bold text-foreground">{message.photoResult.size}-Yard Dumpster</p>
            <div className="flex justify-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize">{message.photoResult.material}</span>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">{Math.round(message.photoResult.confidence * 100)}% confidence</span>
            </div>
          </div>
        )}

        {/* Upload card */}
        {message.uploadCard && (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm font-medium text-foreground">Drag and drop or tap to upload</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG accepted</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
            />
          </div>
        )}

        {/* Quick action buttons */}
        {message.buttons && message.buttons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.buttons.map((btn) => (
              <button
                key={btn.action}
                onClick={() => onButton(btn.action)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  btn.variant === 'primary'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-card border border-border text-foreground hover:border-primary/40'
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
          <span className="text-xs font-bold text-muted-foreground">You</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN CHAT COMPONENT
// ============================================================

const ZIP_RE = /\b(9[0-5]\d{3})\b/;

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content: 'Welcome to Calsan. I can get you the right dumpster in under 60 seconds.\n\nWhat would you like to do?',
  buttons: [
    { label: 'Get instant price', action: 'path_price' },
    { label: 'Upload a photo', action: 'path_photo' },
    { label: 'Talk to an expert', action: 'path_expert' },
    { label: "I'm ready to book", action: 'path_book' },
  ],
};

export function AIMainChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<ChatStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [collected, setCollected] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logEvent, logSession } = useSessionTracker();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Helpers
  const addAssistant = (msg: Omit<ChatMessage, 'id' | 'role'>) => {
    setMessages(prev => [...prev, { ...msg, id: `a-${Date.now()}`, role: 'assistant' }]);
  };

  const addUser = (text: string) => {
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
  };

  // ========= BUTTON HANDLER =========
  const handleButton = async (action: string) => {
    switch (action) {
      case 'path_price':
        logEvent('option_clicked', { path: 'instant_price' });
        addUser('Get instant price');
        addAssistant({ content: 'Great. What is the delivery ZIP code or address?' });
        setStep('price_zip');
        break;

      case 'path_photo':
        logEvent('option_clicked', { path: 'upload_photo' });
        addUser('Upload a photo');
        addAssistant({
          content: 'Upload a photo of the debris or project area. I will recommend the best dumpster size.',
          uploadCard: true,
        });
        setStep('photo_upload');
        break;

      case 'path_expert':
        logEvent('option_clicked', { path: 'talk_expert' });
        addUser('Talk to an expert');
        addAssistant({ content: 'No problem. I can have a specialist contact you quickly.\n\nWhat is your name?' });
        setStep('expert_name');
        break;

      case 'path_book':
        logEvent('option_clicked', { path: 'ready_to_book' });
        addUser("I'm ready to book");
        addAssistant({ content: 'Great. Let us reserve your dumpster.\n\nWhat is the delivery ZIP code or address?' });
        setStep('book_zip');
        break;

      case 'open_quote': {
        const params = new URLSearchParams({ v3: '1' });
        if (collected.zip) params.set('zip', collected.zip);
        if (collected.size) params.set('size', collected.size);
        if (collected.material) params.set('material', collected.material);
        logEvent('routed_to_quote', { zip: collected.zip });
        logSession('instant_price');
        navigate(`/quote?${params.toString()}`);
        break;
      }

      case 'open_quote_photo': {
        const params = new URLSearchParams({ v3: '1', from: 'waste-vision' });
        if (collected.size) params.set('size', collected.size);
        if (collected.material) params.set('material', collected.material);
        logEvent('routed_to_quote', { from: 'photo' });
        logSession('upload_photo');
        navigate(`/quote?${params.toString()}`);
        break;
      }

      case 'compare_sizes':
        navigate('/sizes');
        break;

      case 'send_expert': {
        setLoading(true);
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: {
              source_channel: 'AI_CHAT',
              source_detail: 'expert_request',
              customer_name: collected.name,
              phone: collected.phone,
              zip_code: collected.zip || null,
              notes: 'Expert callback requested from AI Main Chat',
              priority: 'HIGH',
            },
          });
          logEvent('expert_request_submitted', { zip: collected.zip });
          logSession('expert_request');
          addAssistant({
            content: 'Thanks. Our team will reach out shortly. If you want, you can also see instant pricing now.',
            buttons: [
              { label: 'Open instant quote', action: 'open_quote', variant: 'primary' },
            ],
          });
          setStep('expert_done');
        } catch {
          addAssistant({ content: 'Something went wrong. Please try again or call us at (510) 680-2150.' });
        } finally {
          setLoading(false);
        }
        break;
      }

      case 'book_homeowner':
      case 'book_contractor':
      case 'book_commercial':
        addUser(action.replace('book_', '').charAt(0).toUpperCase() + action.replace('book_', '').slice(1));
        setCollected(p => ({ ...p, type: action.replace('book_', '') }));
        addAssistant({
          content: 'What type of material?',
          buttons: [
            { label: 'General debris', action: 'mat_general' },
            { label: 'Heavy / concrete', action: 'mat_heavy' },
          ],
        });
        setStep('book_material');
        break;

      case 'mat_general':
      case 'mat_heavy': {
        const mat = action === 'mat_general' ? 'general' : 'heavy';
        addUser(mat === 'general' ? 'General debris' : 'Heavy / concrete');
        setCollected(p => ({ ...p, material: mat }));
        const params = new URLSearchParams({ v3: '1', fast: '1' });
        if (collected.zip) params.set('zip', collected.zip);
        if (collected.type) params.set('type', collected.type);
        params.set('material', mat);

        // Create lead
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: {
              source_channel: 'AI_CHAT',
              source_detail: 'ready_to_book',
              zip_code: collected.zip || null,
              notes: `Ready to book: ${collected.type}, ${mat}`,
            },
          });
        } catch { /* silent */ }

        logEvent('routed_to_quote', { path: 'book', zip: collected.zip });
        logSession('ready_to_book');

        addAssistant({
          content: 'Everything is set. Continue to complete your booking.',
          buttons: [{ label: 'Continue to Booking', action: `navigate:/quote?${params.toString()}`, variant: 'primary' }],
        });
        setStep('book_done');
        break;
      }

      default:
        if (action.startsWith('navigate:')) {
          navigate(action.replace('navigate:', ''));
        }
        break;
    }
  };

  // ========= TEXT INPUT HANDLER =========
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addUser(text);

    switch (step) {
      case 'price_zip': {
        const zip = text.match(ZIP_RE)?.[1] || text;
        setCollected(p => ({ ...p, zip }));
        logEvent('zip_entered', { zip });

        // Create lead
        try {
          await supabase.functions.invoke('lead-ingest', {
            body: {
              source_channel: 'AI_CHAT',
              source_detail: 'instant_price',
              zip_code: zip,
              notes: 'Instant price request from AI Main Chat',
            },
          });
        } catch { /* silent */ }

        addAssistant({
          content: `Service area confirmed for ${zip}. I will open exact pricing now.`,
          buttons: [{ label: 'Open Instant Quote', action: 'open_quote', variant: 'primary' }],
        });
        setStep('price_confirmed');
        break;
      }

      case 'expert_name':
        setCollected(p => ({ ...p, name: text }));
        addAssistant({ content: `Thanks, ${text}. What is your phone number?` });
        setStep('expert_phone');
        break;

      case 'expert_phone':
        setCollected(p => ({ ...p, phone: text }));
        addAssistant({ content: 'And your ZIP code? (optional — type "skip" to skip)' });
        setStep('expert_zip');
        break;

      case 'expert_zip':
        if (text.toLowerCase() !== 'skip') {
          setCollected(p => ({ ...p, zip: text }));
        }
        addAssistant({
          content: `Got it. Ready to send your request to our team?`,
          buttons: [
            { label: 'Send my request', action: 'send_expert', variant: 'primary' },
            { label: 'Open instant quote', action: 'open_quote' },
          ],
        });
        break;

      case 'book_zip': {
        const zip = text.match(ZIP_RE)?.[1] || text;
        setCollected(p => ({ ...p, zip }));
        logEvent('zip_entered', { zip, path: 'book' });
        addAssistant({
          content: 'What best describes you?',
          buttons: [
            { label: 'Homeowner', action: 'book_homeowner' },
            { label: 'Contractor', action: 'book_contractor' },
            { label: 'Commercial', action: 'book_commercial' },
          ],
        });
        setStep('book_type');
        break;
      }

      default:
        // Free-text fallback: guide back to options
        addAssistant({
          content: 'I can help with that. Here are the quickest ways to proceed:',
          buttons: [
            { label: 'Get instant price', action: 'path_price' },
            { label: 'Upload a photo', action: 'path_photo' },
            { label: 'Talk to an expert', action: 'path_expert' },
            { label: "I'm ready to book", action: 'path_book' },
          ],
        });
        break;
    }
  };

  // ========= PHOTO UPLOAD HANDLER =========
  const handleFilesSelected = async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    logEvent('photo_uploaded');

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      addAssistant({ content: 'Analyzing your photo...' });

      const { data, error } = await supabase.functions.invoke('analyze-waste', {
        body: { images: [base64] },
      });

      if (error) throw error;

      const size = data?.recommendation?.recommendedSize || 20;
      const material = data?.recommendation?.materialCategory || 'general';
      const confidence = data?.recommendation?.confidence || 0.8;

      setCollected(p => ({ ...p, size: String(size), material }));

      // Remove the "Analyzing..." message and add result
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== 'Analyzing your photo...');
        return [...filtered, {
          id: `a-result-${Date.now()}`,
          role: 'assistant' as const,
          content: `Based on your photo, I recommend a ${size}-yard dumpster for ${material} material.`,
          photoResult: { size, material, confidence },
          buttons: [
            { label: 'See exact price', action: 'open_quote_photo', variant: 'primary' as const },
            { label: 'Compare sizes', action: 'compare_sizes' },
          ],
        }];
      });

      // Create lead
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
      addAssistant({ content: 'Could not analyze the photo. Please try again or contact us at (510) 680-2150.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showInput = !['welcome', 'photo_upload', 'photo_result', 'book_type', 'book_material', 'book_done', 'expert_done', 'price_confirmed'].includes(step) || step === 'free_text';

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            How Can We Help You Today?
          </h2>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Get the right dumpster in under 60 seconds.
          </p>
        </div>

        {/* Chat Container */}
        <div className="max-w-[820px] mx-auto bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Calsan Smart Assistant</p>
                <p className="text-xs text-muted-foreground">Dumpster Rental Experts — Bay Area</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="p-4 md:p-6 overflow-y-auto"
            style={{ height: 'clamp(320px, 50vh, 520px)' }}
          >
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onButton={handleButton}
                onFilesSelected={handleFilesSelected}
              />
            ))}
            {loading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">C</span>
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t border-border p-4 bg-muted/20">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  step === 'price_zip' || step === 'book_zip' ? 'Enter ZIP code or address...' :
                  step === 'expert_name' ? 'Your name...' :
                  step === 'expert_phone' ? 'Your phone number...' :
                  step === 'expert_zip' ? 'ZIP code (or type "skip")...' :
                  'Type a message...'
                }
                className="flex-1 bg-card border-border h-11 text-sm"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-11 w-11 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
