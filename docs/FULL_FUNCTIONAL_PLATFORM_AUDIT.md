# Full Functional Platform Audit

> Last updated: 2026-03-31

## Audit Scope

Complete inventory of all active systems across Calsan Dumpsters Pro + Calsan C&D Waste Removal.

## 1. Public Website

| Function | Route | Status | Canonical |
|---|---|---|---|
| Homepage | `/` | ✅ Active | Index |
| Pricing | `/pricing` | ✅ Active | Pricing |
| Sizes | `/sizes` | ✅ Active | Sizes |
| Materials | `/materials` | ✅ Active | Materials |
| Areas | `/areas` | ✅ Active | Areas |
| Contractors | `/contractors` | ✅ Active | Contractors |
| Contractor Application | `/contractor-application` | ✅ Active | ContractorApplication |
| Quote | `/quote` | ✅ Active | V3QuoteFlow |
| Contractor Quote | `/quote/contractor` | ✅ Active | ContractorQuote |
| Contact | `/contact` | ✅ Active | Contact |
| Contact Us | `/contact-us` | ✅ Active | ContactUs |
| About | `/about` | ✅ Active | About |
| Blog | `/blog` | ✅ Active | Blog |
| How It Works | `/how-it-works` | ✅ Active | HowItWorks |
| Why Calsan | `/why-calsan` | ✅ Active | WhyCalsan |
| Capacity Guide | `/capacity-guide` | ✅ Active | CapacityGuide |
| Visualizer | `/visualizer` | ✅ Active | DumpsterVisualizer |
| Green Halo | `/green-halo` | ✅ Active | GreenHalo |
| Green Impact Map | `/green-impact` | ✅ Active | GreenImpactMap |
| Waste Vision | `/waste-vision` | ✅ Active | WasteVision |
| Technology | `/technology` | ✅ Active | Technology |
| Why Local Yards | `/why-local-yards` | ✅ Active | WhyLocalYards |
| Not A Broker | `/not-a-broker` | ✅ Active | NotABroker |
| Permits | `/permits` | ✅ Active | Permits |
| Careers | `/careers` | ✅ Active | Careers |
| Terms | `/terms` | ✅ Active | Terms |
| Privacy | `/privacy` | ✅ Active | Privacy |
| Download Price List | `/download-price-list` | ✅ Active | DownloadPriceList |
| What Can/Cannot Go | `/what-can-you-put-in-a-dumpster` | ✅ Active | Educational |
| Compare Pages | `/compare/:slug` | ✅ Active | ComparePage |
| Service Pages | `/services/:slug` | ✅ Active | ServicePage |
| Project Type Pages | `/projects/:slug` | ✅ Active | ProjectTypePage |

## 2. Cleanup Brand (C&D Waste Removal)

| Function | Route | Status | Canonical |
|---|---|---|---|
| Cleanup Home | `/cleanup` | ✅ Active | CleanupHome |
| Cleanup Services | `/cleanup/services` | ✅ Active | CleanupServices |
| Cleanup Service Details | `/cleanup/construction-cleanup` etc. | ✅ Active | CleanupServiceDetail |
| Cleanup Quote | `/cleanup/quote` | ✅ Active | CleanupQuote |
| Cleanup Contact | `/cleanup/contact` | ✅ Active | CleanupContact |
| Cleanup For Contractors | `/cleanup/for-contractors` | ✅ Active | CleanupForContractors |
| Cleanup Pricing | `/cleanup/pricing` | ✅ Active | CleanupPricing |
| Cleanup Service Areas | `/cleanup/service-areas` | ✅ Active | CleanupServiceAreas |
| Cleanup FAQs | `/cleanup/faqs` | ✅ Active | CleanupFAQs |
| Cleanup About | `/cleanup/about` | ✅ Active | CleanupAbout |
| Cleanup Before/After | `/cleanup/before-after` | ✅ Active | CleanupBeforeAfter |
| Cleanup Local Pages | `/cleanup/oakland`, `/cleanup/alameda`, `/cleanup/bay-area` | ✅ Active | CleanupLocalPage |
| Cleanup Thank You | `/cleanup/thank-you` | ✅ Active | CleanupThankYou |

