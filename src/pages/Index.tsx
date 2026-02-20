import { Suspense, lazy, useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CalsanAIChat } from '@/components/chat/CalsanAIChat';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { Shield, MapPin, DollarSign, Headphones } from 'lucide-react';
import { LocalSEOSchema } from '@/components/seo/LocalSEOSchema';
import { fetchFeatureFlags, getFeatureFlag } from '@/lib/featureFlags';

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

const TRUST_ITEMS = [
  { icon: Shield, label: 'Licensed & Insured' },
  { icon: MapPin, label: 'Local Infrastructure' },
  { icon: DollarSign, label: 'Transparent Pricing' },
  { icon: Headphones, label: 'Professional Dispatch' },
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

      {/* AI Homepage Chat (feature-flagged) */}
      {flagsLoaded && aiHomeEnabled ? (
        <section className="bg-[#F7F9FA] min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 md:py-20">
          <div className="container-wide">
            <div className="text-center mb-8 md:mb-10 space-y-3 max-w-[700px] mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
                Professional Dumpster Rental.
                <br className="hidden sm:block" />
                <span className="text-primary"> The Calsan Dumpster System.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Instant pricing. Local infrastructure. Real-time coordination.
              </p>
            </div>
            <Suspense fallback={<SectionLoader />}>
              <AIMainChat />
            </Suspense>
            <div className="mt-10 md:mt-14 max-w-[700px] mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 justify-center">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Default homepage with CalsanAIChat */
        <section className="bg-[#F7F9FA] min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 md:py-20">
          <div className="container-wide">
            <div className="text-center mb-8 md:mb-10 space-y-3 max-w-[700px] mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
                Professional Dumpster Rental.
                <br className="hidden sm:block" />
                <span className="text-primary"> The Calsan Dumpster System.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Instant pricing. Local infrastructure. Real-time coordination.
              </p>
            </div>
            <CalsanAIChat />
            <div className="mt-10 md:mt-14 max-w-[700px] mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 justify-center">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
