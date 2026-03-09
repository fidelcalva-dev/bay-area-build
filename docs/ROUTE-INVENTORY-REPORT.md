# Calsan Dumpsters Pro — Route Inventory Report

Generated: 2026-03-09

---

## Summary

| Metric | Count |
|---|---|
| **Total Unique Routes** | ~1,650+ |
| **Public Website (static)** | 42 |
| **SEO Programmatic Pages** | ~1,530+ |
| **Blog Pages** | 24 |
| **CRM Admin Routes** | 95 |
| **CRM Portal Routes (Sales/CS/Dispatch/Finance/Driver)** | 42 |
| **Customer Portal Routes** | 16 |
| **Duplicate/Alias Routes** | 12 |
| **Legacy Redirect Routes** | 2 |
| **Broken/Missing Routes** | 0 |

---

## 1. Public Website Pages (42 static routes)

| Route | Component | Status | Indexable |
|---|---|---|---|
| `/` | Index | ✅ Working | Yes |
| `/pricing` | Pricing | ✅ Working | Yes |
| `/sizes` | Sizes | ✅ Working | Yes |
| `/visualizer` | DumpsterVisualizer | ✅ Working | Yes |
| `/areas` | Areas | ✅ Working | Yes |
| `/materials` | Materials | ✅ Working | Yes |
| `/capacity-guide` | CapacityGuide | ✅ Working | Yes |
| `/contractors` | Contractors | ✅ Working | Yes |
| `/contractor-best-practices` | ContractorBestPractices | ✅ Working | Yes |
| `/contractor-resources` | ContractorResources | ✅ Working | Yes |
| `/about` | About | ✅ Working | Yes |
| `/contact` | Contact | ✅ Working | Yes |
| `/blog` | Blog | ✅ Working | Yes |
| `/careers` | Careers | ✅ Working | Yes |
| `/thank-you` | ThankYou | ✅ Working | Yes |
| `/quote` | Quote | ✅ Working | Yes |
| `/quote/contractor` | ContractorQuote | ✅ Working | Yes |
| `/quote/schedule` | QuoteSchedule | ✅ Working | Yes |
| `/quote/pay` | QuotePayment | ✅ Working | Yes |
| `/quick-order` | QuickOrder | ✅ Working | Yes |
| `/green-impact` | GreenImpactMap | ✅ Working | Yes |
| `/green-halo` | GreenHalo | ✅ Working | Yes |
| `/locations` | Locations | ✅ Working | Yes |
| `/terms` | Terms | ✅ Working | Yes |
| `/privacy` | Privacy | ✅ Working | Yes |
| `/waste-vision` | WasteVision | ✅ Working | Yes |
| `/download-price-list` | DownloadPriceList | ✅ Working | Yes |
| `/why-local-yards` | WhyLocalYards | ✅ Working | Yes |
| `/not-a-broker` | NotABroker | ✅ Working | Yes |
| `/how-it-works` | HowItWorks | ✅ Working | Yes |
| `/technology` | Technology | ✅ Working | Yes |
| `/why-calsan` | WhyCalsan | ✅ Working | Yes |
| `/sitemap.xml` | SitemapPage | ✅ Working | No (utility) |
| `/ai-dumpster-assistant` | → Redirect to `/` | ✅ Redirect | No |
| `/staff` | → Redirect to `/app` | ✅ Redirect | No (noindex) |
| `/app` | RoleRouter | ✅ Working | No (noindex) |
| `/request-access` | RequestAccess | ✅ Working | No (noindex) |
| `/set-password` | SetPassword | ✅ Working | No (noindex) |
| `/login` | → AdminLogin | ✅ Working | No (noindex) |

---

## 2. SEO Programmatic Pages (~1,530+)

### 2a. SEO City Pages (from seo_cities DB: 37 total, 34 active)

Each city generates:
- 1 city hub page: `/dumpster-rental/{citySlug}`
- ~8 size pages: `/dumpster-rental/{citySlug}/{size}-yard`
- 5 material pages: `/dumpster-rental/{citySlug}/{materialSlug}`
- 8 job pages: `/dumpster-rental/{citySlug}/{jobSlug}`

**Per city: ~22 pages × 34 active cities = ~748 city-based pages**