## 3. SEO Pages

| Function | Route | Status |
|---|---|---|
| City Domination (Oakland) | `/dumpster-rental-oakland-ca` | ✅ Active |
| City Domination (San Jose) | `/dumpster-rental-san-jose-ca` | ✅ Active |
| City Domination (SF) | `/dumpster-rental-san-francisco-ca` | ✅ Active |
| Regional Hubs | `/dumpster-rental-east-bay`, `/dumpster-rental-south-bay` | ✅ Active |
| Commercial Landing | `/commercial-dumpster-rental` | ✅ Active |
| Size Landing | `/10-yard-dumpster-rental` etc. | ✅ Active |
| Material Landing | `/concrete-dumpster-rental` etc. | ✅ Active |
| SEO City Engine | `/dumpster-rental/:citySlug` | ✅ Active |
| SEO City+Size | `/dumpster-rental/:citySlug/:sizeSlug-yard` | ✅ Active |
| SEO City+Material | `/dumpster-rental/:citySlug/:materialSlug` | ✅ Active |
| ZIP Pages | `/service-area/:zip/dumpster-rental` | ✅ Active |
| Service-City Pages | `/concrete-disposal/:citySlug` etc. | ✅ Active |
| County Pages | `/county/:countySlug/dumpster-rental` | ✅ Active |
| Use Case Pages | `/use-cases/:useCaseSlug` | ✅ Active |
| Hub Pages | `/california-dumpster-rental`, `/bay-area-dumpster-rental` | ✅ Active |
| Yard Hub Pages | `/yards/:yardSlug` | ✅ Active |

## 4. Lead Intake Channels

| Channel | Handler | Brand | Service Line | Status |
|---|---|---|---|---|
| Website Quote (/quote) | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Cleanup Quote (/cleanup/quote) | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ |
| Contact Form (/contact) | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Cleanup Contact (/cleanup/contact) | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ |
| Contractor App (/contractors) | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Cleanup Contractors (/cleanup/for-contractors) | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ |
| AI Chat | lead-ingest | Auto-detected | Auto-detected | ✅ |
| Schedule Delivery | schedule-delivery | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Manual Staff Lead | lead-ingest | Selectable | Selectable | ✅ |
| Phone Inbound | lead-from-phone | Auto-detected | DUMPSTER | ✅ |
| SMS Inbound | twilio-sms-webhook | Auto-detected | DUMPSTER | ✅ |
| Google Ads | lead-from-google-ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Meta Ads | lead-from-meta | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Contractor Quote (/quote/contractor) | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |

## 5. CRM / Sales Portal

| Function | Route | Component | Status |
|---|---|---|---|
| Sales Dashboard | `/sales` | SalesDashboard | ✅ Active |
| Lead Hub | `/sales/leads` | LeadWorkspacePage(sales) | ✅ Canonical |
| Lead Detail | `/sales/leads/:id` | LeadDetailPage(sales) | ✅ Canonical |
| Quotes List | `/sales/quotes` | QuoteWorkspacePage(sales) | ✅ Canonical |
| Quote Detail | `/sales/quotes/:id` | QuoteDetailPage(sales) | ✅ Canonical |
| Quote Builder | `/sales/quotes/new` | QuoteBuilderPage(sales) | ✅ Canonical |
| Sales Calls | `/sales/calls` | SalesCalls | ✅ Active |
| Order Builder | `/sales/order-builder` | OrderBuilder | ✅ Active |
| Legacy: inbox | `/sales/inbox` | → `/sales/leads` | ✅ Redirect |
| Legacy: lead-hub | `/sales/lead-hub` | → `/sales/leads` | ✅ Redirect |
| Legacy: calculator | `/sales/calculator` | → `/sales/quotes/new` | ✅ Redirect |

## 6. Customer Service Portal

