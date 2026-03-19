# BROKEN PAGE AUDIT

> Generated: 2026-03-19

## Methodology
Static analysis of imports, route params, and component dependencies. Runtime smoke testing not performed (analysis-only phase).

---

## Severity Levels
- 🔴 **Critical**: Page crashes on load
- 🟠 **High**: Core functionality broken
- 🟡 **Medium**: Partial functionality issues
- 🟢 **Low**: Cosmetic or edge-case issues

---

## Issues Found

| # | Route | Error Type | Severity | Root Cause | Fix Scope | Notes |
|---|-------|-----------|----------|------------|-----------|-------|
| 1 | `/dumpster-rental/:citySlug/:materialSlug` | Route conflict | 🟡 | Overlaps with `/:sizeSlug-yard` — both are `:paramSlug` under same parent. Route order matters; `-yard` suffix is the differentiator | Router order | Currently works due to `-yard` suffix match in size pattern |
| 2 | `/:citySlug/:subSlug` | Catch-all risk | 🟡 | Legacy redirect pattern could intercept valid future routes | Router order | Low risk — placed near bottom |
| 3 | LeadInbox.tsx | Unused import | 🟢 | Imported in App.tsx but never mounted — wasted bundle if not tree-shaken | Remove import | |
| 4 | SalesLeadInbox.tsx | Unused import | 🟢 | Imported in App.tsx but never mounted | Remove import | |
| 5 | `/admin/config` vs `/admin/configuration` | Unclear purpose | 🟡 | Two entry points — users may get confused | Review & merge | |
| 6 | `/quick-order` | Off-strategy | 🟡 | May conflict with dual-path quote flow policy | Review | Noindexed |
| 7 | `/green-halo/portal/*` | Demo data dependency | 🟡 | Demo portal — may break if demo data removed | Low priority | Noindexed |
| 8 | 17 orphaned files | Dead code | 🟢 | Files exist but not mounted — no runtime impact but add confusion | Delete | See DUPLICATE_PAGE_AUDIT |

---

## Pages Likely Working (High Confidence)
- All public marketing pages ✅
- All SEO city engine pages ✅
- All department portals (Sales, CS, Dispatch, Finance, Driver) ✅
- All admin core modules (Orders, Customers, Pricing) ✅
- Customer portal ✅
- Quote flow ✅

## Pages Status Unknown (Need Runtime Testing)
- All AI copilot pages (depend on edge functions + AI models)
- Telephony pages (depend on external integrations)
- Google Ads pages (depend on external API)
- Local Search pages (depend on external APIs)
- Marketing analytics (depend on GA4 integration)
- Green Halo portal (demo data)
