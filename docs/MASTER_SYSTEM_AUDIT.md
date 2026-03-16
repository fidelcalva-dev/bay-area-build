# CALSAN OPERATING SYSTEM — MASTER SYSTEM AUDIT
## Generated: 2026-03-16

---

## 1. ROUTE & MODULE INVENTORY

### PUBLIC WEBSITE ROUTES

| Route | Component | Purpose | Status | Action | Priority |
|---|---|---|---|---|---|
| `/` | Index | Homepage / conversion hub | ✅ LIVE | KEEP | — |
| `/quote` | Quote | V3 Uber-style quote flow | ✅ LIVE | KEEP | — |
| `/quote/contractor` | ContractorQuote | Contractor-specific quote | ✅ LIVE | KEEP | — |
| `/quote/schedule` | QuoteSchedule | Post-quote scheduling | ✅ LIVE | KEEP | — |
| `/quote/pay` | QuotePayment | Post-quote payment | ✅ LIVE | KEEP | — |
| `/quick-order` | QuickOrder | Quick order entry | ⚠️ REVIEW | MERGE into /quote or REMOVE | B |
| `/schedule-delivery` | ScheduleDelivery | Standalone scheduling | ✅ LIVE | KEEP — complete new vs existing flow | A |
| `/waste-vision` | WasteVision | Photo upload for AI sizing | ✅ LIVE | KEEP | — |
| `/pricing` | Pricing | Public pricing page | ✅ LIVE | KEEP | — |
| `/sizes` | Sizes | Size guide | ✅ LIVE | KEEP | — |
| `/visualizer` | DumpsterVisualizer | 3D size visualizer | ✅ LIVE | KEEP | — |
| `/materials` | Materials | Material guide | ✅ LIVE | KEEP | — |
| `/capacity-guide` | CapacityGuide | Volume capacity guide | ✅ LIVE | KEEP | — |
| `/areas` | Areas | Bay Area service hub | ✅ LIVE | KEEP — refine as Bay Area first | A |
| `/contractors` | Contractors | Contractor landing page | ✅ LIVE | KEEP | — |
| `/contractor-application` | ContractorApplication | Commercial application | ✅ LIVE | KEEP — ensure CRM creates lead | A |
| `/contractor-best-practices` | ContractorBestPractices | Content page | ✅ LIVE | KEEP | — |
| `/contractor-resources` | ContractorResources | Content page | ✅ LIVE | KEEP | — |
| `/about` | About | About page | ✅ LIVE | KEEP | — |
| `/contact` | Contact | Contact page | ✅ LIVE | KEEP | — |
| `/blog` | Blog | Blog index | ✅ LIVE | KEEP | — |
| `/blog/:articleSlug` | BlogArticle | Blog article | ✅ LIVE | KEEP | — |
| `/careers` | Careers | Careers page | ✅ LIVE | KEEP | — |
| `/how-it-works` | HowItWorks | Process explainer | ✅ LIVE | KEEP | — |
| `/why-calsan` | WhyCalsan | Brand page | ✅ LIVE | KEEP | — |
| `/why-local-yards` | WhyLocalYards | Authority page | ✅ LIVE | KEEP | — |
| `/not-a-broker` | NotABroker | Differentiation page | ✅ LIVE | KEEP | — |
| `/technology` | Technology | Tech showcase | ⚠️ OFF-STRATEGY | NOINDEX | C |
| `/green-halo` | GreenHalo | Green Halo page | ⚠️ OFF-STRATEGY | NOINDEX | C |
| `/green-impact` | GreenImpactMap | Green impact map | ⚠️ OFF-STRATEGY | NOINDEX | C |
| `/download-price-list` | DownloadPriceList | Lead magnet | ✅ LIVE | KEEP | — |
| `/terms` | Terms | Legal terms | ✅ LIVE | KEEP | — |
| `/privacy` | Privacy | Privacy policy | ✅ LIVE | KEEP | — |
| `/thank-you` | ThankYou | Post-conversion | ✅ LIVE | KEEP | — |
| `/projects/:slug` | ProjectTypePage | Project type pages | ✅ LIVE | KEEP | — |
| `/locations` | → /areas redirect | Legacy redirect | ✅ | KEEP redirect | — |
| `/ai-dumpster-assistant` | → / redirect | Legacy redirect | ✅ | KEEP redirect | — |