| Function | Route | Component | Status |
|---|---|---|---|
| CS Dashboard | `/cs` | CSDashboard | ✅ Active |
| CS Leads | `/cs/leads` | LeadWorkspacePage(cs) | ✅ Canonical |
| CS Lead Detail | `/cs/leads/:id` | LeadDetailPage(cs) | ✅ Canonical |
| CS Quotes | `/cs/quotes` | QuoteWorkspacePage(cs) | ✅ Canonical |
| CS Quote Detail | `/cs/quotes/:id` | QuoteDetailPage(cs) | ✅ Canonical |
| CS Orders | `/cs/orders` | CSOrders | ✅ Active |
| CS Messages | `/cs/messages` | CSMessages | ✅ Active |
| CS Calls | `/cs/calls` | CSCalls | ✅ Active |
| CS Templates | `/cs/templates` | CSTemplates | ✅ Active |
| CS Requests | `/cs/requests` | CSRequests | ✅ Active |
| Legacy: lead-inbox | `/cs/lead-inbox` | → `/cs/leads` | ✅ Redirect |
| Legacy: calculator | `/cs/calculator` | → `/cs/quotes` | ✅ Redirect |

## 7. Admin Portal

| Function | Route | Status |
|---|---|---|
| Admin Login | `/admin/login` | ✅ Active |
| Command Center | `/admin` | ✅ Canonical (CalsanControlCenter) |
| Configuration Hub | `/admin/configuration` | ✅ Canonical |
| Business Config | `/admin/config` | ✅ Active |
| Master Pricing Hub | `/admin/pricing` | ✅ Canonical (34 tabs) |
| Customers | `/admin/customers` | ✅ Active |
| Customer 360 | `/admin/customers/:id` | ✅ Canonical |
| Orders | `/admin/orders` | ✅ Active |
| Users | `/admin/users` | ✅ Active |
| GHL Integration | `/admin/ghl` | ✅ Active |
| Notifications Config | `/admin/notifications-config` | ✅ Active |
| Audit Logs | `/admin/audit-logs` | ✅ Active |
| Markets | `/admin/markets` | ✅ Active |
| Yards | `/admin/yards` | ✅ Active |
| Zones | `/admin/zones` | ✅ Active |
| Inventory | `/admin/inventory` | ✅ Active |
| Assets Control Tower | `/admin/assets` | ✅ Active |
| Drivers | `/admin/drivers` | ✅ Active |
| Facilities | `/admin/facilities` | ✅ Active |
| QA Control Center | `/admin/qa/control-center` | ✅ Active |
| Admin Leads (Analytics) | `/admin/leads` | ✅ Active (AdminLeadsHub) |
| Admin Leads Workspace | `/admin/leads/workspace` | ✅ Canonical (shared) |
| Admin Quotes | `/admin/quotes` | ✅ Canonical (shared) |
| Admin Quote Builder | `/admin/quotes/new` | ✅ Canonical (shared) |
| Executive Dashboard | `/admin/executive` | ✅ Active |
| BI Dashboard | `/admin/intelligence` | ✅ Active |
| Sales Performance | `/admin/sales-performance` | ✅ Active |
| Leads Health | `/admin/leads-health` | ✅ Active |
| Heavy Risk | `/admin/heavy-risk` | ✅ Active |
| Profitability | `/admin/profitability` | ✅ Active |
| Alerts | `/admin/alerts` | ✅ Active |
| Fraud Flags | `/admin/fraud-flags` | ✅ Active |
| Risk Review | `/admin/risk` | ✅ Active |
| Approval Queue | `/admin/approval-queue` | ✅ Active |
| Activation Dashboard | `/admin/activation` | ✅ Active |
| Activity Feed | `/admin/activity` | ✅ Active |
| Config Health | `/admin/config/health` | ✅ Active |
| Security Health | `/admin/security` | ✅ Active |

## 8. Department Portals

