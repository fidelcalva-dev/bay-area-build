import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { BUSINESS_INFO } from '@/lib/seo';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, ArrowRight, Phone, CheckCircle, CalendarDays, Truck, Package } from 'lucide-react';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { CalsanAIChat } from '@/components/chat/CalsanAIChat';


const truckDelivery = '/images/real-work/truck-delivery.jpg';
const brandedFleet = '/images/real-work/branded-fleet.jpg';
const jobSite = '/images/real-work/job-site.jpg';
const liveDelivery = '/images/real-work/live-delivery.jpg';

// Lazy load below-fold sections
const ReviewsSection = lazy(() =>
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);
const FAQSection = lazy(() =>
  import('@/components/sections/FAQSection').then(mod => ({ default: mod.FAQSection }))
);

const SectionLoader = () => (
  <div className="min-h-[100px] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const TRUST_ITEMS = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: MapPin, label: 'Local Bay Area Operations' },
  { icon: CheckCircle, label: 'No Hidden Fees' },
  { icon: CalendarDays, label: 'Structured Scheduling' },
];

const WHY_EXPERTISE = [
  'Accurate scheduling',
  'Transparent pricing',
  'Clean, well-maintained equipment',
  'Clear weight policies',
  'Professional communication',
  'Reliable pickup and swap coordination',
];


const WHATS_INCLUDED = [
  { icon: Truck, label: 'Delivery & Pickup' },
  { icon: CalendarDays, label: '7-Day Rental' },
  { icon: Package, label: 'Included Disposal Weight' },
  { icon: Phone, label: 'Local Support Team' },
  { icon: Shield, label: 'Licensed & Insured' },
];

const SERVICE_AREAS_LIST = [
  'Oakland', 'San Jose', 'San Francisco', 'Berkeley',
  'Fremont', 'Concord', 'Vallejo', 'Livermore',
];

const HOMEPAGE_SIZES = [10, 20, 30, 40];

const Index = () => {
  const homepageFAQs = getFAQsForSchema(4);
  const sizesData = DUMPSTER_SIZES_DATA.filter(s => HOMEPAGE_SIZES.includes(s.yards));

  return (
    <Layout
      title={PAGE_SEO.home.title}
      description={PAGE_SEO.home.description}
      canonical={PAGE_SEO.home.canonical}
      schema={generateFAQSchema(homepageFAQs)}
      hideChat
    >
      <LocalSEOSchema includeFAQ includeService />

      {/* ========== 1) CLARITY — Hero ========== */}
      <section className="bg-[#F7F9F8] min-h-[calc(100vh-80px)] flex flex-col justify-center py-14 md:py-24">
        <div className="container-wide">
          <div className="text-center mb-8 md:mb-10 space-y-4 max-w-[660px] mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight">
              Dumpster Rental in the Bay Area
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[520px] mx-auto">
              Roll-off dumpster rental for homeowners, contractors and commercial projects.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[520px] mx-auto">
              Exact pricing by ZIP code. Clear rental terms. Reliable delivery and pickup.
            </p>
          </div>

          <div className="max-w-[850px] mx-auto mb-5">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <CalsanAIChat />

          <div className="mt-8 max-w-[700px] mx-auto text-center">
            <p className="text-xs text-muted-foreground/70">
              You will see your total before you confirm.
            </p>
          </div>
        </div>
      </section>

      {/* ========== 2) CONTROL — Price Visibility ========== */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              See Your Exact Price in Seconds
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Enter your ZIP code and project type to receive your exact dumpster rental price.
              No hidden fees. No vague estimates.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {sizesData.map((sizeData) => (
              <Link
                key={sizeData.yards}
                to={`/quote?size=${sizeData.yards}`}
                className="block p-6 bg-background rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 text-center group"
              >
                <div className="text-4xl font-bold text-primary mb-1">{sizeData.yards}</div>
                <div className="text-sm font-medium text-foreground mb-2">Yard Dumpster</div>
                <div className="text-xs text-muted-foreground mb-4">{sizeData.useCases[0]}</div>
                <div className="text-sm font-semibold text-primary mb-3">From ${sizeData.priceFrom}</div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                  Get Price <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 3) AUTHORITY — Specialist Positioning ========== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5">
                  Dumpster Rental Specialists Since 2015
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                  <p>
                    Calsan has worked in hauling and debris removal since 2009.
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
                <p className="text-sm text-muted-foreground pt-4 border-t border-border mt-4">
                  Dumpster Rental. Done Right.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 4) REDUCE RISK — What's Included ========== */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                What's Included
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
              {WHATS_INCLUDED.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-3 p-5 bg-background border border-border rounded-xl text-center">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Clear overage policies. No surprise charges.
            </p>
          </div>
        </div>
      </section>

      {/* ========== 5) LOCAL TRUST — Service Areas ========== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Serving the Bay Area
            </h2>
            <p className="text-muted-foreground mb-8">
              We operate locally and schedule based on your project location.
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

            <Button asChild size="lg" variant="outline" className="rounded-full font-semibold px-8">
              <Link to="/areas">
                Check Availability
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== 6) VISUAL PROOF — Real Work ========== */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Real Equipment. Real Jobs.
            </h2>
            <p className="text-muted-foreground">
              We deliver clean, professional dumpsters to residential and commercial projects across the Bay Area.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: brandedFleet, alt: 'Calsan branded dumpster fleet at local yard' },
              { src: jobSite, alt: 'Clean dumpster placement on residential job site' },
              { src: liveDelivery, alt: 'Professional dumpster delivery in progress' },
              { src: truckDelivery, alt: 'Calsan truck completing a dumpster pickup' },
            ].map((img) => (
              <div key={img.alt} className="rounded-xl overflow-hidden">
                <img src={img.src} alt={img.alt} className="w-full h-48 md:h-56 object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 7) REVIEWS ========== */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* ========== 8) FAQ — Objection Removal ========== */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>

      {/* ========== 9) FINAL CTA ========== */}
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
    </Layout>
  );
};

export default Index;
