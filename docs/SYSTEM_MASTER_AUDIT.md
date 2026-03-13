# CALSAN SYSTEM MASTER AUDIT
> Generated: 2026-03-13 | Status: ACTIVE

---

## FULL_SYSTEM_AUDIT

### PUBLIC WEBSITE ROUTES

| Route | Component | Purpose | Status | Action | Reason |
|-------|-----------|---------|--------|--------|--------|
| `/` | Index.tsx | Homepage + conversion hub | LIVE | KEEP | Core conversion page |
| `/quote` | Quote.tsx | V3 public quote flow | LIVE | KEEP | Primary conversion funnel |
| `/quote/contractor` | ContractorQuote.tsx | Contractor quote variant | LIVE | KEEP | Contractor conversion |
| `/quote/schedule` | QuoteSchedule.tsx | Post-quote scheduling | LIVE | KEEP | Quote funnel step |
| `/quote/pay` | QuotePayment.tsx | Post-quote payment | LIVE | KEEP | Quote funnel step |
| `/quick-order` | QuickOrder.tsx | Quick order flow | LIVE | KEEP | Fast conversion path |
| `/waste-vision` | WasteVision.tsx | AI photo size recommendation | LIVE | KEEP | Photo AI flow |
| `/schedule-delivery` | ScheduleDelivery.tsx | Standalone scheduling | LIVE | KEEP | Booking entry point |
| `/contractor-application` | ContractorApplication.tsx | Contractor account apply | LIVE | KEEP | Commercial acquisition |
| `/contractors` | Contractors.tsx | Contractor benefits page | LIVE | KEEP | Commercial landing |
| `/contractor-best-practices` | ContractorBestPractices.tsx | Contractor education | LIVE | KEEP | Content value |
| `/contractor-resources` | ContractorResources.tsx | Contractor resources | LIVE | KEEP | Content value |
| `/pricing` | Pricing.tsx | Pricing overview | LIVE | KEEP | SEO + education |
| `/sizes` | Sizes.tsx | Size guide | LIVE | KEEP | SEO + education |
| `/materials` | Materials.tsx | Material guide | LIVE | KEEP | SEO + education |
| `/capacity-guide` | CapacityGuide.tsx | Capacity guide | LIVE | KEEP | Education |
| `/visualizer` | DumpsterVisualizer.tsx | Size visualizer | LIVE | KEEP | Education tool |
| `/areas` | Areas.tsx | Service areas hub | LIVE | KEEP | Bay Area hub |
| `/locations` | Locations.tsx | Locations overview | LIVE | MERGE → /areas | Duplicate of /areas |
| `/projects/:slug` | ProjectTypePage.tsx | Project type education | LIVE | KEEP | Education + conversion |
| `/about` | About.tsx | About page | LIVE | KEEP | Trust building |
| `/contact` | Contact.tsx | Contact page | LIVE | KEEP | Lead capture |
| `/blog` | Blog.tsx | Blog index | LIVE | KEEP | Content marketing |
| `/blog/:articleSlug` | BlogArticle.tsx | Blog article | LIVE | KEEP | Content marketing |
| `/careers` | Careers.tsx | Careers page | LIVE | KEEP | Employer brand |
| `/terms` | Terms.tsx | Terms of service | LIVE | KEEP | Legal |
| `/privacy` | Privacy.tsx | Privacy policy | LIVE | KEEP | Legal |
| `/thank-you` | ThankYou.tsx | Thank you page | LIVE | KEEP | Post-conversion |
| `/download-price-list` | DownloadPriceList.tsx | Price list download | LIVE | KEEP | Lead capture |
| `/how-it-works` | HowItWorks.tsx | How it works | LIVE | KEEP | Education |
| `/why-calsan` | WhyCalsan.tsx | Why choose Calsan | LIVE | KEEP | Trust building |
| `/why-local-yards` | WhyLocalYards.tsx | Local yards positioning | LIVE | KEEP | Category positioning |
| `/not-a-broker` | NotABroker.tsx | Not a broker positioning | LIVE | KEEP | Category positioning |
| `/technology` | Technology.tsx | Technology page | LIVE | NOINDEX | Conflicts with "no-tech" brand |
| `/green-impact` | GreenImpactMap.tsx | Green impact map | LIVE | NOINDEX | Low priority, demo |
| `/green-halo` | GreenHalo.tsx | Green Halo page | LIVE | NOINDEX | Demo feature |

