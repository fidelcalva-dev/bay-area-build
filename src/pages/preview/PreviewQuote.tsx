// ============================================================
// PREVIEW QUOTE PAGE - v2 Quote Flow Preview
// For internal testing before public rollout
// ============================================================
import { Layout } from '@/components/layout/Layout';
import { MinimalQuoteCalculator } from '@/components/quote/MinimalQuoteCalculator';
import { CheckCircle, MessageCircle, Shield, AlertTriangle } from 'lucide-react';
import { TrustStrip, PhoneCTA } from '@/components/shared';
import { PriceTransparencyNote } from '@/components/seo/LocalSEOSchema';
import { Badge } from '@/components/ui/badge';

const benefits = [
  'All-inclusive pricing — no hidden fees',
  'Delivery & pickup included',
  'Weight allowance included',
  '7-day standard rental',
  'Bay Area coverage (9 counties)',
  'Hablamos español',
];

export default function PreviewQuote() {
  return (
    <Layout
      title="[PREVIEW] Get Instant Dumpster Quote | CALSAN Dumpsters"
      description="Preview of the new Uber-like quote experience. For internal testing only."
      noindex={true}
    >
      {/* Preview Mode Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 py-2">
        <div className="container-wide">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Preview Mode</span>
            <Badge variant="outline" className="text-xs">v2 Quote Flow</Badge>
            <span className="text-amber-600">- For internal testing only</span>
          </div>
        </div>
      </div>

      <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary/5 via-background to-muted">
        <div className="container-wide py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left - Value Proposition */}
            <div className="lg:sticky lg:top-24">
              {/* Trust Badges */}
              <TrustStrip 
                badges={['licensedInsured', 'fiveStarReviews', 'sameDayAvailable']}
                variant="light"
                className="mb-6"
              />

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
              <PhoneCTA variant="block" />

              {/* Spanish Support */}
              <p className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Hablamos español — llámenos para ayuda en español</span>
              </p>
            </div>

            {/* Right - Calculator */}
            <div className="lg:pt-0">
              <MinimalQuoteCalculator />
              
              {/* Reassurance below calculator */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Your information is secure and never shared
                </p>
                <PriceTransparencyNote className="text-xs text-muted-foreground mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll contact you within 15 minutes during business hours (6AM–9PM daily)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
