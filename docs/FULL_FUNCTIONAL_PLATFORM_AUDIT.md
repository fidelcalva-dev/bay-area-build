# Full Functional Platform Audit

> Last updated: 2026-03-30

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
| Quote | `/quote` | ✅ Active | V3QuoteFlow |
| Contact | `/contact` | ✅ Active | ContactUs |
| About | `/about` | ✅ Active | About |
| Blog | `/blog` | ✅ Active | Blog |
| How It Works | `/how-it-works` | ✅ Active | HowItWorks |
| Why Calsan | `/why-calsan` | ✅ Active | WhyCalsan |

## 2. Cleanup Brand (C&D Waste Removal)

| Function | Route | Status | Canonical |
|---|---|---|---|
| Cleanup Home | `/cleanup` | ✅ Active | CleanupHome |
| Cleanup Services | `/cleanup/services` | ✅ Active | CleanupServices |
| Cleanup Service Detail | `/cleanup/services/:slug` | ✅ Active | CleanupServiceDetail |
| Cleanup Quote | `/cleanup/quote` | ✅ Active | CleanupQuote |
| Cleanup Contact | `/cleanup/contact` | ✅ Active | CleanupContact |
| Cleanup For Contractors | `/cleanup/for-contractors` | ✅ Active | CleanupForContractors |
| Cleanup Pricing | `/cleanup/pricing` | ✅ Active | CleanupPricing |
| Cleanup Areas | `/cleanup/areas` | ✅ Active | CleanupServiceAreas |
| Cleanup FAQs | `/cleanup/faqs` | ✅ Active | CleanupFAQs |
| Cleanup About | `/cleanup/about` | ✅ Active | CleanupAbout |
| Cleanup Before/After | `/cleanup/before-after` | ✅ Active | CleanupBeforeAfter |
| Cleanup Local Pages | `/cleanup/:city` | ✅ Active | CleanupLocalPage |

## 3. Lead Intake Channels

| Channel | Handler | Brand | Service Line | Lead Created | Status |
|---|---|---|---|---|---|
| Website Quote (/quote) | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ |
| Cleanup Quote (/cleanup/quote) | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ | ✅ |
| Contact Form (/contact) | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ |
| Cleanup Contact (/cleanup/contact) | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ | ✅ |
| Contractor App (/contractors) | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ |
| Cleanup Contractors (/cleanup/for-contractors) | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ | ✅ |
| AI Chat | lead-ingest | Auto-detected | Auto-detected | ✅ | ✅ |
| Schedule Delivery | schedule-delivery | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ |
| Manual Staff Lead | lead-ingest | Selectable | Selectable | ✅ | ✅ |
| Phone Inbound | lead-from-phone | Auto-detected | DUMPSTER | ✅ | ✅ |
| SMS Inbound | twilio-sms-webhook | Auto-detected | DUMPSTER | ✅ | ✅ |
| Google Ads | lead-from-google-ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ |
| Meta Ads | lead-from-meta | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ |

## 4. CRM / Sales Portal

| Function | Route | Status |
|---|---|---|
| Sales Dashboard | `/sales` | ✅ Active |
| Lead Hub | `/sales/leads` | ✅ Canonical |
| Lead Detail | `/sales/leads/:id` | ✅ Active |
| Quotes List | `/sales/quotes` | ✅ Active |
| Quote Detail | `/sales/quotes/:id` | ✅ Active |
| Internal Calculator | `/sales/quotes/new` | ✅ Canonical |
| Sales Calls | `/sales/calls` | ✅ Active |
| Order Builder | `/sales/order-builder` | ✅ Active |

## 5. Admin Portal

| Function | Route | Status |
|---|---|---|
| Command Center | `/admin` | ✅ Canonical |
| Configuration Hub | `/admin/configuration` | ✅ Canonical |
| Business Config | `/admin/config` | ✅ Active |
| Master Pricing Hub | `/admin/pricing` | ✅ Canonical |
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

## 6. Department Portals

| Portal | Route | Status |
|---|---|---|
| CS Dashboard | `/cs` | ✅ Active |
| Dispatch | `/dispatch` | ✅ Active |
| Control Tower | `/dispatch/control-tower` | ✅ Active |
| Driver | `/driver` | ✅ Active |
| Finance | `/finance` | ✅ Active |
| AR Aging | `/finance/ar-aging` | ✅ Active |

## 7. Customer Portal

| Function | Route | Status |
|---|---|---|
| Login | `/portal` | ✅ Active |
| Dashboard | `/portal/dashboard` | ✅ Active |
| Orders | `/portal/orders` | ✅ Active |
| Documents | `/portal/documents` | ✅ Active |
| Pay | `/portal/pay` | ✅ Active |
| Contract Sign | `/contract/:token` | ✅ Active |

## 8. Edge Functions (Active)

Total: 90+ edge functions deployed. Key canonical functions:
- `lead-ingest` — Canonical lead orchestrator
- `save-quote` — Quote persistence
- `schedule-delivery` — Order scheduling
- `generate-quote-pdf` (via generate-internal-pdf) — PDF generation
- `ghl-send-outbound` — Communication
- `internal-alert-dispatcher` — Notifications
- `lead-sla-monitor` — SLA monitoring
- `process-payment` — Payment processing
- `send-outbound-quote` — Quote delivery

## 9. Duplicate Logic Assessment

| Business Function | Canonical Service | Duplicate Risk | Status |
|---|---|---|---|
| Lead creation | lead-ingest | LOW — all paths unified | ✅ Clean |
| Pricing calculation | masterPricingService | LOW — single gateway | ✅ Clean |
| Quote session | useQuoteSession | LOW | ✅ Clean |
| Draft quote | draftQuoteService | LOW | ✅ Clean |
| Communication | ghlCommunication | LOW | ✅ Clean |
| Timeline events | timelineService | LOW | ✅ Clean |
| Notifications | notificationService | LOW | ✅ Clean |
| Contract lifecycle | contractService | LOW | ✅ Clean |
| Customer identity | identity_groups + triggers | LOW | ✅ Clean |
| PDF generation | generate-internal-pdf | LOW | ✅ Clean |

## Summary

- **Total active routes**: ~120+
- **Total edge functions**: ~90+
- **Duplicate business logic**: No critical duplicates detected
- **Both brands unified**: ✅ Yes — same CRM, same Lead Hub, same Customer 360
- **Pipeline**: Unified across service lines with filter-based views