| Route Pattern | Count | Status | Indexable |
|---|---|---|---|
| `/dumpster-rental/:citySlug` | 34 | ✅ Working (fallback if data missing) | Yes |
| `/dumpster-rental/:citySlug/:size-yard` | ~272 | ✅ Working | Yes |
| `/dumpster-rental/:citySlug/:materialSlug` | 170 | ✅ Working | Yes |
| `/dumpster-rental/:citySlug/:jobSlug` | 272 | ✅ Working | Yes |

### 2b. SEO ZIP Pages (~300+)

| Route Pattern | Count | Status | Indexable |
|---|---|---|---|
| `/service-area/:zip/dumpster-rental` | ~300+ | ✅ Working | Yes |

### 2c. SEO County Pages (16)

| Route Pattern | Count | Status | Indexable |
|---|---|---|---|
| `/county/:countySlug/dumpster-rental` | 16 | ✅ Working | Yes |

### 2d. SEO Use Case Pages (6)

| Route Pattern | Count | Status | Indexable |
|---|---|---|---|
| `/use-cases/:useCaseSlug` | 6 | ✅ Working | Yes |

### 2e. SEO Hub Pages (4)

| Route | Status | Indexable |
|---|---|---|
| `/california-dumpster-rental` | ✅ Working | Yes |
| `/bay-area-dumpster-rental` | ✅ Working | Yes |
| `/southern-california-dumpster-rental` | ✅ Working | Yes |
| `/central-valley-dumpster-rental` | ✅ Working | Yes |

### 2f. SEO Domination Pages (3 static city pages)

| Route | Status | Indexable | Duplicate? |
|---|---|---|---|
| `/dumpster-rental-oakland-ca` | ✅ Working | Yes | ⚠️ Overlaps `/dumpster-rental/oakland` |
| `/dumpster-rental-san-jose-ca` | ✅ Working | Yes | ⚠️ Overlaps `/dumpster-rental/san-jose` |
| `/dumpster-rental-san-francisco-ca` | ✅ Working | Yes | ⚠️ Overlaps `/dumpster-rental/san-francisco` |

### 2g. Regional & Commercial Landing Pages (5)

| Route | Status | Indexable |
|---|---|---|
| `/dumpster-rental-east-bay` | ✅ Working | Yes |
| `/dumpster-rental-south-bay` | ✅ Working | Yes |
| `/commercial-dumpster-rental` | ✅ Working | Yes |
| `/construction-dumpsters` | ✅ Working | Yes |
| `/warehouse-cleanout-dumpsters` | ✅ Working | Yes |

### 2h. Standalone Size Intent Pages (4)

| Route | Status | Indexable |
|---|---|---|
| `/10-yard-dumpster-rental` | ✅ Working | Yes |
| `/20-yard-dumpster-rental` | ✅ Working | Yes |
| `/30-yard-dumpster-rental` | ✅ Working | Yes |
| `/40-yard-dumpster-rental` | ✅ Working | Yes |

### 2i. Standalone Material Intent Pages (5)

| Route | Status | Indexable |
|---|---|---|
| `/concrete-dumpster-rental` | ✅ Working | Yes |
| `/dirt-dumpster-rental` | ✅ Working | Yes |
| `/roofing-dumpster-rental` | ✅ Working | Yes |
| `/construction-debris-dumpster-rental` | ✅ Working | Yes |
| `/residential-dumpster-rental` | ✅ Working | Yes |

### 2j. Service-Specific SEO Routes (5)

| Route Pattern | Status | Indexable |
|---|---|---|
| `/concrete-disposal/:citySlug` | ✅ Working | Yes |
| `/yard-waste-removal/:citySlug` | ✅ Working | Yes |
| `/debris-removal/:citySlug` | ✅ Working | Yes |
| `/construction-debris/:citySlug` | ✅ Working | Yes |
| `/yard-waste-disposal/:citySlug` | ✅ Working | Yes |

### 2k. Yard Hub Pages (dynamic)

| Route Pattern | Status | Indexable |
|---|---|---|
| `/yards/:yardSlug` | ✅ Working | Yes |

---

## 3. Blog Pages (24)

