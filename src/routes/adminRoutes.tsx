import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { SuspenseRoute } from './shared';

// Admin Layout & Core
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const ControlCenter = lazy(() => import("@/pages/admin/ControlCenter"));
const CalsanControlCenter = lazy(() => import("@/pages/admin/CalsanControlCenter"));

// AI Pages
const AIPerformanceDashboard = lazy(() => import("@/pages/admin/AIPerformanceDashboard"));
const AIControlCenter = lazy(() => import("@/pages/admin/ai/AIControlCenter"));
const AISalesCopilot = lazy(() => import("@/pages/admin/ai/AISalesCopilot"));
const AICsCopilot = lazy(() => import("@/pages/admin/ai/AICsCopilot"));
const AIDispatchCopilot = lazy(() => import("@/pages/admin/ai/AIDispatchCopilot"));
const AIDriverCopilot = lazy(() => import("@/pages/admin/ai/AIDriverCopilot"));
const AIFleetCopilot = lazy(() => import("@/pages/admin/ai/AIFleetCopilot"));
const AIFinanceCopilot = lazy(() => import("@/pages/admin/ai/AIFinanceCopilot"));
const AISeoCopilot = lazy(() => import("@/pages/admin/ai/AISeoCopilot"));
const AIAdminCopilot = lazy(() => import("@/pages/admin/ai/AIAdminCopilot"));
const AdminAIChat = lazy(() => import("@/pages/admin/AdminAIChat"));

