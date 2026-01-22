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
const CustomerOrders = lazy(() => import("./pages/portal/CustomerOrders"));
const CustomerDocuments = lazy(() => import("./pages/portal/CustomerDocuments"));
const CustomerOrderDetail = lazy(() => import("./pages/portal/CustomerOrderDetail"));
const PaymentComplete = lazy(() => import("./pages/portal/PaymentComplete"));
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
const ConfigIndex = lazy(() => import("./pages/admin/ConfigIndex"));
const HeavyPricingManager = lazy(() => import("./pages/admin/HeavyPricingManager"));
const MixedRulesManager = lazy(() => import("./pages/admin/MixedRulesManager"));
const WarningsCapsManager = lazy(() => import("./pages/admin/WarningsCapsManager"));
const OrdersManager = lazy(() => import("./pages/admin/OrdersManager"));
const CustomersManager = lazy(() => import("./pages/admin/CustomersManager"));
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogsPage"));
const TollSurchargesManager = lazy(() => import("./pages/admin/TollSurchargesManager"));
const CityRatesManager = lazy(() => import("./pages/admin/CityRatesManager"));
const DriversManager = lazy(() => import("./pages/admin/DriversManager"));
const DispatchCalendar = lazy(() => import("./pages/admin/DispatchCalendar"));
const TicketsManager = lazy(() => import("./pages/admin/TicketsManager"));
const InventoryManager = lazy(() => import("./pages/admin/InventoryManager"));
const UsersManager = lazy(() => import("./pages/admin/UsersManager"));
const AlertsPage = lazy(() => import("./pages/admin/AlertsPage"));

// Admin Dashboards
const DashboardOverview = lazy(() => import("./pages/admin/dashboards/DashboardOverview"));
const AdminSalesDashboard = lazy(() => import("./pages/admin/dashboards/SalesDashboard"));
const AdminOperationsDashboard = lazy(() => import("./pages/admin/dashboards/OperationsDashboard"));
const AdminFinanceDashboard = lazy(() => import("./pages/admin/dashboards/FinanceDashboardPage"));
const AdminCustomersDashboard = lazy(() => import("./pages/admin/dashboards/CustomersDashboard"));
const KPIDashboard = lazy(() => import("./pages/admin/dashboards/KPIDashboard"));

// CS Portal
const CSLayout = lazy(() => import("./pages/cs/CSLayout"));
const CSDashboard = lazy(() => import("./pages/cs/CSDashboard"));
const CSOrders = lazy(() => import("./pages/cs/CSOrders"));
const CSRequests = lazy(() => import("./pages/cs/CSRequests"));
const CSTemplates = lazy(() => import("./pages/cs/CSTemplates"));
const CSMessages = lazy(() => import("./pages/cs/CSMessages"));

// Driver App
const DriverApp = lazy(() => import("./pages/driver/DriverApp"));

// Sales Portal
const SalesLayout = lazy(() => import("./pages/sales/SalesLayout"));
const SalesDashboard = lazy(() => import("./pages/sales/SalesDashboard"));
const SalesLeads = lazy(() => import("./pages/sales/SalesLeads"));
const SalesQuotes = lazy(() => import("./pages/sales/SalesQuotes"));

// Finance Portal
const FinanceLayout = lazy(() => import("./pages/finance/FinanceLayout"));
const FinanceDashboard = lazy(() => import("./pages/finance/FinanceDashboard"));
const FinanceInvoices = lazy(() => import("./pages/finance/FinanceInvoices"));
const FinanceInvoiceDetail = lazy(() => import("./pages/finance/FinanceInvoiceDetail"));
const FinancePayments = lazy(() => import("./pages/finance/FinancePayments"));