| Route Pattern | Count | Status | Indexable |
|---|---|---|---|
| `/blog/:articleSlug` | 18 (SEO_BLOG_TOPICS) + 6 (editorial) | ✅ Working | Yes |

---

## 4. CRM Admin Routes (95 routes under /admin)

All noindex, protected behind AdminLayout auth.

| Route | Component | Status |
|---|---|---|
| `/admin` | CalsanControlCenter | ✅ Working |
| `/admin/modules` | ControlCenter | ✅ Working |
| `/admin/legacy-dashboard` | AdminDashboard | ✅ Working |
| `/admin/orders` | OrdersManager | ✅ Working |
| `/admin/customers` | CustomersManager | ✅ Working |
| `/admin/customers/:id` | CustomerDetail | ✅ Working |
| `/admin/yards` | YardsManager | ✅ Working |
| `/admin/zones` | ZonesManager | ✅ Working |
| `/admin/pricing` | PricingManager | ✅ Working |
| `/admin/pricing/locations` | LocationPricingManager | ✅ Working |
| `/admin/vendors` | VendorsManager | ✅ Working |
| `/admin/extras` | ExtrasManager | ✅ Working |
| `/admin/config` | ConfigManager | ✅ Working |
| `/admin/configuration` | ConfigurationHub | ✅ Working |
| `/admin/volume-commitments` | VolumeCommitmentsManager | ✅ Working |
| `/admin/audit-logs` | AuditLogsPage | ✅ Working |
| `/admin/google` | AdminGoogleSettings | ✅ Working |
| `/admin/google/setup` | AdminGoogleSetup | ✅ Working |
| `/admin/google/logs` | AdminGoogleLogs | ✅ Working |
| `/admin/messaging` | AdminMessaging | ✅ Working |
| `/admin/email-test` | AdminEmailTest | ✅ Working |
| `/admin/ghl` | GHLIntegrationPage | ✅ Working |
| `/admin/toll-surcharges` | TollSurchargesManager | ✅ Working |
| `/admin/city-rates` | CityRatesManager | ✅ Working |
| `/admin/drivers` | DriversManager | ✅ Working |
| `/admin/dispatch` | DispatchCalendar | ✅ Working |
| `/admin/tickets` | TicketsManager | ✅ Working |
| `/admin/inventory` | InventoryManager | ✅ Working |
| `/admin/assets` | AssetsControlTower | ✅ Working |
| `/admin/fleet/cameras` | FleetCamerasManager | ✅ Working |
| `/admin/movements` | MovementsLog | ✅ Working |
| `/admin/users` | UsersManager | ✅ Working |
| `/admin/access-requests` | AccessRequestsPage | ✅ Working |
| `/admin/alerts` | AlertsPage | ✅ Working |
| `/admin/fraud-flags` | FraudFlagsPage | ✅ Working |
| `/admin/risk` | RiskReviewPage | ✅ Working |
| `/admin/quick-links` | QuickLinksManager | ✅ Working |
| `/admin/markets` | MarketsManager | ✅ Working |
| `/admin/markets/new-location` | NewLocationWizard | ✅ Working |
| `/admin/facilities` | FacilitiesManager | ✅ Working |
| `/admin/disposal-search` | DisposalSearchPage | ✅ Working |
| `/admin/facilities/finder` | FacilitiesFinder | ✅ Working |
| `/admin/overdue` | OverdueBillingPage | ✅ Working |
| `/admin/approval-queue` | ApprovalQueuePage | ✅ Working |
| `/admin/compensation` | CompensationPage | ✅ Working |
| `/admin/config/health` | ConfigHealthPage | ✅ Working |
| `/admin/security` | SecurityHealthPage | ✅ Working |
| `/admin/setup/functions` | IntegrationFunctionsMap | ✅ Working |
| `/admin/setup/what-missing` | WhatsMissingPage | ✅ Working |
| `/admin/setup/search-index` | SearchIndexManager | ✅ Working |
| `/admin/materials/catalog` | MaterialCatalogPage | ✅ Working |
| `/admin/materials/categories` | ProjectCategoriesPage | ✅ Working |
| `/admin/materials/offers` | MaterialOffersPage | ✅ Working |
| `/admin/customer-type-rules` | CustomerTypeRulesPage | ✅ Working |
| `/admin/activity` | AdminActivityFeed | ✅ Working |
| `/admin/customer-health` | CustomerHealthDashboard | ✅ Working |
| `/admin/heavy-risk` | HeavyRiskDashboard | ✅ Working |
| `/admin/profitability` | ProfitabilityDashboard | ✅ Working |
| `/admin/telephony/calls` | CallsManager | ✅ Working |
| `/admin/telephony/numbers` | PhoneNumbersManager | ✅ Working |
| `/admin/telephony/analytics` | CallAnalyticsPage | ✅ Working |
| `/admin/telephony/migration` | TelephonyMigration | ✅ Working |
| `/admin/telephony/test` | TelephonyTestCall | ✅ Working |
| `/admin/telephony/import` | TelephonyImport | ✅ Working |
| `/admin/dashboards/overview` | DashboardOverview | ✅ Working |
| `/admin/dashboards/sales` | AdminSalesDashboard | ✅ Working |
| `/admin/dashboards/operations` | AdminOperationsDashboard | ✅ Working |
| `/admin/dashboards/finance` | AdminFinanceDashboard | ✅ Working |
| `/admin/dashboards/customers` | AdminCustomersDashboard | ✅ Working |
| `/admin/dashboards/kpis` | KPIDashboard | ✅ Working |
| `/admin/dashboards/leads` | LeadPerformanceDashboard | ✅ Working |
| `/admin/leads/settings` | LeadEngineSettings | ✅ Working |
| `/admin/ads` | AdsOverview | ✅ Working |
| `/admin/ads/overview` | AdsOverview | ⚠️ Duplicate of `/admin/ads` |
| `/admin/ads/campaigns` | AdsCampaigns | ✅ Working |
| `/admin/ads/rules` | AdsRules | ✅ Working |
| `/admin/ads/markets` | AdsMarketsPage | ✅ Working |
| `/admin/ads/logs` | AdsLogsPage | ✅ Working |
| `/admin/docs` | InternalDocsPage | ✅ Working |
| `/admin/calculator/logs` | CalculatorLogsPage | ✅ Working |
| `/admin/notifications/internal` | InternalAlertsPage | ✅ Working |
| `/admin/qa/control-center` | QaControlCenter | ✅ Working |
| `/admin/qa/workflows` | WorkflowsExplorer | ✅ Working |
| `/admin/qa/photo-ai-test` | PhotoAITest | ✅ Working |
| `/admin/qa/build-info` | BuildInfo | ✅ Working |
| `/admin/qa/env-health` | EnvHealth | ✅ Working |
| `/admin/qa/build-health` | BuildHealth | ✅ Working |
| `/admin/qa/seo-health` | SeoHealthDashboard | ✅ Working |
| `/admin/qa/workflow-graph` | WorkflowGraph | ✅ Working |
| `/admin/seo` | → Redirect to dashboard | ✅ Redirect |
| `/admin/seo/dashboard` | SeoAdminDashboard | ✅ Working |
| `/admin/seo/cities` | SeoAdminCities | ✅ Working |
| `/admin/seo/pages` | SeoAdminPages | ✅ Working |
| `/admin/seo/sitemap` | SeoAdminSitemap | ✅ Working |
| `/admin/seo/gbp-plan` | GbpDominationPlan | ✅ Working |
| `/admin/seo/health` | SeoHealthPage | ✅ Working |
| `/admin/seo/repair` | SeoRepairPage | ✅ Working |
| `/admin/seo/indexing` | SeoIndexingPage | ✅ Working |
| `/admin/seo/queue` | SeoQueuePage | ✅ Working |
| `/admin/seo/rules` | SeoRulesPage | ✅ Working |
| `/admin/seo/metrics` | SeoMetricsPage | ✅ Working |
| `/admin/seo/generate` | SeoGeneratePage | ✅ Working |
| `/admin/seo/grid` | SeoGridPage | ✅ Working |
| `/admin/seo/audit` | SeoAuditDashboard | ✅ Working |
| `/admin/ai/chat` | AdminAIChat | ✅ Working |
| `/admin/ai/performance` | AIPerformanceDashboard | ✅ Working |
| `/admin/marketing/visitors` | VisitorsDashboard | ✅ Working |
| `/admin/marketing/sessions` | SessionsDashboard | ✅ Working |
| `/admin/marketing/google-setup` | GoogleSetupWizard | ✅ Working |
| `/admin/marketing/dashboard` | MarketingDashboard | ✅ Working |
| `/admin/marketing/ga4-debug` | GA4DebugPanel | ✅ Working |
| `/admin/activation` | ActivationDashboard | ✅ Working |
| `/admin/leads` | AdminLeadsHub | ✅ Working |
| `/admin/leads-health` | LeadsHealthDashboard | ✅ Working |
| `/admin/system/reset` | SystemResetPage | ✅ Working |
| `/admin/email-config` | EmailConfigPanel | ✅ Working |
| `/admin/executive` | ExecutiveDashboard | ✅ Working |
| `/admin/sales-performance` | SalesPerformanceDashboard | ✅ Working |