| Portal | Route | Status |
|---|---|---|
| Dispatch Dashboard | `/dispatch` | ✅ Active |
| Dispatch Today | `/dispatch/today` | ✅ Active |
| Dispatch Calendar | `/dispatch/calendar` | ✅ Active |
| Control Tower | `/dispatch/control-tower` | ✅ Active |
| Facilities Finder | `/dispatch/facilities` | ✅ Active |
| Yard Hold Board | `/dispatch/yard-hold` | ✅ Active |
| Route History | `/dispatch/history` | ✅ Active |
| Driver Home | `/driver` | ✅ Active |
| Driver Runs | `/driver/runs` | ✅ Active |
| Driver Run Detail | `/driver/runs/:id` | ✅ Active |
| Driver Profile | `/driver/profile` | ✅ Active |
| Driver Truck Select | `/driver/truck-select` | ✅ Active |
| Driver Pre-Trip | `/driver/inspect` | ✅ Active |
| Driver Report Issue | `/driver/report-issue` | ✅ Active |
| Finance Dashboard | `/finance` | ✅ Active |
| Finance Invoices | `/finance/invoices` | ✅ Active |
| Finance Invoice Detail | `/finance/invoices/:orderId` | ✅ Active |
| Finance Payments | `/finance/payments` | ✅ Active |
| Finance Payment Detail | `/finance/payments/:paymentId` | ✅ Active |
| Finance Payment Actions | `/finance/payment-actions` | ✅ Active |
| AR Aging Dashboard | `/finance/ar-aging` | ✅ Active |
| AR Aging Invoices | `/finance/ar-aging/invoices` | ✅ Active |
| AR Aging Customers | `/finance/ar-aging/customers` | ✅ Active |

## 9. Customer Portal

| Function | Route | Status |
|---|---|---|
| Login | `/portal` | ✅ Active |
| Dashboard | `/portal/dashboard` | ✅ Active (Auth guarded) |
| Orders | `/portal/orders` | ✅ Active (Auth guarded) |
| Documents | `/portal/documents` | ✅ Active (Auth guarded) |
| Order Detail | `/portal/orders/:orderId` | ✅ Active (Auth guarded) |
| Quote View | `/portal/quote/:quoteId` | ✅ Active (SMS-accessible) |
| Schedule | `/portal/schedule` | ✅ Active (SMS-accessible) |
| Pay | `/portal/pay` | ✅ Active (SMS-accessible) |
| Contract Sign | `/contract/:token` | ✅ Active |
| Activate | `/portal/activate` | ✅ Active |
| Payment Complete | `/portal/payment-complete` | ✅ Active |
| Track | `/portal/track` | ✅ Active |

## 10. Platform & Marketplace

| Function | Route | Status |
|---|---|---|
| Platform Dashboard | `/platform` | ✅ Active |
| Tenants | `/platform/tenants` | ✅ Active |
| Providers | `/platform/providers` | ✅ Active |
| Provider Join | `/providers/join` | ✅ Active |
| Crew Portal | `/crew` | ✅ Active |

## 11. Duplicate Logic Assessment

| Business Function | Canonical Service | Duplicate Risk | Status |
|---|---|---|---|
| Lead creation | lead-ingest | LOW — all paths unified | ✅ Clean |
| Lead workspace | LeadWorkspacePage | LOW — single component, 3 modes | ✅ Clean |
| Quote workspace | QuoteWorkspacePage | LOW — single component, 3 modes | ✅ Clean |
| Quote builder | QuoteBuilderPage → InternalCalculator | LOW | ✅ Clean |
| Pricing calculation | masterPricingService | LOW — single gateway | ✅ Clean |
| Quote session | useQuoteSession | LOW | ✅ Clean |
| Draft quote | draftQuoteService | LOW | ✅ Clean |
| Communication | ghlCommunication | LOW | ✅ Clean |
| Timeline events | timelineService | LOW | ✅ Clean |
| Notifications | notificationService | LOW | ✅ Clean |
| Contract lifecycle | contractService | LOW | ✅ Clean |
| Customer identity | identity_groups + triggers | LOW | ✅ Clean |
| PDF generation | generate-internal-pdf | LOW | ✅ Clean |
| Document engine | DocumentDeliveryCenter | LOW | ✅ Clean |

## Summary

- **Total active routes**: ~150+
- **Total edge functions**: ~90+
- **Duplicate business logic**: No critical duplicates detected
- **Both brands unified**: ✅ Yes — same CRM, same Lead Hub, same Customer 360
- **Pipeline**: Unified across service lines with filter-based views
- **Shared feature modules**: `src/features/leads/` and `src/features/quotes/`
