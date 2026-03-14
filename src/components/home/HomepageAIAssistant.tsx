// ============================================================
// HomepageAIAssistant — Compact AI sales-support module
// Single heading, quick chips, short responses + CTAs
// Bilingual (EN/ES), lead enrichment, mobile-first
// ============================================================
import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Phone, MessageSquare, Loader2, Send, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/lib/analytics/ga4';
import { BUSINESS_INFO } from '@/lib/seo';
import { cn } from '@/lib/utils';

interface AssistantResponse {
  answer_text: string;
  recommended_action: 'QUOTE' | 'PHOTO' | 'SCHEDULE' | 'CALL';
  recommended_size: number | null;
  suggested_size_range: string | null;
  should_capture_lead: boolean;
  customer_stage?: string;
  language?: string;
}

type CustomerStage = 'EXPLORING' | 'COMPARING' | 'READY' | 'NEEDS_HELP';

const QUICK_CHIPS_EN = [
  { label: 'What size do I need?', icon: '📏' },
  { label: 'What can I put in the dumpster?', icon: '📦' },
  { label: 'I have dirt / concrete', icon: '🪨' },
  { label: 'How fast can you deliver?', icon: '⚡' },
  { label: "I'm not sure", icon: '🤔' },
];

function getCtasForStage(
  stage: CustomerStage,
  action: string,
  lang: string,
): Array<{ label: string; icon: React.ElementType; variant: 'primary' | 'secondary'; to?: string; href?: string }> {
  const isEs = lang === 'ES';

  const ctas: Array<{ label: string; icon: React.ElementType; variant: 'primary' | 'secondary'; to?: string; href?: string }> = [];

  // Primary CTA based on action/stage
  if (action === 'PHOTO' || stage === 'EXPLORING') {
    ctas.push({
      label: isEs ? 'Subir Foto para Ayuda' : 'Upload Photo for Size Help',
      icon: Camera,
      variant: 'secondary',
      to: '/waste-vision',
    });
    ctas.push({
      label: isEs ? 'Ver Precio Exacto' : 'Get Exact Price',
      icon: ArrowRight,
      variant: 'primary',
      to: '/quote?v3=1',
    });
  } else if (stage === 'READY' || action === 'QUOTE') {
    ctas.push({
      label: isEs ? 'Ver Precio Exacto' : 'Get Exact Price',
      icon: ArrowRight,
      variant: 'primary',
      to: '/quote?v3=1',
    });
    ctas.push({
      label: isEs ? 'Ver Disponibilidad' : 'Check Availability',
      icon: ArrowRight,
      variant: 'secondary',
      to: '/quote?v3=1',
    });
  } else if (stage === 'NEEDS_HELP' || action === 'CALL') {
    ctas.push({
      label: isEs ? 'Hablar con Especialista' : 'Talk to a Specialist',
      icon: Phone,
      variant: 'primary',
      href: `tel:${BUSINESS_INFO.phone.sales}`,
    });
    ctas.push({
      label: isEs ? 'Enviar Mensaje' : 'Text Us',
      icon: MessageSquare,
      variant: 'secondary',
      href: `sms:${BUSINESS_INFO.phone.sales}`,
    });
  } else {
    ctas.push({
      label: isEs ? 'Ver Precio Exacto' : 'Get Exact Price',
      icon: ArrowRight,
      variant: 'primary',
      to: '/quote?v3=1',
    });
    ctas.push({
      label: isEs ? 'Subir Foto' : 'Upload Photo',
      icon: Upload,
      variant: 'secondary',
      to: '/waste-vision',
    });
  }

  return ctas;
}