### SEO LANDING PAGES

| Route | Component | Purpose | Status | Action | Reason |
|-------|-----------|---------|--------|--------|--------|
| `/dumpster-rental/:citySlug` | SeoCityPage.tsx | City SEO pages | LIVE | KEEP | Core SEO |
| `/dumpster-rental/:citySlug/:sizeSlug-yard` | SeoCitySizePage.tsx | City+Size SEO | LIVE | KEEP | Core SEO |
| `/dumpster-rental/:citySlug/:materialSlug` | SeoCityMaterialPage.tsx | City+Material SEO | LIVE | KEEP | Core SEO |
| `/service-area/:zip/dumpster-rental` | SeoZipPage.tsx | ZIP SEO pages | LIVE | KEEP | Core SEO |
| `/county/:countySlug/dumpster-rental` | SeoCountyPage.tsx | County SEO | LIVE | KEEP | Core SEO |
| `/use-cases/:useCaseSlug` | SeoUseCasePage.tsx | Use case SEO | LIVE | KEEP | Core SEO |
| `/dumpster-rental-oakland-ca` | DumpsterRentalOakland.tsx | Oakland domination | LIVE | KEEP | Authority page |
| `/dumpster-rental-san-jose-ca` | DumpsterRentalSanJose.tsx | San Jose domination | LIVE | KEEP | Authority page |
| `/dumpster-rental-san-francisco-ca` | DumpsterRentalSanFrancisco.tsx | SF domination | LIVE | KEEP | Authority page |
| `/dumpster-rental-east-bay` | RegionalLandingPage.tsx | East Bay regional | LIVE | KEEP | Regional SEO |
| `/dumpster-rental-south-bay` | RegionalLandingPage.tsx | South Bay regional | LIVE | KEEP | Regional SEO |
| `/bay-area-dumpster-rental` | SeoHubPage.tsx | Bay Area hub | LIVE | KEEP | Hub page |
| `/california-dumpster-rental` | SeoHubPage.tsx | California hub | LIVE | KEEP | Hub page |
| `/southern-california-dumpster-rental` | SeoHubPage.tsx | SoCal hub | LIVE | NOINDEX | Outside focus |
| `/central-valley-dumpster-rental` | SeoHubPage.tsx | Central Valley hub | LIVE | NOINDEX | Outside focus |
| `/north-bay-dumpster-rental` | SeoHubPage.tsx | North Bay hub | LIVE | KEEP | Support ring |
| `/commercial-dumpster-rental` | CommercialLandingPage.tsx | Commercial SEO | LIVE | KEEP | Commercial intent |
| `/construction-dumpsters` | CommercialLandingPage.tsx | Construction SEO | LIVE | KEEP | High intent |
| `/warehouse-cleanout-dumpsters` | CommercialLandingPage.tsx | Warehouse SEO | LIVE | KEEP | Commercial intent |
| `/10-yard-dumpster-rental` | SizeLandingPage.tsx | 10yd SEO | LIVE | KEEP | Size intent |
| `/20-yard-dumpster-rental` | SizeLandingPage.tsx | 20yd SEO | LIVE | KEEP | Size intent |
| `/30-yard-dumpster-rental` | SizeLandingPage.tsx | 30yd SEO | LIVE | KEEP | Size intent |
| `/40-yard-dumpster-rental` | SizeLandingPage.tsx | 40yd SEO | LIVE | KEEP | Size intent |
| `/concrete-dumpster-rental` | MaterialLandingPage.tsx | Concrete SEO | LIVE | KEEP | Material intent |
| `/dirt-dumpster-rental` | MaterialLandingPage.tsx | Dirt SEO | LIVE | KEEP | Material intent |
| `/roofing-dumpster-rental` | MaterialLandingPage.tsx | Roofing SEO | LIVE | KEEP | Material intent |
| `/construction-debris-dumpster-rental` | MaterialLandingPage.tsx | Construction debris SEO | LIVE | KEEP | Material intent |
| `/residential-dumpster-rental` | MaterialLandingPage.tsx | Residential SEO | LIVE | KEEP | Material intent |
| `/yards/:yardSlug` | YardHubPage.tsx | Yard authority pages | LIVE | KEEP | Local authority |
| `/concrete-disposal/:citySlug` | SeoServiceCityPage.tsx | Service+City SEO | LIVE | KEEP | Service intent |
| `/yard-waste-removal/:citySlug` | SeoServiceCityPage.tsx | Service+City SEO | LIVE | KEEP | Service intent |
| `/debris-removal/:citySlug` | SeoServiceCityPage.tsx | Service+City SEO | LIVE | KEEP | Service intent |