### Maintenance Routes (under /admin)

| Route | Component | Status |
|---|---|---|
| `/admin/maintenance` | MaintenanceDashboard | ✅ Working |
| `/admin/maintenance/trucks` | MaintenanceTrucks | ✅ Working |
| `/admin/maintenance/issues` | MaintenanceIssues | ✅ Working |
| `/admin/maintenance/work-orders` | MaintenanceWorkOrders | ✅ Working |
| `/admin/vehicles/:id` | VehicleProfile | ✅ Working |

---

## 5. Role-Based CRM Portals

### Sales Portal (10 routes under /sales)

| Route | Component | Status | Indexable |
|---|---|---|---|
| `/sales` | SalesDashboard | ✅ Working | No |
| `/sales/leads` | SalesLeads | ✅ Working | No |
| `/sales/leads/:id` | SalesLeadDetail | ✅ Working | No |
| `/sales/quotes` | SalesQuotes | ✅ Working | No |
| `/sales/quotes/:id` | SalesQuoteDetail | ✅ Working | No |
| `/sales/quotes/new` | SalesNewQuote | ✅ Working | No |
| `/sales/calls` | SalesCalls | ✅ Working | No |
| `/sales/inbox` | → Redirect to /sales/leads | ✅ Redirect | No |
| `/sales/lead-hub` | → Redirect to /sales/leads | ✅ Redirect | No |
| `/sales/order-builder` | OrderBuilder | ✅ Working | No |

