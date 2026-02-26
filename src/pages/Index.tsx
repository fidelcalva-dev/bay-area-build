import { Suspense, lazy } from 'react';
import { BUILD_INFO } from '@/lib/buildInfo';
import { Layout } from '@/components/layout/Layout';
import { PAGE_SEO, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { BUSINESS_INFO } from '@/lib/seo';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, ArrowRight, Phone, CheckCircle, CalendarDays, Truck, Package, Scale, MessageSquare } from 'lucide-react';


// Lazy load below-fold sections
const FAQSection = lazy(() =>
  import('@/components/sections/FAQSection').then(mod => ({ default: mod.FAQSection }))
);

const SectionLoader = () => (
  <div className="min-h-[100px] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const WHY_EXPERTISE = [
  'Accurate scheduling',
  'Transparent pricing',
  'Clean, well-maintained equipment',
  'Professional dispatch coordination',
  'Clear material guidelines',
  'Reliable pickup',
];

const DUMPSTER_SIZES = [
  { name: '10 Yard Dumpster', description: 'Best for small remodels and cleanouts.' },
  { name: '20 Yard Dumpster', description: 'Most common residential size.' },
  { name: '30 Yard Dumpster', description: 'Ideal for larger renovation projects.' },
  { name: '40 Yard Dumpster', description: 'For major construction and commercial use.' },
  { name: 'Concrete & Heavy Material Containers', description: 'Specialized options for heavy debris.' },
];

const TRUST_GRID = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: MapPin, label: 'Local Bay Area Operations' },
  { icon: Scale, label: 'Clear Weight Policies' },
  { icon: CheckCircle, label: 'No Hidden Charges' },
  { icon: CalendarDays, label: 'Reliable Scheduling' },
  { icon: MessageSquare, label: 'Professional Communication' },
];

const SERVICE_AREAS_LIST = [
  'Oakland', 'San Jose', 'San Francisco', 'Berkeley',
  'Hayward', 'Fremont', 'Vallejo', 'Livermore',
  'Concord', 'Richmond',
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

      {/* ========== 1) HERO SECTION ========== */}
      <section className="bg-background min-h-[calc(100vh-80px)] flex flex-col justify-center py-14 md:py-24">
        <div className="container-wide">
          <div className="text-center mb-8 md:mb-10 space-y-4 max-w-[660px] mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
              Dumpster Rental in the{' '}
              <span className="relative inline-block">
                Bay Area
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-full" />
              </span>
            </h1>
            <p className="text-sm font-medium text-primary tracking-wide">
              Serving Oakland &bull; San Jose &bull; San Francisco
            </p>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[560px] mx-auto">
              Professional roll-off dumpster rental in Oakland, San Jose, San Francisco and surrounding cities.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[520px] mx-auto">
              Exact pricing by ZIP. Clear rental terms. Reliable delivery.
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
              <Link to="/quote/schedule">
                Schedule Delivery
                <CalendarDays className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground/70">
            You will see your total before you confirm.
          </p>
        </div>
      </section>

      {/* ========== 2) EXPERTISE BLOCK ========== */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
                  We Specialize in Dumpster Rental
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                  <p>
                    Since 2009, we have operated in hauling and debris removal.
                    Since 2015, we have focused exclusively on dumpster rental.
                  </p>
                  <p>That focus allows us to deliver:</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 md:pt-12">
                {WHY_EXPERTISE.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.8} />
                    <span>{item}</span>
                  </div>
                ))}
                <p className="text-sm font-bold text-foreground pt-4 border-t border-border mt-4">
                  Dumpster Rental. Done Right.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 3) SERVICES GRID ========== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Dumpster Sizes Available
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {DUMPSTER_SIZES.map((size) => (
              <div
                key={size.name}
                className="p-6 bg-card rounded-2xl border border-border text-center"
              >
                <div className="text-lg font-bold text-foreground mb-2">{size.name}</div>
                <div className="text-sm text-muted-foreground">{size.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 4) TRUST BLOCK ========== */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Why Choose Calsan
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              {TRUST_GRID.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-3 p-5 bg-card border border-border rounded-xl text-center">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              We focus on service, clarity, and execution.
            </p>
          </div>
        </div>
      </section>

      {/* ========== 5) SERVICE AREA BLOCK ========== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Dumpster Rental Near You
            </h2>
            <p className="text-muted-foreground mb-8">
              We serve the following Bay Area cities and surrounding areas.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {SERVICE_AREAS_LIST.map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground"
                >
                  {area}
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Enter your ZIP code to see exact pricing instantly.
            </p>

            <Button asChild size="lg" variant="outline" className="rounded-full font-semibold px-8">
              <Link to="/areas">
                Check Availability
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== 6) FAQ SECTION ========== */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection limit={4} />
      </Suspense>

      {/* ========== 7) FINAL CTA ========== */}
      <section className="py-20 md:py-28 gradient-hero">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Schedule Your Dumpster?
          </h2>
          <p className="text-primary-foreground/70 mb-6 text-base">
            Clear pricing. Professional delivery. Reliable pickup.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-semibold px-8 shadow-cta text-base">
              <Link to="/quote?v3=1">
                Get Exact Price
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
            Serving the Bay Area since 2009. Focused on dumpster rental since 2015.
          </p>
        </div>
      </section>

      {/* Dev-only build fingerprint — proves which file is mounted */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-2 right-2 z-[9999] bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded pointer-events-none">
          <div>HOME_SOURCE: src/pages/Index.tsx</div>
          <div>BUILD: {BUILD_INFO.timestamp}</div>
          <div>ENV: {BUILD_INFO.env}</div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
