import { Suspense, lazy, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CalsanAIChat } from '@/components/chat/CalsanAIChat';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { Shield, Clock, MapPin, DollarSign, Phone, Upload, CalendarDays, Briefcase, Truck, ArrowLeftRight } from 'lucide-react';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { fetchFeatureFlags, getFeatureFlag } from '@/lib/featureFlags';
import { cn } from '@/lib/utils';

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

// ── Quick Action Buttons ──
const QUICK_ACTIONS = [
  { icon: DollarSign, label: 'Get Exact Price', href: '/quote?v3=1' },
  { icon: Upload, label: 'Upload a Photo', href: '/quote?v3=1' },
  { icon: CalendarDays, label: 'Schedule Delivery', href: '/quote?v3=1' },
  { icon: Phone, label: 'Talk to a Specialist', href: '/quote?v3=1' },
  { icon: Briefcase, label: 'Contractor Account', href: '/contractors' },
  { icon: Truck, label: 'Request Pickup', href: '/quote?v3=1' },
  { icon: ArrowLeftRight, label: 'Swap Dumpster', href: '/quote?v3=1' },
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

      {/* ══════════ AI-FIRST HERO ══════════ */}
      <section className="bg-background min-h-[calc(100vh-64px)] flex items-center py-12 md:py-20">
        <div className="w-full max-w-[920px] mx-auto px-4 sm:px-6">

          {/* ── Headline ── */}
          <div className="text-center mb-8 md:mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary/70 mb-3">
              Calsan Dumpster System
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
              Professional Dumpster Rental
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed">
              Powered by Structured Logistics
            </p>
          </div>

          {/* ── AI Panel ── */}
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

          {/* ── Trust Strip ── */}
          <div className="mt-10 md:mt-14">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-muted-foreground/70">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
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
