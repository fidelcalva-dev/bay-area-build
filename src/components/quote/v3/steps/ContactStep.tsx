// V3 Step 6 — Contact / Lead Capture
import React from 'react';
import { User, Phone, Mail, Shield, Clock, ChevronRight, Building2 } from 'lucide-react';
import { PrivacyNoticeAtCollection } from '@/components/legal/PrivacyNoticeAtCollection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import logoCalsan from '@/assets/logo-calsan.jpeg';
import { StepTransition, BackButton } from './shared';
import type { ContactStepProps } from './types';

export function ContactStep({
  customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerEmail, setCustomerEmail, customerNotes, setCustomerNotes,
  companyName, setCompanyName,
  consentSms, setConsentSms, consentTerms, setConsentTerms,
  customerType, goNext, goBack,
}: ContactStepProps) {
  const [phoneTouched, setPhoneTouched] = React.useState(false);

  const phoneDigits = customerPhone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === 10;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (raw.length >= 7) {
      setCustomerPhone(`(${raw.slice(0,3)}) ${raw.slice(3,6)}-${raw.slice(6)}`);
    } else if (raw.length >= 4) {
      setCustomerPhone(`(${raw.slice(0,3)}) ${raw.slice(3)}`);
    } else {
      setCustomerPhone(raw);
    }
  };

  return (
    <StepTransition stepKey="contact">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <img src={logoCalsan} alt="Calsan Dumpsters Pro" className="h-10 w-auto rounded-md mb-3" />
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            Almost there — who should we contact?
          </h4>
          <p className="text-sm text-muted-foreground">
            We'll send your exact price and next steps.
          </p>
        </div>

        {/* Contact form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" /> Name
            </label>
            <Input
              type="text"
              placeholder="John Smith"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-12 rounded-xl border-border/60"
              autoFocus
            />
          </div>

          {/* Company name — always visible, optional */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> Company Name
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              type="text"
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-12 rounded-xl border-border/60"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone
            </label>
            <Input
              type="tel"
              inputMode="tel"
              placeholder="(510) 555-1234"
              value={customerPhone}
              onChange={handlePhoneChange}
              onBlur={() => setPhoneTouched(true)}
              className={`h-12 rounded-xl border-border/60 ${phoneTouched && !phoneValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {phoneTouched && !phoneValid && (
              <p className="text-xs text-destructive mt-1">Phone must be exactly 10 digits</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              type="email"
              placeholder="you@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="h-12 rounded-xl border-border/60"
            />
          </div>
        </div>

        {/* SMS Consent */}
        <div className="space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={consentSms}
              onCheckedChange={(v) => setConsentSms(v === true)}
              className="mt-0.5"
            />
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              By checking, you are allowing to receive promotional/marketing SMS communications from Calsan Dumpsters Pro. Frequency may vary. Message and data rates may apply, reply HELP for help or STOP to opt-out.
            </span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={consentTerms}
              onCheckedChange={(v) => setConsentTerms(v === true)}
              className="mt-0.5"
            />
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              By checking, I accept{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Terms Of Service</a>
              {' & '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Privacy Policy</a>
            </span>
          </label>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 py-1">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <Shield className="w-3 h-3 text-primary" />
            Secure & private
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
            <Clock className="w-3 h-3 text-primary" />
            15-min response
          </span>
        </div>

        <Button
          variant="cta"
          size="lg"
          className="w-full h-14 rounded-xl text-base font-semibold"
          onClick={goNext}
          disabled={!customerName || !phoneValid || !consentSms || !consentTerms}
        >
          See My Exact Price
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Privacy Policy</a>
          {' · '}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Terms of Service</a>
        </p>
      </div>
    </StepTransition>
  );
}