// Core Management
const ZonesManager = lazy(() => import("@/pages/admin/ZonesManager"));
// PricingManager now loaded inside MasterPricingHub
const MasterPricingHub = lazy(() => import("@/pages/admin/MasterPricingHub"));
const VendorsManager = lazy(() => import("@/pages/admin/VendorsManager"));
const ExtrasManager = lazy(() => import("@/pages/admin/ExtrasManager"));
// VolumeCommitmentsManager, HeavyPricingManager, MixedRulesManager, WarningsCapsManager now loaded inside MasterPricingHub
const YardsManager = lazy(() => import("@/pages/admin/YardsManager"));
const ConfigManager = lazy(() => import("@/pages/admin/ConfigManager"));
const ConfigurationHub = lazy(() => import("@/pages/admin/ConfigurationHub"));
const OrdersManager = lazy(() => import("@/pages/admin/OrdersManager"));
const CustomersManager = lazy(() => import("@/pages/admin/CustomersManager"));
const AuditLogsPage = lazy(() => import("@/pages/admin/AuditLogsPage"));
const AdminGoogleSettings = lazy(() => import("@/pages/admin/AdminGoogleSettings"));
const AdminGoogleSetup = lazy(() => import("@/pages/admin/AdminGoogleSetup"));
const AdminGoogleLogs = lazy(() => import("@/pages/admin/AdminGoogleLogs"));
const AdminMessaging = lazy(() => import("@/pages/admin/AdminMessaging"));
const GHLIntegrationPage = lazy(() => import("@/pages/admin/GHLIntegrationPage"));
// TollSurchargesManager, CityRatesManager now loaded inside MasterPricingHub
const DriversManager = lazy(() => import("@/pages/admin/DriversManager"));
const DispatchCalendar = lazy(() => import("@/pages/admin/DispatchCalendar"));
const TicketsManager = lazy(() => import("@/pages/admin/TicketsManager"));
const InventoryManager = lazy(() => import("@/pages/admin/InventoryManager"));
const AssetsControlTower = lazy(() => import("@/pages/admin/AssetsControlTower"));
const FleetCamerasManager = lazy(() => import("@/pages/admin/FleetCamerasManager"));
const MovementsLog = lazy(() => import("@/pages/admin/MovementsLog"));
const UsersManager = lazy(() => import("@/pages/admin/UsersManager"));
const AccessRequestsPage = lazy(() => import("@/pages/admin/AccessRequestsPage"));
const AlertsPage = lazy(() => import("@/pages/admin/AlertsPage"));
const FraudFlagsPage = lazy(() => import("@/pages/admin/FraudFlagsPage"));
const RiskReviewPage = lazy(() => import("@/pages/admin/RiskReviewPage"));
const QuickLinksManager = lazy(() => import("@/pages/admin/QuickLinksManager"));
const MarketsManager = lazy(() => import("@/pages/admin/MarketsManager"));
const HeavyRiskDashboard = lazy(() => import("@/pages/admin/HeavyRiskDashboard"));
const FacilitiesManager = lazy(() => import("@/pages/admin/FacilitiesManager"));
const DisposalSearchPage = lazy(() => import("@/pages/admin/DisposalSearchPage"));
const OverdueBillingPage = lazy(() => import("@/pages/admin/OverdueBillingPage"));
const ApprovalQueuePage = lazy(() => import("@/pages/admin/ApprovalQueuePage"));
const CompensationPage = lazy(() => import("@/pages/admin/CompensationPage"));
const ConfigHealthPage = lazy(() => import("@/pages/admin/ConfigHealthPage"));
const SecurityHealthPage = lazy(() => import("@/pages/admin/SecurityHealthPage"));
const InternalDocsPage = lazy(() => import("@/pages/admin/InternalDocsPage"));
const ProfitabilityDashboard = lazy(() => import("@/pages/admin/ProfitabilityDashboard"));
const NotificationConfigPage = lazy(() => import("@/pages/admin/NotificationConfigPage"));
const AdminEmailTest = lazy(() => import("@/pages/admin/AdminEmailTest"));
const IntegrationFunctionsMap = lazy(() => import("@/pages/admin/IntegrationFunctionsMap"));
const WhatsMissingPage = lazy(() => import("@/pages/admin/WhatsMissingPage"));
const SearchIndexManager = lazy(() => import("@/pages/admin/SearchIndexManager"));
const InternalAlertsPage = lazy(() => import("@/pages/admin/InternalAlertsPage"));
const CalculatorLogsPage = lazy(() => import("@/pages/admin/CalculatorLogsPage"));
const AdminActivityFeed = lazy(() => import("@/pages/admin/AdminActivityFeed"));
const CustomerDetail = lazy(() => import("@/pages/admin/CustomerDetail"));
const CustomerForm = lazy(() => import("@/pages/admin/CustomerForm"));
const CustomerHealthDashboard = lazy(() => import("@/pages/admin/CustomerHealthDashboard"));
// CustomerTypeRulesPage now loaded inside MasterPricingHub
const ActivationDashboard = lazy(() => import("@/pages/admin/ActivationDashboard"));
const ExecutiveDashboard = lazy(() => import("@/pages/admin/ExecutiveDashboard"));
const BusinessIntelligenceDashboard = lazy(() => import("@/pages/admin/BusinessIntelligenceDashboard"));
const SalesPerformanceDashboard = lazy(() => import("@/pages/admin/SalesPerformanceDashboard"));
const AdminLeadsHub = lazy(() => import("@/pages/admin/AdminLeadsHub"));
const LeadsHealthDashboard = lazy(() => import("@/pages/admin/LeadsHealthDashboard"));
const SystemResetPage = lazy(() => import("@/pages/admin/SystemResetPage"));
const EmailConfigPanel = lazy(() => import("@/pages/admin/EmailConfigPanel"));
const VehicleProfile = lazy(() => import("@/pages/admin/VehicleProfile"));

// Pricing Sub-pages
// Pricing sub-pages now loaded inside MasterPricingHub (lazy-loaded there)


// Markets
const NewLocationWizard = lazy(() => import("@/pages/admin/markets/NewLocationWizard"));

// QA Pages
const QaControlCenter = lazy(() => import("@/pages/admin/qa/QaControlCenter"));
const WorkflowsExplorer = lazy(() => import("@/pages/admin/qa/WorkflowsExplorer"));
const WorkflowGraph = lazy(() => import("@/pages/admin/qa/WorkflowGraph"));
const PhotoAITest = lazy(() => import("@/pages/admin/qa/PhotoAITest"));
const BuildInfo = lazy(() => import("@/pages/admin/qa/BuildInfo"));
const EnvHealth = lazy(() => import("@/pages/admin/qa/EnvHealth"));
const BuildHealth = lazy(() => import("@/pages/admin/qa/BuildHealth"));

const RouteHealthPage = lazy(() => import("@/pages/admin/qa/RouteHealthPage"));
const DuplicatePagesPage = lazy(() => import("@/pages/admin/qa/DuplicatePagesPage"));
const PublicVsCrmPage = lazy(() => import("@/pages/admin/qa/PublicVsCrmPage"));
const PageOrganizationPage = lazy(() => import("@/pages/admin/qa/PageOrganizationPage"));
const DomainHealth = lazy(() => import("@/pages/admin/qa/DomainHealth"));