### CUSTOMER PORTAL

| Route | Component | Purpose | Status | Action | Reason |
|-------|-----------|---------|--------|--------|--------|
| `/portal` | CustomerLogin.tsx | Portal login | LIVE | KEEP | Customer access |
| `/portal/dashboard` | CustomerDashboard.tsx | Customer dashboard | LIVE | KEEP | Self-service |
| `/portal/orders` | CustomerOrders.tsx | Customer orders | LIVE | KEEP | Self-service |
| `/portal/documents` | CustomerDocuments.tsx | Customer docs | LIVE | KEEP | Self-service |
| `/portal/orders/:orderId` | CustomerOrderDetail.tsx | Order detail | LIVE | KEEP | Self-service |
| `/portal/quote/:quoteId` | PortalQuoteView.tsx | Quote view | LIVE | KEEP | Quote review |
| `/portal/schedule` | PortalSchedule.tsx | Customer scheduling | LIVE | KEEP | Self-service |
| `/portal/pay` | PortalPay.tsx | Payment | LIVE | KEEP | Payment |
| `/portal/pay/:paymentId` | PaymentRedirect.tsx | Payment redirect | LIVE | KEEP | Payment link |
| `/portal/sign-quote-contract` | SignQuoteContract.tsx | Contract signing | LIVE | KEEP | Legal |
| `/portal/activate` | PortalActivate.tsx | Account activation | LIVE | KEEP | Onboarding |
| `/portal/track` | PortalTrack.tsx | Order tracking | LIVE | KEEP | Self-service |
| `/contract/:token` | ContractSignPage.tsx | Contract signing | LIVE | KEEP | Legal |