### SEO CITY ENGINE ROUTES (PROGRAMMATIC)

| Route Pattern | Component | Status | Action |
|---|---|---|---|
| `/dumpster-rental/:citySlug` | SeoCityPage | ✅ LIVE | KEEP — Bay Area cities only |
| `/dumpster-rental/:citySlug/:sizeSlug-yard` | SeoCitySizePage | ✅ LIVE | KEEP |
| `/dumpster-rental/:citySlug/:materialSlug` | SeoCityMaterialPage | ✅ LIVE | KEEP |
| `/service-area/:zip/dumpster-rental` | SeoZipPage | ✅ LIVE | KEEP |
| `/concrete-disposal/:citySlug` | SeoServiceCityPage | ✅ LIVE | KEEP |
| `/yard-waste-removal/:citySlug` | SeoServiceCityPage | ✅ LIVE | KEEP |
| `/debris-removal/:citySlug` | SeoServiceCityPage | ✅ LIVE | KEEP |
| `/construction-debris/:citySlug` | SeoServiceCityPage | ✅ LIVE | KEEP |
| `/county/:countySlug/dumpster-rental` | SeoCountyPage | ✅ LIVE | KEEP |
| `/use-cases/:useCaseSlug` | SeoUseCasePage | ✅ LIVE | KEEP |
| `/dumpster-rental-oakland-ca` | DumpsterRentalOakland | ✅ LIVE | KEEP — core city |
| `/dumpster-rental-san-jose-ca` | DumpsterRentalSanJose | ✅ LIVE | KEEP — core city |
| `/dumpster-rental-san-francisco-ca` | DumpsterRentalSanFrancisco | ✅ LIVE | KEEP — core city |

### SEO HUB PAGES

| Route | Status | Action | Priority |
|---|---|---|---|
| `/bay-area-dumpster-rental` | ✅ LIVE | KEEP — primary regional hub | — |
| `/california-dumpster-rental` | ✅ LIVE | KEEP — state hub | — |
| `/dumpster-rental-east-bay` | ✅ LIVE | KEEP | — |
| `/dumpster-rental-south-bay` | ✅ LIVE | KEEP | — |
| `/north-bay-dumpster-rental` | ✅ LIVE | KEEP | — |
| `/southern-california-dumpster-rental` | ⚠️ OUTSIDE_CURRENT_FOCUS | NOINDEX | B |
| `/central-valley-dumpster-rental` | ⚠️ OUTSIDE_CURRENT_FOCUS | NOINDEX | B |

### STANDALONE LANDING PAGES

| Route | Status | Action |
|---|---|---|
| `/10-yard-dumpster-rental` | ✅ LIVE | KEEP |
| `/20-yard-dumpster-rental` | ✅ LIVE | KEEP |
| `/30-yard-dumpster-rental` | ✅ LIVE | KEEP |
| `/40-yard-dumpster-rental` | ✅ LIVE | KEEP |
| `/concrete-dumpster-rental` | ✅ LIVE | KEEP |
| `/dirt-dumpster-rental` | ✅ LIVE | KEEP |
| `/roofing-dumpster-rental` | ✅ LIVE | KEEP |
| `/construction-debris-dumpster-rental` | ✅ LIVE | KEEP |
| `/residential-dumpster-rental` | ✅ LIVE | KEEP |
| `/commercial-dumpster-rental` | ✅ LIVE | KEEP |
| `/construction-dumpsters` | ✅ LIVE | KEEP |
| `/warehouse-cleanout-dumpsters` | ✅ LIVE | KEEP |
| `/yards/:yardSlug` | ✅ LIVE | KEEP |

### CUSTOMER PORTAL ROUTES

