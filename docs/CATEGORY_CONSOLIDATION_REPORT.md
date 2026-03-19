# CATEGORY CONSOLIDATION REPORT

> Generated: 2026-03-19

## Summary

Most duplicate pages were already resolved during the canonicalization cleanup phase. This report confirms the canonical page per category and documents all redirects in place.

---

## Category Family Audit

| Category | Canonical Route | Duplicates / Redirects | Status |
|----------|----------------|----------------------|--------|
| **Homepage** | `/` | `/preview/home` → `/`, `/ai-dumpster-assistant` → `/` | ✅ Consolidated |
| **Quote** | `/quote` | `/preview/quote` → `/quote` | ✅ Consolidated |
| **Pricing** | `/pricing` | — | ✅ Clean |
| **Sizes** | `/sizes` | — | ✅ Clean |
| **Materials** | `/materials` | — | ✅ Clean |
| **Areas** | `/areas` | `/locations` → `/areas` | ✅ Consolidated |
| **Contractors** | `/contractors` | — | ✅ Clean |
| **Blog** | `/blog` | — | ✅ Clean |
| **Admin Index** | `/admin` | `/admin/control-center` → `/admin`, `/admin/legacy-dashboard` → `/admin` | ✅ Consolidated |
| **Configuration Hub** | `/admin/configuration` | Distinct from `/admin/config` (raw DB settings). Both kept with cross-links. | ✅ Clarified |
| **Business Config** | `/admin/config` | Distinct from `/admin/configuration` (nav hub). Both kept with cross-links. | ✅ Clarified |
| **Pricing Admin** | `/admin/pricing` | `/admin/pricing-engine` → `/admin/pricing` | ✅ Consolidated |
| **SEO Admin** | `/admin/seo/dashboard` | `/admin/seo` → `/admin/seo/dashboard` | ✅ Consolidated |
| **SEO Health** | `/admin/seo/health` | `/admin/qa/seo-health` → `/admin/seo/health` | ✅ Consolidated |
| **Alerts** | `/admin/alerts` | Distinct from `/admin/notifications/internal` (delivery tracking). Both kept. | ✅ Distinct purpose |
| **Lead Hub** | `/sales/leads` | `/sales/inbox` → `/sales/leads`, `/sales/lead-hub` → `/sales/leads` | ✅ Consolidated |
| **Calculator** | `/sales/quotes/new` | `/internal/calculator`, `/ops/calculator`, `/sales/calculator`, `/cs/calculator`, `/dispatch/calculator` = intentional role aliases | ✅ Aliases kept |
| **Ads** | `/admin/ads` | `/admin/ads/overview` → `/admin/ads` | ✅ Consolidated |
| **Markets** | `/admin/markets` | `/admin/markets/new` → `/admin/markets/new-location` | ✅ Consolidated |
| **Driver** | `/driver` | `/driver/legacy` → `/driver` | ✅ Consolidated |
| **Customer 360** | `/admin/customers/:id` | — | ✅ Clean |
| **Dispatch** | `/dispatch` | — | ✅ Clean |
| **Finance** | `/finance` | — | ✅ Clean |
| **QA Hub** | `/admin/qa/control-center` | — | ✅ Clean |
| **Customer Portal** | `/portal/dashboard` | `/portal/order/:id` = legacy alias for `/portal/orders/:id` (kept for SMS backward compat) | ✅ Alias kept |

---

## Redirect Matrix (All Active Redirects)

| Source | Target | Type |
|--------|--------|------|
| `/locations` | `/areas` | Navigate replace |
| `/ai-dumpster-assistant` | `/` | Navigate replace |
| `/preview/quote` | `/quote` | Navigate replace |
| `/preview/home` | `/` | Navigate replace |
| `/admin/control-center` | `/admin` | Navigate replace |
| `/admin/legacy-dashboard` | `/admin` | Navigate replace |
| `/admin/pricing-engine` | `/admin/pricing` | Navigate replace |
| `/admin/seo` | `/admin/seo/dashboard` | Navigate replace |
| `/admin/qa/seo-health` | `/admin/seo/health` | Navigate replace |
| `/admin/ads/overview` | `/admin/ads` | Navigate replace |
| `/admin/markets/new` | `/admin/markets/new-location` | Navigate replace |
| `/sales/inbox` | `/sales/leads` | Navigate replace |
| `/sales/lead-hub` | `/sales/leads` | Navigate replace |
| `/driver/legacy` | `/driver` | Navigate replace |
| `/:citySlug/:sizeSlug-yard-dumpster` | `/dumpster-rental/:citySlug/:sz-yard` | Legacy SEO redirect |
| `/:citySlug/:subSlug` | `/dumpster-rental/:citySlug/:subSlug` | Legacy SEO redirect |

**Total active redirects: 16**

---

## Intentional Aliases (Not Duplicates)

| Alias Route | Canonical | Reason |
|-------------|-----------|--------|
| `/internal/calculator` | `/sales/quotes/new` | Role convenience |
| `/ops/calculator` | `/sales/quotes/new` | Role convenience |
| `/sales/calculator` | `/sales/quotes/new` | Role convenience |
| `/cs/calculator` | `/sales/quotes/new` | Role convenience |
| `/dispatch/calculator` | `/sales/quotes/new` | Role convenience |
| `/portal/order/:orderId` | `/portal/orders/:orderId` | SMS backward compat |

---

## Distinct Pages That Appear Similar But Serve Different Purposes

| Page A | Page B | Why Both Kept |
|--------|--------|---------------|
| `/admin/configuration` | `/admin/config` | Hub = visual nav to modules; Config = raw DB key-value editor |
| `/admin/alerts` | `/admin/notifications/internal` | Alerts = system alerts + recommendations; Internal = notification delivery tracking |
| `/dumpster-rental-oakland-ca` | `/dumpster-rental/oakland` | SEO domination page vs programmatic city page |
| `/dumpster-rental-san-jose-ca` | `/dumpster-rental/san-jose` | Same pattern |
| `/dumpster-rental-san-francisco-ca` | `/dumpster-rental/san-francisco` | Same pattern |

---

## Files Removed During Canonicalization (Previously)

See `docs/CLEANUP_EXECUTION_LOG.md` for the full list of 15+ orphaned files deleted during prior phases.

## Remaining Review Items

| Item | Priority | Notes |
|------|----------|-------|
| Calculator aliases | Low | Could be converted to redirects in future but work fine as aliases |
| Portal order legacy alias | Low | Keep indefinitely for SMS link backward compat |
| SEO domination vs programmatic overlap | Low | Intentional SEO strategy — both pages target different keywords |