### CRM — ADMIN (/admin/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/admin` | Control Center (index) | LIVE | KEEP |
| `/admin/control-center` | Calsan Control Center | LIVE | KEEP |
| `/admin/modules` | Module registry | LIVE | KEEP |
| `/admin/orders` | Orders manager | LIVE | KEEP |
| `/admin/customers` | Customers list | LIVE | KEEP |
| `/admin/customers/new` | Create customer | LIVE | KEEP |
| `/admin/customers/:id` | Customer 360 | LIVE | KEEP |
| `/admin/customers/:id/edit` | Edit customer | LIVE | KEEP |
| `/admin/yards` | Yards manager | LIVE | KEEP |
| `/admin/zones` | Zones manager | LIVE | KEEP |
| `/admin/pricing` | Pricing manager | LIVE | KEEP |
| `/admin/pricing/locations` | Location pricing | LIVE | KEEP |
| `/admin/pricing/simulator` | Pricing simulator | LIVE | KEEP |
| `/admin/pricing/yard-health` | Yard health | LIVE | KEEP |
| `/admin/pricing/zip-health` | ZIP health | LIVE | KEEP |
| `/admin/pricing-engine` | Pricing engine dashboard | LIVE | KEEP |
| `/admin/vendors` | Vendors | LIVE | KEEP |
| `/admin/extras` | Extras manager | LIVE | KEEP |
| `/admin/config` | Config manager | LIVE | KEEP |
| `/admin/configuration` | Configuration hub | LIVE | KEEP |
| `/admin/inventory` | Inventory manager | LIVE | KEEP |
| `/admin/assets` | Asset Control Tower | LIVE | KEEP |
| `/admin/movements` | Movements log | LIVE | KEEP |
| `/admin/drivers` | Drivers manager | LIVE | KEEP |
| `/admin/dispatch` | Dispatch calendar | LIVE | KEEP |
| `/admin/tickets` | Tickets manager | LIVE | KEEP |
| `/admin/markets` | Markets manager | LIVE | KEEP |
| `/admin/markets/new-location` | New location wizard | LIVE | KEEP |
| `/admin/facilities` | Facilities manager | LIVE | KEEP |
| `/admin/disposal-search` | Disposal search | LIVE | KEEP |
| `/admin/leads` | Lead hub | LIVE | KEEP |
| `/admin/leads-health` | Leads health | LIVE | KEEP |
| `/admin/leads/settings` | Lead engine settings | LIVE | KEEP |
| `/admin/users` | Users manager | LIVE | KEEP |
| `/admin/access-requests` | Access requests | LIVE | KEEP |
| `/admin/alerts` | Alerts | LIVE | KEEP |
| `/admin/fraud-flags` | Fraud flags | LIVE | KEEP |
| `/admin/risk` | Risk review | LIVE | KEEP |
| `/admin/overdue` | Overdue billing | LIVE | KEEP |
| `/admin/approval-queue` | Approval queue | LIVE | KEEP |
| `/admin/heavy-risk` | Heavy risk dashboard | LIVE | KEEP |
| `/admin/audit-logs` | Audit logs | LIVE | KEEP |
| `/admin/messaging` | Messaging config | LIVE | KEEP |
| `/admin/email-test` | Email test | LIVE | KEEP |
| `/admin/email-config` | Email config | LIVE | KEEP |
| `/admin/activation` | Activation dashboard | LIVE | KEEP |
| `/admin/executive` | Executive dashboard | LIVE | KEEP |
| `/admin/intelligence` | BI dashboard | LIVE | KEEP |
| `/admin/sales-performance` | Sales performance | LIVE | KEEP |
| `/admin/profitability` | Profitability | LIVE | KEEP |
| `/admin/customer-health` | Customer health | LIVE | KEEP |
| `/admin/compensation` | Compensation | LIVE | KEEP |
| `/admin/activity` | Activity feed | LIVE | KEEP |

### CRM — ADMIN QA (/admin/qa/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/admin/qa/control-center` | QA control center | LIVE | KEEP |
| `/admin/qa/route-health` | Route health | LIVE | KEEP |
| `/admin/qa/duplicate-pages` | Duplicate pages | LIVE | KEEP |
| `/admin/qa/public-vs-crm` | Public vs CRM | LIVE | KEEP |
| `/admin/qa/page-organization` | Page organization | LIVE | KEEP |
| `/admin/qa/domain-health` | Domain health | LIVE | KEEP |
| `/admin/qa/seo-health` | SEO health | LIVE | KEEP |
| `/admin/qa/build-info` | Build info | LIVE | KEEP |
| `/admin/qa/env-health` | Env health | LIVE | KEEP |
| `/admin/qa/build-health` | Build health | LIVE | KEEP |
| `/admin/qa/photo-ai-test` | Photo AI test | LIVE | KEEP |
| `/admin/qa/workflows` | Workflows explorer | LIVE | KEEP |
| `/admin/qa/workflow-graph` | Workflow graph | LIVE | KEEP |
| `/admin/config/health` | Config health | LIVE | KEEP |
| `/admin/security` | Security health | LIVE | KEEP |

