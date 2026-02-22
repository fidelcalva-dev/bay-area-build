import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema, BUSINESS_INFO as SHARED_BUSINESS_INFO } from '@/lib/shared-data';
import { BUSINESS_INFO } from '@/lib/seo';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, MapPin, DollarSign, HardHat, ArrowRight, Phone, CheckCircle, Clock, Truck, ClipboardCheck } from 'lucide-react';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { motion } from 'framer-motion';

import truckDelivery from '@/assets/real-work/truck-delivery.jpg';
import brandedFleet from '@/assets/real-work/branded-fleet.jpg';
import jobSite from '@/assets/real-work/job-site.jpg';
import liveDelivery from '@/assets/real-work/live-delivery.jpg';

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
  { icon: MapPin, label: 'Real Local Yards' },
  { icon: DollarSign, label: 'Transparent Pricing' },
  { icon: HardHat, label: 'Contractor-Friendly' },
];

const WHY_CARDS = [
  {
    icon: Clock,
    title: 'Structured Logistics',
    description: 'We schedule, confirm, and deliver on time.',
  },
  {
    icon: MapPin,
    title: 'Local Yard Coverage',
    description: 'We operate from multiple yard locations across the region to stay close to your project.',
  },
  {
    icon: DollarSign,
    title: 'Clear Pricing',
    description: 'No hidden fees. No surprises. You know what you are paying for.',
  },
  {
    icon: HardHat,
    title: 'Contractor-Ready',
    description: 'Reliable service for remodels, demolition, concrete, excavation, and cleanouts.',
  },
];

const HOW_IT_WORKS_STEPS = [
  { step: '01', title: 'Get Your Price', description: 'Enter your ZIP and project details for an exact price.' },
  { step: '02', title: 'Schedule Delivery', description: 'Choose your delivery date and time window.' },
  { step: '03', title: 'Fill It', description: 'Load your dumpster at your own pace during the rental period.' },
  { step: '04', title: 'We Pick It Up', description: 'We haul it away and handle responsible disposal.' },
];

const SERVICE_AREAS_LIST = [
  'Oakland', 'San Jose', 'San Francisco', 'San Rafael',
  'Vallejo', 'Livermore', 'Tracy', 'Fremont',
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

      {/* ========== 1) HERO SECTION ========== */}
      <section className="bg-card min-h-[calc(100vh-80px)] flex items-center py-16 md:py-24 lg:py-32">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.08] tracking-tight">
                Professional Dumpster Rental.
                <br />
                <span className="text-primary">Done Right.</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-[520px]">
                Local dumpsters. Clear pricing. Reliable delivery.
                <br />
                Serving homeowners and contractors across the Bay Area.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-sm font-semibold px-8 hover:scale-[1.02] transition-all text-base">
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

              {/* Trust Strip */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4">
                {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.8} />
                    <span className="text-sm text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative hidden lg:block"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={truckDelivery}
                  alt="Calsan Dumpsters Pro branded truck delivering a clean dumpster to a job site"
                  className="w-full h-[480px] object-cover"
                  loading="eager"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                <p className="text-xs text-muted-foreground">Serving the Bay Area</p>
                <p className="text-sm font-bold text-foreground">Since 2009</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== 2) WHY CALSAN ========== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Dumpster Rental Is All We Do.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Since 2009, we have worked in hauling, construction debris, and job site services.
              Since 2015, we have specialized exclusively in dumpster rental and material delivery.
              We understand job sites. We understand timelines.
              And we understand what happens when dumpsters are late.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 3) DUMPSTER SIZES ========== */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Right Size. Right Job.
            </h2>
            <p className="text-muted-foreground">
              Need help choosing? We will guide you.
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

      {/* ========== 4) HOW IT WORKS ========== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Simple. Professional. Predictable.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="text-3xl font-bold text-primary/20 mb-2">{step.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-primary" />
                We confirm before delivery.
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-primary" />
                We protect driveways.
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-primary" />
                We handle disposal responsibly.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5) TRUST & PROOF (Reviews) ========== */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* ========== 5b) Real Work Gallery ========== */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Trusted By Homeowners and Contractors
            </h2>
            <p className="text-muted-foreground">Professional service. Every time.</p>
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

      {/* ========== 6) SERVICE AREAS ========== */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Serving the Bay Area
            </h2>
            <p className="text-muted-foreground mb-8">
              We operate from multiple local yard locations to stay close to your project.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {SERVICE_AREAS_LIST.map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 bg-background border border-border rounded-full text-sm font-medium text-foreground"
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

      {/* ========== 7) STRONG CTA ========== */}
      <section className="py-20 md:py-28 gradient-hero">
        <div className="container-narrow text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Schedule Your Dumpster?
          </h2>

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
            Same-day delivery available based on availability.
          </p>
        </div>
      </section>

      {/* ========== 8) FAQ ========== */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>
    </Layout>
  );
};

export default Index;
