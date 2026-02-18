import { Suspense, lazy, useEffect } from 'react';
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

// Lazy load non-critical pages
const Pricing = lazy(() => import("./pages/Pricing"));
const Sizes = lazy(() => import("./pages/Sizes"));
const DumpsterVisualizer = lazy(() => import("./pages/DumpsterVisualizer"));
const Areas = lazy(() => import("./pages/Areas"));
const Materials = lazy(() => import("./pages/Materials"));
const CapacityGuide = lazy(() => import("./pages/CapacityGuide"));
const Contractors = lazy(() => import("./pages/Contractors"));
const ContractorBestPractices = lazy(() => import("./pages/ContractorBestPractices"));
const ContractorResources = lazy(() => import("./pages/ContractorResources"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const Careers = lazy(() => import("./pages/Careers"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Quote = lazy(() => import("./pages/Quote"));
const ContractorQuote = lazy(() => import("./pages/ContractorQuote"));
const QuickOrder = lazy(() => import("./pages/QuickOrder"));
const QuoteSchedule = lazy(() => import("./pages/QuoteSchedule"));
const QuotePayment = lazy(() => import("./pages/QuotePayment"));
const GreenImpactMap = lazy(() => import("./pages/GreenImpactMap"));
const GreenHalo = lazy(() => import("./pages/GreenHalo"));
const Locations = lazy(() => import("./pages/Locations"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const WasteVision = lazy(() => import("./pages/WasteVision"));

// Category Positioning Pages
const WhyLocalYards = lazy(() => import("./pages/WhyLocalYards"));
const NotABroker = lazy(() => import("./pages/NotABroker"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Technology = lazy(() => import("./pages/Technology"));
const StaffLogin = lazy(() => import("./pages/StaffLogin"));
const RoleRouter = lazy(() => import("./pages/RoleRouter"));
const RequestAccess = lazy(() => import("./pages/RequestAccess"));

// SEO Landing Pages
const RegionalLandingPage = lazy(() => import("./pages/RegionalLandingPage"));
const CommercialLandingPage = lazy(() => import("./pages/CommercialLandingPage"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const DumpsterRentalOakland = lazy(() => import("./pages/DumpsterRentalOakland"));
const DumpsterRentalSanJose = lazy(() => import("./pages/DumpsterRentalSanJose"));
const DumpsterRentalSanFrancisco = lazy(() => import("./pages/DumpsterRentalSanFrancisco"));

// Preview Pages (v2 Uber-like experience)
const PreviewQuote = lazy(() => import("./pages/preview/PreviewQuote"));
const PreviewHome = lazy(() => import("./pages/preview/PreviewHome"));

// Customer Portal pages (SMS OTP auth)
const CustomerLogin = lazy(() => import("./pages/portal/CustomerLogin"));
const CustomerDashboard = lazy(() => import("./pages/portal/CustomerDashboard"));
const CustomerOrders = lazy(() => import("./pages/portal/CustomerOrders"));
const CustomerDocuments = lazy(() => import("./pages/portal/CustomerDocuments"));
const CustomerOrderDetail = lazy(() => import("./pages/portal/CustomerOrderDetail"));
const PaymentComplete = lazy(() => import("./pages/portal/PaymentComplete"));
const PortalTrack = lazy(() => import("./pages/portal/PortalTrack"));
const PortalQuoteView = lazy(() => import("./pages/portal/PortalQuoteView"));
const PortalSchedule = lazy(() => import("./pages/portal/PortalSchedule"));
const PortalPay = lazy(() => import("./pages/portal/PortalPay"));

// Portal Auth Guard
import { PortalAuthGuard } from "./components/portal/PortalAuthGuard";

// Green Halo Portal pages (separate - demo only)
const PortalLogin = lazy(() => import("./pages/portal/PortalLogin"));
const PortalDashboard = lazy(() => import("./pages/portal/PortalDashboard"));
const ProjectDetail = lazy(() => import("./pages/portal/ProjectDetail"));
const SustainabilityReport = lazy(() => import("./pages/portal/SustainabilityReport"));

// Admin pages (rarely accessed)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const SetPassword = lazy(() => import("./pages/SetPassword"));
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
const ConfigurationHub = lazy(() => import("./pages/admin/ConfigurationHub"));
const HeavyPricingManager = lazy(() => import("./pages/admin/HeavyPricingManager"));
const MixedRulesManager = lazy(() => import("./pages/admin/MixedRulesManager"));
const WarningsCapsManager = lazy(() => import("./pages/admin/WarningsCapsManager"));
const OrdersManager = lazy(() => import("./pages/admin/OrdersManager"));
const CustomersManager = lazy(() => import("./pages/admin/CustomersManager"));
const AuditLogsPage = lazy(() => import("./pages/admin/AuditLogsPage"));
const AdminGoogleSettings = lazy(() => import("./pages/admin/AdminGoogleSettings"));
const AdminGoogleSetup = lazy(() => import("./pages/admin/AdminGoogleSetup"));
const AdminGoogleLogs = lazy(() => import("./pages/admin/AdminGoogleLogs"));
const AdminMessaging = lazy(() => import("./pages/admin/AdminMessaging"));
const GHLIntegrationPage = lazy(() => import("./pages/admin/GHLIntegrationPage"));
const TollSurchargesManager = lazy(() => import("./pages/admin/TollSurchargesManager"));
const CityRatesManager = lazy(() => import("./pages/admin/CityRatesManager"));
const DriversManager = lazy(() => import("./pages/admin/DriversManager"));
const DispatchCalendar = lazy(() => import("./pages/admin/DispatchCalendar"));
const TicketsManager = lazy(() => import("./pages/admin/TicketsManager"));
const InventoryManager = lazy(() => import("./pages/admin/InventoryManager"));
const AssetsControlTower = lazy(() => import("./pages/admin/AssetsControlTower"));
const MovementsLog = lazy(() => import("./pages/admin/MovementsLog"));
const UsersManager = lazy(() => import("./pages/admin/UsersManager"));
const AccessRequestsPage = lazy(() => import("./pages/admin/AccessRequestsPage"));
const AlertsPage = lazy(() => import("./pages/admin/AlertsPage"));
const FraudFlagsPage = lazy(() => import("./pages/admin/FraudFlagsPage"));
const RiskReviewPage = lazy(() => import("./pages/admin/RiskReviewPage"));
const QuickLinksManager = lazy(() => import("./pages/admin/QuickLinksManager"));
const MarketsManager = lazy(() => import("./pages/admin/MarketsManager"));
const HeavyRiskDashboard = lazy(() => import("./pages/admin/HeavyRiskDashboard"));
const FacilitiesManager = lazy(() => import("./pages/admin/FacilitiesManager"));
const OverdueBillingPage = lazy(() => import("./pages/admin/OverdueBillingPage"));
const ApprovalQueuePage = lazy(() => import("./pages/admin/ApprovalQueuePage"));
const CompensationPage = lazy(() => import("./pages/admin/CompensationPage"));
const ConfigHealthPage = lazy(() => import("./pages/admin/ConfigHealthPage"));
const SecurityHealthPage = lazy(() => import("./pages/admin/SecurityHealthPage"));
const InternalDocsPage = lazy(() => import("./pages/admin/InternalDocsPage"));
const ProfitabilityDashboard = lazy(() => import("./pages/admin/ProfitabilityDashboard"));
const LocationPricingManager = lazy(() => import("./pages/admin/pricing/LocationPricingManager"));
const NewLocationWizard = lazy(() => import("./pages/admin/markets/NewLocationWizard"));
const QaControlCenter = lazy(() => import("./pages/admin/qa/QaControlCenter"));
const WorkflowsExplorer = lazy(() => import("./pages/admin/qa/WorkflowsExplorer"));
const WorkflowGraph = lazy(() => import("./pages/admin/qa/WorkflowGraph"));
const CalculatorLogsPage = lazy(() => import("./pages/admin/CalculatorLogsPage"));
const AdminActivityFeed = lazy(() => import("./pages/admin/AdminActivityFeed"));
const CustomerDetail = lazy(() => import("./pages/admin/CustomerDetail"));
const CustomerHealthDashboard = lazy(() => import("./pages/admin/CustomerHealthDashboard"));
const SearchIndexManager = lazy(() => import("./pages/admin/SearchIndexManager"));
const InternalAlertsPage = lazy(() => import("./pages/admin/InternalAlertsPage"));
const AdminEmailTest = lazy(() => import("./pages/admin/AdminEmailTest"));
const SeoAdminCities = lazy(() => import("./pages/admin/SeoAdminCities"));
const SeoAdminPages = lazy(() => import("./pages/admin/SeoAdminPages"));
const SeoAdminSitemap = lazy(() => import("./pages/admin/SeoAdminSitemap"));
const SeoAdminDashboard = lazy(() => import("./pages/admin/SeoAdminDashboard"));
const GbpDominationPlan = lazy(() => import("./pages/admin/GbpDominationPlan"));
const AdminAIChat = lazy(() => import("./pages/admin/AdminAIChat"));
const SeoHealthPage = lazy(() => import("./pages/admin/SeoHealthPage"));
const SeoIndexingPage = lazy(() => import("./pages/admin/SeoIndexingPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));

// Marketing / Visitor Intelligence
const VisitorsDashboard = lazy(() => import("./pages/admin/marketing/VisitorsDashboard"));
const SessionsDashboard = lazy(() => import("./pages/admin/marketing/SessionsDashboard"));
const GoogleSetupWizard = lazy(() => import("./pages/admin/marketing/GoogleSetupWizard"));
const MarketingDashboard = lazy(() => import("./pages/admin/marketing/MarketingDashboard"));
const GA4DebugPanel = lazy(() => import("./pages/admin/marketing/GA4DebugPanel"));

// SEO City Engine Pages
const SeoCityPage = lazy(() => import("./pages/seo/SeoCityPage"));
const SeoCitySizePage = lazy(() => import("./pages/seo/SeoCitySizePage"));
const SeoCityMaterialPage = lazy(() => import("./pages/seo/SeoCityMaterialPage"));
const SeoZipPage = lazy(() => import("./pages/seo/SeoZipPage"));
const SeoCityJobPage = lazy(() => import("./pages/seo/SeoCityJobPage"));

// Legacy SEO URL redirects
import { LegacySizeRedirect, LegacySubpageRedirect } from './components/seo/SeoLegacyRedirects';

// Internal Calculator
const InternalCalculator = lazy(() => import("./pages/internal/InternalCalculator"));

// Telephony Admin Pages
const CallsManager = lazy(() => import("./pages/admin/CallsManager"));
const PhoneNumbersManager = lazy(() => import("./pages/admin/PhoneNumbersManager"));
const CallAnalyticsPage = lazy(() => import("./pages/admin/CallAnalyticsPage"));
const TelephonyMigration = lazy(() => import("./pages/admin/TelephonyMigration"));
const TelephonyTestCall = lazy(() => import("./pages/admin/TelephonyTestCall"));
const TelephonyImport = lazy(() => import("./pages/admin/TelephonyImport"));
const IntegrationFunctionsMap = lazy(() => import("./pages/admin/IntegrationFunctionsMap"));
const WhatsMissingPage = lazy(() => import("./pages/admin/WhatsMissingPage"));

// Google Ads Admin Pages
const AdsOverview = lazy(() => import("./pages/admin/ads/AdsOverview"));
const AdsCampaigns = lazy(() => import("./pages/admin/ads/AdsCampaigns"));
const AdsRules = lazy(() => import("./pages/admin/ads/AdsRules"));
const AdsMarketsPage = lazy(() => import("./pages/admin/ads/AdsMarketsPage"));
const AdsLogsPage = lazy(() => import("./pages/admin/ads/AdsLogsPage"));

// Admin Dashboards
const DashboardOverview = lazy(() => import("./pages/admin/dashboards/DashboardOverview"));
const AdminSalesDashboard = lazy(() => import("./pages/admin/dashboards/SalesDashboard"));
const AdminOperationsDashboard = lazy(() => import("./pages/admin/dashboards/OperationsDashboard"));
const AdminFinanceDashboard = lazy(() => import("./pages/admin/dashboards/FinanceDashboardPage"));
const AdminCustomersDashboard = lazy(() => import("./pages/admin/dashboards/CustomersDashboard"));
const KPIDashboard = lazy(() => import("./pages/admin/dashboards/KPIDashboard"));
const LeadPerformanceDashboard = lazy(() => import("./pages/admin/dashboards/LeadPerformanceDashboard"));
const LeadEngineSettings = lazy(() => import("./pages/admin/LeadEngineSettings"));
const LeadInbox = lazy(() => import("./pages/sales/LeadInbox"));
const CSLeads = lazy(() => import("./pages/cs/CSLeads"));

// Material Catalog Admin Pages
const MaterialCatalogPage = lazy(() => import("./pages/admin/materials/MaterialCatalogPage"));
const ProjectCategoriesPage = lazy(() => import("./pages/admin/materials/ProjectCategoriesPage"));
const MaterialOffersPage = lazy(() => import("./pages/admin/materials/MaterialOffersPage"));
const CustomerTypeRulesPage = lazy(() => import("./pages/admin/CustomerTypeRulesPage"));
// CS Portal
const CSLayout = lazy(() => import("./pages/cs/CSLayout"));
const CSDashboard = lazy(() => import("./pages/cs/CSDashboard"));
const CSOrders = lazy(() => import("./pages/cs/CSOrders"));
const CSRequests = lazy(() => import("./pages/cs/CSRequests"));
const CSTemplates = lazy(() => import("./pages/cs/CSTemplates"));
const CSMessages = lazy(() => import("./pages/cs/CSMessages"));
const CSCalls = lazy(() => import("./pages/cs/CSCalls"));

// Driver App
const DriverLayout = lazy(() => import("./pages/driver/DriverLayout"));
const DriverHome = lazy(() => import("./pages/driver/DriverHome"));
const DriverRuns = lazy(() => import("./pages/driver/DriverRuns"));
const DriverProfile = lazy(() => import("./pages/driver/DriverProfile"));
const DriverApp = lazy(() => import("./pages/driver/DriverApp"));

// Sales Portal
const SalesLayout = lazy(() => import("./pages/sales/SalesLayout"));
const SalesDashboard = lazy(() => import("./pages/sales/SalesDashboard"));
const SalesLeads = lazy(() => import("./pages/sales/SalesLeads"));
const SalesLeadDetail = lazy(() => import("./pages/sales/LeadDetail"));
const SalesQuotes = lazy(() => import("./pages/sales/SalesQuotes"));
const SalesNewQuote = lazy(() => import("./pages/sales/SalesNewQuote"));
const SalesCalls = lazy(() => import("./pages/sales/SalesCalls"));
const SalesLeadInbox = lazy(() => import("./pages/sales/SalesLeadInbox"));
const OrderBuilder = lazy(() => import("./pages/sales/OrderBuilder"));

// CS Lead Inbox
const CSLeadInbox = lazy(() => import("./pages/cs/CSLeadInbox"));

// Admin Lead Hub
const AdminLeadsHub = lazy(() => import("./pages/admin/AdminLeadsHub"));

// Dispatch Portal
const DispatchLayout = lazy(() => import("./pages/dispatch/DispatchLayout"));
const DispatchDashboard = lazy(() => import("./pages/dispatch/DispatchDashboard"));
const DispatchToday = lazy(() => import("./pages/dispatch/DispatchToday"));
const DispatchCalendarPage = lazy(() => import("./pages/dispatch/DispatchCalendarPage"));
const DispatchFlags = lazy(() => import("./pages/dispatch/DispatchFlags"));
const DispatchRequests = lazy(() => import("./pages/dispatch/DispatchRequests"));
const DispatchRunsCalendar = lazy(() => import("./pages/dispatch/DispatchRunsCalendar"));
const DispatchRunsList = lazy(() => import("./pages/dispatch/DispatchRunsList"));
const DispatchRunDetail = lazy(() => import("./pages/dispatch/DispatchRunDetail"));

// Finance Portal
const FinanceLayout = lazy(() => import("./pages/finance/FinanceLayout"));
const FinanceDashboard = lazy(() => import("./pages/finance/FinanceDashboard"));
const FinanceInvoices = lazy(() => import("./pages/finance/FinanceInvoices"));
const FinanceInvoiceDetail = lazy(() => import("./pages/finance/FinanceInvoiceDetail"));
const FinancePayments = lazy(() => import("./pages/finance/FinancePayments"));
const FinancePaymentDetail = lazy(() => import("./pages/finance/FinancePaymentDetail"));
const FinancePaymentActions = lazy(() => import("./pages/finance/FinancePaymentActions"));
const ARAgingDashboard = lazy(() => import("./pages/finance/ARAgingDashboard"));
const ARAgingInvoices = lazy(() => import("./pages/finance/ARAgingInvoices"));
const ARAgingCustomers = lazy(() => import("./pages/finance/ARAgingCustomers"));

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
              <Route path="/visualizer" element={
                <Suspense fallback={<PageLoader />}><DumpsterVisualizer /></Suspense>
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
              <Route path="/contractor-resources" element={
                <Suspense fallback={<PageLoader />}><ContractorResources /></Suspense>
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
              <Route path="/blog/:articleSlug" element={
                <Suspense fallback={<PageLoader />}><BlogArticle /></Suspense>
              } />
              
              {/* Dynamic Sitemap */}
              <Route path="/sitemap.xml" element={
                <Suspense fallback={<PageLoader />}><SitemapPage /></Suspense>
              } />

              {/* Oakland SEO Domination Page */}
              <Route path="/dumpster-rental-oakland-ca" element={
                <Suspense fallback={<PageLoader />}><DumpsterRentalOakland /></Suspense>
              } />
              {/* San Jose SEO Domination Page */}
              <Route path="/dumpster-rental-san-jose-ca" element={
                <Suspense fallback={<PageLoader />}><DumpsterRentalSanJose /></Suspense>
              } />
              {/* San Francisco SEO Domination Page */}
              <Route path="/dumpster-rental-san-francisco-ca" element={
                <Suspense fallback={<PageLoader />}><DumpsterRentalSanFrancisco /></Suspense>
              } />
              
              {/* Regional & Commercial SEO Pages */}
              <Route path="/dumpster-rental-east-bay" element={
                <Suspense fallback={<PageLoader />}><RegionalLandingPage /></Suspense>
              } />
              <Route path="/dumpster-rental-south-bay" element={
                <Suspense fallback={<PageLoader />}><RegionalLandingPage /></Suspense>
              } />
              <Route path="/commercial-dumpster-rental" element={
                <Suspense fallback={<PageLoader />}><CommercialLandingPage /></Suspense>
              } />
              <Route path="/construction-dumpsters" element={
                <Suspense fallback={<PageLoader />}><CommercialLandingPage /></Suspense>
              } />
              <Route path="/warehouse-cleanout-dumpsters" element={
                <Suspense fallback={<PageLoader />}><CommercialLandingPage /></Suspense>
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
              <Route path="/quote/schedule" element={
                <Suspense fallback={<PageLoader />}><QuoteSchedule /></Suspense>
              } />
              <Route path="/quote/pay" element={
                <Suspense fallback={<PageLoader />}><QuotePayment /></Suspense>
              } />
              <Route path="/quick-order" element={
                <Suspense fallback={<PageLoader />}><QuickOrder /></Suspense>
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
              <Route path="/terms" element={
                <Suspense fallback={<PageLoader />}><Terms /></Suspense>
              } />
              <Route path="/privacy" element={
                <Suspense fallback={<PageLoader />}><Privacy /></Suspense>
              } />
              <Route path="/waste-vision" element={
                <Suspense fallback={<PageLoader />}><WasteVision /></Suspense>
              } />
              
              {/* Category Positioning Pages */}
              <Route path="/why-local-yards" element={
                <Suspense fallback={<PageLoader />}><WhyLocalYards /></Suspense>
              } />
              <Route path="/not-a-broker" element={
                <Suspense fallback={<PageLoader />}><NotABroker /></Suspense>
              } />
              <Route path="/how-it-works" element={
                <Suspense fallback={<PageLoader />}><HowItWorks /></Suspense>
              } />
              <Route path="/technology" element={
                <Suspense fallback={<PageLoader />}><Technology /></Suspense>
              } />
              
              {/* Staff CRM Login Redirect */}
              <Route path="/staff" element={
                <Suspense fallback={<PageLoader />}><StaffLogin /></Suspense>
              } />

              {/* Role Router — post-login redirect */}
              <Route path="/app" element={
                <Suspense fallback={<PageLoader />}><RoleRouter /></Suspense>
              } />

              {/* Request Access — no role assigned */}
              <Route path="/request-access" element={
                <Suspense fallback={<PageLoader />}><RequestAccess /></Suspense>
              } />
              
              {/* SEO City Engine Routes — canonical /dumpster-rental/{citySlug}/... */}
              <Route path="/dumpster-rental/:citySlug" element={
                <Suspense fallback={<PageLoader />}><SeoCityPage /></Suspense>
              } />
              <Route path="/dumpster-rental/:citySlug/:sizeSlug-yard" element={
                <Suspense fallback={<PageLoader />}><SeoCitySizePage /></Suspense>
              } />
              <Route path="/dumpster-rental/:citySlug/:materialSlug" element={
                <Suspense fallback={<PageLoader />}><SeoCityMaterialPage /></Suspense>
              } />

              {/* SEO ZIP Pages */}
              <Route path="/service-area/:zip/dumpster-rental" element={
                <Suspense fallback={<PageLoader />}><SeoZipPage /></Suspense>
              } />

              {/* Legacy URL redirects — 301 to canonical */}
              <Route path="/:citySlug/:sizeSlug-yard-dumpster" element={<LegacySizeRedirect />} />
              <Route path="/:citySlug/:subSlug" element={<LegacySubpageRedirect />} />

              {/* Preview Routes (v2 Uber-like experience) */}
              <Route path="/preview/quote" element={
                <Suspense fallback={<PageLoader />}><PreviewQuote /></Suspense>
              } />
              <Route path="/preview/home" element={
                <Suspense fallback={<PageLoader />}><PreviewHome /></Suspense>
              } />
              
              {/* Customer Portal (SMS OTP Auth) */}
              <Route path="/portal" element={
                <Suspense fallback={<PageLoader />}><CustomerLogin /></Suspense>
              } />
              <Route path="/portal/track" element={
                <Suspense fallback={<PageLoader />}><PortalTrack /></Suspense>
              } />
              <Route path="/portal/dashboard" element={
                <PortalAuthGuard>
                  <Suspense fallback={<PageLoader />}><CustomerDashboard /></Suspense>
                </PortalAuthGuard>
              } />
              <Route path="/portal/orders" element={
                <PortalAuthGuard>
                  <Suspense fallback={<PageLoader />}><CustomerOrders /></Suspense>
                </PortalAuthGuard>
              } />
              <Route path="/portal/documents" element={
                <PortalAuthGuard>
                  <Suspense fallback={<PageLoader />}><CustomerDocuments /></Suspense>
                </PortalAuthGuard>
              } />
              <Route path="/portal/order/:orderId" element={
                <PortalAuthGuard>
                  <Suspense fallback={<PageLoader />}><CustomerOrderDetail /></Suspense>
                </PortalAuthGuard>
              } />
              <Route path="/portal/orders/:orderId" element={
                <PortalAuthGuard>
                  <Suspense fallback={<PageLoader />}><CustomerOrderDetail /></Suspense>
                </PortalAuthGuard>
              } />
              <Route path="/portal/payment-complete" element={
                <PortalAuthGuard>
                  <Suspense fallback={<PageLoader />}><PaymentComplete /></Suspense>
                </PortalAuthGuard>
              } />

              {/* Portal Quote/Schedule/Pay (accessible via SMS links, no OTP required) */}
              <Route path="/portal/quote/:quoteId" element={
                <Suspense fallback={<PageLoader />}><PortalQuoteView /></Suspense>
              } />
              <Route path="/portal/schedule" element={
                <Suspense fallback={<PageLoader />}><PortalSchedule /></Suspense>
              } />
              <Route path="/portal/pay" element={
                <Suspense fallback={<PageLoader />}><PortalPay /></Suspense>
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
              
              {/* Set Password (invite link) */}
              <Route path="/set-password" element={
                <Suspense fallback={<PageLoader />}><SetPassword /></Suspense>
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
                <Route path="configuration" element={
                  <Suspense fallback={<PageLoader />}><ConfigurationHub /></Suspense>
                } />
                <Route path="volume-commitments" element={
                  <Suspense fallback={<PageLoader />}><VolumeCommitmentsManager /></Suspense>
                } />
                <Route path="audit-logs" element={
                  <Suspense fallback={<PageLoader />}><AuditLogsPage /></Suspense>
                } />
                <Route path="google" element={
                  <Suspense fallback={<PageLoader />}><AdminGoogleSettings /></Suspense>
                } />
                <Route path="google/setup" element={
                  <Suspense fallback={<PageLoader />}><AdminGoogleSetup /></Suspense>
                } />
                <Route path="google/logs" element={
                  <Suspense fallback={<PageLoader />}><AdminGoogleLogs /></Suspense>
                } />
                <Route path="messaging" element={
                  <Suspense fallback={<PageLoader />}><AdminMessaging /></Suspense>
                } />
                <Route path="email-test" element={
                  <Suspense fallback={<PageLoader />}><AdminEmailTest /></Suspense>
                } />
                <Route path="ghl" element={
                  <Suspense fallback={<PageLoader />}><GHLIntegrationPage /></Suspense>
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
                <Route path="assets" element={
                  <Suspense fallback={<PageLoader />}><AssetsControlTower /></Suspense>
                } />
                <Route path="movements" element={
                  <Suspense fallback={<PageLoader />}><MovementsLog /></Suspense>
                } />
                <Route path="users" element={
                  <Suspense fallback={<PageLoader />}><UsersManager /></Suspense>
                } />
                <Route path="access-requests" element={
                  <Suspense fallback={<PageLoader />}><AccessRequestsPage /></Suspense>
                } />
                <Route path="alerts" element={
                  <Suspense fallback={<PageLoader />}><AlertsPage /></Suspense>
                } />
                <Route path="fraud-flags" element={
                  <Suspense fallback={<PageLoader />}><FraudFlagsPage /></Suspense>
                } />
                <Route path="risk" element={
                  <Suspense fallback={<PageLoader />}><RiskReviewPage /></Suspense>
                } />
                <Route path="quick-links" element={
                  <Suspense fallback={<PageLoader />}><QuickLinksManager /></Suspense>
                } />
                <Route path="markets" element={
                  <Suspense fallback={<PageLoader />}><MarketsManager /></Suspense>
                } />
                <Route path="markets/new-location" element={
                  <Suspense fallback={<PageLoader />}><NewLocationWizard /></Suspense>
                } />
                <Route path="facilities" element={
                  <Suspense fallback={<PageLoader />}><FacilitiesManager /></Suspense>
                } />
                <Route path="overdue" element={
                  <Suspense fallback={<PageLoader />}><OverdueBillingPage /></Suspense>
                } />
                <Route path="approval-queue" element={
                  <Suspense fallback={<PageLoader />}><ApprovalQueuePage /></Suspense>
                } />
                <Route path="compensation" element={
                  <Suspense fallback={<PageLoader />}><CompensationPage /></Suspense>
                } />
                <Route path="config/health" element={
                  <Suspense fallback={<PageLoader />}><ConfigHealthPage /></Suspense>
                } />
                <Route path="security" element={
                  <Suspense fallback={<PageLoader />}><SecurityHealthPage /></Suspense>
                } />
                <Route path="setup/functions" element={
                  <Suspense fallback={<PageLoader />}><IntegrationFunctionsMap /></Suspense>
                } />
                <Route path="setup/what-missing" element={
                  <Suspense fallback={<PageLoader />}><WhatsMissingPage /></Suspense>
                } />
                <Route path="setup/search-index" element={
                  <Suspense fallback={<PageLoader />}><SearchIndexManager /></Suspense>
                } />
                {/* Material Catalog Admin Pages */}
                <Route path="materials/catalog" element={
                  <Suspense fallback={<PageLoader />}><MaterialCatalogPage /></Suspense>
                } />
                <Route path="materials/categories" element={
                  <Suspense fallback={<PageLoader />}><ProjectCategoriesPage /></Suspense>
                } />
                <Route path="materials/offers" element={
                  <Suspense fallback={<PageLoader />}><MaterialOffersPage /></Suspense>
                } />
                <Route path="customer-type-rules" element={
                  <Suspense fallback={<PageLoader />}><CustomerTypeRulesPage /></Suspense>
                } />
                <Route path="activity" element={
                  <Suspense fallback={<PageLoader />}><AdminActivityFeed /></Suspense>
                } />
                <Route path="customers/:id" element={
                  <Suspense fallback={<PageLoader />}><CustomerDetail /></Suspense>
                } />
                <Route path="customer-health" element={
                  <Suspense fallback={<PageLoader />}><CustomerHealthDashboard /></Suspense>
                } />
                <Route path="heavy-risk" element={
                  <Suspense fallback={<PageLoader />}><HeavyRiskDashboard /></Suspense>
                } />
                <Route path="profitability" element={
                  <Suspense fallback={<PageLoader />}><ProfitabilityDashboard /></Suspense>
                } />
                <Route path="pricing/locations" element={
                  <Suspense fallback={<PageLoader />}><LocationPricingManager /></Suspense>
                } />
                {/* Telephony Routes */}
                <Route path="telephony/calls" element={
                  <Suspense fallback={<PageLoader />}><CallsManager /></Suspense>
                } />
                <Route path="telephony/numbers" element={
                  <Suspense fallback={<PageLoader />}><PhoneNumbersManager /></Suspense>
                } />
                <Route path="telephony/analytics" element={
                  <Suspense fallback={<PageLoader />}><CallAnalyticsPage /></Suspense>
                } />
                <Route path="telephony/migration" element={
                  <Suspense fallback={<PageLoader />}><TelephonyMigration /></Suspense>
                } />
                <Route path="telephony/test" element={
                  <Suspense fallback={<PageLoader />}><TelephonyTestCall /></Suspense>
                } />
                <Route path="telephony/import" element={
                  <Suspense fallback={<PageLoader />}><TelephonyImport /></Suspense>
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
                <Route path="dashboards/leads" element={
                  <Suspense fallback={<PageLoader />}><LeadPerformanceDashboard /></Suspense>
                } />
                <Route path="leads/settings" element={
                  <Suspense fallback={<PageLoader />}><LeadEngineSettings /></Suspense>
                } />
                {/* Google Ads Routes */}
                <Route path="ads" element={
                  <Suspense fallback={<PageLoader />}><AdsOverview /></Suspense>
                } />
                <Route path="ads/overview" element={
                  <Suspense fallback={<PageLoader />}><AdsOverview /></Suspense>
                } />
                <Route path="ads/campaigns" element={
                  <Suspense fallback={<PageLoader />}><AdsCampaigns /></Suspense>
                } />
                <Route path="ads/rules" element={
                  <Suspense fallback={<PageLoader />}><AdsRules /></Suspense>
                } />
                <Route path="ads/markets" element={
                  <Suspense fallback={<PageLoader />}><AdsMarketsPage /></Suspense>
                } />
                <Route path="ads/logs" element={
                  <Suspense fallback={<PageLoader />}><AdsLogsPage /></Suspense>
                } />
                {/* Internal Documentation */}
                <Route path="docs" element={
                  <Suspense fallback={<PageLoader />}><InternalDocsPage /></Suspense>
                } />
                {/* Calculator Logs */}
                <Route path="calculator/logs" element={
                  <Suspense fallback={<PageLoader />}><CalculatorLogsPage /></Suspense>
                } />
                {/* Internal Alerts */}
                <Route path="notifications/internal" element={
                  <Suspense fallback={<PageLoader />}><InternalAlertsPage /></Suspense>
                } />
                {/* QA Control Center */}
                <Route path="qa/control-center" element={
                  <Suspense fallback={<PageLoader />}><QaControlCenter /></Suspense>
                } />
                <Route path="qa/workflows" element={
                  <Suspense fallback={<PageLoader />}><WorkflowsExplorer /></Suspense>
                } />
                {/* SEO Admin Routes */}
                <Route path="seo/dashboard" element={
                  <Suspense fallback={<PageLoader />}><SeoAdminDashboard /></Suspense>
                } />
                <Route path="seo/cities" element={
                  <Suspense fallback={<PageLoader />}><SeoAdminCities /></Suspense>
                } />
                <Route path="seo/pages" element={
                  <Suspense fallback={<PageLoader />}><SeoAdminPages /></Suspense>
                } />
                <Route path="seo/sitemap" element={
                  <Suspense fallback={<PageLoader />}><SeoAdminSitemap /></Suspense>
                } />
                <Route path="seo/gbp-plan" element={
                  <Suspense fallback={<PageLoader />}><GbpDominationPlan /></Suspense>
                } />
                <Route path="seo/health" element={
                  <Suspense fallback={<PageLoader />}><SeoHealthPage /></Suspense>
                } />
                <Route path="seo/indexing" element={
                  <Suspense fallback={<PageLoader />}><SeoIndexingPage /></Suspense>
                } />
                <Route path="qa/workflow-graph" element={
                  <Suspense fallback={<PageLoader />}><WorkflowGraph /></Suspense>
                } />
                <Route path="ai/chat" element={
                  <Suspense fallback={<PageLoader />}><AdminAIChat /></Suspense>
                } />
                {/* Marketing / Visitor Intelligence */}
                <Route path="marketing/visitors" element={
                  <Suspense fallback={<PageLoader />}><VisitorsDashboard /></Suspense>
                } />
                <Route path="marketing/sessions" element={
                  <Suspense fallback={<PageLoader />}><SessionsDashboard /></Suspense>
                } />
                <Route path="marketing/google-setup" element={
                  <Suspense fallback={<PageLoader />}><GoogleSetupWizard /></Suspense>
                } />
                <Route path="marketing/dashboard" element={
                  <Suspense fallback={<PageLoader />}><MarketingDashboard /></Suspense>
                } />
                <Route path="marketing/ga4-debug" element={
                  <Suspense fallback={<PageLoader />}><GA4DebugPanel /></Suspense>
                } />
              </Route>

              {/* Driver App with Layout */}
              <Route path="/driver" element={
                <Suspense fallback={<PageLoader />}><DriverLayout /></Suspense>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoader />}><DriverHome /></Suspense>
                } />
                <Route path="runs" element={
                  <Suspense fallback={<PageLoader />}><DriverRuns /></Suspense>
                } />
                <Route path="profile" element={
                  <Suspense fallback={<PageLoader />}><DriverProfile /></Suspense>
                } />
              </Route>
              
              {/* Legacy Driver App (standalone) */}
              <Route path="/driver/legacy" element={
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
                <Route path="leads/:id" element={
                  <Suspense fallback={<PageLoader />}><SalesLeadDetail /></Suspense>
                } />
                <Route path="quotes" element={
                  <Suspense fallback={<PageLoader />}><SalesQuotes /></Suspense>
                } />
                <Route path="quotes/new" element={
                  <Suspense fallback={<PageLoader />}><SalesNewQuote /></Suspense>
                } />
                <Route path="calls" element={
                  <Suspense fallback={<PageLoader />}><SalesCalls /></Suspense>
                } />
                <Route path="inbox" element={
                  <Suspense fallback={<PageLoader />}><LeadInbox /></Suspense>
                } />
                <Route path="lead-hub" element={
                  <Suspense fallback={<PageLoader />}><SalesLeadInbox /></Suspense>
                } />
                <Route path="order-builder" element={
                  <Suspense fallback={<PageLoader />}><OrderBuilder /></Suspense>
                } />
              </Route>

              {/* Dispatch Portal */}
              <Route path="/dispatch" element={
                <Suspense fallback={<PageLoader />}><DispatchLayout /></Suspense>
              }>
                <Route index element={
                  <Suspense fallback={<PageLoader />}><DispatchDashboard /></Suspense>
                } />
                <Route path="today" element={
                  <Suspense fallback={<PageLoader />}><DispatchToday /></Suspense>
                } />
                <Route path="calendar" element={
                  <Suspense fallback={<PageLoader />}><DispatchCalendarPage /></Suspense>
                } />
                <Route path="flags" element={
                  <Suspense fallback={<PageLoader />}><DispatchFlags /></Suspense>
                } />
                <Route path="requests" element={
                  <Suspense fallback={<PageLoader />}><DispatchRequests /></Suspense>
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
                <Route path="payments/:paymentId" element={
                  <Suspense fallback={<PageLoader />}><FinancePaymentDetail /></Suspense>
                } />
                <Route path="payment-actions" element={
                  <Suspense fallback={<PageLoader />}><FinancePaymentActions /></Suspense>
                } />
                <Route path="ar-aging" element={
                  <Suspense fallback={<PageLoader />}><ARAgingDashboard /></Suspense>
                } />
                <Route path="ar-aging/invoices" element={
                  <Suspense fallback={<PageLoader />}><ARAgingInvoices /></Suspense>
                } />
                <Route path="ar-aging/customers" element={
                  <Suspense fallback={<PageLoader />}><ARAgingCustomers /></Suspense>
                } />
              </Route>

              {/* Payment redirect page */}
              <Route path="/portal/pay/:paymentId" element={
                <Suspense fallback={<PageLoader />}><PaymentRedirect /></Suspense>
              } />

              {/* Internal Calculator — canonical route */}
              <Route path="/internal/calculator" element={
                <Suspense fallback={<PageLoader />}><InternalCalculator /></Suspense>
              } />
              {/* Calculator route aliases */}
              <Route path="/ops/calculator" element={
                <Suspense fallback={<PageLoader />}><InternalCalculator /></Suspense>
              } />
              <Route path="/sales/calculator" element={
                <Suspense fallback={<PageLoader />}><InternalCalculator /></Suspense>
              } />
              <Route path="/cs/calculator" element={
                <Suspense fallback={<PageLoader />}><InternalCalculator /></Suspense>
              } />
              <Route path="/dispatch/calculator" element={
                <Suspense fallback={<PageLoader />}><InternalCalculator /></Suspense>
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
};

export default App;