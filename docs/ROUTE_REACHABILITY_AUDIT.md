# ROUTE REACHABILITY AUDIT

> Generated: 2026-03-19

## Summary

| Status | Count |
|--------|-------|
| Mounted + Reachable | ~305 |
| Mounted, Redirect only | 10 |
| Orphaned (file exists, no route) | 17 |
| Legacy but still mounted | 3 |
| Hidden (no nav link) | ~180 |

---

## ORPHANED ROUTES (file exists, NOT mounted)

| File | Mounted | Linked | Reachable | Notes |
|------|---------|--------|-----------|-------|
| MasterAIDashboard.tsx | ❌ | ❌ | ❌ | Dead code — superseded by AI copilots |
| MasterAIDecisions.tsx | ❌ | ❌ | ❌ | Dead code |
| MasterAIJobs.tsx | ❌ | ❌ | ❌ | Dead code |
| MasterAINotifications.tsx | ❌ | ❌ | ❌ | Dead code |
| AuditLogsViewer.tsx | ❌ | ❌ | ❌ | Replaced by AuditLogsPage |
| UserRolesManager.tsx | ❌ | ❌ | ❌ | Unused — roles managed in UsersManager? |
| MasterPricingDashboard.tsx | ❌ | ❌ | ❌ | Superseded by PricingReadinessDashboard? |
| CityLandingPage.tsx | ❌ | ❌ | ❌ | Replaced by SeoCityPage |
| Locations.tsx | ❌ | ❌ | ❌ | Redirect to /areas exists; file dead |
| PreviewHome.tsx | ❌ | ❌ | ❌ | Redirected; file dead |
| PreviewQuote.tsx | ❌ | ❌ | ❌ | Redirected; file dead |
| DispatchRunsCalendar.tsx | ❌ | ❌ | ❌ | Explicitly removed per comment |
| DispatchRunsList.tsx | ❌ | ❌ | ❌ | Explicitly removed per comment |
| DispatchRunDetail.tsx | ❌ | ❌ | ❌ | Explicitly removed per comment |
| SalesNewQuote.tsx | ❌ | ❌ | ❌ | Import aliased to InternalCalculator |
| LeadInbox.tsx (sales) | ✅ imported | ❌ | ❌ | Imported but no route mounts it |
| SalesLeadInbox.tsx | ✅ imported | ❌ | ❌ | Imported but no route mounts it |

---

## LEGACY BUT STILL MOUNTED

| Route | Component | Notes |
|-------|-----------|-------|
| `/admin/legacy-dashboard` | AdminDashboard.tsx | Labeled "legacy" |
| `/driver/legacy` | DriverApp.tsx | Standalone legacy driver app |
| `/admin/control-center` | CalsanControlCenter | Duplicate of admin index |

---

## REDIRECT-ONLY ROUTES (10)

| Route | Target |
|-------|--------|
| `/locations` | `/areas` |
| `/ai-dumpster-assistant` | `/` |
| `/preview/quote` | `/quote` |
| `/preview/home` | `/` |
| `/admin/ads/overview` | `/admin/ads` |
| `/admin/seo` | `/admin/seo/dashboard` |
| `/admin/markets/new` | `/admin/markets/new-location` |
| `/sales/inbox` | `/sales/leads` |
| `/sales/lead-hub` | `/sales/leads` |
| `/:citySlug/:sizeSlug-yard-dumpster` | Legacy redirect |

---

## POTENTIAL ROUTE CONFLICTS

| Route Pattern | Conflict |
|---------------|----------|
| `/dumpster-rental/:citySlug/:sizeSlug-yard` | Overlaps with `/dumpster-rental/:citySlug/:materialSlug` — React Router matches first |
| `/:citySlug/:subSlug` | Catch-all legacy redirect — could swallow valid routes if placed wrong |
