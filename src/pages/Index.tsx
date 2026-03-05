import { Suspense, lazy } from 'react'; // homepage
import { BUILD_INFO } from '@/lib/buildInfo';
import { Layout } from '@/components/layout/Layout';
import { PAGE_SEO, generateFAQSchema, generateBreadcrumbSchema, BUSINESS_INFO } from '@/lib/seo';
import { getFAQsForSchema, DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, ArrowRight, Phone, CheckCircle, Scale, MessageSquare, Truck, Star, Clock, Wrench } from 'lucide-react';
import { GuidedAssistant } from '@/components/home/GuidedAssistant';

const FAQSection = lazy(() =>
  import('@/components/sections/FAQSection').then(mod => ({ default: mod.FAQSection }))
);
const ReviewsSection = lazy(() =>
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);

const SectionLoader = () => (
  <div className="min-h-[100px] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const TRUST_STRIP = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Scale, label: 'Transparent Pricing' },
  { icon: Wrench, label: 'Contractor-Ready' },
  { icon: MessageSquare, label: 'Professional Dispatch' },
];

const HERO_PHOTOS = [
  { src: '/images/dumpsters/20yd-photo-1.jpg', alt: 'Dumpster delivery on a Bay Area job site' },
  { src: '/images/dumpsters/30yd-photo-2.jpg', alt: 'Roll-off truck delivering dumpster' },
  { src: '/images/dumpsters/40yd-photo-1.jpg', alt: 'Construction project cleanup with dumpster' },
];

const DUMPSTER_CARDS = [
  { yards: 10, photo: '/images/dumpsters/10yd-photo-1.jpg', use: 'Small cleanouts & minor remodeling' },
  { yards: 20, photo: '/images/dumpsters/20yd-photo-2.jpg', use: 'Most common for remodels & roofing' },
  { yards: 30, photo: '/images/dumpsters/30yd-photo-1.jpg', use: 'Construction & larger renovations' },
  { yards: 40, photo: '/images/dumpsters/40yd-photo-1.jpg', use: 'Large construction & commercial' },
];

const WHY_CALSAN = [
  { icon: MapPin, title: 'Local Dumpster Experts', desc: 'Real yards in Oakland & San Jose, not a broker network.' },
  { icon: Clock, title: 'Fast Same-Day Delivery', desc: 'Order by noon, delivered the same day in most areas.' },
  { icon: Scale, title: 'Transparent Pricing', desc: 'ZIP-based pricing with no hidden fees or surprise charges.' },
  { icon: Truck, title: 'Professional Drivers', desc: 'Experienced operators who protect your property.' },
  { icon: Wrench, title: 'Contractor-Ready Service', desc: 'Volume accounts, flexible scheduling, reliable pickups.' },
];

const SERVICE_AREAS_LIST = [
  { name: 'Oakland', slug: 'oakland' },
  { name: 'San Jose', slug: 'san-jose' },
  { name: 'San Francisco', slug: 'san-francisco' },
  { name: 'Berkeley', slug: 'berkeley' },
  { name: 'Hayward', slug: 'hayward' },
  { name: 'Fremont', slug: 'fremont' },
  { name: 'Walnut Creek', slug: 'walnut-creek' },
  { name: 'Concord', slug: 'concord' },
];