// SEO Admin
const SeoAdminCities = lazy(() => import("@/pages/admin/SeoAdminCities"));
const SeoAdminPages = lazy(() => import("@/pages/admin/SeoAdminPages"));
const SeoAdminSitemap = lazy(() => import("@/pages/admin/SeoAdminSitemap"));
const SeoAdminDashboard = lazy(() => import("@/pages/admin/SeoAdminDashboard"));
const GbpDominationPlan = lazy(() => import("@/pages/admin/GbpDominationPlan"));
const SeoHealthPage = lazy(() => import("@/pages/admin/SeoHealthPage"));
const SeoRepairPage = lazy(() => import("@/pages/admin/SeoRepairPage"));
const SeoIndexingPage = lazy(() => import("@/pages/admin/SeoIndexingPage"));
const SeoQueuePage = lazy(() => import("@/pages/admin/SeoQueuePage"));
const SeoRulesPage = lazy(() => import("@/pages/admin/SeoRulesPage"));
const SeoMetricsPage = lazy(() => import("@/pages/admin/SeoMetricsPage"));
const SeoGeneratePage = lazy(() => import("@/pages/admin/SeoGeneratePage"));
const SeoGridPage = lazy(() => import("@/pages/admin/SeoGridPage"));
const SeoAuditDashboard = lazy(() => import("@/pages/admin/SeoAuditDashboard"));

// Local Search Admin
const LocalDashboard = lazy(() => import("@/pages/admin/local/LocalDashboard"));
const GoogleBusinessPage = lazy(() => import("@/pages/admin/local/GoogleBusinessPage"));
const BingPlacesPage = lazy(() => import("@/pages/admin/local/BingPlacesPage"));
const AppleBusinessPage = lazy(() => import("@/pages/admin/local/AppleBusinessPage"));
const ReviewsEnginePage = lazy(() => import("@/pages/admin/local/ReviewsEnginePage"));
const PhotosEnginePage = lazy(() => import("@/pages/admin/local/PhotosEnginePage"));
const CitationsPage = lazy(() => import("@/pages/admin/local/CitationsPage"));

// Marketing / Visitor Intelligence
const VisitorsDashboard = lazy(() => import("@/pages/admin/marketing/VisitorsDashboard"));
const SessionsDashboard = lazy(() => import("@/pages/admin/marketing/SessionsDashboard"));
const GoogleSetupWizard = lazy(() => import("@/pages/admin/marketing/GoogleSetupWizard"));
const MarketingDashboard = lazy(() => import("@/pages/admin/marketing/MarketingDashboard"));
const GA4DebugPanel = lazy(() => import("@/pages/admin/marketing/GA4DebugPanel"));

// Dashboards
const DashboardOverview = lazy(() => import("@/pages/admin/dashboards/DashboardOverview"));
const AdminSalesDashboard = lazy(() => import("@/pages/admin/dashboards/SalesDashboard"));
const AdminOperationsDashboard = lazy(() => import("@/pages/admin/dashboards/OperationsDashboard"));
const AdminFinanceDashboard = lazy(() => import("@/pages/admin/dashboards/FinanceDashboardPage"));
const AdminCustomersDashboard = lazy(() => import("@/pages/admin/dashboards/CustomersDashboard"));
const KPIDashboard = lazy(() => import("@/pages/admin/dashboards/KPIDashboard"));
const LeadPerformanceDashboard = lazy(() => import("@/pages/admin/dashboards/LeadPerformanceDashboard"));
const LeadEngineSettings = lazy(() => import("@/pages/admin/LeadEngineSettings"));

// Telephony
const CallsManager = lazy(() => import("@/pages/admin/CallsManager"));
const PhoneNumbersManager = lazy(() => import("@/pages/admin/PhoneNumbersManager"));
const CallAnalyticsPage = lazy(() => import("@/pages/admin/CallAnalyticsPage"));
const TelephonyMigration = lazy(() => import("@/pages/admin/TelephonyMigration"));
const TelephonyTestCall = lazy(() => import("@/pages/admin/TelephonyTestCall"));
const TelephonyImport = lazy(() => import("@/pages/admin/TelephonyImport"));

