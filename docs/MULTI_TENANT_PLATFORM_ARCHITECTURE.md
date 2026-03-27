# Multi-Tenant Platform Architecture

> Last updated: 2026-03-27

## Overview

The platform operates as a **multi-company, multi-service operating system** built on one reusable core with isolated tenant data. It does NOT create a second disconnected CRM — it extends the existing canonical service layer with company-awareness and service-vertical configuration.

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│           PLATFORM CONTROL PLANE                │
│  Provider onboarding · Lead routing · Billing   │
│  Marketplace ops · Aggregated analytics         │
├─────────────────────────────────────────────────┤
│           COMPANY CONFIG LAYER                  │
│  companies · company_services · branding        │
│  seo_config · header/footer · payment accounts  │
│  analytics_ids · GHL subaccounts                │
├─────────────────────────────────────────────────┤
│         SERVICE VERTICAL LAYER                  │
│  service_verticals · pricing_model · quote_fields│
│  line_item_types · surcharges · doc templates   │
├─────────────────────────────────────────────────┤
│         TENANT DATA (ISOLATED)                  │
│  customers · leads · quotes · orders · invoices │
│  payments · docs · timeline · communications    │
│  (scoped by company_id, never shared)           │
├─────────────────────────────────────────────────┤
│         REUSABLE CORE MODULES                   │
│  Lead Orchestrator · Quote Engine · Pricing Hub │
│  Customer 360 · Portal · Docs · Payments        │
│  Timeline · Notifications · Role Portals        │
└─────────────────────────────────────────────────┘
```

## Database Tables

### Platform Layer
| Table | Purpose |
|---|---|
| `companies` | Tenant registry with branding, config, credentials |
| `service_verticals` | Platform-wide service catalog |
| `company_services` | Which services each company offers |
| `provider_profiles` | Marketplace provider details |
| `subscription_plans` | Monetization tiers |
| `lead_routing_rules` | Geo + service + priority routing |
| `document_templates_mt` | Company/service-aware doc templates |
| `pricing_families` | Per-company pricing catalogs |
| `company_user_assignments` | Staff ↔ company mapping |

### Tenant Data (Existing, Add company_id)
All existing transactional tables (customers, sales_leads, quotes, orders, invoices, payments, timeline, etc.) will be extended with `company_id` to enable tenant isolation via RLS.

## Service Verticals

| Code | Category | Pricing Model |
|---|---|---|
| CONSTRUCTION_CLEANUP | cleanup | LABOR_PLUS_DISPOSAL |
| POST_CONSTRUCTION_CLEANUP | cleanup | SIZE_BASED |
| DEMOLITION_SUPPORT | cleanup | LABOR_PLUS_DISPOSAL |
| SITE_CLEANUP | cleanup | FLAT_PACKAGE |
| RECURRING_SITE_SERVICE | cleanup | RECURRING_SERVICE |
| MATERIAL_PICKUP | hauling | LINE_ITEM_BASED |
| LABOR_ASSISTED_CLEANUP | labor | LINE_ITEM_BASED |
| DUMPSTER_RENTAL_LEGACY | dumpster | SMART_ENGINE |

## Brand Separation Rules

1. **Calsan C&D Waste Removal** = cleanup/debris/service business (new brand)
2. **Calsan Dumpsters Pro** = dumpster rentals only (legacy brand)
3. Cleanup pages must NOT contain dumpster-specific content
4. Dumpster rental service is `public_visible: false` on the cleanup brand
5. Cross-reference is allowed only as "We also offer dumpster rentals through our sister brand"

## Marketplace Model

### Subscription Tiers
| Plan | Price | Lead Cap | Priority |
|---|---|---|---|
| Starter | $299/mo | 20 | 1 |
| Growth | $599/mo | 50 | 5 |
| Pro | $999/mo | Unlimited | 10 |

### Lead Routing
- Service match → Geo match → Subscription status → Plan priority → Capacity → SLA → QA score
- Supports: exclusive, shared, round-robin, priority scoring, admin override

## Document Templates
| Code | Scope |
|---|---|
| MSA_CLEANUP_STD | Construction/Post-Con/Demo cleanup |
| SERVICE_ADDENDUM_STD | Site cleanup, material pickup, labor |
| SOW_CLEANUP_STD | Detailed scope for cleanup projects |
| QUOTE_PROPOSAL_STD | All quotable services |
| CHANGE_ORDER_STD | Scope/pricing modifications |
| PAYMENT_TERMS_NET7 | Standard payment terms |
| RECURRING_SERVICE_AGREEMENT_STD | Recurring services |
| JOB_COMPLETION_REPORT_STD | Post-job completion |

## Pricing Families (Calsan Services)
| Family | Key Rates |
|---|---|
| LABOR_RATES | $95/hr tech, $115 lead, $135 supervisor |
| TRUCK_FEES | $195 service trip, $295 flatbed, $395 roll-off |
| DISPOSAL_RATES | $85/ton general, $65 concrete, $95 mixed C&D |
| SQFT_RATES | $0.35-$0.65/sqft, $695 minimum |
| PACKAGE_RATES | $325 quick / $595 extended / $995 full day |
| RECURRING_RATES | $800-$1,800/month by frequency |
| SURCHARGES | Rush +20%, After-hours +25%, Stairs +15%, etc. |
| SERVICE_AREA | Zone A-D surcharges ($0-$150) |

## Role Portals

### Platform Roles
- Platform Admin, Marketplace Ops, Provider Success, Billing

### Company Roles (Per Tenant)
- Sales, Customer Service, Dispatch, Crew Lead, Finance

## Implementation Phases

### Phase 1 — Foundation (Current) ✅
- [x] Multi-tenant database schema
- [x] Service vertical catalog
- [x] Company seed (Calsan Services)
- [x] Pricing families
- [x] Subscription plans
- [x] TypeScript config layer
- [x] Architecture documentation

### Phase 2 — Tenant Isolation
- [ ] Add `company_id` to existing transactional tables
- [ ] RLS policies for tenant isolation
- [ ] Company context provider (React)
- [ ] Company-aware Lead Orchestrator
- [ ] Company-aware Quote Engine

### Phase 3 — Cleanup Brand Public Site
- [ ] Home page (config-driven)
- [ ] Service pages (7 cleanup services)
- [ ] Local pages (Oakland, Alameda, Bay Area)
- [ ] Pricing page
- [ ] Quote flow (service-aware)
- [ ] FAQ, Contact, Before/After

### Phase 4 — Marketplace
- [ ] Provider registration flow
- [ ] Lead routing engine
- [ ] Subscription billing
- [ ] Provider dashboard
- [ ] Platform admin panel

### Phase 5 — Advanced
- [ ] Multi-brand SEO isolation
- [ ] Separate analytics per company
- [ ] Separate payment accounts
- [ ] API access (Pro tier)
- [ ] Success fee model (Phase 2 monetization)

## Config Files

| File | Purpose |
|---|---|
| `src/config/platform/types.ts` | All platform type definitions |
| `src/config/platform/serviceVerticals.ts` | Service catalog with quote fields |
| `src/config/platform/companySeeds.ts` | Calsan Services static config |
| `src/config/platform/subscriptionPlans.ts` | Marketplace pricing tiers |
| `src/config/platform/documentTemplates.ts` | Document template registry |
| `src/config/platform/index.ts` | Public API barrel export |

## Placeholders (Pending)

| Placeholder | Purpose |
|---|---|
| `[ADD_DOMAIN]` | Cleanup brand domain |
| `[ADD_MAIN_PHONE]` | Primary phone number |
| `[ADD_EMAIL_DOMAIN]` | Email sending domain |
| `[ADD_ADDRESS]` | Business address |
| `[ADD_LOGO]` | Cleanup brand logo URL |
| `[ADD_COLORS]` | Brand color palette |
| `[ADD_ANALYTICS_IDS]` | GA4/GTM IDs |
| `[ADD_PAYMENT_ACCOUNT]` | Payment processor account |
| `[ADD_GHL_SUBACCOUNT]` | GoHighLevel subaccount |
