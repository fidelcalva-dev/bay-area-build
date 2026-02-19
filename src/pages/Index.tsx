import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSectionPlatform } from '@/components/sections/HeroSectionPlatform';
import {
  HowSystemWorksSection,
  DeliveryIntelligenceSection,
  ServiceCycleSection,
  BuiltForContractorsSection,
  SecureDigitalSection,
  WhyDifferentSection,
} from '@/components/sections/PlatformSections';
import { TimelineCredibilitySection, WhatMakesDifferentSection } from '@/components/sections/BrandPositioningSection';
import { InteractiveAISection } from '@/components/sections/InteractiveAISection';
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
      {/* Hero */}
      <HeroSectionPlatform />

      {/* How Our System Works (local dumpster company) */}
      <HowSystemWorksSection />

      {/* Interactive AI Chat Section */}
      <InteractiveAISection />

      {/* Timeline: Built on Experience */}
      <TimelineCredibilitySection />

      {/* What Makes Calsan Different */}
      <WhatMakesDifferentSection />

      {/* Delivery Intelligence */}
      <DeliveryIntelligenceSection />

      {/* Full Service Cycle */}
      <ServiceCycleSection />

      {/* Built for Contractors */}
      <BuiltForContractorsSection />

      {/* Secure Digital Operations */}
      <SecureDigitalSection />

      {/* Why We're Different (comparison) */}
      <WhyDifferentSection />

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
