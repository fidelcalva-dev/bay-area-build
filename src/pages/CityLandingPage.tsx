import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { getCityBySlug, generateCitySchema, SERVICE_CITIES } from '@/lib/cityData';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES, MASTER_FAQS } from '@/lib/shared-data';
import { BUSINESS_INFO, OPERATIONAL_YARDS, generateFAQSchema } from '@/lib/seo';
import { ArrowRight, MapPin, Phone, Truck, CheckCircle, AlertTriangle, Building, Clock, Shield } from 'lucide-react';
import NotFound from './NotFound';

export default function CityLandingPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const city = citySlug ? getCityBySlug(citySlug) : undefined;

  if (!city) return <NotFound />;

  const yard = OPERATIONAL_YARDS.find(y => y.id === city.nearestYardId);
  const citySchema = generateCitySchema(city);
  const nearbyCities = city.nearbyLinks
    .map(slug => SERVICE_CITIES.find(c => c.slug === slug))
    .filter(Boolean);

  // Local FAQs
  const localFaqs = [
    { question: `How much does a dumpster rental cost in ${city.name}?`, answer: `Dumpster rental in ${city.name} starts at $${DUMPSTER_SIZES_DATA[0].priceFrom} for a ${DUMPSTER_SIZES_DATA[0].yards}-yard dumpster. Pricing depends on size, material type, and rental duration. Heavy materials (concrete, dirt) are flat-fee with no weight overage. General debris overages are billed at $${PRICING_POLICIES.overagePerTonGeneral}/ton.` },
    { question: `How fast can I get a dumpster in ${city.name}?`, answer: `Same-day delivery is available for most ${city.name} addresses when ordered before noon. Our ${yard?.name || 'nearest yard'} is close by, ensuring fast turnaround. Next-day delivery is standard for all orders.` },
    { question: `Do I need a permit for a dumpster in ${city.name}?`, answer: city.permitInfo },
    { question: `What sizes are available in ${city.name}?`, answer: `We offer 6, 8, 10, 20, 30, 40, and 50 yard dumpsters in ${city.name}. Heavy material dumpsters (concrete, dirt) are available in 6-10 yard sizes. General debris dumpsters are available in all sizes.` },
  ];

  const faqSchema = generateFAQSchema(localFaqs);

  return (
    <Layout title={city.metaTitle} description={city.metaDescription}>
      <Helmet>
        <link rel="canonical" href={`${BUSINESS_INFO.url}/dumpster-rental/${city.slug}`} />
        <script type="application/ld+json">{JSON.stringify(citySchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-foreground/70 text-sm mb-3">
              <Link to="/" className="hover:text-primary-foreground">Home</Link>
              <span>/</span>
              <Link to="/areas" className="hover:text-primary-foreground">Service Areas</Link>
              <span>/</span>
              <span className="text-primary-foreground">{city.name}</span>
            </div>
            <h1 className="heading-xl mb-4">Dumpster Rental in {city.name}, CA</h1>
            <p className="text-xl text-primary-foreground/85 mb-6">{city.localIntro}</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="cta" size="lg">
                <Link to="/quote">
                  Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  {BUSINESS_INFO.phone.salesFormatted}
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
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Local Yard in {yard?.city || 'Bay Area'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Same-Day Delivery Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>6-50 Yard Sizes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Available Sizes */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <h2 className="heading-lg text-foreground mb-3 text-center">Dumpster Sizes Available in {city.name}</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            From small cleanouts to major construction projects—find the right size for your {city.name} project.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {DUMPSTER_SIZES_DATA.map(size => (
              <Link
                key={size.yards}
                to={`/${size.yards}-yard-dumpster`}
                className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{size.yards}</div>
                <div className="text-xs text-muted-foreground mb-2">YARD</div>
                <div className="text-sm font-semibold text-primary">From ${size.priceFrom}</div>
                <div className="text-xs text-muted-foreground mt-1">{size.loads}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Local Disposal Rules */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <h2 className="heading-md text-foreground">Local Disposal Rules</h2>
              </div>
              <p className="text-muted-foreground mb-4">{city.dumpRules}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span className="text-sm text-muted-foreground">Heavy materials (concrete, dirt): <strong className="text-foreground">Flat fee—no weight overage</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span className="text-sm text-muted-foreground">General debris: ${PRICING_POLICIES.overagePerTonGeneral}/ton overage based on scale ticket</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <span className="text-sm text-muted-foreground">Standard {PRICING_POLICIES.standardRentalDays}-day rental, ${PRICING_POLICIES.extraDayCost}/day extra</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-accent-foreground" />
                </div>
                <h2 className="heading-md text-foreground">Permit Information</h2>
              </div>
              <p className="text-muted-foreground mb-4">{city.permitInfo}</p>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-2">Need help with permits?</p>
                <p className="text-sm text-muted-foreground">Our team can guide you through the permit process for {city.name}. Call us for assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Note */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
            <h2 className="heading-md text-foreground mb-3">{city.name} Pricing</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{city.pricingNote}</p>
            <Button asChild variant="cta" size="lg">
              <Link to="/quote">
                Get Your {city.name} Price <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Local FAQs */}
      <section className="section-padding bg-muted/30">
        <div className="container-narrow">
          <h2 className="heading-lg text-foreground mb-8 text-center">Frequently Asked Questions — {city.name}</h2>
          <div className="space-y-4">
            {localFaqs.map((faq, i) => (
              <details key={i} className="bg-card border border-border rounded-xl overflow-hidden group">
                <summary className="p-5 cursor-pointer font-semibold text-foreground hover:bg-muted/30 transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-muted-foreground">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Cities */}
      {nearbyCities.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-wide">
            <h2 className="heading-md text-foreground mb-6 text-center">Also Serving Nearby</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {nearbyCities.map(c => c && (
                <Link
                  key={c.slug}
                  to={`/dumpster-rental/${c.slug}`}
                  className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {c.name}, CA
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-narrow text-center">
          <h2 className="heading-lg mb-4">Ready to Rent a Dumpster in {city.name}?</h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Get an instant quote or call us now. Same-day delivery available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="cta" size="xl">
              <Link to="/quote">
                Get Instant Quote <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />
                {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-8 bg-muted/30 border-t border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/sizes" className="text-primary hover:underline">All Dumpster Sizes</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/materials" className="text-primary hover:underline">Accepted Materials</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/pricing" className="text-primary hover:underline">Full Pricing</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/contractors" className="text-primary hover:underline">Contractor Programs</Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/areas" className="text-primary hover:underline">All Service Areas</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
