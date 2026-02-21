import { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CalsanAIChat } from '@/components/chat/CalsanAIChat';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import {
  Shield, Clock, MapPin, DollarSign, Phone, Upload,
  CalendarDays, Briefcase, Truck, ArrowRight, ArrowLeftRight,
  Building2, HardHat, Home, CheckCircle, Trash2,
} from 'lucide-react';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { fetchFeatureFlags, getFeatureFlag } from '@/lib/featureFlags';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AnimatedSection, StaggeredContainer, AnimatedItem } from '@/components/animations';
import jobSiteImg from '@/assets/images/calsan-dumpster-delivery.jpg';

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
    description: 'Cleanouts, renovations, landscaping. Right-sized dumpsters delivered on your schedule.',
  },
  {
    icon: HardHat,
    title: 'Construction & Demo',
    description: 'Concrete, dirt, roofing, mixed debris. Heavy-material rated containers available.',
  },
  {
    icon: Building2,
    title: 'Commercial Sites',
    description: 'Multi-unit, retail, and office projects. Volume programs and recurring service.',
  },
];

// ── How It Works Steps ──
const STEPS = [
  { number: '01', icon: MapPin, title: 'Enter Your Address', description: 'We match you to the nearest yard automatically.' },
  { number: '02', icon: Trash2, title: 'Select Size', description: 'Smart recommendation based on your project type.' },
  { number: '03', icon: CheckCircle, title: 'Confirm & Schedule', description: 'Lock in your price and choose your delivery window.' },
  { number: '04', icon: Truck, title: 'Delivery & Pickup', description: 'We drop off, you fill up, we haul away. Done.' },
];

// ── Quick Action Buttons ──
const QUICK_ACTIONS = [
  { icon: DollarSign, label: 'Get Exact Price', href: '/quote?v3=1' },
  { icon: Upload, label: 'Upload a Photo', href: '/quote?v3=1' },
  { icon: CalendarDays, label: 'Schedule Delivery', href: '/quote?v3=1' },
  { icon: Phone, label: 'Talk to a Specialist', href: '/quote?v3=1' },
  { icon: Briefcase, label: 'Contractor Account', href: '/contractors' },
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
      <section className="bg-background py-16 md:py-24 lg:py-32">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <AnimatedSection>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary/70 mb-4">
                Calsan Dumpster System
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-[1.15] tracking-tight mb-5">
                Professional Dumpster Rental
                <span className="block text-muted-foreground text-2xl sm:text-3xl md:text-4xl font-semibold mt-1">
                  Built for Contractors & Serious Projects
                </span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg mb-8">
                We specialize exclusively in roll-off dumpster rental. Local yards. Transparent pricing. Structured logistics.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="cta" size="lg" className="group">
                  <Link to="/quote?v3=1">
                    Get Exact Price
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="tel:+15107770803">Talk to a Specialist</a>
                </Button>
              </div>
            </AnimatedSection>

            {/* Right — Image */}
            <AnimatedSection delay={0.15} className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-md">
                <img
                  src={jobSiteImg}
                  alt="Professional Calsan dumpster delivery on a clean job site"
                  className="w-full h-auto object-cover aspect-[4/3]"
                  loading="eager"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ══════════ TRUST LAYER ══════════ */}
      <section className="border-y border-border/50 bg-muted/30 py-6">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-muted-foreground">
                <Icon className="w-4.5 h-4.5" strokeWidth={1.5} />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CORE OFFER ══════════ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Dumpster Rental — Done Right
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {CORE_OFFERS.map(({ icon: Icon, title, description }) => (
              <AnimatedItem key={title} variant="fadeUp">
                <div className="bg-card rounded-2xl border border-border/50 p-7 h-full flex flex-col hover:border-primary/20 hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{description}</p>
                  <Button asChild variant="outline" size="sm" className="w-fit group">
                    <Link to="/quote?v3=1">
                      Get Price
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Simple, Structured Process
            </h2>
          </AnimatedSection>

          <StaggeredContainer className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {STEPS.map(({ number, icon: Icon, title, description }, idx) => (
              <AnimatedItem key={title} variant="fadeUp">
                <div className="relative bg-card rounded-2xl border border-border/50 p-6 h-full text-center hover:border-primary/20 hover:shadow-md transition-all duration-200">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-1">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </AnimatedItem>
            ))}
          </StaggeredContainer>
        </div>
      </section>

      {/* ══════════ AUTHORITY ══════════ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-wide max-w-3xl mx-auto">
          <AnimatedSection className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">
              Built for Scale. Structured for Reliability.
            </h2>
            <div className="text-muted-foreground text-sm sm:text-base leading-relaxed space-y-4 text-left">
              <p>
                Since 2009, we have operated in junk removal, hauling, and construction debris management. Since 2015, we have specialized exclusively in dumpster rental and material delivery.
              </p>
              <p>We now operate with:</p>
              <ul className="grid sm:grid-cols-2 gap-2 list-none pl-0">
                {[
                  'Dedicated sales team',
                  'Customer service',
                  'Dispatch & logistics',
                  'Automation systems',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ══════════ AI CHAT PANEL ══════════ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-wide max-w-[920px] mx-auto">
          <AnimatedSection className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Ask Anything About Dumpster Rental
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Our system guides you to the right size, pricing, and delivery timing.
            </p>
          </AnimatedSection>

          <div className="bg-card rounded-2xl border border-border/50 shadow-md overflow-hidden">
            {/* Quick Actions */}
            <div className="px-5 pt-5 pb-3 border-b border-border/30">
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    to={href}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium",
                      "bg-muted/50 text-foreground border border-border/40",
                      "hover:border-primary/30 hover:bg-muted transition-all duration-200"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Chat */}
            {ChatComponent}
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

      {/* ══════════ CTA ══════════ */}
      <section className="py-16 md:py-20 bg-foreground text-background">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-background/60 mb-8">
            Get an exact estimate in 60 seconds. Same-day delivery available.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="cta" size="lg" className="group">
              <Link to="/quote?v3=1">
                Get Exact Price
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-background/30 text-background hover:bg-background/10">
              <a href="tel:+15107770803">Call a Specialist</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