| Route | Status | Action |
|---|---|---|
| `/portal` | ✅ LIVE | KEEP — SMS OTP login |
| `/portal/dashboard` | ✅ LIVE | KEEP |
| `/portal/orders` | ✅ LIVE | KEEP |
| `/portal/orders/:orderId` | ✅ LIVE | KEEP |
| `/portal/documents` | ✅ LIVE | KEEP |
| `/portal/quote/:quoteId` | ✅ LIVE | KEEP |
| `/portal/schedule` | ✅ LIVE | KEEP |
| `/portal/pay` | ✅ LIVE | KEEP |
| `/portal/pay/:paymentId` | ✅ LIVE | KEEP |
| `/portal/sign-quote-contract` | ✅ LIVE | KEEP |
| `/portal/activate` | ✅ LIVE | KEEP |
| `/portal/track` | ✅ LIVE | KEEP |
| `/contract/:token` | ✅ LIVE | KEEP |
| `/portal/payment-complete` | ✅ LIVE | KEEP |

### GREEN HALO PORTAL (DEMO — OFF-STRATEGY)

| Route | Action |
|---|---|
| `/green-halo/portal` | NOINDEX — demo only |
| `/green-halo/portal/dashboard` | NOINDEX |
| `/green-halo/portal/project/:projectId` | NOINDEX |
| `/green-halo/portal/report` | NOINDEX |

---

### CRM / ADMIN ROUTES (/admin/*)

| Route | Purpose | Status |
|---|---|---|
| `/admin` | Control Center (index) | ✅ LIVE |
| `/admin/control-center` | Calsan Control Center | ✅ LIVE |
| `/admin/modules` | Module Registry | ✅ LIVE |
| `/admin/legacy-dashboard` | Legacy admin dashboard | ⚠️ ARCHIVE candidate |
| `/admin/orders` | Orders manager | ✅ LIVE |
| `/admin/customers` | Customers list | ✅ LIVE |
| `/admin/customers/new` | New customer form | ✅ LIVE |
| `/admin/customers/:id` | Customer 360 detail | ✅ LIVE |
| `/admin/customers/:id/edit` | Edit customer | ✅ LIVE |
| `/admin/leads` | Lead Hub | ✅ LIVE |
| `/admin/leads-health` | Leads health dashboard | ✅ LIVE |
| `/admin/yards` | Yards manager | ✅ LIVE |
| `/admin/zones` | Zones manager | ✅ LIVE |
| `/admin/pricing` | Pricing manager | ✅ LIVE |
| `/admin/markets` | Markets manager | ✅ LIVE |
| `/admin/facilities` | Facilities manager | ✅ LIVE |
| `/admin/disposal-search` | Disposal search | ✅ LIVE |
| `/admin/inventory` | Inventory manager | ✅ LIVE |
| `/admin/assets` | Assets control tower | ✅ LIVE |
| `/admin/movements` | Movements log | ✅ LIVE |
| `/admin/drivers` | Drivers manager | ✅ LIVE |
| `/admin/tickets` | Dump tickets | ✅ LIVE |
| `/admin/users` | Users manager | ✅ LIVE |
| `/admin/access-requests` | Access requests | ✅ LIVE |
| `/admin/alerts` | Alerts | ✅ LIVE |
| `/admin/audit-logs` | Audit logs | ✅ LIVE |
| `/admin/extras` | Extras manager | ✅ LIVE |
| `/admin/vendors` | Vendors manager | ✅ LIVE |
| `/admin/config` | Config manager | ✅ LIVE |
| `/admin/configuration` | Configuration hub | ✅ LIVE |
| `/admin/config/locations` | Locations config | ✅ LIVE |
| `/admin/config/social` | Social links config | ✅ LIVE |
| `/admin/config/ai-estimator-templates` | AI estimator templates | ✅ LIVE |
| `/admin/config/health` | Config health | ✅ LIVE |
| `/admin/customer-health` | Customer health dashboard | ✅ LIVE |
| `/admin/heavy-risk` | Heavy risk dashboard | ✅ LIVE |
| `/admin/overdue` | Overdue billing | ✅ LIVE |
| `/admin/approval-queue` | Approval queue | ✅ LIVE |
| `/admin/fraud-flags` | Fraud flags | ✅ LIVE |
| `/admin/risk` | Risk review | ✅ LIVE |
| `/admin/profitability` | Profitability dashboard | ✅ LIVE |
| `/admin/executive` | Executive dashboard | ✅ LIVE |
| `/admin/intelligence` | BI dashboard | ✅ LIVE |
| `/admin/sales-performance` | Sales performance | ✅ LIVE |
| `/admin/activation` | Customer activation | ✅ LIVE |

