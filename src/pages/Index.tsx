import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { GoogleGuaranteeSection } from '@/components/sections/GoogleGuaranteeSection';
import { TrustBadgesSection } from '@/components/sections/TrustBadgesSection';
import { AreasPreviewSection } from '@/components/sections/AreasPreviewSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';

// Lazy load heavy sections for better initial load
const RealWorkSection = lazy(() => 
  import('@/components/sections/RealWorkSection').then(mod => ({ default: mod.RealWorkSection }))
);
const SizesPreviewSection = lazy(() => 
  import('@/components/sections/SizesPreviewSection').then(mod => ({ default: mod.SizesPreviewSection }))
);
const CompareSizesSection = lazy(() => 
  import('@/components/sections/CompareSizesSection').then(mod => ({ default: mod.CompareSizesSection }))
);
const BeforeAfterGallerySection = lazy(() => 
  import('@/components/sections/BeforeAfterGallerySection').then(mod => ({ default: mod.BeforeAfterGallerySection }))
);
const ServiceCoverageMapSection = lazy(() => 
  import('@/components/sections/ServiceCoverageMapSection').then(mod => ({ default: mod.ServiceCoverageMapSection }))
);
const MeetTheTeamSection = lazy(() => 
  import('@/components/sections/MeetTheTeamSection').then(mod => ({ default: mod.MeetTheTeamSection }))
);
const CityOperatorSection = lazy(() => 
  import('@/components/sections/CityOperatorSection').then(mod => ({ default: mod.CityOperatorSection }))
);
const ExpansionRoadmapSection = lazy(() => 
  import('@/components/sections/ExpansionRoadmapSection').then(mod => ({ default: mod.ExpansionRoadmapSection }))
);
const ReviewsSection = lazy(() => 
  import('@/components/sections/ReviewsSection').then(mod => ({ default: mod.ReviewsSection }))
);
const VideoTestimonialsSection = lazy(() => 
  import('@/components/sections/VideoTestimonialsSection').then(mod => ({ default: mod.VideoTestimonialsSection }))
);

// Lightweight loading fallback
const SectionLoader = () => (
  <div className="min-h-[300px] flex items-center justify-center bg-muted/30">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  // Use master FAQ data for schema
  const homepageFAQs = getFAQsForSchema(4);

  return (
    <Layout
      title={PAGE_SEO.home.title}
      description={PAGE_SEO.home.description}
      canonical={PAGE_SEO.home.canonical}
      schema={generateFAQSchema(homepageFAQs)}
    >
      {/* Critical above-the-fold content - loaded immediately */}
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <GoogleGuaranteeSection />
      
      {/* Lazy-loaded sections below the fold */}
      <Suspense fallback={<SectionLoader />}>
        <RealWorkSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <BeforeAfterGallerySection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <SizesPreviewSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <CompareSizesSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ServiceCoverageMapSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <MeetTheTeamSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <CityOperatorSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ExpansionRoadmapSection />
      </Suspense>
      
      {/* Trust Badges Section - Above Reviews */}
      <TrustBadgesSection />
      
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <VideoTestimonialsSection />
      </Suspense>
      
      {/* Lightweight sections loaded normally */}
      <AreasPreviewSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
