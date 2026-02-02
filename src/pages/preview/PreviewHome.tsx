// ============================================================
// PREVIEW HOME PAGE - v2 Homepage Preview
// For internal testing before public rollout
// ============================================================
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
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

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

export default function PreviewHome() {
  const homepageFAQs = getFAQsForSchema(4);

  return (
    <Layout
      title="[PREVIEW] Dumpster Rental Bay Area | CALSAN Dumpsters"
      description="Preview of the new Uber-like homepage experience. For internal testing only."
      noindex={true}
      schema={generateFAQSchema(homepageFAQs)}
    >
      {/* Preview Mode Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 py-2 sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Preview Mode</span>
            <Badge variant="outline" className="text-xs">v2 Homepage</Badge>
            <span className="text-amber-600">- For internal testing only</span>
          </div>
        </div>
      </div>

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
}
