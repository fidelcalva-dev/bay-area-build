import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { SuspenseRoute } from './shared';
import { lazyRetry } from '@/lib/lazyRetry';

// Public pages — wrapped with lazyRetry for stale-chunk resilience
const Pricing = lazy(lazyRetry(() => import("@/pages/Pricing")));
const Sizes = lazy(lazyRetry(() => import("@/pages/Sizes")));
const DumpsterVisualizer = lazy(lazyRetry(() => import("@/pages/DumpsterVisualizer")));
const Areas = lazy(lazyRetry(() => import("@/pages/Areas")));
const Materials = lazy(lazyRetry(() => import("@/pages/Materials")));
const CapacityGuide = lazy(lazyRetry(() => import("@/pages/CapacityGuide")));
const Contractors = lazy(lazyRetry(() => import("@/pages/Contractors")));
const ContractorApplication = lazy(lazyRetry(() => import("@/pages/ContractorApplication")));
const ScheduleDelivery = lazy(lazyRetry(() => import("@/pages/ScheduleDelivery")));
const ProjectTypePage = lazy(lazyRetry(() => import("@/pages/ProjectTypePage")));
const ContractorBestPractices = lazy(lazyRetry(() => import("@/pages/ContractorBestPractices")));
const ContractorResources = lazy(lazyRetry(() => import("@/pages/ContractorResources")));
const About = lazy(lazyRetry(() => import("@/pages/About")));
const Contact = lazy(lazyRetry(() => import("@/pages/Contact")));
const Blog = lazy(lazyRetry(() => import("@/pages/Blog")));
const Careers = lazy(lazyRetry(() => import("@/pages/Careers")));
const ThankYou = lazy(lazyRetry(() => import("@/pages/ThankYou")));
const Quote = lazy(lazyRetry(() => import("@/pages/Quote")));
const ContractorQuote = lazy(lazyRetry(() => import("@/pages/ContractorQuote")));
const QuickOrder = lazy(lazyRetry(() => import("@/pages/QuickOrder")));
const QuoteSchedule = lazy(lazyRetry(() => import("@/pages/QuoteSchedule")));
const QuotePayment = lazy(lazyRetry(() => import("@/pages/QuotePayment")));
const GreenImpactMap = lazy(lazyRetry(() => import("@/pages/GreenImpactMap")));
const GreenHalo = lazy(lazyRetry(() => import("@/pages/GreenHalo")));
const Terms = lazy(lazyRetry(() => import("@/pages/Terms")));
const Privacy = lazy(lazyRetry(() => import("@/pages/Privacy")));
const WasteVision = lazy(lazyRetry(() => import("@/pages/WasteVision")));
const DownloadPriceList = lazy(lazyRetry(() => import("@/pages/DownloadPriceList")));
const WhyLocalYards = lazy(lazyRetry(() => import("@/pages/WhyLocalYards")));
const NotABroker = lazy(lazyRetry(() => import("@/pages/NotABroker")));
const HowItWorks = lazy(lazyRetry(() => import("@/pages/HowItWorks")));
const Technology = lazy(lazyRetry(() => import("@/pages/Technology")));
const WhyCalsan = lazy(lazyRetry(() => import("@/pages/WhyCalsan")));
const BlogArticle = lazy(lazyRetry(() => import("@/pages/BlogArticle")));
const SitemapPage = lazy(lazyRetry(() => import("@/pages/SitemapPage")));
const ContactUs = lazy(lazyRetry(() => import("@/pages/ContactUs")));

// Auth pages — also resilient to stale chunks
const StaffLogin = lazy(lazyRetry(() => import("@/pages/StaffLogin")));
const RoleRouter = lazy(lazyRetry(() => import("@/pages/RoleRouter")));
const RequestAccess = lazy(lazyRetry(() => import("@/pages/RequestAccess")));
const SetPassword = lazy(lazyRetry(() => import("@/pages/SetPassword")));