### CS Portal (8 routes under /cs)

| Route | Component | Status | Indexable |
|---|---|---|---|
| `/cs` | CSDashboard | ✅ Working | No |
| `/cs/orders` | CSOrders | ✅ Working | No |
| `/cs/requests` | CSRequests | ✅ Working | No |
| `/cs/templates` | CSTemplates | ✅ Working | No |
| `/cs/messages` | CSMessages | ✅ Working | No |
| `/cs/calls` | CSCalls | ✅ Working | No |
| `/cs/leads` | CSLeads | ✅ Working | No |
| `/cs/lead-inbox` | CSLeadInbox | ✅ Working | No |

### Dispatch Portal (12 routes under /dispatch)

| Route | Component | Status | Indexable |
|---|---|---|---|
| `/dispatch` | DispatchDashboard | ✅ Working | No |
| `/dispatch/today` | DispatchToday | ✅ Working | No |
| `/dispatch/calendar` | DispatchCalendarPage | ✅ Working | No |
| `/dispatch/flags` | DispatchFlags | ✅ Working | No |
| `/dispatch/requests` | DispatchRequests | ✅ Working | No |
| `/dispatch/control-tower` | ControlTower | ✅ Working | No |
| `/dispatch/history` | RouteHistory | ✅ Working | No |
| `/dispatch/facilities` | FacilitiesFinder | ✅ Working | No |
| `/dispatch/yard-hold` | YardHoldBoard | ✅ Working | No |
| `/dispatch/truck-cameras/:truckId` | TruckCameras | ✅ Working | No |
| `/dispatch/runs` (calendar) | DispatchRunsCalendar | ⚠️ Imported but no route | No |
| `/dispatch/runs/list` | DispatchRunsList | ⚠️ Imported but no route | No |

### Driver App (9 routes under /driver)