### CRM — ADMIN SEO (/admin/seo/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/admin/seo/dashboard` | SEO dashboard | LIVE | KEEP |
| `/admin/seo/cities` | SEO cities | LIVE | KEEP |
| `/admin/seo/pages` | SEO pages | LIVE | KEEP |
| `/admin/seo/sitemap` | SEO sitemap | LIVE | KEEP |
| `/admin/seo/gbp-plan` | GBP plan | LIVE | KEEP |
| `/admin/seo/health` | SEO health | LIVE | KEEP |
| `/admin/seo/repair` | SEO repair | LIVE | KEEP |
| `/admin/seo/indexing` | SEO indexing | LIVE | KEEP |
| `/admin/seo/queue` | SEO queue | LIVE | KEEP |
| `/admin/seo/rules` | SEO rules | LIVE | KEEP |
| `/admin/seo/metrics` | SEO metrics | LIVE | KEEP |
| `/admin/seo/generate` | SEO generate | LIVE | KEEP |
| `/admin/seo/grid` | SEO grid | LIVE | KEEP |
| `/admin/seo/audit` | SEO audit | LIVE | KEEP |

### CRM — ADMIN LOCAL (/admin/local/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/admin/local/dashboard` | Local dashboard | LIVE | KEEP |
| `/admin/local/google-business` | GBP | LIVE | KEEP |
| `/admin/local/bing-places` | Bing Places | LIVE | KEEP |
| `/admin/local/apple-business` | Apple Business | LIVE | KEEP |
| `/admin/local/reviews` | Reviews engine | LIVE | KEEP |
| `/admin/local/photos` | Photos engine | LIVE | KEEP |
| `/admin/local/citations` | Citations tracker | LIVE | KEEP |

### CRM — ADMIN AI (/admin/ai/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/admin/ai/chat` | AI chat | LIVE | KEEP |
| `/admin/ai/performance` | AI performance | LIVE | KEEP |
| `/admin/ai/control-center` | AI control center | LIVE | KEEP |
| `/admin/ai/sales` | Sales copilot | LIVE | KEEP |
| `/admin/ai/customer-service` | CS copilot | LIVE | KEEP |
| `/admin/ai/dispatch` | Dispatch copilot | LIVE | KEEP |
| `/admin/ai/driver` | Driver copilot | LIVE | KEEP |
| `/admin/ai/fleet` | Fleet copilot | LIVE | KEEP |
| `/admin/ai/finance` | Finance copilot | LIVE | KEEP |
| `/admin/ai/seo` | SEO copilot | LIVE | KEEP |
| `/admin/ai/admin` | Admin copilot | LIVE | KEEP |

### CRM — SALES (/sales/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/sales` | Sales dashboard | LIVE | KEEP |
| `/sales/leads` | Sales leads list | LIVE | KEEP |
| `/sales/leads/:id` | Lead detail | LIVE | KEEP |
| `/sales/quotes` | Quotes list | LIVE | KEEP |
| `/sales/quotes/:id` | Quote detail | LIVE | KEEP |
| `/sales/quotes/new` | Internal quote builder | LIVE | KEEP |
| `/sales/calls` | Sales calls | LIVE | KEEP |
| `/sales/order-builder` | Order builder | LIVE | KEEP |

### CRM — CUSTOMER SERVICE (/cs/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/cs` | CS dashboard | LIVE | KEEP |
| `/cs/orders` | CS orders | LIVE | KEEP |
| `/cs/requests` | CS requests | LIVE | KEEP |
| `/cs/templates` | CS templates | LIVE | KEEP |
| `/cs/messages` | CS messages | LIVE | KEEP |
| `/cs/calls` | CS calls | LIVE | KEEP |
| `/cs/leads` | CS leads | LIVE | KEEP |
| `/cs/lead-inbox` | CS lead inbox | LIVE | KEEP |

### CRM — DISPATCH (/dispatch/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/dispatch` | Dispatch dashboard | LIVE | KEEP |
| `/dispatch/today` | Today's jobs | LIVE | KEEP |
| `/dispatch/calendar` | Calendar view | LIVE | KEEP |
| `/dispatch/flags` | Dispatch flags | LIVE | KEEP |
| `/dispatch/requests` | Dispatch requests | LIVE | KEEP |
| `/dispatch/control-tower` | Control tower | LIVE | KEEP |
| `/dispatch/history` | Route history | LIVE | KEEP |
| `/dispatch/facilities` | Facilities finder | LIVE | KEEP |
| `/dispatch/yard-hold` | Yard hold board | LIVE | KEEP |
| `/dispatch/truck-cameras/:truckId` | Truck cameras | LIVE | KEEP |

