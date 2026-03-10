// ============================================================
// AskSpecialist — Inline Q&A card for homepage
// Short AI answers + CTA routing. No long chat UI.
// ============================================================
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, Calendar, Phone, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/lib/analytics/ga4';
import { BUSINESS_INFO } from '@/lib/seo';

interface AssistantResponse {
  answer_text: string;
  recommended_action: 'QUOTE' | 'PHOTO' | 'SCHEDULE' | 'CALL';
  recommended_size: number | null;
  suggested_size_range: string | null;
  should_capture_lead: boolean;
}

const QUICK_CHIPS = [
  'What size do I need?',
  'What can I put in the dumpster?',
  'How fast can you deliver?',
] as const;

export function AskSpecialist() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadPhone, setLeadPhone] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
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
        body: { question: q.trim() },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResponse(data as AssistantResponse);

      // Auto-trigger lead capture for high-intent questions
      if (data?.should_capture_lead) {
        setShowLeadCapture(true);
      }

      // Also check if user included contact info in question
      const hasPhone = /\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/.test(q);
      const hasEmail = /@/.test(q);
      if (hasPhone || hasEmail) {
        setShowLeadCapture(true);
      }
    } catch (err) {
      console.error('AskSpecialist error:', err);
      setError('Unable to answer right now. Please try one of the options below.');
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

  const handleCtaClick = useCallback((action: string) => {
    track('assistant_cta_clicked', { action });
    switch (action) {
      case 'QUOTE':
        navigate('/quote?v3=1');
        break;
      case 'PHOTO':
        navigate('/quote?v3=1&tab=photo');
        break;
      case 'SCHEDULE':
        navigate('/portal/schedule');
        break;
      case 'CALL':
        setShowLeadCapture(true);
        break;
    }
  }, [navigate]);

  const handleLeadSubmit = useCallback(async () => {
    if (!leadPhone.trim()) return;
    try {
      await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'website_assistant',
          source_detail: 'ask_specialist_lead_capture',
          name: leadName.trim() || undefined,
          phone: leadPhone.trim(),
          notes: question ? `Question: ${question.slice(0, 200)}` : undefined,
          consent_status: 'FORM_SUBMIT',
        },
      });
      track('assistant_lead_created', { source: 'ask_specialist' });
      setLeadSubmitted(true);
    } catch (err) {
      console.error('Lead ingest error:', err);
    }
  }, [leadPhone, leadName, question]);

  const primaryAction = response?.recommended_action || 'QUOTE';
  const showSchedule = primaryAction === 'SCHEDULE';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-6 mb-6">
      {/* Header */}
      <h3 className="text-base font-semibold text-foreground mb-0.5">
        Not sure what size you need?
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ask our specialist. Quick answers, then get exact pricing by ZIP.
      </p>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <Input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What size for a kitchen remodel?"
          className="text-sm h-11 rounded-xl border-border flex-1"
          maxLength={200}
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={loading || !question.trim()}
          className="h-11 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          size="sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>

      {/* Quick Chips */}
      {!response && !loading && (
        <div className="flex flex-wrap gap-2 mb-1">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive mt-3">{error}</p>
      )}

      {/* Response */}
      {response && (
        <div className="mt-4 space-y-4">
          <div className="bg-muted/40 border border-border rounded-xl p-4">
            <p className="text-sm text-foreground leading-relaxed">
              {response.answer_text}
            </p>
            {response.suggested_size_range && (
              <p className="text-xs text-primary font-medium mt-2">
                Recommended size: {response.suggested_size_range} yard
              </p>
            )}
            {!response.suggested_size_range && response.recommended_size && (
              <p className="text-xs text-primary font-medium mt-2">
                Recommended size: {response.recommended_size} yard
              </p>
            )}
          </div>

          {/* CTAs */}
          {!showLeadCapture && !leadSubmitted && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleCtaClick(showSchedule ? 'SCHEDULE' : 'QUOTE')}
                className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
                size="sm"
              >
                {showSchedule ? (
                  <>
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Schedule Delivery
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                    Get Exact Price
                  </>
                )}
              </Button>
              {!showSchedule && (
                <Button
                  onClick={() => handleCtaClick('PHOTO')}
                  variant="outline"
                  className="h-10 rounded-xl text-sm font-medium border-border"
                  size="sm"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload Photo
                </Button>
              )}
            </div>
          )}

          {/* Lead Capture */}
          {showLeadCapture && !leadSubmitted && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Where should we text you?
              </p>
              <Input
                type="tel"
                placeholder="Phone number"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="text-sm h-10 rounded-xl border-border"
                autoFocus
              />
              <Input
                type="text"
                placeholder="Name (optional)"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="text-sm h-10 rounded-xl border-border"
              />
              <Button
                onClick={handleLeadSubmit}
                disabled={!leadPhone.trim()}
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
                size="sm"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                Talk to a Specialist
              </Button>
            </div>
          )}

          {/* Lead Confirmed */}
          {leadSubmitted && (
            <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-foreground">
                Thanks. A specialist will reach out shortly.
              </p>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={() => {
              setResponse(null);
              setQuestion('');
              setError('');
              setShowLeadCapture(false);
              setLeadSubmitted(false);
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ask another question
          </button>
        </div>
      )}
    </div>
  );
}

export default AskSpecialist;
