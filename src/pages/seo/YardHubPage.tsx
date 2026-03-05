import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { getYardHub, YARD_HUBS } from '@/lib/yard-hub-data';
import GoogleMapEmbed from '@/components/seo/GoogleMapEmbed';
import { ArrowRight, MapPin, Truck, Clock, Shield, CheckCircle, Star, Package, AlertTriangle, HardHat, Building } from 'lucide-react';

export default function YardHubPage() {
  const { yardSlug } = useParams<{ yardSlug: string }>();
  const yard = getYardHub(yardSlug || '');

  if (!yard) return <Navigate to="/areas" replace />;

  const title = `${yard.city} Dumpster Rental Yard | ${BUSINESS_INFO.name}`;
  const description = `Rent dumpsters from our ${yard.city} yard. ${yard.deliverySpeed} Sizes 6–40 yards. Serving ${yard.coverageCities.map(c => c.name).join(', ')}.`;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/areas' },
    { name: `${yard.city} Yard`, url: `/yards/${yard.slug}` },
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${BUSINESS_INFO.name} — ${yard.city} Yard`,
    "description": yard.coverageDescription,
    "telephone": BUSINESS_INFO.phone.sales,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": yard.address.split(',')[0],
      "addressLocality": yard.city,
      "addressRegion": "CA",
      "addressCountry": "US",
    },
    "geo": { "@type": "GeoCoordinates", "latitude": yard.lat, "longitude": yard.lng },
    "areaServed": yard.coverageCities.map(c => ({ "@type": "City", "name": `${c.name}, CA` })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Dumpster Rental Services",
      "itemListElement": DUMPSTER_SIZES_DATA.map(s => ({
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": `${s.yards} Yard Dumpster Rental` },
        "price": s.priceFrom.toString(),
        "priceCurrency": "USD",
      })),
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "300", "bestRating": "5" },
    "availableChannel": { "@type": "ServiceChannel", "serviceUrl": `${BUSINESS_INFO.url}/quote`, "name": "Online Quote Calculator" },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": ["Service", "WasteManagementService"],
    "serviceType": "Dumpster Rental",
    "name": `Dumpster Rental from ${yard.city} Yard`,
    "provider": { "@type": "LocalBusiness", "@id": `${BUSINESS_INFO.url}/#organization` },
    "areaServed": yard.coverageCities.map(c => ({ "@type": "City", "name": `${c.name}, CA` })),
  };

  const otherYards = YARD_HUBS.filter(y => y.slug !== yard.slug);

  return (
    <Layout title={title} description={description} canonical={`/yards/${yard.slug}`}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(generateFAQSchema(yard.faqs))}</script>
        <script type="application/ld+json">{JSON.stringify(generateBreadcrumbSchema(breadcrumbs))}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-20">
        <div className="container-wide max-w-5xl">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/areas" className="hover:text-primary">Service Areas</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{yard.city} Yard</span>
          </nav>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            Dumpster Rental from Our {yard.city} Yard
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            {yard.coverageDescription}
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-foreground">4.9 ★</span>
              <span className="text-muted-foreground">from 300+ reviews</span>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">1–3 hour delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{yard.region}</span>
            </div>
          </div>

          <Link to="/quote">
            <Button variant="cta" size="lg">
              Get Exact Price <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Coverage Map + Distance Table */}
      <section className="py-12 bg-background">
        <div className="container-wide max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            <MapPin className="w-5 h-5 inline mr-2 text-primary" />
            Service Coverage from {yard.city}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <GoogleMapEmbed yardId={yard.yardId} city={yard.city} height="350" />
            
            <div className="space-y-3">
              {yard.coverageCities.map(city => (
                <Link
                  key={city.slug}
                  to={`/dumpster-rental/${city.slug}`}
                  className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-primary" />
                    <div>
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">{city.name}</span>
                      <p className="text-xs text-muted-foreground">~{city.distanceMiles} miles • {city.deliveryEstimate}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
              <p className="text-xs text-muted-foreground mt-2">
                Serving {yard.city} from our {yard.name} — approximately {yard.coverageCities[0]?.distanceMiles || 0} miles away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dumpster Sizes Available */}
      <section className="py-12 bg-muted/30">
        <div className="container-wide max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            <Package className="w-5 h-5 inline mr-2 text-primary" />
            Dumpster Sizes Available in {yard.city}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DUMPSTER_SIZES_DATA.map(size => (
              <Link
                key={size.yards}
                to={`/dumpster-rental/${yard.coverageCities[0]?.slug || yard.slug}/${size.yards}-yard`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-foreground">{size.yards} Yard</h3>
                  <span className="text-sm font-semibold text-primary">From ${size.priceFrom}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{size.dimensions}</p>
                <p className="text-sm text-muted-foreground">{size.description}</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  Includes {size.includedTons} ton{size.includedTons > 1 ? 's' : ''} • 7-day rental
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Final pricing depends on material type, weight, and delivery location.{' '}
            <Link to="/quote" className="underline hover:text-primary">Get your exact price →</Link>
          </p>
        </div>
      </section>

      {/* Why Local Yard Proximity Matters */}
      <section className="py-12 bg-background">
        <div className="container-wide max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            <Shield className="w-5 h-5 inline mr-2 text-primary" />
            Why a Local Yard in {yard.city} Matters
          </h2>

          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>
              When you rent from a company with a physical yard near your job site, you get faster delivery, 
              lower transport costs, and higher availability. National brokers often dispatch from yards 50+ miles 
              away, adding transit time and fees that get passed to you.
            </p>
            <p>
              Our {yard.name} at {yard.address} stores a full fleet of roll-off dumpsters ranging from 6 to 40 cubic 
              yards. Because we own and operate our equipment locally, we control the entire process — from dispatch 
              to delivery to pickup and disposal. There are no middlemen, no surprise fees, and no guessing when 
              your dumpster will arrive.
            </p>
            <p>
              {yard.deliverySpeed} For time-sensitive construction or renovation projects, this local advantage can 
              save you an entire day of waiting. Our drivers know {yard.city} streets, neighborhoods, and access 
              challenges — whether it's tight residential driveways, commercial loading docks, or construction sites 
              with restricted access.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Clock, title: 'Faster Delivery', desc: '1–3 hour delivery from a local yard vs. next-day from distant depots.' },
              { icon: Shield, title: 'No Broker Markups', desc: 'Direct pricing from the yard operator — no middleman fees.' },
              { icon: Truck, title: 'Higher Availability', desc: 'Local inventory means more sizes in stock, more often.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Stored */}
      <section className="py-12 bg-muted/30">
        <div className="container-wide max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            <Building className="w-5 h-5 inline mr-2 text-primary" />
            Equipment at Our {yard.city} Yard
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {yard.equipmentStored.map(item => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Authority Content (Phase 3) */}
      <section className="py-12 bg-background">
        <div className="container-wide max-w-5xl space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <HardHat className="w-5 h-5 inline mr-2 text-primary" />
              Dumpster Permits in {yard.city}
            </h2>
            <p className="text-muted-foreground">{yard.localPermitInfo}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Driveway Protection Tips
            </h2>
            <p className="text-muted-foreground">{yard.drivewayTips}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <AlertTriangle className="w-5 h-5 inline mr-2 text-destructive" />
              Materials Not Allowed in Dumpsters
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {yard.prohibitedMaterials.map(m => (
                <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive font-bold">✕</span> {m}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Construction Debris Disposal Rules
            </h2>
            <p className="text-muted-foreground">{yard.constructionRules}</p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-muted/30">
        <div className="container-wide max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions — {yard.city} Yard
          </h2>
          <div className="space-y-3">
            {yard.faqs.map((faq, i) => (
              <details key={i} className="bg-card border border-border rounded-xl p-4 group">
                <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="mt-3 text-muted-foreground text-sm">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Link Network (Phase 6) */}
      <section className="py-12 bg-background">
        <div className="container-wide max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Explore More
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Link to city pages */}
            {yard.coverageCities.map(city => (
              <Link
                key={city.slug}
                to={`/dumpster-rental/${city.slug}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Dumpster Rental in {city.name}
              </Link>
            ))}

            {/* Size pages for primary city */}
            {DUMPSTER_SIZES_DATA.slice(0, 4).map(s => (
              <Link
                key={s.yards}
                to={`/dumpster-rental/${yard.coverageCities[0]?.slug || yard.slug}/${s.yards}-yard`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {s.yards} Yard Dumpster in {yard.city}
              </Link>
            ))}

            {/* Other yard hubs */}
            {otherYards.map(y => (
              <Link
                key={y.slug}
                to={`/yards/${y.slug}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                {y.city} Yard Hub
              </Link>
            ))}

            {/* Quote calculator */}
            <Link to="/quote" className="flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowRight className="w-3.5 h-3.5" />
              Get Instant Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container-wide max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to Rent a Dumpster from Our {yard.city} Yard?
          </h2>
          <p className="text-muted-foreground mb-6">
            Enter your ZIP code for instant, all-inclusive pricing. {yard.deliverySpeed}
          </p>
          <Link to="/quote">
            <Button variant="cta" size="lg">
              Get Exact Price <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