const Index = () => {
  const homepageFAQs = getFAQsForSchema(4);

  return (
    <Layout
      title={PAGE_SEO.home.title}
      description={PAGE_SEO.home.description}
      canonical={PAGE_SEO.home.canonical}
      schema={[
        generateFAQSchema(homepageFAQs),
        generateBreadcrumbSchema([{ name: 'Home', url: '/' }]),
      ]}
      hideChat
    >
      <LocalSEOSchema includeFAQ includeService />

      {/* ========== SECTION 1 — HERO ========== */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-wide">
          <div className="text-center mb-8 space-y-4 max-w-[660px] mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
              Same-Day Dumpster Rental in the Bay Area
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-[560px] mx-auto">
              Fast delivery. Transparent pricing. Professional service.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-[500px] mx-auto">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold px-8 shadow-cta text-base">
              <Link to="/quote?v3=1">
                Get Exact Price
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-8 text-base">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                <Phone className="w-4 h-4 mr-2" />
                Speak With Our Team
              </a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 max-w-[640px] mx-auto">
            {TRUST_STRIP.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.8} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground/60">
            Serving the Bay Area since 2009.
          </p>
        </div>
      </section>

      {/* ========== SECTION 2 — SERVICE PHOTOS ========== */}
      <section className="bg-background pb-10 md:pb-16">
        <div className="container-wide">
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-5xl mx-auto">
            {HERO_PHOTOS.map((photo) => (
              <div key={photo.src} className="rounded-xl overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-[120px] md:h-[200px] object-cover"
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 3 — INSTANT QUOTE SYSTEM ========== */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Get Your Dumpster Quote in 60 Seconds
            </h2>
          </div>
          <GuidedAssistant />
          <p className="text-center text-sm text-muted-foreground mt-4">
            You'll see your total before you confirm. No surprises.
          </p>
        </div>
      </section>

      {/* ========== SECTION 4 — DUMPSTER SIZES ========== */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container-wide">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Dumpster Sizes
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 max-w-4xl mx-auto">
            {DUMPSTER_CARDS.map((size) => {
              const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === size.yards);
              return (
                <div
                  key={size.yards}
                  className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/30 transition-colors"
                >
                  <div className="overflow-hidden">
                    <img
                      src={size.photo}
                      alt={`${size.yards} yard dumpster`}
                      className="w-full h-[100px] md:h-[140px] object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-lg font-bold text-foreground mb-1">
                      {size.yards} Yard
                    </div>
                    <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      {size.use}
                    </div>
                    {sizeData && (
                      <div className="text-sm font-semibold text-primary mb-3">
                        From ${sizeData.priceFrom}
                      </div>
                    )}
                    <Button asChild size="sm" variant="outline" className="w-full rounded-full text-xs font-semibold">
                      <Link to={`/quote?size=${size.yards}`}>
                        Get Price
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== SECTION 5 — WHY CALSAN ========== */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Why Customers Choose Calsan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {WHY_CALSAN.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start p-5 bg-card rounded-2xl border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 6 — REVIEWS ========== */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* ========== SECTION 7 — SERVICE AREAS ========== */}
      <section className="py-14 md:py-20 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Serving the Bay Area
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Oakland, San Jose, San Francisco and surrounding cities.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {SERVICE_AREAS_LIST.map((area) => (
                <Link
                  key={area.slug}
                  to={`/dumpster-rental/${area.slug}`}
                  className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {area.name}
                </Link>
              ))}
            </div>

            <Button asChild size="lg" variant="outline" className="rounded-full font-semibold px-8">
              <Link to="/areas">
                View All Service Areas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SECTION 8 — FINAL CTA ========== */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Get Exact Dumpster Pricing
          </h2>
          <p className="text-primary-foreground/70 mb-6 text-base">
            See your price before confirming. No surprises, no hidden fees.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold px-8 shadow-cta text-base">
              <Link to="/quote?v3=1">
                Start Instant Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base">
              <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                Call {BUSINESS_INFO.phone.salesFormatted}
              </a>
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/60">
            Calsan Dumpsters Pro — Dumpster Rental. Done Right.
          </p>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection limit={4} />
      </Suspense>

      {/* Build fingerprint */}
      {import.meta.env.DEV ? (
        <div className="fixed bottom-2 right-2 z-[9999] bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none">
          <div>HOME_SOURCE: src/pages/Index.tsx</div>
          <div>BUILD: {BUILD_INFO.timestamp}</div>
          <div>ENV: {BUILD_INFO.env}</div>
        </div>
      ) : (
        <div
          data-build-source="src/pages/Index.tsx"
          data-build-time={BUILD_INFO.timestamp}
          data-build-env={BUILD_INFO.env}
          className="hidden"
          aria-hidden="true"
        />
      )}
    </Layout>
  );
};

export default Index;
