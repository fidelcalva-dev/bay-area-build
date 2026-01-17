import { ArrowRight, Phone, MessageCircle, Shield, Award, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstantQuoteCalculatorV3 } from '@/components/quote/InstantQuoteCalculatorV3';

const TRASHLAB_URL = 'https://app.trashlab.com';

export function HeroSection() {
  const benefits = [
    'Same-day delivery available',
    'Transparent pricing — no hidden fees',
    'On-time guarantee or it\'s free',
  ];

  const trustBadges = [
    { icon: Shield, label: 'Google Guaranteed' },
    { icon: Award, label: 'Licensed & Insured' },
    { icon: CheckCircle, label: 'Hablamos Español' },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center py-6 md:py-10 lg:py-16">
          {/* Left Content - Conversion Optimized */}
          <div className="text-center lg:text-left">
            {/* Star Rating - Above the Fold */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 animate-fade-in">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary-foreground">5.0</span>
                <span className="text-primary-foreground/70 text-sm">from</span>
                <a 
                  href="#reviews" 
                  className="text-accent font-semibold text-sm hover:underline underline-offset-2"
                >
                  500+ reviews
                </a>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-3 animate-slide-up leading-tight">
              Dumpster Rentals in the Bay Area
              <span className="block text-accent mt-1">— Instant Quote by ZIP</span>
            </h1>

            {/* 3 Benefits Subheadline */}
            <ul className="space-y-1.5 mb-4 animate-slide-up">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center justify-center lg:justify-start gap-2 text-sm md:text-base text-primary-foreground/90">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTAs - Primary + Secondary */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start animate-slide-up mb-4">
              <Button asChild variant="hero" size="lg" className="text-base">
                <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer">
                  Get Instant Quote
                  <ArrowRight className="w-5 h-5 ml-1" />
                </a>
              </Button>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="heroSecondary" size="lg" className="flex-1 sm:flex-none">
                  <a href="sms:+15106802150">
                    <MessageCircle className="w-4 h-4" />
                    Text Us
                  </a>
                </Button>
                <Button asChild variant="heroSecondary" size="lg" className="flex-1 sm:flex-none">
                  <a href="tel:+15106802150">
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 animate-fade-in">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-foreground/10 backdrop-blur rounded-full text-xs md:text-sm text-primary-foreground/90"
                >
                  <Icon className="w-3.5 h-3.5 text-accent" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Quote Calculator */}
          <div className="animate-slide-up" id="quote">
            <InstantQuoteCalculatorV3 />
          </div>
        </div>
      </div>
    </section>
  );
}
