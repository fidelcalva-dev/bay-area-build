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
import { PAGE_SEO, generateFAQSchema } from '@/lib/seo';

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
