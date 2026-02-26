// ============================================================
// GuidedAssistant — Deterministic, button-driven service assistant
// No free text. No AI mention. Conversion-first decision tree.
// ============================================================
import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Upload, Phone, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BUSINESS_INFO } from '@/lib/seo';

type AssistantState =
  | 'home'
  | 'zip'
  | 'photo'
  | 'photo-analyzing'
  | 'schedule'
  | 'contact'
  | 'contractor'
  | 'contractor-existing'
  | 'contractor-new'
  | 'contact-form'
  | 'fallback';

interface MenuOption {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

export function GuidedAssistant() {
  const [state, setState] = useState<AssistantState>('home');
  const [zip, setZip] = useState('');
  const [contactMethod, setContactMethod] = useState<'call' | 'text' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const goBack = useCallback(() => setState('home'), []);

  const handleZipSubmit = useCallback(() => {
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      navigate(`/quote?v3=1&zip=${zip}`);
    }
  }, [zip, navigate]);

  const handlePhotoUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setState('photo-analyzing');
      // Navigate to waste vision flow with file
      setTimeout(() => {
        navigate('/quote?v3=1&tab=photo');
      }, 1500);
    }
  }, [navigate]);

  const handleContactSubmit = useCallback(() => {
    if (name.trim() && phone.trim()) {
      setSubmitted(true);
      // In production this would trigger lead-ingest
    }
  }, [name, phone]);

  // ── HOME STATE ──
  if (state === 'home') {
    const options: MenuOption[] = [
      {
        label: 'Get Exact Price',
        icon: <ArrowRight className="w-5 h-5" />,
        action: () => setState('zip'),
      },
      {
        label: 'Upload Photo for Size Recommendation',
        icon: <Upload className="w-5 h-5" />,
        action: handlePhotoUpload,
      },
      {
        label: 'Schedule a Delivery',
        icon: <MapPin className="w-5 h-5" />,
        action: () => setState('schedule'),
      },
      {
        label: 'Talk to a Specialist',
        icon: <Phone className="w-5 h-5" />,
        action: () => setState('contact'),
      },
      {
        label: 'Contractor Pricing',
        icon: <MessageSquare className="w-5 h-5" />,
        action: () => setState('contractor'),
      },
    ];

    return (
      <AssistantShell>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            How can we help you today?
          </h3>
          <p className="text-sm text-muted-foreground">
            Select one option to get started.
          </p>
        </div>
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="w-full flex items-center justify-between px-5 py-4 bg-background border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 hover:bg-muted/30 transition-all min-h-[56px] group"
            >
              <span>{opt.label}</span>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">
                {opt.icon}
              </span>
            </button>
          ))}
        </div>
      </AssistantShell>
    );
  }

  // ── ZIP / GET EXACT PRICE ──
  if (state === 'zip') {
    return (
      <AssistantShell onBack={goBack}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Where is the dumpster needed?
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter your ZIP code for exact pricing.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Enter ZIP code"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleZipSubmit()}
              className="text-base h-[56px] rounded-xl border-border"
              autoFocus
            />
            <Button
              onClick={handleZipSubmit}
              disabled={zip.length !== 5}
              className="h-[56px] px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <button
            onClick={() => navigate('/quote?v3=1')}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-background border border-border rounded-xl text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all min-h-[56px]"
          >
            <MapPin className="w-4 h-4" />
            Enter full address instead
          </button>
        </div>
      </AssistantShell>
    );
  }

  // ── PHOTO ANALYZING ──
  if (state === 'photo' || state === 'photo-analyzing') {
    return (
      <AssistantShell onBack={goBack}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Analyzing your project...
          </h3>
          <p className="text-sm text-muted-foreground">
            We'll recommend the right dumpster size.
          </p>
        </div>
      </AssistantShell>
    );
  }

  // ── SCHEDULE ──
  if (state === 'schedule') {
    return (
      <AssistantShell onBack={goBack}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Have you already received a quote?
          </h3>
        </div>
        <div className="space-y-3">
          <OptionButton
            label="Yes, I have a quote"
            onClick={() => navigate('/portal/schedule')}
          />
          <OptionButton
            label="No, I need a quote first"
            onClick={() => setState('zip')}
          />
        </div>
      </AssistantShell>
    );
  }

  // ── CONTACT ──
  if (state === 'contact') {
    return (
      <AssistantShell onBack={goBack}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Would you like us to call or text you?
          </h3>
        </div>
        <div className="space-y-3">
          <OptionButton
            label="Call Me"
            onClick={() => {
              setContactMethod('call');
              setState('contact-form');
            }}
          />
          <OptionButton
            label="Text Me"
            onClick={() => {
              setContactMethod('text');
              setState('contact-form');
            }}
          />
          <div className="pt-2 text-center">
            <a
              href={`tel:${BUSINESS_INFO.phone.sales}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              Or call us now: {BUSINESS_INFO.phone.salesFormatted}
            </a>
          </div>
        </div>
      </AssistantShell>
    );
  }

  // ── CONTACT FORM ──
  if (state === 'contact-form') {
    if (submitted) {
      return (
        <AssistantShell>
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              We'll {contactMethod === 'call' ? 'call' : 'text'} you shortly.
            </h3>
            <p className="text-sm text-muted-foreground">
              A specialist will reach out within a few minutes during business hours.
            </p>
          </div>
        </AssistantShell>
      );
    }

    return (
      <AssistantShell onBack={() => setState('contact')}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Your contact information
          </h3>
          <p className="text-sm text-muted-foreground">
            We'll {contactMethod === 'call' ? 'call' : 'text'} you at this number.
          </p>
        </div>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base h-[56px] rounded-xl border-border"
            autoFocus
          />
          <Input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContactSubmit()}
            className="text-base h-[56px] rounded-xl border-border"
          />
          <Button
            onClick={handleContactSubmit}
            disabled={!name.trim() || !phone.trim()}
            className="w-full h-[56px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
          >
            {contactMethod === 'call' ? 'Request Call' : 'Request Text'}
          </Button>
        </div>
      </AssistantShell>
    );
  }

  // ── CONTRACTOR ──
  if (state === 'contractor') {
    return (
      <AssistantShell onBack={goBack}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Are you an existing contractor?
          </h3>
        </div>
        <div className="space-y-3">
          <OptionButton
            label="Yes, I have an account"
            onClick={() => navigate('/quote/contractor')}
          />
          <OptionButton
            label="No, I'm new"
            onClick={() => navigate('/quote/contractor')}
          />
        </div>
      </AssistantShell>
    );
  }

  // ── FALLBACK ──
  return (
    <AssistantShell>
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-4">
          We're having trouble loading this step.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Please call{' '}
          <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-primary font-semibold hover:underline">
            {BUSINESS_INFO.phone.salesFormatted}
          </a>{' '}
          for immediate assistance.
        </p>
        <Button onClick={goBack} variant="outline" className="rounded-xl">
          Start Over
        </Button>
      </div>
    </AssistantShell>
  );
}

// ── Shell wrapper ──
function AssistantShell({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="max-w-[520px] mx-auto bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}
      {children}
    </div>
  );
}

// ── Reusable option button ──
function OptionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 bg-background border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 hover:bg-muted/30 transition-all min-h-[56px]"
    >
      <span>{label}</span>
      <ArrowRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

export default GuidedAssistant;
