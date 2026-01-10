import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, CheckCircle, Info, DollarSign, Truck, Clock } from 'lucide-react';

const TRASHLAB_URL = 'https://app.trashlab.com';

const pricingTiers = [
  { size: 8, basePrice: 350, weightLimit: '1 ton', extraWeight: '$75/ton' },
  { size: 10, basePrice: 395, weightLimit: '2 tons', extraWeight: '$75/ton' },
  { size: 15, basePrice: 445, weightLimit: '2 tons', extraWeight: '$75/ton' },
  { size: 20, basePrice: 495, weightLimit: '3 tons', extraWeight: '$75/ton' },
  { size: 30, basePrice: 595, weightLimit: '4 tons', extraWeight: '$75/ton' },
  { size: 40, basePrice: 695, weightLimit: '5 tons', extraWeight: '$75/ton' },
];

const included = [
  'Up to 7 days rental',
  'Delivery & pickup',
  'Weight allowance included',
  'No hidden fees',
  'Text delivery updates',
];

const extras = [
  { name: 'Extra rental days', price: '$50/day' },
  { name: 'Overweight charges', price: '$75/ton over limit' },
  { name: 'Concrete/dirt surcharge', price: '$100 flat' },
  { name: 'Same-day delivery', price: 'Often free (call to confirm)' },
  { name: 'Swap (empty & return)', price: 'Starting at $150' },
];

export default function Pricing() {
  return (
    <Layout 
      title="Dumpster Rental Pricing | Transparent Rates"
      description="Affordable dumpster rental prices in SF Bay Area. 8-40 yard dumpsters starting at $350. No hidden fees. Same-day delivery available."
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">Transparent Pricing</h1>
            <p className="text-xl text-primary-foreground/85">
              No surprises, no hidden fees. See exactly what you'll pay before you book.
            </p>
          </div>
        </div>
      </section>

      {/* How Pricing Works */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">How Pricing Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, all-inclusive pricing. Your quote includes delivery, pickup, and rental period.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">1. Choose Your Size</h3>
              <p className="text-muted-foreground">Pick the dumpster size that fits your project. Not sure? We'll help you decide.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">2. We Deliver</h3>
              <p className="text-muted-foreground">Same-day or next-day delivery. We'll text you when we're on the way.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">3. Fill & Call</h3>
              <p className="text-muted-foreground">Take up to 7 days. When you're done, schedule pickup. We handle disposal.</p>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div key={tier.size} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-card-hover transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{tier.size} Yard</h3>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Starting at</span>
                  <div className="text-4xl font-extrabold text-foreground">${tier.basePrice}</div>
                </div>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Weight limit:</span>
                    <span className="font-medium text-foreground">{tier.weightLimit}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Extra weight:</span>
                    <span className="font-medium text-foreground">{tier.extraWeight}</span>
                  </div>
                </div>

                <Button asChild variant="cta" className="w-full">
                  <a href={TRASHLAB_URL} target="_blank" rel="noopener noreferrer">
                    Order Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-lg text-foreground mb-6">What's Included</h2>
              <p className="text-muted-foreground mb-8">
                Every rental comes with these features at no extra cost.
              </p>
              <div className="space-y-4">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="heading-lg text-foreground mb-6">Additional Fees</h2>
              <p className="text-muted-foreground mb-8">
                These fees only apply in specific situations. We'll always tell you upfront.
              </p>
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="space-y-4">
                  {extras.map((extra) => (
                    <div key={extra.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-foreground">{extra.name}</span>
                      <span className="font-semibold text-foreground">{extra.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-8 bg-accent/10">
        <div className="container-wide">
          <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-accent/20">
            <Info className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Price Varies by Location</h4>
              <p className="text-muted-foreground">
                Final pricing depends on your delivery location and material type. Get an instant quote for your exact address.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Get Your Quote?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Enter your ZIP code to see exact pricing for your location.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/#quote">
                Get Instant Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href="tel:+15106802150">
                Call (510) 680-2150
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
