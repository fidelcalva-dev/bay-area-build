import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { SizesPreviewSection } from '@/components/sections/SizesPreviewSection';
import { AreasPreviewSection } from '@/components/sections/AreasPreviewSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <TrustSection />
      <SizesPreviewSection />
      <ReviewsSection />
      <AreasPreviewSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