### PRICING ADMIN ROUTES (/admin/pricing/*)

| Route | Purpose | Status |
|---|---|---|
| `/admin/pricing/locations` | Location pricing | ✅ LIVE |
| `/admin/pricing/simulator` | Pricing simulator | ✅ LIVE |
| `/admin/pricing/yard-health` | Yard health | ✅ LIVE |
| `/admin/pricing/zip-health` | ZIP health | ✅ LIVE |
| `/admin/pricing/facility-costs` | Facility costs | ✅ LIVE |
| `/admin/pricing/material-rules` | Material rules | ✅ LIVE |
| `/admin/pricing/zone-surcharges` | Zone surcharges | ✅ LIVE |
| `/admin/pricing/rush-delivery` | Rush delivery config | ✅ LIVE |
| `/admin/pricing/contractor-pricing` | Contractor pricing | ✅ LIVE |
| `/admin/pricing/extras-catalog` | Extras catalog | ✅ LIVE |
| `/admin/pricing/city-display-zips` | City display ZIPs | ✅ LIVE |
| `/admin/pricing/rush-health` | Rush health | ✅ LIVE |
| `/admin/pricing/contractor-rules` | Contractor rules health | ✅ LIVE |
| `/admin/pricing/extras-health` | Extras health | ✅ LIVE |
| `/admin/pricing/readiness` | Pricing readiness | ✅ LIVE |
| `/admin/pricing-engine` | Pricing engine dashboard | ✅ LIVE |

### SEO ADMIN ROUTES (/admin/seo/*)

| Route | Purpose | Status |
|---|---|---|
| `/admin/seo/dashboard` | SEO dashboard | ✅ LIVE |
| `/admin/seo/cities` | SEO cities | ✅ LIVE |
| `/admin/seo/pages` | SEO pages | ✅ LIVE |
| `/admin/seo/sitemap` | Sitemap admin | ✅ LIVE |
| `/admin/seo/gbp-plan` | GBP plan | ✅ LIVE |
| `/admin/seo/health` | SEO health | ✅ LIVE |
| `/admin/seo/repair` | SEO repair | ✅ LIVE |
| `/admin/seo/indexing` | Indexing control | ✅ LIVE |
| `/admin/seo/queue` | SEO queue | ✅ LIVE |
| `/admin/seo/rules` | SEO rules | ✅ LIVE |
| `/admin/seo/metrics` | SEO metrics | ✅ LIVE |
| `/admin/seo/generate` | SEO generate | ✅ LIVE |
| `/admin/seo/grid` | SEO grid | ✅ LIVE |
| `/admin/seo/audit` | SEO audit | ✅ LIVE |

### QA ADMIN ROUTES (/admin/qa/*)

| Route | Purpose | Status |
|---|---|---|
| `/admin/qa/control-center` | QA control center | ✅ LIVE |
| `/admin/qa/workflows` | Workflows explorer | ✅ LIVE |
| `/admin/qa/workflow-graph` | Workflow graph | ✅ LIVE |
| `/admin/qa/photo-ai-test` | Photo AI test | ✅ LIVE |
| `/admin/qa/build-info` | Build info | ✅ LIVE |
| `/admin/qa/env-health` | Environment health | ✅ LIVE |
| `/admin/qa/build-health` | Build health | ✅ LIVE |
| `/admin/qa/seo-health` | Public SEO health | ✅ LIVE |
| `/admin/qa/route-health` | Route health | ✅ LIVE |
| `/admin/qa/duplicate-pages` | Duplicate pages | ✅ LIVE |
| `/admin/qa/public-vs-crm` | Public vs CRM | ✅ LIVE |
| `/admin/qa/page-organization` | Page organization | ✅ LIVE |
| `/admin/qa/domain-health` | Domain health | ✅ LIVE |

