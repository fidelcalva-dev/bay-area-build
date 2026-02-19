import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Camera, Phone, CalendarCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import { PhotoUploadModal } from '@/components/sections/PhotoUploadModal';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { toast } from 'sonner';

// ============================================================
// AI START HUB — Primary Decision Layer
// ============================================================

const expertFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().trim().min(10, 'Valid phone required').max(20),
  zip: z.string().trim().min(5, 'Valid ZIP required').max(10),
});

function useEntryTracking() {
  const startTime = useRef(Date.now());

  const trackAction = useCallback(async (actionType: string, metadata?: Record<string, any>) => {
    const params = new URLSearchParams(window.location.search);
    try {
      await supabase.from('ai_entry_events').insert({
        action_type: actionType,
        time_on_page_ms: Date.now() - startTime.current,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_content: params.get('utm_content'),
        utm_term: params.get('utm_term'),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        metadata: metadata || null,
      });
    } catch {
      // Silent fail for analytics
    }
  }, []);

  return { trackAction };
}

// ============================================================
// EXPERT REQUEST FORM (Option 3)
// ============================================================

function ExpertRequestForm({ onClose, trackAction }: { onClose: () => void; trackAction: (a: string, m?: Record<string, any>) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', phone: '', zip: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = expertFormSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'AI_EXPERT_REQUEST',
          customer_name: parsed.data.name,
          phone: parsed.data.phone,
          zip_code: parsed.data.zip,
          notes: 'Requested expert callback from AI Start Hub',
        },
      });

      if (error) throw error;

      await trackAction('expert_request_submitted', { zip: parsed.data.zip });
      toast.success('Request received — a specialist will call you shortly.');
      onClose();
    } catch (err) {
      console.error('Expert request error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div>
        <Label htmlFor="expert-name" className="text-xs font-medium text-muted-foreground">Name</Label>
        <Input
          id="expert-name"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
          className="mt-1"
          maxLength={100}
        />
        {errors.name && <p className="text-xs text-destructive mt-0.5">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="expert-phone" className="text-xs font-medium text-muted-foreground">Phone</Label>
        <Input
          id="expert-phone"
          placeholder="(510) 555-1234"
          value={form.phone}
          onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
          className="mt-1"
          maxLength={20}
          type="tel"
        />
        {errors.phone && <p className="text-xs text-destructive mt-0.5">{errors.phone}</p>}
      </div>
      <div>
        <Label htmlFor="expert-zip" className="text-xs font-medium text-muted-foreground">ZIP Code</Label>
        <Input
          id="expert-zip"
          placeholder="94501"
          value={form.zip}
          onChange={(e) => setForm(p => ({ ...p, zip: e.target.value }))}
          className="mt-1"
          maxLength={10}
        />
        {errors.zip && <p className="text-xs text-destructive mt-0.5">{errors.zip}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Request Callback
      </Button>
    </form>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const actionCards = [
  {
    id: 'instant-price',
    icon: DollarSign,
    title: 'Instant Price',
    description: 'Get a transparent quote in 60 seconds — no call needed.',
    cta: 'See Pricing',
  },
  {
    id: 'upload-photo',
    icon: Camera,
    title: 'Upload a Photo',
    description: 'Snap a photo of your debris. AI recommends the right size.',
    cta: 'Upload Now',
  },
  {
    id: 'talk-expert',
    icon: Phone,
    title: 'Talk to an Expert',
    description: 'Get a callback from a waste specialist within minutes.',
    cta: 'Request Call',
  },
  {
    id: 'ready-to-book',
    icon: CalendarCheck,
    title: "I'm Ready to Book",
    description: 'Skip ahead — choose your dumpster and schedule delivery.',
    cta: 'Book Now',
  },
];

export function AIStartHub() {
  const navigate = useNavigate();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [expertFormOpen, setExpertFormOpen] = useState(false);
  const { trackAction } = useEntryTracking();

  const handleCardClick = async (cardId: string) => {
    await trackAction(`card_click_${cardId}`);

    switch (cardId) {
      case 'instant-price':
        navigate('/quote?v3=1');
        break;
      case 'upload-photo':
        setPhotoModalOpen(true);
        break;
      case 'talk-expert':
        setExpertFormOpen(prev => !prev);
        break;
      case 'ready-to-book':
        navigate('/quote?v3=1&skip=project');
        break;
    }
  };

  return (
    <>
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              How Can We Help You Today?
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
              Choose the fastest path to your dumpster rental.
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {actionCards.map((card) => (
              <AnimatedItem key={card.id} variant="fadeUp">
                <div className="h-full">
                  <button
                    onClick={() => handleCardClick(card.id)}
                    className="w-full h-full text-left bg-card rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <card.icon className="w-6 h-6 text-primary" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1.5">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{card.description}</p>
                    <div className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-4 group-hover:gap-2.5 transition-all">
                      {card.cta}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Expert form inline expand */}
                  {card.id === 'talk-expert' && expertFormOpen && (
                    <div className="bg-card border border-border border-t-0 rounded-b-2xl px-6 pb-6 -mt-2">
                      <ExpertRequestForm
                        onClose={() => setExpertFormOpen(false)}
                        trackAction={trackAction}
                      />
                    </div>
                  )}
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      <PhotoUploadModal open={photoModalOpen} onOpenChange={setPhotoModalOpen} />
    </>
  );
}
