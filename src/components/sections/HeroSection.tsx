import { CheckCircle } from 'lucide-react';
import { InstantQuoteCalculatorV3 } from '@/components/quote/InstantQuoteCalculatorV3';
import { TrustStrip, StarRating, CTAButtons } from '@/components/shared';

export function HeroSection() {
  const benefits = [
    'Same-day delivery available',
    'Transparent pricing — no hidden fees',
    'On-time guarantee or it\'s free',
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
            <StarRating 
              rating={5.0} 
              reviews={500} 
              variant="hero"
              className="justify-center lg:justify-start mb-4 animate-fade-in" 
            />

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
            <CTAButtons 
              variant="hero" 
              className="justify-center lg:justify-start animate-slide-up mb-4" 
            />

            {/* Trust Badges */}
            <TrustStrip 
              badges={['googleGuaranteed', 'licensedInsured', 'hablamosEspanol']}
              variant="hero"
              className="justify-center lg:justify-start animate-fade-in" 
            />
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
