# Cleanup Execution Log

**Date**: 2026-03-19  
**Phase**: Canonicalization & Consolidation

---

## Files Deleted (7)

| File | Reason |
|------|--------|
| `src/pages/admin/AdminDashboard.tsx` | Legacy dashboard replaced by CalsanControlCenter |
| `src/pages/admin/ConfigIndex.tsx` | Dead import — never mounted as a route |
| `src/pages/admin/PricingEngineDashboard.tsx` | Duplicate of PricingManager — consolidated |
| `src/pages/driver/DriverApp.tsx` | Legacy standalone driver app — modern driver portal active |
| `supabase/functions/ghl-send-message/` | Deprecated — merged into ghl-send-outbound |
| `supabase/functions/ghl-message-worker/` | Deprecated — queue processor no longer used |
| `supabase/functions/ghl-inbound-webhook/` | Deprecated — duplicate of ghl-webhook-inbound |

## Routes Consolidated (Redirects Added)

| Route | Action | Target |
|-------|--------|--------|
| `/admin/control-center` | → Redirect | `/admin` (same CalsanControlCenter component) |
| `/admin/legacy-dashboard` | → Redirect | `/admin` (legacy AdminDashboard retired) |
| `/admin/pricing-engine` | → Redirect | `/admin/pricing` (PricingManager is canonical) |
| `/admin/qa/seo-health` | → Redirect | `/admin/seo/health` (SeoHealthPage is canonical, in sidebar) |
| `/driver/legacy` | → Redirect | `/driver` (modern driver portal is canonical) |

## Canonical Route Map

### Public Site
| Route | Component | Status |
|-------|-----------|--------|
| `/` | Index.tsx | ✅ Canonical |
| `/quote` | Quote.tsx | ✅ Canonical |
| `/pricing` | Pricing.tsx | ✅ Canonical |
| `/sizes` | Sizes.tsx | ✅ Canonical |
| `/materials` | Materials.tsx | ✅ Canonical |
| `/areas` | Areas.tsx | ✅ Canonical |
| `/contractors` | Contractors.tsx | ✅ Canonical |
| `/dumpster-rental/:citySlug` | SeoCityPage.tsx | ✅ SEO Engine |

### CRM / Admin
| Route | Component | Status |
|-------|-----------|--------|
| `/admin` | CalsanControlCenter.tsx | ✅ Canonical (index) |
| `/admin/configuration` | ConfigurationHub.tsx | ✅ Canonical (config hub) |
| `/admin/config` | ConfigManager.tsx | ✅ Canonical (business rules) |
| `/admin/pricing` | PricingManager.tsx | ✅ Canonical |
| `/admin/seo/health` | SeoHealthPage.tsx | ✅ Canonical SEO health |
| `/admin/ghl` | GHLIntegrationPage.tsx | ✅ Canonical GHL |

### Canonical Edge Functions (GHL)
| Function | Role | Status |
|----------|------|--------|
| `ghl-send-outbound` | Outbound messaging | ✅ Canonical |
| `ghl-webhook-inbound` | Inbound webhook | ✅ Canonical |
| `ghl-sync-poller` | Sync/polling | ✅ Canonical |
| `highlevel-webhook` | Contact sync | ✅ Active |

## Route Categories Updated
- `routeCategories.ts`: Removed legacy-dashboard and driver/legacy entries
- `adminRoutes.tsx`: Removed 4 dead imports (AdminDashboard, ConfigIndex, PricingEngineDashboard, SeoHealthDashboard)
- `departmentRoutes.tsx`: Removed DriverApp import, replaced with redirect

## Unresolved / Kept Intentionally
- `/admin/configuration` + `/admin/config` both remain — different purposes (hub vs business rules)
- `/portal/order/:orderId` kept as legacy alias (same component as `/portal/orders/:orderId`)
- Green Halo portal routes kept — strategic demo feature
- `qa/SeoHealthDashboard.tsx` file kept — still referenced by other QA tools, just not mounted as duplicate route

## Summary
- **Files deleted**: 7 (4 pages + 3 edge functions)
- **Routes redirected**: 5
- **Dead imports removed**: 5
- **Canonical GHL functions**: 4 (3 deprecated deleted)
