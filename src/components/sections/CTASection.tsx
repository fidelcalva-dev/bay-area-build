// CTA Section - Standardized call-to-action
// Uses 3 standard CTAs: Get Instant Quote, Call Now, Text Us

import { ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { BUSINESS_INFO, CTA_LINKS } from '@/lib/shared-data';

interface CTASectionProps {
  /** Custom headline */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Background variant */
  variant?: 'primary' | 'secondary' | 'dark';
  /** Show only primary CTA */
  primaryOnly?: boolean;
}

export function CTASection({ 
  title, 
  subtitle, 
  variant = 'secondary',
  primaryOnly = false 
}: CTASectionProps) {
  const { t } = useLanguage();

  const bgClass = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    dark: 'bg-foreground text-background',
  }[variant];

  const buttonOutlineClass = {
    primary: 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10',
    secondary: 'border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10',
    dark: 'border-background/30 text-background hover:bg-background/10',
  }[variant];

  return (
    <section className={`section-padding ${bgClass}`}>
      <div className="container-narrow text-center">
        <h2 className="heading-lg mb-4">
          {title || t('ctaSection.title')}
        </h2>
        <p className={`text-lg max-w-2xl mx-auto mb-8 opacity-80`}>
          {subtitle || t('ctaSection.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {/* Primary CTA: Get Instant Quote */}
          <Button asChild variant="cta" size="xl">
            <Link to={CTA_LINKS.quotePage}>
              Get Instant Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          {!primaryOnly && (
            <>
              {/* Secondary CTA: Call Now */}
              <Button asChild variant="heroOutline" size="xl" className={buttonOutlineClass}>
                <a href={CTA_LINKS.call}>
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </Button>

              {/* Tertiary CTA: Text Us */}
              <Button asChild variant="heroOutline" size="xl" className={buttonOutlineClass}>
                <a href={CTA_LINKS.text}>
                  <MessageSquare className="w-5 h-5" />
                  Text Us
                </a>
              </Button>
            </>
          )}
        </div>

        <p className="opacity-60">
          🇪🇸 Hablamos Español • {BUSINESS_INFO.phone.salesFormatted}
        </p>
      </div>
    </section>
  );
}
