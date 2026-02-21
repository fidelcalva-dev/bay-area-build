import { Suspense, lazy, useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CalsanAIChat } from '@/components/chat/CalsanAIChat';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { Shield, DollarSign, Headphones, FileText, Star, ChevronDown } from 'lucide-react';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { fetchFeatureFlags, getFeatureFlag } from '@/lib/featureFlags';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Lazy load below-fold sections
const ReviewsSection = lazy(() =>
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);
const FAQSection = lazy(() =>
  import('@/components/sections/FAQSection').then(mod => ({ default: mod.FAQSection }))
);

// Lazy load AI home chat (only when flag is on)
const AIMainChat = lazy(() =>
  import('@/components/home/AIMainChat').then(mod => ({ default: mod.AIMainChat }))
);

const SectionLoader = () => (
  <div className="min-h-[100px] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const TRUST_STRIP_ITEMS = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: DollarSign, label: 'Transparent Pricing' },
  { icon: Headphones, label: 'Professional Dispatch' },
  { icon: FileText, label: 'Documentation-Ready Receipts' },
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

  return (
    <Layout
      title={PAGE_SEO.home.title}
      description={PAGE_SEO.home.description}
      canonical={PAGE_SEO.home.canonical}
      schema={generateFAQSchema(homepageFAQs)}
      hideChat
    >
      <LocalSEOSchema includeFAQ includeService />

      {/* Hero Section */}
      {(() => {
        const HeroContent = ({ chatComponent }: { chatComponent: React.ReactNode }) => (
          <section className="bg-[#F7F9FA] min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 md:py-20">
            <div className="container-wide">
              {/* Headline */}
              <div className="text-center mb-8 md:mb-10 space-y-3 max-w-[700px] mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
                  Professional Dumpster Rental.
                  <br className="hidden sm:block" />
                  <span className="text-primary"> The Calsan Dumpster System.</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Exact pricing by ZIP. Clear rules. Professional dispatch coordination.
                  <br className="hidden sm:block" />
                  Local infrastructure in your market.
                </p>
                <p className="text-xs text-muted-foreground/70 pt-1">
                  Serving the Bay Area since 2009. Specialized in dumpster rental since 2015.
                </p>
              </div>

              {/* Trust Strip — above chat */}
              <div className="max-w-[850px] mx-auto mb-5">
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {TRUST_STRIP_ITEMS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-xs text-muted-foreground font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              {chatComponent}

              {/* Social Proof — below chat */}
              <div className="mt-8 max-w-[700px] mx-auto text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-foreground">4.9</span>
                  <span className="text-xs text-muted-foreground">from 200+ verified reviews</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Trusted by homeowners and contractors across the Bay Area.
                </p>
              </div>

              {/* What's Included — accordion */}
              <div className="mt-8 max-w-[600px] mx-auto">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground bg-white border border-[hsl(220_10%_90%)] rounded-xl hover:border-primary/30 transition-colors group">
                    <span>What's included in the price</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 px-4 py-3 bg-white border border-[hsl(220_10%_90%)] rounded-xl">
                    <ul className="space-y-2 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                        Delivery and pickup
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                        Standard 7-day rental period
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                        Included disposal tonnage (varies by size and material)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                        Clear overage rules ($165/ton beyond included weight)
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground/70 mt-3 pt-2 border-t border-[hsl(220_10%_93%)]">
                      Rules are shown before you confirm.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </section>
        );

        return flagsLoaded && aiHomeEnabled ? (
          <HeroContent chatComponent={
            <Suspense fallback={<SectionLoader />}>
              <AIMainChat />
            </Suspense>
          } />
        ) : (
          <HeroContent chatComponent={<CalsanAIChat />} />
        );
      })()}

      {/* Reviews */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* FAQ */}
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>
    </Layout>
  );
};

export default Index;
