# FINAL CATEGORY SUMMARY

> Finalized: 2026-03-19

## Category Architecture

| Category | Canonical Route | Kept Distinct Pages | Active Redirects | Aliases | Status |
|----------|----------------|-------------------|-----------------|---------|--------|
| **Homepage** | `/` | — | `/preview/home` → `/`, `/ai-dumpster-assistant` → `/` | — | ✅ Final |
| **Quote** | `/quote` | — | `/preview/quote` → `/quote` | — | ✅ Final |
| **Pricing** | `/pricing` | — | — | — | ✅ Final |
| **Sizes** | `/sizes` | — | — | — | ✅ Final |
| **Materials** | `/materials` | — | — | — | ✅ Final |
| **Areas** | `/areas` | — | `/locations` → `/areas` | — | ✅ Final |
| **Contractors** | `/contractors` | — | — | — | ✅ Final |
| **Blog** | `/blog` | `/blog/:articleSlug` | — | — | ✅ Final |
| **Contact** | `/contact` | — | — | — | ✅ Final |
| **About** | `/about` | — | — | — | ✅ Final |
| **How It Works** | `/how-it-works` | — | — | — | ✅ Final |
| **Why Calsan** | `/why-calsan` | — | — | — | ✅ Final |
| **Admin Index** | `/admin` | — | `/admin/control-center`, `/admin/legacy-dashboard` → `/admin` | — | ✅ Final |
| **Module Registry** | `/admin/modules` | — | — | — | ✅ Final |
| **Config Hub** | `/admin/configuration` | `/admin/config` (distinct purpose) | — | — | ✅ Final |
| **Business Config** | `/admin/config` | `/admin/configuration` (distinct purpose) | — | — | ✅ Final |
| **Customers** | `/admin/customers` | `/admin/customers/:id` (Customer 360) | — | — | ✅ Final |
| **Orders** | `/admin/orders` | — | — | — | ✅ Final |
| **Pricing Admin** | `/admin/pricing` | Subpages (zones, ZIPs, etc.) | `/admin/pricing-engine` → `/admin/pricing` | — | ✅ Final |
| **SEO Admin** | `/admin/seo/dashboard` | `/admin/seo/health` | `/admin/seo` → `/admin/seo/dashboard`, `/admin/qa/seo-health` → `/admin/seo/health` | — | ✅ Final |
| **GHL** | `/admin/ghl` | — | — | — | ✅ Final |
| **Alerts** | `/admin/alerts` | `/admin/notifications/internal` (distinct) | — | — | ✅ Final |
| **QA Hub** | `/admin/qa/control-center` | Domain health, workflow explorer | — | — | ✅ Final |
| **Leads** | `/admin/leads` | `/sales/leads`, `/sales/leads/:id` | `/sales/inbox`, `/sales/lead-hub` → `/sales/leads` | — | ✅ Final |
| **Users** | `/admin/users` | — | — | — | ✅ Final |
| **Ads** | `/admin/ads` | Campaigns, rules, markets, logs | `/admin/ads/overview` → `/admin/ads` | — | ✅ Final |
| **Sales** | `/sales` | `/sales/quotes`, `/sales/quotes/:id` | — | — | ✅ Final |
| **Calculator** | `/sales/quotes/new` | — | — | 5 role aliases | ✅ Final |
| **CS** | `/cs` | — | — | — | ✅ Final |
| **Dispatch** | `/dispatch` | `/dispatch/control-tower` | — | — | ✅ Final |
| **Driver** | `/driver` | Runs, pre-trip | `/driver/legacy` → `/driver` | — | ✅ Final |
| **Finance** | `/finance` | `/finance/ar-aging` | — | — | ✅ Final |
| **Portal** | `/portal` | Dashboard, orders, documents, pay, sign | — | `/portal/order/:id` (SMS compat) | ✅ Final |
| **Contract Sign** | `/contract/:token` | — | — | — | ✅ Final |
| **SEO Cities** | `/dumpster-rental/:citySlug` | Size, material, job subpages | Legacy `/:city/:size-yard-dumpster` redirects | — | ✅ Final |
| **SEO Domination** | `/dumpster-rental-{city}-ca` | — | — | — | ✅ Final (distinct from programmatic) |

## Totals

- **Active redirects**: 16
- **Intentional aliases**: 6
- **Distinct-but-similar pairs**: 5 (config hub/config, alerts/notifications, 3 SEO domination/programmatic)
- **Orphaned files removed**: 15+ (see `docs/CLEANUP_EXECUTION_LOG.md`)

## Remaining Review Items

| Item | Priority | Notes |
|------|----------|-------|
| Calculator aliases → redirects | Low | Work fine as aliases; convert when convenient |
| Portal order legacy alias | Low | Keep indefinitely for SMS backward compat |
| SEO domination vs programmatic | Low | Intentional strategy — both target different keywords |
| Markets subpage redirect | Low | `/admin/markets/new` → `/admin/markets/new-location` may be simplified later |

## Operating Standard

This document, together with `CANONICAL_ROUTE_MAP.md` and `REDIRECT_MATRIX.md`, constitutes the **canonical category architecture** for all future development. Any new page must be registered in `src/lib/routeCategories.ts` and mapped here before implementation.
