// ============================================================
// PREVIEW HOME PAGE - v2 Homepage Preview
// Uber-like booking experience for internal testing
// ============================================================
import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeroSectionV2 } from '@/components/sections/HeroSectionV2';
import { HowItWorksV2 } from '@/components/sections/HowItWorksV2';
import { BenefitsStripV2 } from '@/components/sections/BenefitsStripV2';
import { QuickSizesV2 } from '@/components/sections/QuickSizesV2';
import { TrustBadgesSection } from '@/components/sections/TrustBadgesSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';
import { getFAQsForSchema } from '@/lib/shared-data';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Preview Mode</span>
              <Badge variant="outline" className="text-xs">v2 Uber-like Homepage</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800">
                <Link to="/">
                  <Eye className="w-4 h-4 mr-1" />
                  View Current Site
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* V2 Hero - Uber-like with prominent ZIP bar */}
      <HeroSectionV2 />
      
      {/* V2 Benefits Strip - 3 key value props */}
      <BenefitsStripV2 />
      
      {/* V2 How It Works - Simplified 3 steps */}
      <HowItWorksV2 />
      
      {/* V2 Quick Sizes - Common sizes only */}
      <QuickSizesV2 />
      
      {/* Social proof - verified credentials (reused) */}
      <TrustBadgesSection />
      
      {/* Real work examples */}
      <Suspense fallback={<SectionLoader />}>
        <RealWorkSection />
      </Suspense>
      
      {/* Verified customer reviews */}
      <Suspense fallback={<SectionLoader />}>
        <ReviewsSection />
      </Suspense>
      
      {/* FAQ + CTA */}
      <FAQSection limit={4} />
      <CTASection />
    </Layout>
  );
}
