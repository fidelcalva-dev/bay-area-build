# DUPLICATE PAGE AUDIT

> Generated: 2026-03-19

## Confirmed Duplicates / Overlaps

| # | Canonical | Duplicate/Overlap | Type | Reason | Merge Likely? |
|---|-----------|-------------------|------|--------|---------------|
| 1 | `/admin` (index) | `/admin/control-center` | Same component | Both render CalsanControlCenter | ✅ Keep index, remove route |
| 2 | `/admin/ads` | `/admin/ads/overview` | Redirect | Already redirected | ✅ Done |
| 3 | `/admin/seo/dashboard` | `/admin/seo` | Redirect | Already redirected | ✅ Done |
| 4 | `/sales/leads` | `/sales/inbox`, `/sales/lead-hub` | Redirect | Already redirected | ✅ Done |
| 5 | `/admin/config` | `/admin/configuration` | Overlap | Two config entry points — different UIs? | ⚠️ Review |
| 6 | `/admin/pricing` | `/admin/pricing-engine` | Overlap | Both pricing overview dashboards | ⚠️ Review |
| 7 | `/admin/seo/health` | `/admin/qa/seo-health` | Overlap | Two SEO health views | ⚠️ Merge |
| 8 | `/admin/alerts` | `/admin/notifications/internal` | Overlap | Both alert/notification views | ⚠️ Review |
| 9 | `/admin/facilities` | `/admin/facilities/finder` | Parent/tool | Finder is utility under facilities | ❌ OK |
| 10 | `/dispatch/facilities` | `/admin/facilities/finder` | Same component | FacilitiesFinder shared | ❌ Intentional alias |
| 11 | `/dumpster-rental-oakland-ca` | `/dumpster-rental/oakland` | SEO decision | Domination vs programmatic — both kept with unique canonicals | ❌ Keep both |
| 12 | `/dumpster-rental-san-jose-ca` | `/dumpster-rental/san-jose` | SEO decision | Same as above | ❌ Keep both |
| 13 | `/dumpster-rental-san-francisco-ca` | `/dumpster-rental/san-francisco` | SEO decision | Same as above | ❌ Keep both |
| 14 | `/portal/order/:orderId` | `/portal/orders/:orderId` | Legacy alias | SMS backward compat — same component | ❌ Keep alias |
| 15 | `/internal/calculator` | `/ops/calculator`, `/sales/calculator`, `/cs/calculator`, `/dispatch/calculator` | Role aliases | Intentional per-role nav convenience | ❌ Keep |

---

## Orphaned File Duplicates

| Active | Orphaned File | Action |
|--------|---------------|--------|
| AuditLogsPage.tsx | AuditLogsViewer.tsx | Safe to delete |
| SeoCityPage.tsx | CityLandingPage.tsx | Safe to delete |
| Areas.tsx + redirect | Locations.tsx | Safe to delete |
| InternalCalculator.tsx | SalesNewQuote.tsx | Safe to delete (import aliased) |
| AI Copilots | MasterAIDashboard/Decisions/Jobs/Notifications | Safe to delete (4 files) |
| PricingReadinessDashboard | MasterPricingDashboard.tsx | Safe to delete |
| Redirect in place | PreviewHome.tsx, PreviewQuote.tsx | Safe to delete |
| Dispatch routes | DispatchRunsCalendar/List/Detail.tsx | Safe to delete (3 files) |

**Total files safe to delete: 15**
