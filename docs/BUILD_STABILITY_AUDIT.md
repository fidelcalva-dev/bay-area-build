# BUILD / RUNTIME STABILITY AUDIT

> Generated: 2026-03-19

## Issues Found

| # | Issue Type | File | Severity | Route Impact | Notes |
|---|-----------|------|----------|-------------|-------|
| 1 | Unused import | App.tsx (LeadInbox) | 🟢 Low | None | Imported but never mounted |
| 2 | Unused import | App.tsx (SalesLeadInbox) | 🟢 Low | None | Imported but never mounted |
| 3 | Dead file | MasterAIDashboard.tsx | 🟢 Low | None | 4 Master AI files not imported |
| 4 | Dead file | AuditLogsViewer.tsx | 🟢 Low | None | Replaced by AuditLogsPage |
| 5 | Dead file | UserRolesManager.tsx | 🟢 Low | None | Not imported |
| 6 | Dead file | MasterPricingDashboard.tsx | 🟢 Low | None | Not imported |
| 7 | Dead file | CityLandingPage.tsx | 🟢 Low | None | Replaced by SeoCityPage |
| 8 | Dead file | Locations.tsx | 🟢 Low | None | Redirect to /areas exists |
| 9 | Dead file | PreviewHome.tsx, PreviewQuote.tsx | 🟢 Low | None | Redirected |
| 10 | Dead files (3) | DispatchRuns*.tsx | 🟢 Low | None | Explicitly removed per comment |
| 11 | Dead file | SalesNewQuote.tsx | 🟢 Low | None | Import aliased to InternalCalculator |
| 12 | Route conflict risk | City+Material vs City+Size | 🟡 Medium | SEO pages | Relies on `-yard` suffix |
| 13 | Catch-all route risk | `/:citySlug/:subSlug` | 🟡 Medium | Future routes | Could intercept new patterns |
| 14 | Config overlap | `/admin/config` vs `/admin/configuration` | 🟡 Medium | Admin UX | Confusing dual entry |
| 15 | Large App.tsx | 1475 lines | 🟡 Medium | Maintainability | Consider route splitting |

---

## Build Health Summary

| Metric | Value |
|--------|-------|
| Total files in src/pages/ | ~200+ |
| Mounted routes | ~320 |
| Dead/orphaned files | 17 |
| Unused imports in App.tsx | 2 |
| Route conflicts | 2 (low severity) |
| App.tsx size | 1475 lines (large) |
| Build-blocking issues | 0 |
| Runtime crash risks | 0 confirmed |
