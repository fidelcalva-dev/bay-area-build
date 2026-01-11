import { Layout } from '@/components/layout/Layout';
import { InstantQuoteCalculatorV3 } from '@/components/quote/InstantQuoteCalculatorV3';
import { Shield, Star, Clock, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const trustBadges = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Star, label: '4.9★ (200+ Reviews)' },
  { icon: Clock, label: 'Same-Day Available' },
];

const benefits = [
  'All-inclusive pricing — no hidden fees',
  'Delivery & pickup included',
  'Weight allowance included',
  '7-day standard rental',
  'Bay Area coverage (9 counties)',
  'Español disponible',
];

export default function Quote() {
  return (
    <Layout
      title="Get Instant Dumpster Quote | CALSAN Dumpsters"
      description="Get an instant dumpster rental quote in 60 seconds. All-inclusive pricing with no hidden fees. Same-day delivery available in the Bay Area."
    >
      <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-muted">
        <div className="container-wide py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left - Value Proposition */}
            <div className="lg:sticky lg:top-24">
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                {trustBadges.map((badge) => (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm font-medium text-primary"
                  >
                    <badge.icon className="w-4 h-4" />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>

              {/* Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                Get Your Dumpster Quote
                <span className="block text-primary mt-1">In 60 Seconds</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Transparent, all-inclusive pricing for roll-off dumpster rentals across the Bay Area. 
                No surprises, no hidden fees.
              </p>

              {/* Benefits List */}
              <div className="bg-card rounded-2xl border border-border p-6 mb-8">
                <h2 className="font-bold text-foreground mb-4">What's Included</h2>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle className="w-5 h-5 text-success shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phone CTA */}
              <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Prefer to talk?</p>
                  <p className="font-semibold text-foreground">Call (510) 680-2150</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href="tel:+15106802150">Call Now</a>
                </Button>
              </div>

              {/* Spanish Support */}
              <p className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
                🇪🇸 <span>Hablamos español — llámenos para ayuda en español</span>
              </p>
            </div>

            {/* Right - Calculator */}
            <div className="lg:pt-0">
              <InstantQuoteCalculatorV3 />
              
              {/* Reassurance below calculator */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  🔒 Your information is secure and never shared
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  We'll contact you within 15 minutes during business hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