// Payment redirect page
const PaymentRedirect = lazy(() => import("./pages/portal/PaymentRedirect"));

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
              <Route path="/portal/orders" element={
                <Suspense fallback={<PageLoader />}><CustomerOrders /></Suspense>
              } />
              <Route path="/portal/documents" element={
                <Suspense fallback={<PageLoader />}><CustomerDocuments /></Suspense>
              } />
              <Route path="/portal/order/:orderId" element={
                <Suspense fallback={<PageLoader />}><CustomerOrderDetail /></Suspense>
              } />
              <Route path="/portal/orders/:orderId" element={
                <Suspense fallback={<PageLoader />}><CustomerOrderDetail /></Suspense>
              } />
              <Route path="/portal/payment-complete" element={
                <Suspense fallback={<PageLoader />}><PaymentComplete /></Suspense>
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
                <Route path="toll-surcharges" element={
                  <Suspense fallback={<PageLoader />}><TollSurchargesManager /></Suspense>
                } />
                <Route path="city-rates" element={
                  <Suspense fallback={<PageLoader />}><CityRatesManager /></Suspense>
                } />
                <Route path="drivers" element={
                  <Suspense fallback={<PageLoader />}><DriversManager /></Suspense>
                } />
                <Route path="dispatch" element={
                  <Suspense fallback={<PageLoader />}><DispatchCalendar /></Suspense>
                } />
                <Route path="tickets" element={
                  <Suspense fallback={<PageLoader />}><TicketsManager /></Suspense>
                } />
                <Route path="inventory" element={
                  <Suspense fallback={<PageLoader />}><InventoryManager /></Suspense>
                } />
                <Route path="users" element={
                  <Suspense fallback={<PageLoader />}><UsersManager /></Suspense>
                } />
                <Route path="alerts" element={
                  <Suspense fallback={<PageLoader />}><AlertsPage /></Suspense>
                } />
                {/* Admin Dashboards */}
                <Route path="dashboards/overview" element={
                  <Suspense fallback={<PageLoader />}><DashboardOverview /></Suspense>
                } />
                <Route path="dashboards/sales" element={
                  <Suspense fallback={<PageLoader />}><AdminSalesDashboard /></Suspense>
                } />
                <Route path="dashboards/operations" element={
                  <Suspense fallback={<PageLoader />}><AdminOperationsDashboard /></Suspense>
                } />
                <Route path="dashboards/finance" element={
                  <Suspense fallback={<PageLoader />}><AdminFinanceDashboard /></Suspense>
                } />
                <Route path="dashboards/customers" element={
                  <Suspense fallback={<PageLoader />}><AdminCustomersDashboard /></Suspense>
                } />
                <Route path="dashboards/kpis" element={
                  <Suspense fallback={<PageLoader />}><KPIDashboard /></Suspense>
                } />
              </Route>

              {/* Driver App */}
              <Route path="/driver" element={
                <Suspense fallback={<PageLoader />}><DriverApp /></Suspense>
              } />

              {/* Sales Portal */}
              <Route path="/sales" element={
                <Suspense fallback={<PageLoader />}><SalesLayout /></Suspense>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoader />}><SalesDashboard /></Suspense>
                } />
                <Route path="leads" element={
                  <Suspense fallback={<PageLoader />}><SalesLeads /></Suspense>
                } />
                <Route path="quotes" element={
                  <Suspense fallback={<PageLoader />}><SalesQuotes /></Suspense>
                } />
              </Route>

              {/* Finance Portal */}
              <Route path="/finance" element={
                <Suspense fallback={<PageLoader />}><FinanceLayout /></Suspense>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoader />}><FinanceDashboard /></Suspense>
                } />
                <Route path="invoices" element={
                  <Suspense fallback={<PageLoader />}><FinanceInvoices /></Suspense>
                } />
                <Route path="invoices/:orderId" element={
                  <Suspense fallback={<PageLoader />}><FinanceInvoiceDetail /></Suspense>
                } />
                <Route path="payments" element={
                  <Suspense fallback={<PageLoader />}><FinancePayments /></Suspense>
                } />
              </Route>

              {/* Payment redirect page */}
              <Route path="/portal/pay/:paymentId" element={
                <Suspense fallback={<PageLoader />}><PaymentRedirect /></Suspense>
              } />
              
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