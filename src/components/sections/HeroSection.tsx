import { Zap, MapPin, Clock, ArrowRight } from 'lucide-react';
import { InstantQuoteCalculatorV3 } from '@/components/quote/InstantQuoteCalculatorV3';
import { TrustStrip, StarRating } from '@/components/shared';

export function HeroSection() {
  const systemFeatures = [
    { icon: MapPin, label: 'Nearest yard auto-selected' },
    { icon: Zap, label: 'Instant ZIP-based estimate' },
    { icon: Clock, label: 'Same-day available' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--accent)/0.15)_0%,_transparent_50%)]" />
      
      {/* Subtle grid pattern for tech feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--primary-foreground)) 1px, transparent 1px),
                            linear-gradient(to bottom, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container-wide relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-8 md:py-12 lg:py-20">
          {/* Left Content - System-First Messaging */}
          <div className="text-center lg:text-left space-y-6">
            {/* Micro-indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/10 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-xs font-medium text-primary-foreground/80">
                Dispatch available now
              </span>
            </div>

            {/* Headline - Tech-style */}
            <div className="animate-slide-up">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight">
                Dumpster logistics
                <span className="block text-accent mt-1">made simple</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-primary-foreground/70 max-w-lg">
                Enter your ZIP. Get an instant estimate. Schedule delivery. 
                <span className="text-primary-foreground font-medium"> That's it.</span>
              </p>
            </div>

            {/* System Features - Inline indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 animate-slide-up">
              {systemFeatures.map(({ icon: Icon, label }) => (
                <div 
                  key={label}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-foreground/5 backdrop-blur-sm rounded-lg border border-primary-foreground/10 text-sm"
                >
                  <Icon className="w-4 h-4 text-accent" />
                  <span className="text-primary-foreground/90 font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Star Rating - Subtle */}
            <div className="animate-fade-in pt-2">
              <StarRating 
                rating={5.0} 
                reviews={500} 
                variant="hero"
                className="justify-center lg:justify-start" 
              />
            </div>

            {/* Trust Strip - Compact */}
            <TrustStrip 
              badges={['googleGuaranteed', 'licensedInsured', 'hablamosEspanol']}
              variant="hero"
              size="sm"
              className="justify-center lg:justify-start animate-fade-in" 
            />
          </div>

          {/* Right - Quote Calculator with system styling */}
          <div className="animate-slide-up lg:animate-slide-in-right" id="quote">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl" />
              
              <InstantQuoteCalculatorV3 />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
