// CTA Section - Standardized call-to-action
// Uses canonical CTAButtons component for consistency

import { useLanguage } from '@/contexts/LanguageContext';
import { CTAButtons, CTA_CONFIG } from '@/components/shared';

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

  return (
    <section className={`section-padding ${bgClass}`}>
      <div className="container-narrow text-center">
        <h2 className="heading-lg mb-4">
          {title || t('ctaSection.title')}
        </h2>
        <p className={`text-lg max-w-2xl mx-auto mb-8 opacity-80`}>
          {subtitle || t('ctaSection.subtitle')}
        </p>

        <CTAButtons 
          variant="section" 
          showText={!primaryOnly}
          showCall={!primaryOnly}
          className="justify-center mb-8" 
        />

        <p className="opacity-60">
          🇪🇸 Hablamos Español • {CTA_CONFIG.phoneFormatted}
        </p>
      </div>
    </section>
  );
}