### AI ADMIN ROUTES (/admin/ai/*)

| Route | Purpose | Status |
|---|---|---|
| `/admin/ai/chat` | Admin AI chat | ✅ LIVE |
| `/admin/ai/performance` | AI performance | ✅ LIVE |
| `/admin/ai/control-center` | AI control center | ✅ LIVE |
| `/admin/ai/sales` | Sales copilot | ✅ LIVE |
| `/admin/ai/customer-service` | CS copilot | ✅ LIVE |
| `/admin/ai/dispatch` | Dispatch copilot | ✅ LIVE |
| `/admin/ai/driver` | Driver copilot | ✅ LIVE |
| `/admin/ai/fleet` | Fleet copilot | ✅ LIVE |
| `/admin/ai/finance` | Finance copilot | ✅ LIVE |
| `/admin/ai/seo` | SEO copilot | ✅ LIVE |
| `/admin/ai/admin` | Admin copilot | ✅ LIVE |

### DEPARTMENT PORTALS

| Route | Department | Status |
|---|---|---|
| `/sales` | Sales dashboard | ✅ LIVE |
| `/sales/leads` | Sales leads | ✅ LIVE |
| `/sales/leads/:id` | Lead detail | ✅ LIVE |
| `/sales/quotes` | Sales quotes | ✅ LIVE |
| `/sales/quotes/:id` | Quote detail | ✅ LIVE |
| `/sales/quotes/new` | New quote (Full Calculator) | ✅ LIVE |
| `/sales/calls` | Sales calls | ✅ LIVE |
| `/sales/order-builder` | Order builder | ✅ LIVE |
| `/dispatch` | Dispatch dashboard | ✅ LIVE |
| `/dispatch/today` | Today's runs | ✅ LIVE |
| `/dispatch/calendar` | Dispatch calendar | ✅ LIVE |
| `/dispatch/control-tower` | Control Tower | ✅ LIVE |
| `/dispatch/facilities` | Facilities finder | ✅ LIVE |
| `/dispatch/flags` | Dispatch flags | ✅ LIVE |
| `/dispatch/requests` | Dispatch requests | ✅ LIVE |
| `/dispatch/history` | Route history | ✅ LIVE |
| `/dispatch/yard-hold` | Yard hold board | ✅ LIVE |
| `/driver` | Driver home | ✅ LIVE |
| `/driver/runs` | Driver runs | ✅ LIVE |
| `/driver/runs/:id` | Run detail | ✅ LIVE |
| `/driver/profile` | Driver profile | ✅ LIVE |
| `/driver/truck-select` | Truck select | ✅ LIVE |
| `/driver/inspect` | Pre-trip inspection | ✅ LIVE |
| `/driver/report-issue` | Report issue | ✅ LIVE |
| `/cs` | CS dashboard | ✅ LIVE |
| `/cs/orders` | CS orders | ✅ LIVE |
| `/cs/requests` | CS requests | ✅ LIVE |
| `/cs/templates` | CS templates | ✅ LIVE |
| `/cs/messages` | CS messages | ✅ LIVE |
| `/cs/calls` | CS calls | ✅ LIVE |
| `/cs/leads` | CS leads | ✅ LIVE |
| `/cs/lead-inbox` | CS lead inbox | ✅ LIVE |
| `/finance` | Finance dashboard | ✅ LIVE |
| `/finance/invoices` | Invoices | ✅ LIVE |
| `/finance/invoices/:orderId` | Invoice detail | ✅ LIVE |
| `/finance/payments` | Payments | ✅ LIVE |
| `/finance/payments/:paymentId` | Payment detail | ✅ LIVE |
| `/finance/payment-actions` | Payment actions | ✅ LIVE |
| `/finance/ar-aging` | AR aging dashboard | ✅ LIVE |
| `/finance/ar-aging/invoices` | AR aging invoices | ✅ LIVE |
| `/finance/ar-aging/customers` | AR aging customers | ✅ LIVE |

