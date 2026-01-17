import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { GoogleGuaranteeSection } from '@/components/sections/GoogleGuaranteeSection';
import { AreasPreviewSection } from '@/components/sections/AreasPreviewSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';

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

// Homepage FAQ for schema
const homepageFAQs = [
  {
    question: 'How quickly can I get a dumpster delivered?',
    answer: 'We offer same-day delivery for most Bay Area locations when you order before noon. Next-day delivery is available for all orders.',
  },
  {
    question: 'What sizes of dumpsters do you offer?',
    answer: 'We offer dumpsters from 6 yards to 50 yards. Heavy material dumpsters (6, 8, 10 yard) and general debris dumpsters (10, 20, 30, 40, 50 yard) are available.',
  },
  {
    question: 'How much does a dumpster rental cost?',
    answer: 'Pricing starts at $299 for residential projects. Price depends on size, location, and rental duration. Get an instant quote on our website.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We serve 9 Bay Area counties: Alameda, San Francisco, Santa Clara, Contra Costa, San Mateo, Marin, Napa, Solano, and Sonoma.',
  },
];

const Index = () => {
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
