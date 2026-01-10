import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/sections/HeroSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { GoogleGuaranteeSection } from '@/components/sections/GoogleGuaranteeSection';
import { RealWorkSection } from '@/components/sections/RealWorkSection';
import { SizesPreviewSection } from '@/components/sections/SizesPreviewSection';
import { CompareSizesSection } from '@/components/sections/CompareSizesSection';
import { BeforeAfterGallerySection } from '@/components/sections/BeforeAfterGallerySection';
import { AreasPreviewSection } from '@/components/sections/AreasPreviewSection';
import { ServiceCoverageMapSection } from '@/components/sections/ServiceCoverageMapSection';
import { MeetTheTeamSection } from '@/components/sections/MeetTheTeamSection';
import { CityOperatorSection } from '@/components/sections/CityOperatorSection';
import { ExpansionRoadmapSection } from '@/components/sections/ExpansionRoadmapSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { VideoTestimonialsSection } from '@/components/sections/VideoTestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CTASection } from '@/components/sections/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <GoogleGuaranteeSection />
      <RealWorkSection />
      <BeforeAfterGallerySection />
      <SizesPreviewSection />
      <CompareSizesSection />
      <ServiceCoverageMapSection />
      <MeetTheTeamSection />
      <CityOperatorSection />
      <ExpansionRoadmapSection />
      <ReviewsSection />
      <VideoTestimonialsSection />
      <AreasPreviewSection />
      <FAQSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
