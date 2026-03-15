import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, MapPin, Phone, Truck, Clock, Shield, Building } from 'lucide-react';
import { PAGE_SEO, BUSINESS_INFO } from '@/lib/seo';
import { REGIONS, getCitiesForRegion, type RegionConfig } from '@/lib/service-area-config';
import { cityUrl } from '@/lib/seo-urls';

function RegionCard({ region }: { region: RegionConfig }) {
  const cities = getCitiesForRegion(region.slug);
  const isDirect = region.serviceModel === 'DIRECT_OPERATION';

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{region.name}</h3>
              <p className="text-xs text-muted-foreground">{region.counties.join(' • ')}</p>
            </div>
          </div>
          {isDirect ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-full whitespace-nowrap">
              <Truck className="w-3 h-3" /> Direct Operations
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-accent/50 text-muted-foreground rounded-full whitespace-nowrap">
              <Building className="w-3 h-3" /> Service Network
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">{region.description}</p>

        {/* City links */}
        <div className="flex flex-wrap gap-2 mb-4">
          {cities.slice(0, 8).map(city => (
            <Link
              key={city.slug}
              to={cityUrl(city.slug)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-muted rounded-full text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <CheckCircle className="w-3 h-3 text-success" />
              {city.name}
            </Link>
          ))}
          {cities.length > 8 && (
            <span className="inline-flex items-center px-3 py-1.5 text-sm text-muted-foreground">
              +{cities.length - 8} more
            </span>
          )}
        </div>

        {/* Region hub link */}
        <Link
          to={region.hubUrl}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all {region.name} cities <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function Areas() {
  const directRegions = REGIONS.filter(r => r.serviceModel === 'DIRECT_OPERATION');
  const partnerRegions = REGIONS.filter(r => r.serviceModel === 'PARTNER_NETWORK');

  return (
    <Layout
      title={PAGE_SEO.areas.title}
      description={PAGE_SEO.areas.description}
      canonical={PAGE_SEO.areas.canonical}
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm mb-4">
              <MapPin className="w-4 h-4" />
              Bay Area Direct Operations
            </div>
            <h1 className="heading-xl mb-4">Bay Area Dumpster Rental Service Areas</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">
              Dispatched from our Oakland, San Jose, and San Francisco yards — serving 16+ Bay Area cities with same-day delivery and transparent pricing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">
                  Get Instant Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4" />
                  {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-5 bg-muted/50 border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /><span>Real Local Yards</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>Same-Day Delivery</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>Not a Broker</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>5-50 Yard Sizes</span></div>
          </div>
        </div>
      </section>

      {/* Direct Operations Regions */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="heading-lg text-foreground mb-3">Direct Operations — Bay Area</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our fleet operates from local yards in Oakland, San Jose, and San Francisco. Same-day delivery, direct dispatch, and full fleet availability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directRegions.map(region => (
              <RegionCard key={region.slug} region={region} />
            ))}
          </div>
        </div>
      </section>

      {/* Extended Service Network — De-emphasized */}
      {partnerRegions.length > 0 && (
        <section className="py-8 bg-muted/30 border-t border-border">
          <div className="container-wide">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-muted-foreground">Extended Service Network</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-1">
                Service may be available in these regions through our coordinated logistics network. Availability varies — call to confirm.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              {partnerRegions.map(region => (
                <Link
                  key={region.slug}
                  to={region.hubUrl}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-card border border-border rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  <Building className="w-3.5 h-3.5" />
                  {region.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Expanding Coverage */}
      <section className="section-padding bg-background">
        <div className="container-narrow text-center">
          <h2 className="heading-md text-foreground mb-4">Expanding Across California</h2>
          <p className="text-muted-foreground mb-6">
            Our core operations are based in the Bay Area. We're growing into new regions through a coordinated partner network — same Calsan standards, local delivery.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/bay-area-dumpster-rental">
              Explore Bay Area Coverage
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Why Local */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-lg text-foreground mb-6">Why Choose a Local Yard Operator?</h2>
              <div className="space-y-4">
                {[
                  'Same-day delivery from nearby yards',
                  'No broker markups or subcontractor delays',
                  'Drivers who know your neighborhood',
                  'Direct communication — no middlemen',
                  'Supporting a real Bay Area business',
                  'Bilingual support (English & Spanish)',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="heading-sm text-foreground mb-4">Check Your Coverage</h3>
              <p className="text-muted-foreground mb-6">
                Enter your ZIP code to confirm service availability and get an instant quote with transparent pricing.
              </p>
              <Button asChild variant="cta" size="lg" className="w-full">
                <Link to="/quote">
                  Get Instant Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Or call <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-primary font-semibold">{BUSINESS_INFO.phone.salesFormatted}</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Don't See Your City?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            We may still be able to serve you. Give us a call and we'll check if delivery is available in your area.
          </p>
          <Button asChild variant="cta" size="xl">
            <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
              Call {BUSINESS_INFO.phone.salesFormatted}
            </a>
          </Button>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-8 bg-muted/30 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/sizes" className="text-primary hover:underline">All Dumpster Sizes</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/materials" className="text-primary hover:underline">Materials Guide</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/contractors" className="text-primary hover:underline">Contractor Service</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/dumpster-rental-east-bay" className="text-primary hover:underline">East Bay</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/dumpster-rental-south-bay" className="text-primary hover:underline">South Bay</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/dumpster-rental/san-francisco" className="text-primary hover:underline">San Francisco</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/quote" className="text-primary hover:underline">Get Quote</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