### INTERNAL TOOLS

| Route | Purpose | Status |
|---|---|---|
| `/internal/calculator` | Master Calculator (canonical) | ✅ LIVE |
| `/ops/calculator` | Alias → InternalCalculator | ✅ LIVE |
| `/sales/calculator` | Alias → InternalCalculator | ✅ LIVE |
| `/cs/calculator` | Alias → InternalCalculator | ✅ LIVE |
| `/dispatch/calculator` | Alias → InternalCalculator | ✅ LIVE |

### AUTH / SYSTEM ROUTES

| Route | Purpose | Status |
|---|---|---|
| `/admin/login` | Staff login | ✅ LIVE |
| `/staff` | Staff login (alias) | ✅ LIVE |
| `/app` | Role router | ✅ LIVE |
| `/request-access` | Access request form | ✅ LIVE |
| `/set-password` | Password setup (invite) | ✅ LIVE |

---

## 2. SYSTEMS STATUS SUMMARY

### ✅ OPERATIONAL (Working, Connected)
- Homepage with AI estimator, pricing, hero, CTAs
- V3 Quote flow (ZIP → Material → Size → Contact → Price → Schedule → Access)
- Internal Master Calculator (/internal/calculator)
- Sales portal with lead/quote/order workflow
- Customer 360 with 12+ tabs
- Dispatch Control Tower with map + fleet
- Driver App with checkpoint workflow
- Finance portal with invoicing + AR aging
- CS portal with orders/requests/calls
- Pricing engine (smart + static fallback)
- SEO city engine (programmatic pages)
- Customer Portal (SMS OTP)
- Identity resolution system
- RBAC with 14 roles
- Admin configuration center

### ⚠️ NEEDS COMPLETION / HARDENING
1. **Quote persistence** — verify size/material/delivery date/time window/driver notes persist through full flow
2. **Schedule Delivery** — complete new vs existing customer branching
3. **PDF generation/delivery** — verify no "PDF not available yet" dead states
4. **Contract signing flow** — verify end-to-end sign → Customer 360 visibility
5. **Placement/logistics verification** — verify customer marking → logistics review → driver visibility
6. **Commercial account program** — verify application → approval → tier assignment → discount in calculator
7. **Heavy material enforcement** — verify 5/8/10 constraint in ALL size selectors (quote, calculator, admin)
8. **Extras/exceptions engine** — verify driver report → billing line item flow
9. **Identity merge UI** — verify merge suggestions are reviewable by staff
10. **SEO page classification** — noindex out-of-focus pages (SoCal, Central Valley hubs)

### 🔴 ITEMS TO REMOVE / ARCHIVE
1. `/admin/legacy-dashboard` → archive
2. `/quick-order` → review if redundant with /quote
3. `/technology` → noindex (off-strategy)
4. `/green-halo` → noindex (off-strategy)
5. `/green-impact` → noindex (off-strategy)
6. Green Halo Portal routes → noindex
7. `/driver/legacy` → remove if unused
8. `/southern-california-dumpster-rental` → noindex
9. `/central-valley-dumpster-rental` → noindex

---

## 3. RECOMMENDED SPRINT PLAN

### Sprint 1 (Week 1-2): Revenue Protection & Quote Reliability
- [ ] Verify quote flow persistence (size, material, delivery date, time window, driver notes)
- [ ] Verify all homepage CTAs route correctly
- [ ] Verify AI estimator enriches CRM lead on every interaction
- [ ] Verify heavy material constraint (5/8/10 only) in all selectors
- [ ] Fix any "PDF not available" dead states
- [ ] Verify lead-ingest fires at all progressive milestones

### Sprint 2 (Week 3-4): Sales & Document Workflow
- [ ] Verify internal New Quote → full calculator (/sales/quotes/new?mode=full)
- [ ] Verify quote preview/PDF/send by email/SMS
- [ ] Verify contract send → view → sign → Customer 360 visibility
- [ ] Verify addendum workflow
- [ ] Verify negotiated price range controls (range_min → approval_required)
- [ ] Verify commercial account tier → discount application

