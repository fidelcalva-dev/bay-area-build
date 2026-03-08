import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { ArrowRight, Phone, Truck, Clock, Shield, MapPin } from 'lucide-react';

interface SeoFallbackContentProps {
  cityName: string;
  citySlug: string;
}

export function SeoFallbackContent({ cityName, citySlug }: SeoFallbackContentProps) {
  const displayName = cityName || citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Layout
      title={`Dumpster Rental in ${displayName}, CA | Calsan Dumpsters Pro`}
      description={`Professional dumpster rental in ${displayName}, CA. Same-day delivery available. 10–40 yard sizes. Call ${BUSINESS_INFO.phone.salesFormatted}.`}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="heading-xl mb-4">Dumpster Rental in {displayName}, CA</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              Calsan Dumpsters Pro provides professional dumpster rental services in {displayName} and surrounding areas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-6 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>Local Bay Area Yards</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>Same-Day Delivery Available</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>Licensed & Insured</span></div>
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /><span>10–40 Yard Sizes</span></div>
          </div>
        </div>
      </section>

      {/* Sizes */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-8 text-center">Available Dumpster Sizes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {DUMPSTER_SIZES_DATA.map(size => (
              <div key={size.yards} className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-foreground">{size.yards}</div>
                <div className="text-xs text-muted-foreground mb-2">YARD DUMPSTER</div>
                <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
                <div className="text-xs text-muted-foreground mt-1">{size.loads}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Get Your {displayName} Dumpster Price</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">Same-day delivery available. Transparent pricing. No hidden fees.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}><Phone className="w-4 h-4 mr-2" />{BUSINESS_INFO.phone.salesFormatted}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-8 bg-muted/30 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/sizes" className="text-primary hover:underline">All Dumpster Sizes</Link>
            <Link to="/materials" className="text-primary hover:underline">Materials Guide</Link>
            <Link to="/pricing" className="text-primary hover:underline">Pricing</Link>
            <Link to="/areas" className="text-primary hover:underline">All Service Areas</Link>
            <Link to="/quote" className="text-primary hover:underline">Get Quote</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