// Google Ads
const AdsOverview = lazy(() => import("@/pages/admin/ads/AdsOverview"));
const AdsCampaigns = lazy(() => import("@/pages/admin/ads/AdsCampaigns"));
const AdsRules = lazy(() => import("@/pages/admin/ads/AdsRules"));
const AdsMarketsPage = lazy(() => import("@/pages/admin/ads/AdsMarketsPage"));
const AdsLogsPage = lazy(() => import("@/pages/admin/ads/AdsLogsPage"));

// Material Catalog
const MaterialCatalogPage = lazy(() => import("@/pages/admin/materials/MaterialCatalogPage"));
const ProjectCategoriesPage = lazy(() => import("@/pages/admin/materials/ProjectCategoriesPage"));
const MaterialOffersPage = lazy(() => import("@/pages/admin/materials/MaterialOffersPage"));

// Config Sub-pages
const LocationsConfig = lazy(() => import("@/pages/admin/config/LocationsConfig"));
const SocialLinksConfig = lazy(() => import("@/pages/admin/config/SocialLinksConfig"));
const AIEstimatorTemplates = lazy(() => import("@/pages/admin/config/AIEstimatorTemplates"));

// Maintenance
const MaintenanceDashboard = lazy(() => import("@/pages/admin/maintenance/MaintenanceDashboard"));
const MaintenanceTrucks = lazy(() => import("@/pages/admin/maintenance/MaintenanceTrucks"));
const MaintenanceIssues = lazy(() => import("@/pages/admin/maintenance/MaintenanceIssues"));
const MaintenanceWorkOrders = lazy(() => import("@/pages/admin/maintenance/MaintenanceWorkOrders"));

// Dispatch (via admin)
const FacilitiesFinder = lazy(() => import("@/pages/dispatch/FacilitiesFinder"));