### Sprint 3 (Week 5-6): Customer 360 & Identity
- [ ] Verify all 12+ tabs populated with real data
- [ ] Verify Documents tab shows quotes, contracts, signed contracts, invoices
- [ ] Verify identity merge suggestions reviewable
- [ ] Verify duplicate prevention on customer creation
- [ ] Verify Customer Health Score computation

### Sprint 4 (Week 7-8): Dispatch & Driver Operations
- [ ] Verify placement marking → logistics verification → driver visibility
- [ ] Verify driver checkpoint workflow (depart → arrive → deliver → pickup)
- [ ] Verify extras/exceptions report → billing line item
- [ ] Verify dump ticket capture + Customer 360 integration
- [ ] Verify mobile UX for dispatch/driver roles

### Sprint 5 (Week 9-10): Finance & Collections
- [ ] Verify invoice generation from orders
- [ ] Verify payment link send/open/complete flow
- [ ] Verify AR aging dashboard accuracy
- [ ] Verify overdue billing alerts
- [ ] Verify payment actions mobile UX

### Sprint 6 (Week 11-12): SEO Cleanup & QA Consolidation
- [ ] Noindex out-of-focus hub pages (SoCal, Central Valley)
- [ ] Archive legacy/demo routes
- [ ] Verify city pages show representative pricing via principal ZIP
- [ ] Run full SEO health audit
- [ ] Verify all admin QA dashboards functional
- [ ] Final mobile UX pass for all roles

---

## 4. CANONICAL SYSTEM SOURCES OF TRUTH

| System | Source | Location |
|---|---|---|
| Pricing | pricingConfig.ts + dumpster_pricing table + smartPricingEngine.ts | `src/config/pricingConfig.ts`, `src/lib/smartPricingEngine.ts` |
| Locations/Yards | locationConfig.ts + location_configs table | `src/config/locationConfig.ts` |
| Leads | sales_leads table + lead-ingest Edge Function | DB + `supabase/functions/lead-ingest/` |
| Quotes | quotes table + SalesNewQuote component | DB + `src/pages/sales/SalesNewQuote.tsx` |
| Customers | customers table + Customer 360 | DB + `src/pages/admin/CustomerDetail.tsx` |
| Orders | orders table + lifecycle_events | DB |
| Contracts | document_versions + document_acceptances | DB |
| Inventory | assets_dumpsters + dumpster_sizes | DB |
| Estimation Templates | estimation_templates table | DB + `src/pages/admin/config/AIEstimatorTemplates.tsx` |
| Heavy Material Rules | material_rules + smartPricingEngine | DB + engine |
| Identity Resolution | identity_groups + identity_merge_suggestions | DB |

---

## 5. NON-NEGOTIABLE RULES

1. ONE lead system — `sales_leads` table + `lead-ingest` function
2. ONE quote system — website uses `/quote`, staff uses `/sales/quotes/new`
3. ONE customer system — `customers` table + Customer 360
4. ONE pricing source — `pricingConfig.ts` + `dumpster_pricing` + `smartPricingEngine`
5. ONE inventory system — `assets_dumpsters` + `dumpster_sizes`
6. ONE timeline — `timeline_events` + `lifecycle_events`
7. Heavy materials: 5, 8, 10 yd ONLY
8. General debris: 5, 8, 10, 20, 30, 40, 50 yd
9. Operational yards drive pricing, NOT mailing address
10. Internal quotes NEVER use public /quote flow
11. Bay Area-first — no new market expansion until Local Readiness Gate passes

---

## 6. FILE COUNT SUMMARY

| Area | Approximate Files |
|---|---|
| Public pages | ~45 |
| SEO pages | ~12 |
| Admin pages | ~120 |
| Sales pages | ~11 |
| CS pages | ~9 |
| Dispatch pages | ~14 |
| Driver pages | ~9 |
| Finance pages | ~10 |
| Portal pages | ~13 |
| Components | ~50 directories |
| **Total registered routes** | **~350+** |

---

*This audit was generated from the App.tsx route tree and project memory.*
*Last updated: 2026-03-16*
