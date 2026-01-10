import { ArrowRight, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const TRASHLAB_URL = 'https://app.trashlab.com';

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-secondary text-secondary-foreground">
      <div className="container-narrow text-center">
        <h2 className="heading-lg mb-4">{t('ctaSection.title')}</h2>
        <p className="text-lg text-secondary-foreground/80 max-w-2xl mx-auto mb-8">
          {t('ctaSection.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button asChild variant="cta" size="xl">
            <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer">
              {t('cta.order')}
              <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
          <Button asChild variant="heroOutline" size="xl" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
            <a href="tel:+15106802150">
              <Phone className="w-5 h-5" />
              {t('cta.call')}
            </a>
          </Button>
          <Button asChild variant="heroOutline" size="xl" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
            <a href="sms:+15106802150">
              <MessageSquare className="w-5 h-5" />
              {t('cta.text')}
            </a>
          </Button>
        </div>

        <p className="text-secondary-foreground/60">
          🇪🇸 Hablamos Español • (510) 680-2150
        </p>
      </div>
    </section>
  );
}
