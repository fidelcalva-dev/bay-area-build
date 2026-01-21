import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Critical pages loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const Pricing = lazy(() => import("./pages/Pricing"));
const Sizes = lazy(() => import("./pages/Sizes"));
const Areas = lazy(() => import("./pages/Areas"));
const Materials = lazy(() => import("./pages/Materials"));
const CapacityGuide = lazy(() => import("./pages/CapacityGuide"));
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

// Customer Portal pages (SMS OTP auth)
const CustomerLogin = lazy(() => import("./pages/portal/CustomerLogin"));
const CustomerDashboard = lazy(() => import("./pages/portal/CustomerDashboard"));
const CustomerOrderDetail = lazy(() => import("./pages/portal/CustomerOrderDetail"));

// Green Halo Portal pages (separate)
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
const VolumeCommitmentsManager = lazy(() => import("./pages/admin/VolumeCommitmentsManager"));
const YardsManager = lazy(() => import("./pages/admin/YardsManager"));
const ConfigManager = lazy(() => import("./pages/admin/ConfigManager"));
const OrdersManager = lazy(() => import("./pages/admin/OrdersManager"));
const CustomersManager = lazy(() => import("./pages/admin/CustomersManager"));
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogsPage"));

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
  <ErrorBoundary>
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
              <Route path="/capacity-guide" element={
                <Suspense fallback={<PageLoader />}><CapacityGuide /></Suspense>
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
              
              {/* Customer Portal (SMS OTP Auth) */}
              <Route path="/portal" element={
                <Suspense fallback={<PageLoader />}><CustomerLogin /></Suspense>
              } />
              <Route path="/portal/dashboard" element={
                <Suspense fallback={<PageLoader />}><CustomerDashboard /></Suspense>
              } />
              <Route path="/portal/order/:orderId" element={
                <Suspense fallback={<PageLoader />}><CustomerOrderDetail /></Suspense>
              } />

              {/* Green Halo Client Portal */}
              <Route path="/green-halo/portal" element={
                <Suspense fallback={<PageLoader />}><PortalLogin /></Suspense>
              } />
              <Route path="/green-halo/portal/dashboard" element={
                <Suspense fallback={<PageLoader />}><PortalDashboard /></Suspense>
              } />
              <Route path="/green-halo/portal/project/:projectId" element={
                <Suspense fallback={<PageLoader />}><ProjectDetail /></Suspense>
              } />
              <Route path="/green-halo/portal/report" element={
                <Suspense fallback={<PageLoader />}><SustainabilityReport /></Suspense>
              } />
              
              {/* Admin Panel */}
              <Route path="/admin/login" element={
                <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>
              } />
              <Route path="/admin" element={
                <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
                } />
                <Route path="orders" element={
                  <Suspense fallback={<PageLoader />}><OrdersManager /></Suspense>
                } />
                <Route path="customers" element={
                  <Suspense fallback={<PageLoader />}><CustomersManager /></Suspense>
                } />
                <Route path="yards" element={
                  <Suspense fallback={<PageLoader />}><YardsManager /></Suspense>
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
                <Route path="config" element={
                  <Suspense fallback={<PageLoader />}><ConfigManager /></Suspense>
                } />
                <Route path="volume-commitments" element={
                  <Suspense fallback={<PageLoader />}><VolumeCommitmentsManager /></Suspense>
                } />
                <Route path="audit-logs" element={
                  <Suspense fallback={<PageLoader />}><AuditLogsPage /></Suspense>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
</ErrorBoundary>
);

export default App;