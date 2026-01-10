import { useState, useEffect } from 'react';
import { ArrowRight, Phone, CheckCircle, Shield, Star, Clock, Truck, DollarSign, Zap, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { InstantQuoteForm } from '@/components/forms/InstantQuoteForm';

const TRASHLAB_URL = 'https://app.trashlab.com';

// Delivery availability logic based on current time
function getDeliveryAvailability(): { type: 'same-day' | 'next-day'; message: string; urgency: boolean } {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Same-day cutoff at 2 PM on weekdays
  const isSameDayAvailable = hour < 14 && day >= 1 && day <= 5;
  
  // Weekend check
  const isWeekend = day === 0 || day === 6;
  
  if (isSameDayAvailable) {
    const hoursLeft = 14 - hour;
    return {
      type: 'same-day',
      message: `Same-day delivery available — order within ${hoursLeft}hr${hoursLeft > 1 ? 's' : ''}`,
      urgency: hoursLeft <= 2,
    };
  } else if (isWeekend) {
    return {
      type: 'next-day',
      message: 'Order now for Monday delivery',
      urgency: false,
    };
  } else {
    return {
      type: 'next-day',
      message: 'Next-day delivery available',
      urgency: false,
    };
  }
}

export function HeroSection() {
  const { t } = useLanguage();
  const [delivery, setDelivery] = useState(getDeliveryAvailability);

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setDelivery(getDeliveryAvailability());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const benefits = [
    { icon: Clock, textKey: 'hero.benefit.sameDay' },
    { icon: DollarSign, textKey: 'hero.benefit.transparent' },
    { icon: Truck, textKey: 'hero.benefit.onTime' },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 md:py-12 lg:py-16">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Trust Badge + Social Proof Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 backdrop-blur rounded-full text-primary-foreground text-sm font-medium">
                <Shield className="w-4 h-4 text-accent" />
                <span>{t('hero.trust')}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/20 backdrop-blur rounded-full text-accent text-sm font-semibold">
                <Star className="w-4 h-4 fill-accent" />
                <span>4.9</span>
                <span className="text-primary-foreground/70 font-normal">(200+ reviews)</span>
              </div>
            </div>

            {/* Headline - Tightened */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-3 animate-slide-up leading-tight">
              {t('hero.title')}
              <span className="block text-accent mt-1">{t('hero.subtitle')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-primary-foreground/85 max-w-lg mx-auto lg:mx-0 mb-5 animate-slide-up">
              {t('hero.description')}
            </p>

            {/* 3 Benefit Bullets */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6 animate-slide-up">
              {benefits.map(({ icon: Icon, textKey }) => (
                <div
                  key={textKey}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-primary-foreground">{t(textKey)}</span>
                </div>
              ))}
            </div>

            {/* Delivery Availability Indicator */}
            <div className="flex justify-center lg:justify-start mb-4 animate-fade-in">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                delivery.type === 'same-day' 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
              } ${delivery.urgency ? 'animate-pulse' : ''}`}>
                {delivery.type === 'same-day' ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  <CalendarCheck className="w-4 h-4" />
                )}
                <span>{delivery.message}</span>
              </div>
            </div>

            {/* CTAs - High Contrast */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-slide-up">
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

            {/* Social Proof Stats - Above the Fold */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-primary-foreground/10 animate-fade-in">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-extrabold text-primary-foreground">9</div>
                <div className="text-xs text-primary-foreground/70">{t('hero.stats.counties')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-extrabold text-primary-foreground">5K+</div>
                <div className="text-xs text-primary-foreground/70">{t('hero.stats.customers')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-extrabold text-primary-foreground">24hr</div>
                <div className="text-xs text-primary-foreground/70">{t('hero.stats.delivery')}</div>
              </div>
            </div>

            {/* Spanish Support */}
            <div className="mt-4 animate-fade-in">
              <span className="inline-flex items-center gap-2 text-sm text-primary-foreground/80">
                🇪🇸 <span className="font-medium">{t('hero.spanish')}</span>
              </span>
            </div>
          </div>

          {/* Right - Quote Form */}
          <div className="animate-slide-up">
            <InstantQuoteForm />
          </div>
        </div>
      </div>
    </section>
  );
}
