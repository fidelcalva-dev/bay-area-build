import { ArrowRight, Phone, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { InstantQuoteForm } from '@/components/forms/InstantQuoteForm';

const TRASHLAB_URL = 'https://app.trashlab.com';

export function HeroSection() {
  const { t } = useLanguage();

  const features = [
    t('features.sameDay'),
    t('features.transparent'),
    t('features.onTime'),
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[calc(100vh-5rem)] py-12 md:py-16">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur rounded-full text-primary-foreground text-sm font-medium mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              <span>{t('hero.trust')}</span>
              <span className="ml-1 text-primary-foreground/70">•</span>
              <span className="text-primary-foreground/90">🇪🇸 {t('hero.spanish')}</span>
            </div>

            <h1 className="heading-xl text-primary-foreground mb-4 animate-slide-up">
              {t('hero.title')}
              <span className="block text-accent">{t('hero.subtitle')}</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/85 max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up">
              {t('hero.description')}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8 animate-slide-up">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur rounded-lg text-primary-foreground text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
              <Button asChild variant="hero" size="xl">
                <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer">
                  {t('hero.cta.order')}
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <Button asChild variant="heroSecondary" size="xl">
                <a href="tel:+15106802150">
                  <Phone className="w-5 h-5" />
                  {t('hero.cta.call')}
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-primary-foreground/10 animate-fade-in">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground">9</div>
                <div className="text-sm text-primary-foreground/70">Counties Served</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground">6</div>
                <div className="text-sm text-primary-foreground/70">Dumpster Sizes</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground">24hr</div>
                <div className="text-sm text-primary-foreground/70">Delivery Available</div>
              </div>
            </div>
          </div>

          <div className="animate-slide-up">
            <InstantQuoteForm />
          </div>
        </div>
      </div>
    </section>
  );
}
