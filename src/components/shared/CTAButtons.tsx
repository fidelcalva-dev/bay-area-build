import { ArrowRight, Phone, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Canonical CTA configuration
export const CTA_CONFIG = {
  phone: '+15106802150',
  phoneFormatted: '(510) 680-2150',
  quoteUrl: 'https://app.trashlab.com',
  smsNumber: '+15106802150',
} as const;

interface CTAButtonsProps {
  variant?: 'hero' | 'section' | 'inline';
  showQuote?: boolean;
  showText?: boolean;
  showCall?: boolean;
  quoteLabel?: string;
  className?: string;
}

/**
 * Canonical CTA Buttons component
 * Standardizes the 3 primary CTAs: Quote, Text, Call
 */
export function CTAButtons({
  variant = 'hero',
  showQuote = true,
  showText = true,
  showCall = true,
  quoteLabel = 'Get Instant Quote',
  className,
}: CTAButtonsProps) {
  if (variant === 'hero') {
    return (
      <div className={cn('flex flex-col sm:flex-row gap-2 sm:gap-3', className)}>
        {showQuote && (
          <Button asChild variant="hero" size="lg" className="text-base">
            <a href={CTA_CONFIG.quoteUrl} target="_blank" rel="noopener noreferrer">
              {quoteLabel}
              <ArrowRight className="w-5 h-5 ml-1" />
            </a>
          </Button>
        )}
        {(showText || showCall) && (
          <div className="flex gap-2 justify-center">
            {showText && (
              <Button asChild variant="heroSecondary" size="lg" className="flex-1 sm:flex-none">
                <a href={`sms:${CTA_CONFIG.smsNumber}`}>
                  <MessageCircle className="w-4 h-4" />
                  Text Us
                </a>
              </Button>
            )}
            {showCall && (
              <Button asChild variant="heroSecondary" size="lg" className="flex-1 sm:flex-none">
                <a href={`tel:${CTA_CONFIG.phone}`}>
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className={cn('flex flex-wrap items-center justify-center gap-3 sm:gap-4', className)}>
        {showQuote && (
          <Button asChild variant="cta" size="lg">
            <a href={CTA_CONFIG.quoteUrl} target="_blank" rel="noopener noreferrer">
              {quoteLabel}
              <ArrowRight className="w-5 h-5 ml-1" />
            </a>
          </Button>
        )}
        {showCall && (
          <Button asChild variant="outline" size="lg">
            <a href={`tel:${CTA_CONFIG.phone}`}>
              <Phone className="w-4 h-4" />
              {CTA_CONFIG.phoneFormatted}
            </a>
          </Button>
        )}
        {showText && (
          <Button asChild variant="outline" size="lg">
            <a href={`sms:${CTA_CONFIG.smsNumber}`}>
              <MessageCircle className="w-4 h-4" />
              Text Us
            </a>
          </Button>
        )}
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showQuote && (
        <Button asChild variant="default" size="sm">
          <a href={CTA_CONFIG.quoteUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="w-4 h-4" />
            Quote
          </a>
        </Button>
      )}
      {showText && (
        <Button asChild variant="outline" size="sm">
          <a href={`sms:${CTA_CONFIG.smsNumber}`}>
            <MessageCircle className="w-4 h-4" />
            Text
          </a>
        </Button>
      )}
      {showCall && (
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${CTA_CONFIG.phone}`}>
            <Phone className="w-4 h-4" />
            Call
          </a>
        </Button>
      )}
    </div>
  );
}

interface PhoneCTAProps {
  variant?: 'block' | 'inline';
  className?: string;
}

/**
 * Phone CTA with styling for sections
 */
export function PhoneCTA({ variant = 'block', className }: PhoneCTAProps) {
  if (variant === 'inline') {
    return (
      <a
        href={`tel:${CTA_CONFIG.phone}`}
        className={cn(
          'inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors',
          className
        )}
      >
        <Phone className="w-4 h-4" />
        <span>{CTA_CONFIG.phoneFormatted}</span>
      </a>
    );
  }

  return (
    <div className={cn('bg-muted/50 rounded-xl p-4 flex items-center gap-4', className)}>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Phone className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">Prefer to talk?</p>
        <p className="font-semibold text-foreground">Call {CTA_CONFIG.phoneFormatted}</p>
      </div>
      <Button asChild variant="outline" size="sm">
        <a href={`tel:${CTA_CONFIG.phone}`}>Call Now</a>
      </Button>
    </div>
  );
}