| Route | Component | Status | Indexable |
|---|---|---|---|
| `/driver` | DriverHome | ✅ Working | No |
| `/driver/runs/:id` | DriverRunDetail | ✅ Working | No |
| `/driver/runs` | DriverRuns | ✅ Working | No |
| `/driver/profile` | DriverProfile | ✅ Working | No |
| `/driver/truck-select` | DriverTruckSelect | ✅ Working | No |
| `/driver/inspect` | DriverPreTrip | ✅ Working | No |
| `/driver/report-issue` | DriverReportIssue | ✅ Working | No |
| `/driver/legacy` | DriverApp | ✅ Working | No |

### Finance Portal (9 routes under /finance)

| Route | Component | Status | Indexable |
|---|---|---|---|
| `/finance` | FinanceDashboard | ✅ Working | No |
| `/finance/invoices` | FinanceInvoices | ✅ Working | No |
| `/finance/invoices/:orderId` | FinanceInvoiceDetail | ✅ Working | No |
| `/finance/payments` | FinancePayments | ✅ Working | No |
| `/finance/payments/:paymentId` | FinancePaymentDetail | ✅ Working | No |
| `/finance/payment-actions` | FinancePaymentActions | ✅ Working | No |
| `/finance/ar-aging` | ARAgingDashboard | ✅ Working | No |
| `/finance/ar-aging/invoices` | ARAgingInvoices | ✅ Working | No |
| `/finance/ar-aging/customers` | ARAgingCustomers | ✅ Working | No |

---

## 6. Customer Portal (16 routes under /portal)

| Route | Component | Auth Required | Indexable |
|---|---|---|---|
| `/portal` | CustomerLogin | No | No |
| `/portal/track` | PortalTrack | No | No |
| `/portal/dashboard` | CustomerDashboard | PortalAuthGuard | No |
| `/portal/orders` | CustomerOrders | PortalAuthGuard | No |
| `/portal/documents` | CustomerDocuments | PortalAuthGuard | No |
| `/portal/order/:orderId` | CustomerOrderDetail | PortalAuthGuard | No |
| `/portal/orders/:orderId` | CustomerOrderDetail | PortalAuthGuard | No |
| `/portal/payment-complete` | PaymentComplete | PortalAuthGuard | No |
| `/portal/quote/:quoteId` | PortalQuoteView | No (SMS link) | No |
| `/portal/schedule` | PortalSchedule | No (SMS link) | No |
| `/portal/pay` | PortalPay | No (SMS link) | No |
| `/portal/pay/:paymentId` | PaymentRedirect | No | No |
| `/portal/sign-quote-contract` | SignQuoteContract | No | No |
| `/portal/activate` | PortalActivate | No | No |

### Green Halo Portal (4 routes)

| Route | Component | Indexable |
|---|---|---|
| `/green-halo/portal` | PortalLogin | No |
| `/green-halo/portal/dashboard` | PortalDashboard | No |
| `/green-halo/portal/project/:projectId` | ProjectDetail | No |
| `/green-halo/portal/report` | SustainabilityReport | No |

---

## 7. Internal/Cross-Role Routes (5)

| Route | Component | Status | Indexable |
|---|---|---|---|
| `/internal/calculator` | InternalCalculator (canonical) | ✅ Working | No |
| `/ops/calculator` | InternalCalculator (alias) | ⚠️ Duplicate | No |
| `/sales/calculator` | InternalCalculator (alias) | ⚠️ Duplicate | No |
| `/cs/calculator` | InternalCalculator (alias) | ⚠️ Duplicate | No |
| `/dispatch/calculator` | InternalCalculator (alias) | ⚠️ Duplicate | No |

---

## 8. Preview Routes (2)

| Route | Component | Indexable |
|---|---|---|
| `/preview/quote` | PreviewQuote | No |
| `/preview/home` | PreviewHome | No |

---

## 9. Legacy Redirect Routes (2)

| Route Pattern | Target | Type |
|---|---|---|
| `/:citySlug/:sizeSlug-yard-dumpster` | `/dumpster-rental/{city}/{size}-yard` | 301 redirect |
| `/:citySlug/:subSlug` | `/dumpster-rental/{city}/{sub}` | 301 redirect |

---

## 10. Duplicate Analysis

### Confirmed Duplicates (12)

