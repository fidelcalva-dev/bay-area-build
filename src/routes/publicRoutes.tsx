import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { SuspenseRoute } from './shared';

// Public pages
const Pricing = lazy(() => import("@/pages/Pricing"));
const Sizes = lazy(() => import("@/pages/Sizes"));
const DumpsterVisualizer = lazy(() => import("@/pages/DumpsterVisualizer"));
const Areas = lazy(() => import("@/pages/Areas"));
const Materials = lazy(() => import("@/pages/Materials"));
const CapacityGuide = lazy(() => import("@/pages/CapacityGuide"));
const Contractors = lazy(() => import("@/pages/Contractors"));
const ContractorApplication = lazy(() => import("@/pages/ContractorApplication"));
const ScheduleDelivery = lazy(() => import("@/pages/ScheduleDelivery"));
const ProjectTypePage = lazy(() => import("@/pages/ProjectTypePage"));
const ContractorBestPractices = lazy(() => import("@/pages/ContractorBestPractices"));
const ContractorResources = lazy(() => import("@/pages/ContractorResources"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Blog = lazy(() => import("@/pages/Blog"));
const Careers = lazy(() => import("@/pages/Careers"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const Quote = lazy(() => import("@/pages/Quote"));
const ContractorQuote = lazy(() => import("@/pages/ContractorQuote"));
const QuickOrder = lazy(() => import("@/pages/QuickOrder"));
const QuoteSchedule = lazy(() => import("@/pages/QuoteSchedule"));
const QuotePayment = lazy(() => import("@/pages/QuotePayment"));
const GreenImpactMap = lazy(() => import("@/pages/GreenImpactMap"));
const GreenHalo = lazy(() => import("@/pages/GreenHalo"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const WasteVision = lazy(() => import("@/pages/WasteVision"));
const DownloadPriceList = lazy(() => import("@/pages/DownloadPriceList"));
const WhyLocalYards = lazy(() => import("@/pages/WhyLocalYards"));
const NotABroker = lazy(() => import("@/pages/NotABroker"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Technology = lazy(() => import("@/pages/Technology"));
const WhyCalsan = lazy(() => import("@/pages/WhyCalsan"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));
const SitemapPage = lazy(() => import("@/pages/SitemapPage"));

// Auth pages
const StaffLogin = lazy(() => import("@/pages/StaffLogin"));
const RoleRouter = lazy(() => import("@/pages/RoleRouter"));
const RequestAccess = lazy(() => import("@/pages/RequestAccess"));
const SetPassword = lazy(() => import("@/pages/SetPassword"));

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
