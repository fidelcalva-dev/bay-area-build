import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Sizes from "./pages/Sizes";
import Areas from "./pages/Areas";
import Materials from "./pages/Materials";
import Contractors from "./pages/Contractors";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import ThankYou from "./pages/ThankYou";
import Quote from "./pages/Quote";
import ContractorQuote from "./pages/ContractorQuote";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ZonesManager from "./pages/admin/ZonesManager";
import PricingManager from "./pages/admin/PricingManager";
import VendorsManager from "./pages/admin/VendorsManager";
import ExtrasManager from "./pages/admin/ExtrasManager";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalDashboard from "./pages/portal/PortalDashboard";
import ProjectDetail from "./pages/portal/ProjectDetail";
import SustainabilityReport from "./pages/portal/SustainabilityReport";
import GreenImpactMap from "./pages/GreenImpactMap";
import GreenHalo from "./pages/GreenHalo";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/sizes" element={<Sizes />} />
              <Route path="/areas" element={<Areas />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/contractors" element={<Contractors />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/quote" element={<Quote />} />
              <Route path="/quote/contractor" element={<ContractorQuote />} />
              <Route path="/green-impact" element={<GreenImpactMap />} />
              <Route path="/green-halo" element={<GreenHalo />} />
              {/* Green Halo Client Portal */}
              <Route path="/portal" element={<PortalLogin />} />
              <Route path="/portal/dashboard" element={<PortalDashboard />} />
              <Route path="/portal/project/:projectId" element={<ProjectDetail />} />
              <Route path="/portal/report" element={<SustainabilityReport />} />
              {/* Admin Panel */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="zones" element={<ZonesManager />} />
                <Route path="pricing" element={<PricingManager />} />
                <Route path="vendors" element={<VendorsManager />} />
                <Route path="extras" element={<ExtrasManager />} />
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