| Duplicate Route | Canonical Route | Recommendation |
|---|---|---|
| `/dumpster-rental-oakland-ca` | `/dumpster-rental/oakland` | Keep both (different content depth), add canonical tag |
| `/dumpster-rental-san-jose-ca` | `/dumpster-rental/san-jose` | Keep both, add canonical tag |
| `/dumpster-rental-san-francisco-ca` | `/dumpster-rental/san-francisco` | Keep both, add canonical tag |
| `/admin/ads/overview` | `/admin/ads` | Remove duplicate route |
| `/portal/order/:orderId` | `/portal/orders/:orderId` | Keep both (different URL patterns in SMS) |
| `/sales/inbox` | `/sales/leads` | Already redirecting ✅ |
| `/sales/lead-hub` | `/sales/leads` | Already redirecting ✅ |
| `/ops/calculator` | `/internal/calculator` | Keep alias (role convenience) |
| `/sales/calculator` | `/internal/calculator` | Keep alias |
| `/cs/calculator` | `/internal/calculator` | Keep alias |
| `/dispatch/calculator` | `/internal/calculator` | Keep alias |
| `/admin/seo` | `/admin/seo/dashboard` | Already redirecting ✅ |

### SEO Domination Pages vs City Engine Pages

The 3 "domination" pages (`/dumpster-rental-oakland-ca`, etc.) are static, hand-crafted pages with deep content. The city engine pages (`/dumpster-rental/oakland`) are dynamic/DB-driven. **Both should exist** but the domination pages should set `<link rel="canonical">` to themselves (they have more content).

---

## 11. Imported But Unrouted Components (2)

| Component | Import Location | Issue |
|---|---|---|
| `DispatchRunsCalendar` | App.tsx line 302 | Imported but no `<Route>` |
| `DispatchRunsList` | App.tsx line 303 | Imported but no `<Route>` |
| `DispatchRunDetail` | App.tsx line 304 | Imported but no `<Route>` |

---

## 12. Noindex Enforcement (robots.txt + meta tags)

### Currently blocked in robots.txt ✅

- `/app`, `/admin/`, `/set-password`, `/portal/`, `/internal/`, `/dispatch/`, `/sales/`, `/cs/`, `/driver/`, `/finance/`, `/billing/`, `/staff`, `/request-access`, `/login`, `/preview/`, `/green-halo/portal/`

### Should be noindex but NOT in robots.txt ⚠️

All CRM routes are properly blocked. No gaps found.

---

## 13. Final Totals

| Category | Count |
|---|---|
| **Public website (static)** | 42 |
| **SEO city pages (dynamic)** | ~748 |
| **SEO ZIP pages** | ~300 |
| **SEO county pages** | 16 |
| **SEO use case pages** | 6 |
| **SEO hub pages** | 4 |
| **SEO domination pages** | 3 |
| **SEO regional/commercial** | 5 |
| **Standalone size pages** | 4 |
| **Standalone material pages** | 5 |
| **Service-specific city pages** | 5 (× cities) |
| **Yard hub pages** | ~3 |
| **Blog pages** | 24 |
| **CRM admin routes** | 95 |
| **Sales portal** | 10 |
| **CS portal** | 8 |
| **Dispatch portal** | 12 |
| **Driver app** | 9 |
| **Finance portal** | 9 |
| **Customer portal** | 16 |
| **Green Halo portal** | 4 |
| **Internal/cross-role** | 5 |
| **Preview** | 2 |
| **Legacy redirects** | 2 |
| **TOTAL** | **~1,650+** |

| Health | Count |
|---|---|
| ✅ Working | ~1,645+ |
| ⚠️ Duplicates | 12 |
| ⚠️ Unrouted imports | 3 |
| ❌ Broken | 0 |

---

## 14. Recommended Actions

1. **Add routes for unrouted dispatch components** (DispatchRunsCalendar, DispatchRunsList, DispatchRunDetail)
2. **Remove `/admin/ads/overview` duplicate** (already served by `/admin/ads`)
3. **Add canonical tags** on domination pages pointing to themselves
4. **Verify** all 3 domination pages have unique content vs city engine pages
5. **Monitor** calculator aliases — if unused, consolidate to `/internal/calculator`
