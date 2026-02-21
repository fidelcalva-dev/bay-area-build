import { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CalsanAIChat } from '@/components/chat/CalsanAIChat';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { Shield, Clock, MapPin, DollarSign, Building2, HardHat, Home, ArrowRight, MessageSquare, Phone, Upload, CalendarDays, Briefcase } from 'lucide-react';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { fetchFeatureFlags, getFeatureFlag } from '@/lib/featureFlags';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/shared-data';
import { cn } from '@/lib/utils';
import truckDelivery from '@/assets/images/calsan-dumpster-delivery.jpg';

// Lazy load below-fold sections
const ReviewsSection = lazy(() =>
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);
const FAQSection = lazy(() =>
  import('@/components/sections/FAQSection').then(mod => ({ default: mod.FAQSection }))
);
const AIMainChat = lazy(() =>
  import('@/components/home/AIMainChat').then(mod => ({ default: mod.AIMainChat }))
);

const SectionLoader = () => (
  <div className="min-h-[100px] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Trust Layer Items ──
const TRUST_ITEMS = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: Clock, label: 'Serving Since 2009' },
  { icon: MapPin, label: 'Local Yard Network' },
  { icon: DollarSign, label: 'Transparent Pricing' },
];

// ── Core Offer Cards ──
const CORE_OFFERS = [
  {
    icon: Home,
    title: 'Residential Projects',
    description: 'Cleanouts, remodels, landscaping. Clear pricing by size and material type.',
    cta: '/quote?type=residential',
  },
  {
    icon: HardHat,
    title: 'Construction & Demo',
    description: 'Concrete, dirt, roofing, mixed C&D. Heavy material rules included upfront.',
    cta: '/quote?type=construction',
  },
  {
    icon: Building2,
    title: 'Commercial Sites',
    description: 'Ongoing service, scheduled pickups, volume accounts. Dedicated dispatch support.',
    cta: '/quote?type=commercial',
  },
];

// ── How It Works Steps ──
const STEPS = [
  { step: '01', title: 'Enter Your Address', description: 'We check your ZIP against our yard network for availability and pricing.' },
  { step: '02', title: 'Select Size', description: 'Choose from 10, 20, 30, or 40 yard containers based on your project scope.' },
  { step: '03', title: 'Confirm & Schedule', description: 'Review your total, select a delivery date, and confirm your order.' },
  { step: '04', title: 'Delivery & Pickup', description: 'Our dispatch team handles delivery, you fill it, we pick up on schedule.' },
];

// ── Chat Panel Quick Actions ──
const CHAT_ACTIONS = [
  { icon: DollarSign, label: 'Get Exact Price' },
  { icon: Upload, label: 'Upload a Photo' },
  { icon: CalendarDays, label: 'Schedule Delivery' },
  { icon: Phone, label: 'Talk to a Specialist' },
  { icon: Briefcase, label: 'Contractor Account' },
];

const Index = () => {
  const homepageFAQs = getFAQsForSchema(4);
  const [aiHomeEnabled, setAiHomeEnabled] = useState(false);
  const [flagsLoaded, setFlagsLoaded] = useState(false);

  useEffect(() => {
    fetchFeatureFlags().then(() => {
      setAiHomeEnabled(getFeatureFlag('ai_home.enabled'));
      setFlagsLoaded(true);
    });
  }, []);

  const ChatComponent = flagsLoaded && aiHomeEnabled ? (
    <Suspense fallback={<SectionLoader />}>
      <AIMainChat />
    </Suspense>
  ) : (
    <CalsanAIChat />
  );

  return (
    <Layout
      title={PAGE_SEO.home.title}
      description={PAGE_SEO.home.description}
      canonical={PAGE_SEO.home.canonical}
      schema={generateFAQSchema(homepageFAQs)}
      hideChat
    >
      <LocalSEOSchema includeFAQ includeService />

      {/* ══════════ HERO ══════════ */}
      <section className="bg-background py-16 md:py-24 lg:py-28">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
                Professional Dumpster Rental
                <br />
                <span className="text-muted-foreground font-semibold text-2xl sm:text-3xl lg:text-[2rem]">
                  Built for Contractors & Serious Projects
                </span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg">
                We specialize exclusively in roll-off dumpster rental.
                Local yards. Transparent pricing. Structured logistics.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  <Link to="/quote?v3=1">
                    Get Exact Price
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-border/60 text-foreground hover:bg-muted/50"
                >
                  <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Talk to a Specialist
                  </a>
                </Button>
              </div>
            </div>

            {/* Right — Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-border/30">
                <img
                  src={truckDelivery}
                  alt="Calsan Dumpsters professional delivery"
                  className="w-full h-[320px] lg:h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TRUST LAYER ══════════ */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="container-wide py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CORE OFFER ══════════ */}
      <section className="bg-background py-16 md:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Dumpster Rental — Done Right
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto">
              Whether it's a home project, construction site, or commercial operation — we handle the logistics.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {CORE_OFFERS.map(({ icon: Icon, title, description, cta }) => (
              <div
                key={title}
                className="bg-card rounded-2xl border border-border/50 p-7 flex flex-col hover:border-primary/20 hover:shadow-md transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-5 self-start text-primary hover:text-primary/80 hover:bg-primary/5 font-medium px-0"
                >
                  <Link to={cta}>
                    Get Price
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Simple, Structured Process
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map(({ step, title, description }) => (
              <div key={step} className="bg-card rounded-2xl border border-border/50 p-6">
                <span className="text-xs font-bold text-primary/60 tracking-widest">{step}</span>
                <h3 className="text-base font-semibold text-foreground mt-2 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ AUTHORITY ══════════ */}
      <section className="bg-background py-16 md:py-24">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-6">
              Built for Scale. Structured for Reliability.
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Since 2009, we've operated in junk removal, hauling, and construction debris management across the Bay Area.
              </p>
              <p>
                Since 2015, we've specialized exclusively in dumpster rental and material delivery — building the systems, routes, and yard infrastructure to do it at scale.
              </p>
              <p>We now operate with:</p>
              <ul className="space-y-2 pl-1">
                {[
                  'Dedicated sales team',
                  'Customer service',
                  'Dispatch & logistics coordination',
                  'Automation systems for scheduling and routing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CHAT PANEL ══════════ */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Ask Anything About Dumpster Rental
              </h2>
              <p className="text-sm text-muted-foreground mt-3">
                Get answers instantly or connect with our team.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-6">
              {CHAT_ACTIONS.map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  to={label === 'Get Exact Price' ? '/quote?v3=1' : label === 'Contractor Account' ? '/contractors' : '/quote?v3=1'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-medium text-foreground hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Embedded Chat */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {ChatComponent}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="bg-background py-16 md:py-20">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-sm text-muted-foreground">
              Get your exact price in under 60 seconds. No surprises, no hidden fees.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-sm"
              >
                <Link to="/quote?v3=1">
                  Get Exact Price
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl border-border/60"
              >
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ REVIEWS ══════════ */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* ══════════ FAQ ══════════ */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>
    </Layout>
  );
};

export default Index;
