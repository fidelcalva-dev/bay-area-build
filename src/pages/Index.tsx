import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { ServiceGuaranteeSection } from '@/components/sections/ServiceGuaranteeSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { TrustBadgesSection } from '@/components/sections/TrustBadgesSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';

// Lazy load heavier sections
const RealWorkSection = lazy(() => 
  import('@/components/sections/RealWorkSection').then(mod => ({ default: mod.RealWorkSection }))
);
const SizesPreviewSection = lazy(() => 
  import('@/components/sections/SizesPreviewSection').then(mod => ({ default: mod.SizesPreviewSection }))
);
const ServiceCoverageMapSection = lazy(() => 
  import('@/components/sections/ServiceCoverageMapSection').then(mod => ({ default: mod.ServiceCoverageMapSection }))
);
const ReviewsSection = lazy(() => 
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);
const RecyclingCommitmentSection = lazy(() => 
  import('@/components/sections/RecyclingCommitmentSection').then(mod => ({ default: mod.RecyclingCommitmentSection }))
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
      {/* Critical above-the-fold */}
      <HeroSection />
      
      {/* Service Guarantee - immediately after hero */}
      <ServiceGuaranteeSection />
      
      <HowItWorksSection />
      <FeaturesSection />
      
      {/* Social proof - verified credentials */}
      <TrustBadgesSection />
      
      {/* Lazy-loaded sections */}
      <Suspense fallback={<SectionLoader />}>
        <SizesPreviewSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <RealWorkSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ServiceCoverageMapSection />
      </Suspense>
      
      {/* Verified customer reviews */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>
      
      {/* Environmental commitment - accurate messaging */}
      <Suspense fallback={<SectionLoader />}>
        <RecyclingCommitmentSection />
      </Suspense>
      
      {/* FAQ + CTA */}
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
