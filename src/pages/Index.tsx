import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationalHero } from '@/components/sections/ConversationalHero';
import { BuiltFromFieldSection } from '@/components/sections/BuiltFromFieldSection';
import { LocalYardAdvantageSection } from '@/components/sections/LocalYardAdvantageSection';
import { SmartSystemsSection } from '@/components/sections/SmartSystemsSection';
import { TrustBadgesSection } from '@/components/sections/TrustBadgesSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';

// Lazy load heavier sections
const RealWorkSection = lazy(() => 
  import('@/components/sections/RealWorkSection').then(mod => ({ default: mod.RealWorkSection }))
);
const ReviewsSection = lazy(() => 
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);

// Minimal loading fallback
const SectionLoader = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const homepageFAQs = getFAQsForSchema(4);

  return (
    <Layout
      title={PAGE_SEO.home.title}
      description={PAGE_SEO.home.description}
      canonical={PAGE_SEO.home.canonical}
      schema={generateFAQSchema(homepageFAQs)}
    >
      {/* Conversational Hero */}
      <ConversationalHero />

      {/* Built From the Field */}
      <BuiltFromFieldSection />

      {/* Local Yard Advantage */}
      <LocalYardAdvantageSection />

      {/* Smart Systems */}
      <SmartSystemsSection />

      {/* Social proof */}
      <TrustBadgesSection />

      {/* Real work examples */}
      <Suspense fallback={<SectionLoader />}>
        <RealWorkSection />
      </Suspense>

      {/* Reviews */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>

      {/* FAQ + CTA */}
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