export function getPublicRoutes() {
  return [
    <Route key="pricing" path="/pricing" element={<SuspenseRoute><Pricing /></SuspenseRoute>} />,
    <Route key="sizes" path="/sizes" element={<SuspenseRoute><Sizes /></SuspenseRoute>} />,
    <Route key="visualizer" path="/visualizer" element={<SuspenseRoute><DumpsterVisualizer /></SuspenseRoute>} />,
    <Route key="areas" path="/areas" element={<SuspenseRoute><Areas /></SuspenseRoute>} />,
    <Route key="materials" path="/materials" element={<SuspenseRoute><Materials /></SuspenseRoute>} />,
    <Route key="capacity-guide" path="/capacity-guide" element={<SuspenseRoute><CapacityGuide /></SuspenseRoute>} />,
    <Route key="contractors" path="/contractors" element={<SuspenseRoute><Contractors /></SuspenseRoute>} />,
    <Route key="contractor-application" path="/contractor-application" element={<SuspenseRoute><ContractorApplication /></SuspenseRoute>} />,
    <Route key="schedule-delivery" path="/schedule-delivery" element={<SuspenseRoute><ScheduleDelivery /></SuspenseRoute>} />,
    <Route key="projects" path="/projects/:slug" element={<SuspenseRoute><ProjectTypePage /></SuspenseRoute>} />,
    <Route key="contractor-best-practices" path="/contractor-best-practices" element={<SuspenseRoute><ContractorBestPractices /></SuspenseRoute>} />,
    <Route key="contractor-resources" path="/contractor-resources" element={<SuspenseRoute><ContractorResources /></SuspenseRoute>} />,
    <Route key="about" path="/about" element={<SuspenseRoute><About /></SuspenseRoute>} />,
    <Route key="contact" path="/contact" element={<SuspenseRoute><Contact /></SuspenseRoute>} />,
    <Route key="blog" path="/blog" element={<SuspenseRoute><Blog /></SuspenseRoute>} />,
    <Route key="blog-article" path="/blog/:articleSlug" element={<SuspenseRoute><BlogArticle /></SuspenseRoute>} />,
    <Route key="sitemap" path="/sitemap.xml" element={<SuspenseRoute><SitemapPage /></SuspenseRoute>} />,
    <Route key="contact-us" path="/contact-us" element={<SuspenseRoute><ContactUs /></SuspenseRoute>} />,
    <Route key="careers" path="/careers" element={<SuspenseRoute><Careers /></SuspenseRoute>} />,
    <Route key="download-price-list" path="/download-price-list" element={<SuspenseRoute><DownloadPriceList /></SuspenseRoute>} />,
    <Route key="thank-you" path="/thank-you" element={<SuspenseRoute><ThankYou /></SuspenseRoute>} />,
    <Route key="quote" path="/quote" element={<SuspenseRoute><Quote /></SuspenseRoute>} />,
    <Route key="quote-contractor" path="/quote/contractor" element={<SuspenseRoute><ContractorQuote /></SuspenseRoute>} />,
    <Route key="quote-schedule" path="/quote/schedule" element={<SuspenseRoute><QuoteSchedule /></SuspenseRoute>} />,
    <Route key="quote-pay" path="/quote/pay" element={<SuspenseRoute><QuotePayment /></SuspenseRoute>} />,
    <Route key="quick-order" path="/quick-order" element={<SuspenseRoute><QuickOrder /></SuspenseRoute>} />,
    <Route key="green-impact" path="/green-impact" element={<SuspenseRoute><GreenImpactMap /></SuspenseRoute>} />,
    <Route key="green-halo" path="/green-halo" element={<SuspenseRoute><GreenHalo /></SuspenseRoute>} />,
    <Route key="locations-redirect" path="/locations" element={<Navigate to="/areas" replace />} />,
    <Route key="terms" path="/terms" element={<SuspenseRoute><Terms /></SuspenseRoute>} />,
    <Route key="privacy" path="/privacy" element={<SuspenseRoute><Privacy /></SuspenseRoute>} />,
    <Route key="waste-vision" path="/waste-vision" element={<SuspenseRoute><WasteVision /></SuspenseRoute>} />,
    <Route key="ai-assistant-redirect" path="/ai-dumpster-assistant" element={<Navigate to="/" replace />} />,
    <Route key="why-local-yards" path="/why-local-yards" element={<SuspenseRoute><WhyLocalYards /></SuspenseRoute>} />,
    <Route key="not-a-broker" path="/not-a-broker" element={<SuspenseRoute><NotABroker /></SuspenseRoute>} />,
    <Route key="how-it-works" path="/how-it-works" element={<SuspenseRoute><HowItWorks /></SuspenseRoute>} />,
    <Route key="technology" path="/technology" element={<SuspenseRoute><Technology /></SuspenseRoute>} />,
    <Route key="why-calsan" path="/why-calsan" element={<SuspenseRoute><WhyCalsan /></SuspenseRoute>} />,
    <Route key="staff" path="/staff" element={<SuspenseRoute><StaffLogin /></SuspenseRoute>} />,
    <Route key="app" path="/app" element={<SuspenseRoute><RoleRouter /></SuspenseRoute>} />,
    <Route key="request-access" path="/request-access" element={<SuspenseRoute><RequestAccess /></SuspenseRoute>} />,
    <Route key="set-password" path="/set-password" element={<SuspenseRoute><SetPassword /></SuspenseRoute>} />,
    // Preview redirects
    <Route key="preview-quote" path="/preview/quote" element={<Navigate to="/quote" replace />} />,
    <Route key="preview-home" path="/preview/home" element={<Navigate to="/" replace />} />,
  ];
}
