import { useEffect } from 'react';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineSyncBadge } from '@/components/pwa/OfflineSyncBadge';
import { SWUpdatePrompt } from '@/components/pwa/SWUpdatePrompt';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { captureAttribution } from "@/lib/attributionTracker";
import { initTracking } from "@/lib/trackingService";
import { initVisitorTracking } from "@/lib/visitorTracker";
import { usePageTracking } from "@/lib/analytics/usePageTracking";

// Critical pages loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Route modules
import { getPublicRoutes } from './routes/publicRoutes';
import { getSeoRoutes } from './routes/seoRoutes';
import { getPortalRoutes } from './routes/portalRoutes';
import { getAdminRoutes } from './routes/adminRoutes';
import {
  getDriverRoutes,
  getCsRoutes,
  getSalesRoutes,
  getDispatchRoutes,
  getFinanceRoutes,
  getCalculatorRoutes,
} from './routes/departmentRoutes';

// Page loading fallback
import { PageLoader } from './routes/shared';

const queryClient = new QueryClient();

// SPA page view tracker (must be inside BrowserRouter)
function PageTracker() {
  usePageTracking();
  return null;
}

const App = () => {
  useEffect(() => {
    captureAttribution();
    initTracking();
    initVisitorTracking();
  }, []);

  return (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageTracker />
            <InstallPrompt />
            <OfflineSyncBadge />
            <SWUpdatePrompt />
            <Routes>
              {/* Home page */}
              <Route path="/" element={<Index />} />
              
              {/* Public pages */}
              {getPublicRoutes()}
              
              {/* SEO pages */}
              {getSeoRoutes()}
              
              {/* Portal pages */}
              {getPortalRoutes()}
              
              {/* Admin panel */}
              {getAdminRoutes()}
              
              {/* Department portals */}
              {getDriverRoutes()}
              {getCsRoutes()}
              {getSalesRoutes()}
              {getDispatchRoutes()}
              {getFinanceRoutes()}
              
              {/* Internal calculator aliases */}
              {getCalculatorRoutes()}
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
</ErrorBoundary>
  );
};

export default App;
