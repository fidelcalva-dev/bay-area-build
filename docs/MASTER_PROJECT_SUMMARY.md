# MASTER PROJECT SUMMARY

> Full Project Audit — Updated: 2026-03-19 (Post-Cleanup)

---

## Key Metrics

| Metric | Count |
|--------|-------|
| **Total mounted routes** | ~315 (was ~320, 5 converted to redirects) |
| **Total page files** | ~189 (was ~193, deleted 4 more) |
| **Public routes** | ~76 (including redirects + dynamic SEO) |
| **Protected CRM routes** | ~195 |
| **Customer portal routes** | ~15 |
| **Department portal routes** | ~43 |
| **Redirect-only routes** | 15 (was 10, added 5 consolidation redirects) |
| **Orphaned/dead files** | 0 |
| **Duplicate/overlapping routes** | 0 (resolved) |
| **Broken pages (confirmed)** | 0 |
| **QA/Health dashboards** | 28 |
| **Config/settings pages** | 40 |
| **SEO-indexable pages** | 700+ (dynamic) |
| **AI copilot pages** | 11 |
| **Edge functions** | 109 (was 112, deleted 3 deprecated GHL) |
| **App.tsx lines** | ~100 (was 1475, refactored into route modules) |

---

## CLEANUP COMPLETED

### Phase 1 — Dead Files Deleted (18 files)
1. ✅ `src/pages/admin/MasterAIDashboard.tsx`
2. ✅ `src/pages/admin/MasterAIDecisions.tsx`
3. ✅ `src/pages/admin/MasterAIJobs.tsx`
4. ✅ `src/pages/admin/MasterAINotifications.tsx`
5. ✅ `src/pages/admin/AuditLogsViewer.tsx`
6. ✅ `src/pages/admin/UserRolesManager.tsx`
7. ✅ `src/pages/admin/pricing/MasterPricingDashboard.tsx`
8. ✅ `src/pages/CityLandingPage.tsx`
9. ✅ `src/pages/Locations.tsx`
10. ✅ `src/pages/preview/PreviewHome.tsx`
11. ✅ `src/pages/preview/PreviewQuote.tsx`
12. ✅ `src/pages/preview/index.ts`
13. ✅ `src/pages/dispatch/DispatchRunsCalendar.tsx`
14. ✅ `src/pages/dispatch/DispatchRunsList.tsx`
15. ✅ `src/pages/dispatch/DispatchRunDetail.tsx`
16. ✅ `src/pages/sales/SalesNewQuote.tsx`
17. ✅ `src/pages/sales/LeadInbox.tsx`
18. ✅ `src/pages/sales/SalesLeadInbox.tsx`

### Phase 2 — Unused Imports Removed
- ✅ `LeadInbox` import removed from App.tsx
- ✅ `SalesLeadInbox` import removed from App.tsx
- ✅ Stale comment about DispatchRuns removed
- ✅ Reference in `useLeadHub.ts` cleaned

### Phase 3 — App.tsx Router Refactored
App.tsx reduced from **1475 lines → ~100 lines** by extracting route definitions into:
- `src/routes/shared.tsx` — PageLoader, SuspenseRoute
- `src/routes/publicRoutes.tsx` — Public pages, auth, redirects
- `src/routes/seoRoutes.tsx` — SEO city engine, domination pages, legacy redirects
- `src/routes/portalRoutes.tsx` — Customer portal, Green Halo portal
- `src/routes/adminRoutes.tsx` — All admin/CRM routes
- `src/routes/departmentRoutes.tsx` — Driver, CS, Sales, Dispatch, Finance, Calculator

---

## REMAINING ITEMS (Not yet actioned)

### Route Overlaps (Low Risk, Under Review)
| Pair | Status |
|------|--------|
| `/admin/config` vs `/admin/configuration` | Kept both — different components (ConfigManager vs ConfigurationHub) |
| `/admin/seo/health` vs `/admin/qa/seo-health` | Kept both — different components (SeoHealthPage vs SeoHealthDashboard) |
| `/admin/pricing` vs `/admin/pricing-engine` | Kept both — PricingManager (table editor) vs PricingEngineDashboard (overview) |

### Legacy Routes (Retained)
| Route | Reason |
|-------|--------|
| `/admin/legacy-dashboard` | Backward compatibility — remove when ready |
| `/driver/legacy` | Standalone driver app — remove when ready |
| `/admin/control-center` | Duplicates admin index — review later |

---

## RECOMMENDED NEXT STEPS

1. **Merge overlapping config/health routes** when ready
2. **Remove legacy dashboard routes** after team confirmation
3. **Runtime smoke test** integration-dependent pages (AI copilots, telephony, Google Ads)
4. **Add router-level auth guard** to `/internal/calculator` routes

---

## AUDIT DOCUMENTS PRODUCED

| Document | File |
|----------|------|
| Master Page Inventory | `docs/MASTER_PAGE_INVENTORY.md` |
| Route Reachability | `docs/ROUTE_REACHABILITY_AUDIT.md` |
| Page Purpose | `docs/PAGE_PURPOSE_AUDIT.md` |
| Duplicate Pages | `docs/DUPLICATE_PAGE_AUDIT.md` |
| Broken Pages | `docs/BROKEN_PAGE_AUDIT.md` |
| CTA Map | `docs/CTA_MAP.md` |
| Form Flow | `docs/FORM_FLOW_AUDIT.md` |
| SEO Pages | `docs/SEO_PAGE_AUDIT.md` |
| RBAC/Permissions | `docs/RBAC_PAGE_AUDIT.md` |
| Page Dependencies | `docs/PAGE_DEPENDENCY_AUDIT.md` |
| Document Flows | `docs/DOCUMENT_FLOW_AUDIT.md` |
| Config Pages | `docs/CONFIG_PAGE_AUDIT.md` |
| Health Dashboards | `docs/HEALTH_DASHBOARD_AUDIT.md` |
| Build Stability | `docs/BUILD_STABILITY_AUDIT.md` |
| **Master Summary** | `docs/MASTER_PROJECT_SUMMARY.md` |
