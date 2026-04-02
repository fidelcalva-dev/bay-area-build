import { useParams, Navigate, Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageFAQ } from '@/components/seo/PageFAQ';
import { InternalLinkCluster } from '@/components/seo/InternalLinkCluster';
import { SeoJsonLd } from '@/components/seo/SeoJsonLd';
import { getServicePageBySlug, SERVICE_PAGES } from '@/lib/service-pages-data';
import { useDumpsterSizes } from '@/hooks/useDumpsterSizes';
import { BUSINESS_INFO } from '@/lib/seo';
import { ArrowRight, Phone, CheckCircle2, AlertTriangle, Truck, MapPin, DollarSign, Ruler, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ServicePageContent() {
  const { slug } = useParams<{ slug: string }>();
  const { sizes: DUMPSTER_SIZES_DATA } = useDumpsterSizes();
  const page = slug ? getServicePageBySlug(slug) : undefined;

  if (!page) return <Navigate to="/" replace />;

  const sizes = DUMPSTER_SIZES_DATA.filter(s => page.recommendedSizes.includes(s.yards));

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.schemaServiceType,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_INFO.name,
      telephone: BUSINESS_INFO.phone.sales,
      url: BUSINESS_INFO.url,
    },
    areaServed: {
      '@type': 'Place',
      name: 'San Francisco Bay Area, California',
    },
    description: page.metaDescription,
    url: `${BUSINESS_INFO.url}/services/${page.slug}`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BUSINESS_INFO.url },
      { '@type': 'ListItem', position: 2, name: page.title, item: `${BUSINESS_INFO.url}/services/${page.slug}` },
    ],
  };

  return (
    <>
      <SEOHead
        title={page.title}
        description={page.metaDescription}
        canonical={`/services/${page.slug}`}
        schema={[serviceSchema, breadcrumbSchema]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="container-wide max-w-4xl">
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-foreground">{page.title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
            {page.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            {page.heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="text-base">
              <Link to="/quote">
                {page.heroCta} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="mr-2 w-4 h-4" /> {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Intro + Trust */}
      <section className="py-12 md:py-16">
        <div className="container-wide max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-foreground mb-4">What This Service Includes</h2>
              <p className="text-muted-foreground leading-relaxed">{page.intro}</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: ShieldCheck, text: 'Local yards, not a broker' },
                { icon: DollarSign, text: 'Transparent, upfront pricing' },
                { icon: Truck, text: 'Same-day delivery available' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best For */}
      <section className="py-12 md:py-16 bg-muted/30 border-t border-border">
        <div className="container-wide max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Best Projects for This Service</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {page.bestFor.map(item => (
              <div key={item} className="flex items-start gap-3 bg-card border border-border rounded-lg px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Sizes */}
      <section className="py-12 md:py-16">
        <div className="container-wide max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-2">Recommended Dumpster Sizes</h2>
          <p className="text-sm text-muted-foreground mb-6">{page.sizeGuidance}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sizes.map(size => (
              <div key={size.yards} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary">{size.yards}</span>
                  <span className="text-sm font-medium text-muted-foreground">Yard</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{size.dimensions}</p>
                <p className="text-sm font-semibold text-foreground mb-1">From ${size.priceFrom}</p>
                <p className="text-xs text-muted-foreground">{size.includedTons}T included · {size.loads}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/sizes">View All Sizes <Ruler className="ml-2 w-3.5 h-3.5" /></Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/pricing">Full Pricing Guide <DollarSign className="ml-2 w-3.5 h-3.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Delivery & Timing */}
      <section className="py-12 md:py-16 bg-muted/30 border-t border-border">
        <div className="container-wide max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-6">
            <Clock className="inline w-5 h-5 mr-2 text-primary" />
            Delivery, Pickup & Timing
          </h2>
          <div className="space-y-3">
            {page.deliveryNotes.map(note => (
              <div key={note} className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Factors */}
      <section className="py-12 md:py-16">
        <div className="container-wide max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-6">
            <DollarSign className="inline w-5 h-5 mr-2 text-primary" />
            What Affects Your Price
          </h2>
          <ul className="space-y-2">
            {page.pricingFactors.map(factor => (
              <li key={factor} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                {factor}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button asChild>
              <Link to="/quote">Check Price & Availability <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Materials */}
      <section className="py-12 md:py-16 bg-muted/30 border-t border-border">
        <div className="container-wide max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Materials Guidance</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Accepted Materials
              </h3>
              <ul className="space-y-1.5">
                {page.materialsAllowed.map(m => (
                  <li key={m} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span> {m}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Restricted / Prohibited
              </h3>
              <ul className="space-y-1.5">
                {page.materialsRestricted.map(m => (
                  <li key={m} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-1">✕</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Permit & Placement:</strong> {page.permitNote}
            </p>
          </div>
        </div>
      </section>

      {/* Bay Area Service Locations */}
      <section className="py-12 md:py-16">
        <div className="container-wide max-w-4xl">
          <h2 className="text-xl font-bold text-foreground mb-4">
            <MapPin className="inline w-5 h-5 mr-2 text-primary" />
            Bay Area Service Locations
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            We deliver from local yards in Oakland, San Jose, and San Francisco — serving the entire Bay Area.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { city: 'Oakland', to: '/dumpster-rental-oakland-ca' },
              { city: 'San Jose', to: '/dumpster-rental-san-jose-ca' },
              { city: 'San Francisco', to: '/dumpster-rental-san-francisco-ca' },
              { city: 'Berkeley', to: '/dumpster-rental-berkeley-ca' },
              { city: 'Fremont', to: '/dumpster-rental-fremont-ca' },
              { city: 'Hayward', to: '/dumpster-rental-hayward-ca' },
              { city: 'Concord', to: '/dumpster-rental-concord-ca' },
              { city: 'Walnut Creek', to: '/dumpster-rental-walnut-creek-ca' },
              { city: 'Palo Alto', to: '/dumpster-rental-palo-alto-ca' },
              { city: 'Sunnyvale', to: '/dumpster-rental-sunnyvale-ca' },
              { city: 'Santa Clara', to: '/dumpster-rental-santa-clara-ca' },
            ].map(({ city, to }) => (
              <Link
                key={city}
                to={to}
                className="px-3 py-1.5 text-xs font-medium bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-foreground border border-border"
              >
                {city}
              </Link>
            ))}
            <Link
              to="/areas"
              className="px-3 py-1.5 text-xs font-medium text-primary hover:underline"
            >
              All service areas →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <PageFAQ
        faqs={page.faqs}
        title={`${page.schemaServiceType} FAQs`}
        includeSchema
      />

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container-wide max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Get your exact price in 60 seconds. Transparent pricing, local delivery, no broker fees.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/quote">
                Get Your Exact Price <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="mr-2 w-4 h-4" /> {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-10 md:py-14 border-t border-border">
        <div className="container-wide max-w-4xl">
          <h2 className="text-lg font-bold text-foreground mb-6 text-center">Related Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICE_PAGES.filter(p => p.slug !== page.slug).slice(0, 6).map(p => (
              <Link
                key={p.slug}
                to={`/services/${p.slug}`}
                className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded-lg border border-border transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                {p.title.replace(' Bay Area', '')}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Link Cluster */}
      <InternalLinkCluster exclude={[`/services/${page.slug}`]} />
    </>
  );
}

export default ServicePageContent;