export function HomepageAIAssistant() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadPhone, setLeadPhone] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [detectedLang, setDetectedLang] = useState('EN');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const askQuestion = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setResponse(null);
    setShowLeadCapture(false);

    track('assistant_question_asked', { question_preview: q.slice(0, 60) });

    try {
      const { data, error: fnError } = await supabase.functions.invoke('website-assistant', {
        body: {
          question: q.trim(),
          enrich_lead: true,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const res = data as AssistantResponse;
      setResponse(res);
      setDetectedLang(res.language || 'EN');

      if (res.should_capture_lead) {
        setShowLeadCapture(true);
      }
    } catch (err) {
      console.error('HomepageAIAssistant error:', err);
      setError('Unable to answer right now. Try one of the options below.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    askQuestion(question);
  }, [question, askQuestion]);

  const handleChipClick = useCallback((chip: string) => {
    setQuestion(chip);
    askQuestion(chip);
  }, [askQuestion]);

  const handleLeadSubmit = useCallback(async () => {
    if (!leadPhone.trim()) return;
    try {
      await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'WEBSITE_ASSISTANT',
          source_detail: 'homepage_ai_lead_capture',
          name: leadName.trim() || undefined,
          phone: leadPhone.trim(),
          notes: question ? `AI Q: ${question.slice(0, 200)}` : undefined,
          consent_status: 'FORM_SUBMIT',
        },
      });
      track('assistant_lead_created', { source: 'homepage_ai' });
      setLeadSubmitted(true);
    } catch (err) {
      console.error('Lead ingest error:', err);
    }
  }, [leadPhone, leadName, question]);

  const handleReset = useCallback(() => {
    setResponse(null);
    setQuestion('');
    setError('');
    setShowLeadCapture(false);
    setLeadSubmitted(false);
    inputRef.current?.focus();
  }, []);

  const stage = (response?.customer_stage || 'EXPLORING') as CustomerStage;
  const action = response?.recommended_action || 'QUOTE';
  const isEs = detectedLang === 'ES';
  const ctas = response ? getCtasForStage(stage, action, detectedLang) : [];

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Input area */}
        <div className="p-5 md:p-6">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
            <Input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={isEs ? '¿Qué tamaño para una remodelación de cocina?' : 'What size for a kitchen remodel?'}
              className="text-sm h-12 rounded-xl border-border flex-1"
              maxLength={200}
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              size="icon"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>

          {/* Quick Chips — only before response */}
          {!response && !loading && (
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS_EN.map(({ label, icon }) => (
                <button
                  key={label}
                  onClick={() => handleChipClick(label)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full border border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors min-h-[36px]"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>{isEs ? 'Analizando tu proyecto...' : 'Analyzing your project...'}</span>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}

          {/* Response */}
          {response && (
            <div className="space-y-4 mt-1">
              {/* Answer */}
              <div className="bg-muted/40 border border-border rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {response.answer_text}
                </p>
                {response.suggested_size_range && (
                  <p className="text-xs text-primary font-semibold mt-2">
                    {isEs ? 'Tamaño recomendado' : 'Recommended size'}: {response.suggested_size_range} yard
                  </p>
                )}
              </div>

              {/* CTAs */}
              {!showLeadCapture && !leadSubmitted && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {ctas.map((cta) => {
                    const Icon = cta.icon;
                    const isPrimary = cta.variant === 'primary';
                    const cls = cn(
                      'flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all flex-1 min-h-[44px]',
                      isPrimary
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-background border border-border text-foreground hover:border-primary/40',
                    );

                    if (cta.href) {
                      return (
                        <a key={cta.label} href={cta.href} className={cls}>
                          <Icon className="w-4 h-4" />
                          {cta.label}
                        </a>
                      );
                    }
                    return (
                      <button
                        key={cta.label}
                        onClick={() => {
                          track('assistant_cta_clicked', { action: cta.label });
                          if (cta.to) navigate(cta.to);
                        }}
                        className={cls}
                      >
                        <Icon className="w-4 h-4" />
                        {cta.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Lead Capture */}
              {showLeadCapture && !leadSubmitted && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {isEs ? '¿A qué número le enviamos un mensaje?' : 'Where should we text you?'}
                  </p>
                  <Input
                    type="tel"
                    placeholder={isEs ? 'Número de teléfono' : 'Phone number'}
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    className="text-sm h-11 rounded-xl border-border"
                    autoFocus
                  />
                  <Input
                    type="text"
                    placeholder={isEs ? 'Nombre (opcional)' : 'Name (optional)'}
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    className="text-sm h-11 rounded-xl border-border"
                  />
                  <Button
                    onClick={handleLeadSubmit}
                    disabled={!leadPhone.trim()}
                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold"
                  >
                    <Phone className="w-4 h-4 mr-1.5" />
                    {isEs ? 'Hablar con Especialista' : 'Talk to a Specialist'}
                  </Button>
                </div>
              )}

              {/* Lead Confirmed */}
              {leadSubmitted && (
                <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                  <p className="text-sm font-medium text-foreground">
                    {isEs ? 'Gracias. Un especialista se comunicará pronto.' : 'Thanks. A specialist will reach out shortly.'}
                  </p>
                </div>
              )}

              {/* Human fallback + reset */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isEs ? 'Hacer otra pregunta' : 'Ask another question'}
                </button>
                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${BUSINESS_INFO.phone.sales}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    {isEs ? 'Llamar' : 'Call'}
                  </a>
                  <a
                    href={`sms:${BUSINESS_INFO.phone.sales}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    {isEs ? 'Mensaje' : 'Text'}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomepageAIAssistant;