### CRM — DRIVER (/driver/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/driver` | Driver home | LIVE | KEEP |
| `/driver/runs` | Driver runs list | LIVE | KEEP |
| `/driver/runs/:id` | Run detail | LIVE | KEEP |
| `/driver/profile` | Driver profile | LIVE | KEEP |
| `/driver/truck-select` | Truck selection | LIVE | KEEP |
| `/driver/inspect` | Pre-trip inspection | LIVE | KEEP |
| `/driver/report-issue` | Report issue | LIVE | KEEP |
| `/driver/legacy` | Legacy driver app | LIVE | ARCHIVE | Replaced by new layout |

### CRM — FINANCE (/finance/*)

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/finance` | Finance dashboard | LIVE | KEEP |
| `/finance/invoices` | Invoices list | LIVE | KEEP |
| `/finance/invoices/:orderId` | Invoice detail | LIVE | KEEP |
| `/finance/payments` | Payments list | LIVE | KEEP |
| `/finance/payments/:paymentId` | Payment detail | LIVE | KEEP |
| `/finance/payment-actions` | Payment actions | LIVE | KEEP |
| `/finance/ar-aging` | AR aging dashboard | LIVE | KEEP |
| `/finance/ar-aging/invoices` | AR invoices | LIVE | KEEP |
| `/finance/ar-aging/customers` | AR customers | LIVE | KEEP |

### PREVIEW / DEMO ROUTES

| Route | Purpose | Status | Action |
|-------|---------|--------|--------|
| `/preview/quote` | Preview quote v2 | LIVE | ARCHIVE | Superseded by /quote |
| `/preview/home` | Preview home v2 | LIVE | ARCHIVE | Superseded by / |
| `/green-halo/portal/*` | Green Halo portal | LIVE | NOINDEX | Demo only |

---

## PUBLIC_PAGE_ACTION_PLAN

### Pages to NOINDEX/PAUSE (Outside Bay Area Focus)

| Route | Action | Reason |
|-------|--------|--------|
| `/southern-california-dumpster-rental` | NOINDEX_TEMPORARY | Outside current focus |
| `/central-valley-dumpster-rental` | NOINDEX_TEMPORARY | Outside current focus |
| `/technology` | NOINDEX_TEMPORARY | Conflicts with "no-tech" branding |
| `/green-impact` | NOINDEX_TEMPORARY | Demo feature, low value |
| `/green-halo` | NOINDEX_TEMPORARY | Demo feature |

### Pages to MERGE/REDIRECT

| Route | Redirect To | Reason |
|-------|-------------|--------|
| `/locations` | `/areas` | Duplicate functionality |
| `/preview/quote` | `/quote` | Legacy preview |
| `/preview/home` | `/` | Legacy preview |
| `/driver/legacy` | `/driver` | Replaced by new layout |

---

## BAY_AREA_MARKET_CLASSIFICATION

| Market | Tier | Status |
|--------|------|--------|
| Oakland | CORE_DIRECT | Active — HQ yard |
| San Jose | CORE_DIRECT | Active — Operational yard |
| San Francisco | CORE_DIRECT | Active — SF Peninsula ops |
| Berkeley | SUPPORT_RING | Active |
| Alameda | SUPPORT_RING | Active |
| San Leandro | SUPPORT_RING | Active |
| Hayward | SUPPORT_RING | Active |
| Fremont | SUPPORT_RING | Active |
| Walnut Creek | SUPPORT_RING | Active |
| Concord | SUPPORT_RING | Active |
| Pleasanton | SUPPORT_RING | Active |
| Dublin | SUPPORT_RING | Active |
| Livermore | SUPPORT_RING | Active |
| Santa Clara | SUPPORT_RING | Active |
| Sunnyvale | SUPPORT_RING | Active |
| Mountain View | SUPPORT_RING | Active |
| Sacramento | FUTURE_PARTNER | Paused |
| Los Angeles | FUTURE_PARTNER | Paused |
| Southern California markets | OUTSIDE_CURRENT_FOCUS | Noindex |
| Central Valley markets | OUTSIDE_CURRENT_FOCUS | Noindex |

---

## COMMERCIAL_CHAIN (Canonical Flow)

```
Website Entry → Lead (lead-ingest) → Quote → Customer 360 → Contract → Payment → Order → Dispatch → Driver
```

All entry points (public quote, AI chat, photo upload, contact form, SMS, calls, manual CRM) funnel through `lead-ingest` edge function.

---

## INVENTORY_STANDARDS

### Sizes
- GENERAL_DEBRIS: 5, 8, 10, 20, 30, 40, 50 yd
- HEAVY_MATERIAL: 5, 8, 10 yd

### Statuses
- available, reserved, on_truck, on_site, full, pickup_requested, at_dump, at_yard, maintenance_hold, retired

### Asset Fields (assets_dumpsters table)
- asset_code, size_id, asset_status, asset_type, condition
- current_location_type, current_order_id, current_run_id, current_yard_id
- home_yard_id, deployed_at, days_out, last_movement_at
- total_deployments, total_revenue, revenue_30d, revenue_90d

---

## SYSTEM STATUS SUMMARY

| Module | Status | Completeness |
|--------|--------|-------------|
| Homepage | ✅ LIVE | 95% — actions route correctly |
| Public Quote Flow | ✅ LIVE | 95% — V3 9-step flow working |
| WasteVision (Photo AI) | ✅ LIVE | 90% — connected from homepage |
| Schedule Delivery | ✅ LIVE | 90% — 4-step flow with lead-ingest |
| Contractor Application | ✅ LIVE | 95% — full form with CRM integration |
| Contractor Page | ✅ LIVE | 85% — benefits + CTA working |
| Project Type Pages | ✅ LIVE | 80% — education + CTAs |
| Areas / Service Hub | ✅ LIVE | 85% — Bay Area focused |
| Customer 360 | ✅ LIVE | 95% — 12+ tabs |
| Customer Create/Edit | ✅ LIVE | 90% — duplicate prevention |
| Internal Quote Builder | ✅ LIVE | 90% — /sales/quotes/new |
| Sales Workspace | ✅ LIVE | 90% — leads, quotes, calls |
| CS Workspace | ✅ LIVE | 85% — orders, requests, comms |
| Dispatch Workspace | ✅ LIVE | 90% — control tower, calendar |
| Driver App | ✅ LIVE | 85% — runs, inspections, photos |
| Finance/Collections | ✅ LIVE | 85% — invoices, payments, AR aging |
| Contract System | ✅ LIVE | 90% — dual-table MSA+addendum |
| Payment System | ✅ LIVE | 85% — deposit/full/pay-later |
| Asset Inventory | ✅ LIVE | 80% — asset control tower |
| Market Templates | ✅ LIVE | 80% — new location wizard |
| SEO Engine | ✅ LIVE | 90% — city/size/material/zip pages |
| QA/Admin Panels | ✅ LIVE | 90% — route/page/domain health |

---

## RECOMMENDED IMPLEMENTATION ORDER

1. ✅ Homepage action routing (DONE — all CTAs route correctly)
2. ✅ Photo AI flow (DONE — /waste-vision connected)
3. ✅ Schedule delivery (DONE — /schedule-delivery live)
4. ✅ Contractor application (DONE — /contractor-application live)
5. ✅ Internal quote builder (DONE — /sales/quotes/new)
6. ✅ Customer create/edit (DONE — /admin/customers/new + edit)
7. ✅ Customer 360 (DONE — 12+ tabs)
8. Apply NOINDEX to outside-focus pages ← NEXT
9. Merge /locations → /areas redirect ← NEXT
10. Archive /preview/* routes ← NEXT
11. Verify mobile UX across all role workspaces
12. Update live container inventory data
13. Review and clean stale blog content