export function getAdminRoutes() {
  return [
    <Route key="admin-login" path="/admin/login" element={<SuspenseRoute><AdminLogin /></SuspenseRoute>} />,
    <Route key="admin" path="/admin" element={<SuspenseRoute><AdminLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><CalsanControlCenter /></SuspenseRoute>} />
      <Route path="control-center" element={<Navigate to="/admin" replace />} />
      <Route path="modules" element={<SuspenseRoute><ControlCenter /></SuspenseRoute>} />
      <Route path="legacy-dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="orders" element={<SuspenseRoute><OrdersManager /></SuspenseRoute>} />
      <Route path="customers" element={<SuspenseRoute><CustomersManager /></SuspenseRoute>} />
      <Route path="yards" element={<SuspenseRoute><YardsManager /></SuspenseRoute>} />
      <Route path="zones" element={<SuspenseRoute><ZonesManager /></SuspenseRoute>} />
      <Route path="pricing" element={<SuspenseRoute><MasterPricingHub /></SuspenseRoute>} />
      <Route path="vendors" element={<SuspenseRoute><VendorsManager /></SuspenseRoute>} />
      <Route path="extras" element={<SuspenseRoute><ExtrasManager /></SuspenseRoute>} />
      <Route path="config" element={<SuspenseRoute><ConfigManager /></SuspenseRoute>} />
      <Route path="configuration" element={<SuspenseRoute><ConfigurationHub /></SuspenseRoute>} />
      <Route path="volume-commitments" element={<Navigate to="/admin/pricing?tab=volume" replace />} />
      <Route path="audit-logs" element={<SuspenseRoute><AuditLogsPage /></SuspenseRoute>} />
      <Route path="google" element={<SuspenseRoute><AdminGoogleSettings /></SuspenseRoute>} />
      <Route path="google/setup" element={<SuspenseRoute><AdminGoogleSetup /></SuspenseRoute>} />
      <Route path="google/logs" element={<SuspenseRoute><AdminGoogleLogs /></SuspenseRoute>} />
      <Route path="messaging" element={<SuspenseRoute><AdminMessaging /></SuspenseRoute>} />
      <Route path="notifications-config" element={<SuspenseRoute><NotificationConfigPage /></SuspenseRoute>} />
      <Route path="email-test" element={<SuspenseRoute><AdminEmailTest /></SuspenseRoute>} />
      <Route path="ghl" element={<SuspenseRoute><GHLIntegrationPage /></SuspenseRoute>} />
      {/* toll-surcharges and city-rates now redirect via pricing hub routes below */}
      <Route path="drivers" element={<SuspenseRoute><DriversManager /></SuspenseRoute>} />
      <Route path="dispatch" element={<SuspenseRoute><DispatchCalendar /></SuspenseRoute>} />
      <Route path="tickets" element={<SuspenseRoute><TicketsManager /></SuspenseRoute>} />
      <Route path="inventory" element={<SuspenseRoute><InventoryManager /></SuspenseRoute>} />
      <Route path="assets" element={<SuspenseRoute><AssetsControlTower /></SuspenseRoute>} />
      <Route path="fleet/cameras" element={<SuspenseRoute><FleetCamerasManager /></SuspenseRoute>} />
      <Route path="movements" element={<SuspenseRoute><MovementsLog /></SuspenseRoute>} />
      <Route path="users" element={<SuspenseRoute><UsersManager /></SuspenseRoute>} />
      <Route path="access-requests" element={<SuspenseRoute><AccessRequestsPage /></SuspenseRoute>} />
      <Route path="alerts" element={<SuspenseRoute><AlertsPage /></SuspenseRoute>} />
      <Route path="fraud-flags" element={<SuspenseRoute><FraudFlagsPage /></SuspenseRoute>} />
      <Route path="risk" element={<SuspenseRoute><RiskReviewPage /></SuspenseRoute>} />
      <Route path="quick-links" element={<SuspenseRoute><QuickLinksManager /></SuspenseRoute>} />
      <Route path="markets" element={<SuspenseRoute><MarketsManager /></SuspenseRoute>} />
      <Route path="markets/new-location" element={<SuspenseRoute><NewLocationWizard /></SuspenseRoute>} />
      <Route path="markets/new" element={<Navigate to="/admin/markets/new-location" replace />} />
      <Route path="facilities" element={<SuspenseRoute><FacilitiesManager /></SuspenseRoute>} />
      <Route path="disposal-search" element={<SuspenseRoute><DisposalSearchPage /></SuspenseRoute>} />
      <Route path="facilities/finder" element={<SuspenseRoute><FacilitiesFinder /></SuspenseRoute>} />
      <Route path="overdue" element={<SuspenseRoute><OverdueBillingPage /></SuspenseRoute>} />
      <Route path="approval-queue" element={<SuspenseRoute><ApprovalQueuePage /></SuspenseRoute>} />
      <Route path="compensation" element={<SuspenseRoute><CompensationPage /></SuspenseRoute>} />
      <Route path="config/health" element={<SuspenseRoute><ConfigHealthPage /></SuspenseRoute>} />
      <Route path="security" element={<SuspenseRoute><SecurityHealthPage /></SuspenseRoute>} />
      <Route path="setup/functions" element={<SuspenseRoute><IntegrationFunctionsMap /></SuspenseRoute>} />
      <Route path="setup/what-missing" element={<SuspenseRoute><WhatsMissingPage /></SuspenseRoute>} />
      <Route path="setup/search-index" element={<SuspenseRoute><SearchIndexManager /></SuspenseRoute>} />
      {/* Material Catalog */}
      <Route path="materials/catalog" element={<SuspenseRoute><MaterialCatalogPage /></SuspenseRoute>} />
      <Route path="materials/categories" element={<SuspenseRoute><ProjectCategoriesPage /></SuspenseRoute>} />
      <Route path="materials/offers" element={<SuspenseRoute><MaterialOffersPage /></SuspenseRoute>} />
      <Route path="customer-type-rules" element={<Navigate to="/admin/pricing?tab=customer-rules" replace />} />
      <Route path="config/locations" element={<SuspenseRoute><LocationsConfig /></SuspenseRoute>} />
      <Route path="config/social" element={<SuspenseRoute><SocialLinksConfig /></SuspenseRoute>} />
      <Route path="config/ai-estimator-templates" element={<SuspenseRoute><AIEstimatorTemplates /></SuspenseRoute>} />
      <Route path="activity" element={<SuspenseRoute><AdminActivityFeed /></SuspenseRoute>} />
      <Route path="customers/new" element={<SuspenseRoute><CustomerForm /></SuspenseRoute>} />
      <Route path="customers/:id" element={<SuspenseRoute><CustomerDetail /></SuspenseRoute>} />
      <Route path="customers/:id/edit" element={<SuspenseRoute><CustomerForm /></SuspenseRoute>} />
      <Route path="customer-health" element={<SuspenseRoute><CustomerHealthDashboard /></SuspenseRoute>} />
      <Route path="heavy-risk" element={<SuspenseRoute><HeavyRiskDashboard /></SuspenseRoute>} />
      <Route path="profitability" element={<SuspenseRoute><ProfitabilityDashboard /></SuspenseRoute>} />
      {/* Pricing Sub-pages — redirect to canonical hub tabs */}
      <Route path="pricing/locations" element={<Navigate to="/admin/pricing?tab=heavy" replace />} />
      <Route path="pricing/simulator" element={<Navigate to="/admin/pricing?tab=simulator" replace />} />
      <Route path="pricing/yard-health" element={<Navigate to="/admin/pricing?tab=yards" replace />} />
      <Route path="pricing/zip-health" element={<Navigate to="/admin/pricing?tab=zips" replace />} />
      <Route path="pricing/facility-costs" element={<Navigate to="/admin/pricing?tab=facilities" replace />} />
      <Route path="pricing/material-rules" element={<Navigate to="/admin/pricing?tab=materials" replace />} />
      <Route path="pricing/zone-surcharges" element={<Navigate to="/admin/pricing?tab=zones" replace />} />
      <Route path="pricing/rush-delivery" element={<Navigate to="/admin/pricing?tab=rush" replace />} />
      <Route path="pricing/contractor-pricing" element={<Navigate to="/admin/pricing?tab=contractor" replace />} />
      <Route path="pricing/extras-catalog" element={<Navigate to="/admin/pricing?tab=extras" replace />} />
      <Route path="pricing/city-display-zips" element={<Navigate to="/admin/pricing?tab=cities" replace />} />
      <Route path="pricing/rush-health" element={<Navigate to="/admin/pricing?tab=rush-health" replace />} />
      <Route path="pricing/contractor-rules" element={<Navigate to="/admin/pricing?tab=contractor-health" replace />} />
      <Route path="pricing/extras-health" element={<Navigate to="/admin/pricing?tab=extras-health" replace />} />
      <Route path="pricing/readiness" element={<Navigate to="/admin/pricing?tab=readiness" replace />} />
      <Route path="pricing-engine" element={<Navigate to="/admin/pricing" replace />} />
      {/* Scattered pricing pages → redirect to hub */}
      <Route path="heavy-pricing" element={<Navigate to="/admin/pricing?tab=heavy-rates" replace />} />
      <Route path="mixed-rules" element={<Navigate to="/admin/pricing?tab=mixed-rules" replace />} />
      <Route path="warnings-caps" element={<Navigate to="/admin/pricing?tab=warnings-caps" replace />} />
      <Route path="city-rates" element={<Navigate to="/admin/pricing?tab=city-rates" replace />} />
      <Route path="toll-surcharges" element={<Navigate to="/admin/pricing?tab=tolls" replace />} />
      {/* Telephony */}
      <Route path="telephony/calls" element={<SuspenseRoute><CallsManager /></SuspenseRoute>} />
      <Route path="telephony/numbers" element={<SuspenseRoute><PhoneNumbersManager /></SuspenseRoute>} />
      <Route path="telephony/analytics" element={<SuspenseRoute><CallAnalyticsPage /></SuspenseRoute>} />
      <Route path="telephony/migration" element={<SuspenseRoute><TelephonyMigration /></SuspenseRoute>} />
      <Route path="telephony/test" element={<SuspenseRoute><TelephonyTestCall /></SuspenseRoute>} />
      <Route path="telephony/import" element={<SuspenseRoute><TelephonyImport /></SuspenseRoute>} />
      {/* Dashboards */}
      <Route path="dashboards/overview" element={<SuspenseRoute><DashboardOverview /></SuspenseRoute>} />
      <Route path="dashboards/sales" element={<SuspenseRoute><AdminSalesDashboard /></SuspenseRoute>} />
      <Route path="dashboards/operations" element={<SuspenseRoute><AdminOperationsDashboard /></SuspenseRoute>} />
      <Route path="dashboards/finance" element={<SuspenseRoute><AdminFinanceDashboard /></SuspenseRoute>} />
      <Route path="dashboards/customers" element={<SuspenseRoute><AdminCustomersDashboard /></SuspenseRoute>} />
      <Route path="dashboards/kpis" element={<SuspenseRoute><KPIDashboard /></SuspenseRoute>} />
      <Route path="dashboards/leads" element={<SuspenseRoute><LeadPerformanceDashboard /></SuspenseRoute>} />
      <Route path="leads/settings" element={<SuspenseRoute><LeadEngineSettings /></SuspenseRoute>} />
      {/* Google Ads */}
      <Route path="ads" element={<SuspenseRoute><AdsOverview /></SuspenseRoute>} />
      <Route path="ads/overview" element={<Navigate to="/admin/ads" replace />} />
      <Route path="ads/campaigns" element={<SuspenseRoute><AdsCampaigns /></SuspenseRoute>} />
      <Route path="ads/rules" element={<SuspenseRoute><AdsRules /></SuspenseRoute>} />
      <Route path="ads/markets" element={<SuspenseRoute><AdsMarketsPage /></SuspenseRoute>} />
      <Route path="ads/logs" element={<SuspenseRoute><AdsLogsPage /></SuspenseRoute>} />
      {/* Internal Docs */}
      <Route path="docs" element={<SuspenseRoute><InternalDocsPage /></SuspenseRoute>} />
      <Route path="calculator/logs" element={<SuspenseRoute><CalculatorLogsPage /></SuspenseRoute>} />
      <Route path="notifications/internal" element={<SuspenseRoute><InternalAlertsPage /></SuspenseRoute>} />
      {/* QA */}
      <Route path="qa/control-center" element={<SuspenseRoute><QaControlCenter /></SuspenseRoute>} />
      <Route path="qa/workflows" element={<SuspenseRoute><WorkflowsExplorer /></SuspenseRoute>} />
      <Route path="qa/photo-ai-test" element={<SuspenseRoute><PhotoAITest /></SuspenseRoute>} />
      <Route path="qa/build-info" element={<SuspenseRoute><BuildInfo /></SuspenseRoute>} />
      <Route path="qa/env-health" element={<SuspenseRoute><EnvHealth /></SuspenseRoute>} />
      <Route path="qa/build-health" element={<SuspenseRoute><BuildHealth /></SuspenseRoute>} />
      <Route path="qa/seo-health" element={<Navigate to="/admin/seo/health" replace />} />
      <Route path="qa/route-health" element={<SuspenseRoute><RouteHealthPage /></SuspenseRoute>} />
      <Route path="qa/duplicate-pages" element={<SuspenseRoute><DuplicatePagesPage /></SuspenseRoute>} />
      <Route path="qa/public-vs-crm" element={<SuspenseRoute><PublicVsCrmPage /></SuspenseRoute>} />
      <Route path="qa/page-organization" element={<SuspenseRoute><PageOrganizationPage /></SuspenseRoute>} />
      <Route path="qa/domain-health" element={<SuspenseRoute><DomainHealth /></SuspenseRoute>} />
      <Route path="qa/workflow-graph" element={<SuspenseRoute><WorkflowGraph /></SuspenseRoute>} />
      {/* SEO Admin */}
      <Route path="seo" element={<Navigate to="/admin/seo/dashboard" replace />} />
      <Route path="seo/dashboard" element={<SuspenseRoute><SeoAdminDashboard /></SuspenseRoute>} />
      <Route path="seo/cities" element={<SuspenseRoute><SeoAdminCities /></SuspenseRoute>} />
      <Route path="seo/pages" element={<SuspenseRoute><SeoAdminPages /></SuspenseRoute>} />
      <Route path="seo/sitemap" element={<SuspenseRoute><SeoAdminSitemap /></SuspenseRoute>} />
      <Route path="seo/gbp-plan" element={<SuspenseRoute><GbpDominationPlan /></SuspenseRoute>} />
      <Route path="seo/health" element={<SuspenseRoute><SeoHealthPage /></SuspenseRoute>} />
      <Route path="seo/repair" element={<SuspenseRoute><SeoRepairPage /></SuspenseRoute>} />
      <Route path="seo/indexing" element={<SuspenseRoute><SeoIndexingPage /></SuspenseRoute>} />
      <Route path="seo/queue" element={<SuspenseRoute><SeoQueuePage /></SuspenseRoute>} />
      <Route path="seo/rules" element={<SuspenseRoute><SeoRulesPage /></SuspenseRoute>} />
      <Route path="seo/metrics" element={<SuspenseRoute><SeoMetricsPage /></SuspenseRoute>} />
      <Route path="seo/generate" element={<SuspenseRoute><SeoGeneratePage /></SuspenseRoute>} />
      <Route path="seo/grid" element={<SuspenseRoute><SeoGridPage /></SuspenseRoute>} />
      <Route path="seo/audit" element={<SuspenseRoute><SeoAuditDashboard /></SuspenseRoute>} />
      {/* Local Search */}
      <Route path="local/dashboard" element={<SuspenseRoute><LocalDashboard /></SuspenseRoute>} />
      <Route path="local/google-business" element={<SuspenseRoute><GoogleBusinessPage /></SuspenseRoute>} />
      <Route path="local/bing-places" element={<SuspenseRoute><BingPlacesPage /></SuspenseRoute>} />
      <Route path="local/apple-business" element={<SuspenseRoute><AppleBusinessPage /></SuspenseRoute>} />
      <Route path="local/reviews" element={<SuspenseRoute><ReviewsEnginePage /></SuspenseRoute>} />
      <Route path="local/photos" element={<SuspenseRoute><PhotosEnginePage /></SuspenseRoute>} />
      <Route path="local/citations" element={<SuspenseRoute><CitationsPage /></SuspenseRoute>} />
      {/* AI */}
      <Route path="ai/chat" element={<SuspenseRoute><AdminAIChat /></SuspenseRoute>} />
      <Route path="ai/performance" element={<SuspenseRoute><AIPerformanceDashboard /></SuspenseRoute>} />
      <Route path="ai/control-center" element={<SuspenseRoute><AIControlCenter /></SuspenseRoute>} />
      <Route path="ai/sales" element={<SuspenseRoute><AISalesCopilot /></SuspenseRoute>} />
      <Route path="ai/customer-service" element={<SuspenseRoute><AICsCopilot /></SuspenseRoute>} />
      <Route path="ai/dispatch" element={<SuspenseRoute><AIDispatchCopilot /></SuspenseRoute>} />
      <Route path="ai/driver" element={<SuspenseRoute><AIDriverCopilot /></SuspenseRoute>} />
      <Route path="ai/fleet" element={<SuspenseRoute><AIFleetCopilot /></SuspenseRoute>} />
      <Route path="ai/finance" element={<SuspenseRoute><AIFinanceCopilot /></SuspenseRoute>} />
      <Route path="ai/seo" element={<SuspenseRoute><AISeoCopilot /></SuspenseRoute>} />
      <Route path="ai/admin" element={<SuspenseRoute><AIAdminCopilot /></SuspenseRoute>} />
      {/* Marketing */}
      <Route path="marketing/visitors" element={<SuspenseRoute><VisitorsDashboard /></SuspenseRoute>} />
      <Route path="marketing/sessions" element={<SuspenseRoute><SessionsDashboard /></SuspenseRoute>} />
      <Route path="marketing/google-setup" element={<SuspenseRoute><GoogleSetupWizard /></SuspenseRoute>} />
      <Route path="marketing/dashboard" element={<SuspenseRoute><MarketingDashboard /></SuspenseRoute>} />
      <Route path="marketing/ga4-debug" element={<SuspenseRoute><GA4DebugPanel /></SuspenseRoute>} />
      {/* Activation & Leads */}
      <Route path="activation" element={<SuspenseRoute><ActivationDashboard /></SuspenseRoute>} />
      <Route path="leads" element={<SuspenseRoute><AdminLeadsHub /></SuspenseRoute>} />
      <Route path="leads-health" element={<SuspenseRoute><LeadsHealthDashboard /></SuspenseRoute>} />
      <Route path="system/reset" element={<SuspenseRoute><SystemResetPage /></SuspenseRoute>} />
      <Route path="email-config" element={<SuspenseRoute><EmailConfigPanel /></SuspenseRoute>} />
      <Route path="executive" element={<SuspenseRoute><ExecutiveDashboard /></SuspenseRoute>} />
      <Route path="intelligence" element={<SuspenseRoute><BusinessIntelligenceDashboard /></SuspenseRoute>} />
      <Route path="sales-performance" element={<SuspenseRoute><SalesPerformanceDashboard /></SuspenseRoute>} />
      {/* Maintenance */}
      <Route path="maintenance" element={<SuspenseRoute><MaintenanceDashboard /></SuspenseRoute>} />
      <Route path="maintenance/trucks" element={<SuspenseRoute><MaintenanceTrucks /></SuspenseRoute>} />
      <Route path="maintenance/issues" element={<SuspenseRoute><MaintenanceIssues /></SuspenseRoute>} />
      <Route path="maintenance/work-orders" element={<SuspenseRoute><MaintenanceWorkOrders /></SuspenseRoute>} />
      <Route path="vehicles/:id" element={<SuspenseRoute><VehicleProfile /></SuspenseRoute>} />
    </Route>,
  ];
}
