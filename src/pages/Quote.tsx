import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { V3QuoteFlow } from '@/components/quote/v3';
import { CheckCircle, MessageCircle, Shield, ArrowRight, Package, Clock, Truck } from 'lucide-react';
import { TrustStrip, PhoneCTA } from '@/components/shared';
import { PriceTransparencyNote } from '@/components/seo/LocalSEOSchema';
import { CalculatorSeoFaq } from '@/components/seo/CalculatorSeoFaq';

const benefits = [
  'All-inclusive pricing — no hidden fees',
  'Delivery & pickup included',
  'Weight allowance included',
  '7-day standard rental',
  'Bay Area coverage (9 counties)',
  'Español disponible',
];

const HOW_IT_WORKS = [
  { number: '1', icon: ArrowRight, title: 'Get your exact price', desc: 'Enter ZIP and project type' },
  { number: '2', icon: Clock, title: 'Choose delivery date', desc: 'Pick a date that works' },
  { number: '3', icon: Package, title: 'Fill the dumpster', desc: 'Load at your own pace' },
  { number: '4', icon: Truck, title: 'We pick it up', desc: 'We haul it away' },
];

export default function Quote() {
  return (
    <Layout
      title="Get Instant Dumpster Quote | CALSAN Dumpsters"
      description="Get an instant dumpster rental quote in 60 seconds. All-inclusive pricing with no hidden fees. Same-day delivery available in the Bay Area."
    >
      <section className="min-h-[calc(100vh-4rem)] bg-[hsl(150_10%_98%)]">
        <div className="container-wide py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Calculator — shows first on mobile */}
            <div className="order-first lg:order-last lg:pt-0">
              <V3QuoteFlow />
              
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  After-hours messages answered next business window
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-4 pt-3 border-t border-border">
                  <Link to="/how-it-works" className="text-xs text-primary hover:underline flex items-center gap-1">
                    How it works <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link to="/why-local-yards" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Why local yards <ArrowRight className="w-3 h-3" />
                  </Link>
                  <Link to="/not-a-broker" className="text-xs text-primary hover:underline flex items-center gap-1">
                    We're not a broker <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Value Proposition — below calculator on mobile, left side on desktop */}
            <div className="order-last lg:order-first lg:sticky lg:top-24">
              <TrustStrip 
                badges={['licensedInsured', 'fiveStarReviews', 'sameDayAvailable']}
                variant="light"
                className="mb-6"
              />

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                Get Your Dumpster Quote
                <span className="block text-primary mt-1">In 60 Seconds</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Transparent, all-inclusive pricing for roll-off dumpster rentals across the Bay Area. 
                No surprises, no hidden fees.
              </p>

              <div className="bg-card rounded-2xl border border-border p-6 mb-6">
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

              <div className="bg-card rounded-2xl border border-border p-6 mb-6">
                <h2 className="font-bold text-foreground mb-4">How It Works</h2>
                <div className="space-y-3">
                  {HOW_IT_WORKS.map((step) => (
                    <div key={step.number} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {step.number}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <PhoneCTA variant="block" />

              <p className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>Hablamos español — llámenos para ayuda en español</span>
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>

      <CalculatorSeoFaq />
    </Layout>
  );
}
