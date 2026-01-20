import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Critical pages loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const Pricing = lazy(() => import("./pages/Pricing"));
const Sizes = lazy(() => import("./pages/Sizes"));
const Areas = lazy(() => import("./pages/Areas"));
const Materials = lazy(() => import("./pages/Materials"));
const Contractors = lazy(() => import("./pages/Contractors"));
const ContractorBestPractices = lazy(() => import("./pages/ContractorBestPractices"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const Careers = lazy(() => import("./pages/Careers"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Quote = lazy(() => import("./pages/Quote"));
const ContractorQuote = lazy(() => import("./pages/ContractorQuote"));
const GreenImpactMap = lazy(() => import("./pages/GreenImpactMap"));
const GreenHalo = lazy(() => import("./pages/GreenHalo"));
const Locations = lazy(() => import("./pages/Locations"));

// Portal pages (rarely accessed)
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin"));
const PortalDashboard = lazy(() => import("./pages/portal/PortalDashboard"));
const ProjectDetail = lazy(() => import("./pages/portal/ProjectDetail"));
const SustainabilityReport = lazy(() => import("./pages/portal/SustainabilityReport"));

// Admin pages (rarely accessed)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ZonesManager = lazy(() => import("./pages/admin/ZonesManager"));
const PricingManager = lazy(() => import("./pages/admin/PricingManager"));
const VendorsManager = lazy(() => import("./pages/admin/VendorsManager"));
const ExtrasManager = lazy(() => import("./pages/admin/ExtrasManager"));

const queryClient = new QueryClient();

// Page loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Home page - loaded immediately */}
              <Route path="/" element={<Index />} />
              
              {/* Public pages - lazy loaded */}
              <Route path="/pricing" element={
                <Suspense fallback={<PageLoader />}><Pricing /></Suspense>
              } />
              <Route path="/sizes" element={
                <Suspense fallback={<PageLoader />}><Sizes /></Suspense>
              } />
              <Route path="/areas" element={
                <Suspense fallback={<PageLoader />}><Areas /></Suspense>
              } />
              <Route path="/materials" element={
                <Suspense fallback={<PageLoader />}><Materials /></Suspense>
              } />
              <Route path="/contractors" element={
                <Suspense fallback={<PageLoader />}><Contractors /></Suspense>
              } />
              <Route path="/contractor-best-practices" element={
                <Suspense fallback={<PageLoader />}><ContractorBestPractices /></Suspense>
              } />
              <Route path="/about" element={
                <Suspense fallback={<PageLoader />}><About /></Suspense>
              } />
              <Route path="/contact" element={
                <Suspense fallback={<PageLoader />}><Contact /></Suspense>
              } />
              <Route path="/blog" element={
                <Suspense fallback={<PageLoader />}><Blog /></Suspense>
              } />
              <Route path="/careers" element={
                <Suspense fallback={<PageLoader />}><Careers /></Suspense>
              } />
              <Route path="/thank-you" element={
                <Suspense fallback={<PageLoader />}><ThankYou /></Suspense>
              } />
              <Route path="/quote" element={
                <Suspense fallback={<PageLoader />}><Quote /></Suspense>
              } />
              <Route path="/quote/contractor" element={
                <Suspense fallback={<PageLoader />}><ContractorQuote /></Suspense>
              } />
              <Route path="/green-impact" element={
                <Suspense fallback={<PageLoader />}><GreenImpactMap /></Suspense>
              } />
              <Route path="/green-halo" element={
                <Suspense fallback={<PageLoader />}><GreenHalo /></Suspense>
              } />
              <Route path="/locations" element={
                <Suspense fallback={<PageLoader />}><Locations /></Suspense>
              } />
              
              {/* Green Halo Client Portal */}
              <Route path="/portal" element={
                <Suspense fallback={<PageLoader />}><PortalLogin /></Suspense>
              } />
              <Route path="/portal/dashboard" element={
                <Suspense fallback={<PageLoader />}><PortalDashboard /></Suspense>
              } />
              <Route path="/portal/project/:projectId" element={
                <Suspense fallback={<PageLoader />}><ProjectDetail /></Suspense>
              } />
              <Route path="/portal/report" element={
                <Suspense fallback={<PageLoader />}><SustainabilityReport /></Suspense>
              } />
              
              {/* Admin Panel */}
              <Route path="/admin" element={
                <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>
              } />
              <Route path="/admin/*" element={
                <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>
              }>
                <Route path="dashboard" element={
                  <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
                } />
                <Route path="zones" element={
                  <Suspense fallback={<PageLoader />}><ZonesManager /></Suspense>
                } />
                <Route path="pricing" element={
                  <Suspense fallback={<PageLoader />}><PricingManager /></Suspense>
                } />
                <Route path="vendors" element={
                  <Suspense fallback={<PageLoader />}><VendorsManager /></Suspense>
                } />
                <Route path="extras" element={
                  <Suspense fallback={<PageLoader />}><ExtrasManager /></Suspense>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;