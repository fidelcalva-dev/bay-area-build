# MASTER PROJECT SUMMARY

> Full Project Audit — Generated: 2026-03-19

---

## Key Metrics

| Metric | Count |
|--------|-------|
| **Total mounted routes** | ~322 |
| **Total page files** | ~210 |
| **Public routes** | ~76 (including redirects + dynamic SEO) |
| **Protected CRM routes** | ~200 |
| **Customer portal routes** | ~15 |
| **Department portal routes** | ~44 |
| **Redirect-only routes** | 10 |
| **Orphaned/dead files** | 17 |
| **Duplicate/overlapping routes** | 7 (4 resolved, 3 need review) |
| **Broken pages (confirmed)** | 0 |
| **Broken pages (suspected)** | 0 |
| **Pages needing runtime testing** | ~30 (integration-dependent) |
| **QA/Health dashboards** | 28 |
| **Config/settings pages** | 41 |
| **SEO-indexable pages** | 700+ (dynamic) |
| **AI copilot pages** | 11 |

---

## TOP 20 CRITICAL ISSUES

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | 17 orphaned files (dead code) | 🟡 | Delete safely |
| 2 | 2 unused imports in App.tsx (LeadInbox, SalesLeadInbox) | 🟢 | Remove imports |
| 3 | `/admin/config` vs `/admin/configuration` overlap | 🟡 | Merge or redirect |
| 4 | `/admin/seo/health` vs `/admin/qa/seo-health` overlap | 🟡 | Merge |
| 5 | `/admin/pricing` vs `/admin/pricing-engine` overlap | 🟡 | Review purpose |
| 6 | `/admin/alerts` vs `/admin/notifications/internal` overlap | 🟡 | Review purpose |
| 7 | App.tsx is 1475 lines — hard to maintain | 🟡 | Consider route splitting |
| 8 | City+Material vs City+Size route disambiguation | 🟡 | Monitor for conflicts |
| 9 | `/:citySlug/:subSlug` catch-all risk | 🟡 | Monitor |
| 10 | `/internal/calculator` — no visible router-level auth guard | 🟡 | Verify component-level auth |
| 11 | `/quick-order` — off-strategy per dual-path policy | 🟡 | Review/remove |
| 12 | Green Halo demo pages (4) — still mounted | 🟢 | Remove if demo is over |
| 13 | `/admin/legacy-dashboard` still mounted | 🟢 | Remove when ready |
| 14 | `/driver/legacy` still mounted | 🟢 | Remove when ready |
| 15 | `/admin/control-center` duplicates admin index | 🟢 | Remove redundant route |
| 16 | AI copilots (11) — need runtime verification | 🟡 | Test edge function deps |
| 17 | Telephony pages (6) — need integration verification | 🟡 | Test external deps |
| 18 | PDF generation — unverified at runtime | 🟡 | Smoke test quote/invoice PDFs |
| 19 | SalesNewQuote.tsx file exists but unused | 🟢 | Delete |
| 20 | preview/ directory (3 files) — dead code | 🟢 | Delete directory |

---

## TOP 20 MERGE/REMOVE CANDIDATES

| # | Candidate | Action | Risk |
|---|-----------|--------|------|
| 1 | `MasterAIDashboard.tsx` | Delete | None |
| 2 | `MasterAIDecisions.tsx` | Delete | None |
| 3 | `MasterAIJobs.tsx` | Delete | None |
| 4 | `MasterAINotifications.tsx` | Delete | None |
| 5 | `AuditLogsViewer.tsx` | Delete | None |
| 6 | `UserRolesManager.tsx` | Delete | None |
| 7 | `MasterPricingDashboard.tsx` | Delete | None |
| 8 | `CityLandingPage.tsx` | Delete | None |
| 9 | `Locations.tsx` | Delete | None |
| 10 | `PreviewHome.tsx` | Delete | None |
| 11 | `PreviewQuote.tsx` | Delete | None |
| 12 | `preview/index.ts` | Delete | None |
| 13 | `DispatchRunsCalendar.tsx` | Delete | None |
| 14 | `DispatchRunsList.tsx` | Delete | None |
| 15 | `DispatchRunDetail.tsx` | Delete | None |
| 16 | `SalesNewQuote.tsx` | Delete | None |
| 17 | `/admin/config` OR `/admin/configuration` | Merge → one | Low |
| 18 | `/admin/seo/health` OR `/admin/qa/seo-health` | Merge → one | Low |
| 19 | LeadInbox.tsx import | Remove from App.tsx | None |
| 20 | SalesLeadInbox.tsx import | Remove from App.tsx | None |

---

## TOP 20 HIGHEST-VALUE PAGES TO KEEP & IMPROVE

| # | Route | Value | Notes |
|---|-------|-------|-------|
| 1 | `/` | Homepage — primary entry | Highest traffic |
| 2 | `/quote` | V3 Quote Flow | Primary conversion |
| 3 | `/pricing` | Pricing page | Money page |
| 4 | `/dumpster-rental/:citySlug` | SEO City Engine | 50+ cities |
| 5 | `/dumpster-rental-oakland-ca` | Domination page | Hand-crafted SEO |
| 6 | `/dumpster-rental-san-jose-ca` | Domination page | Hand-crafted SEO |
| 7 | `/dumpster-rental-san-francisco-ca` | Domination page | Hand-crafted SEO |
| 8 | `/areas` | Geo hub | Internal links |
| 9 | `/sizes` | Size hub | Internal links |
| 10 | `/materials` | Materials hub | Internal links |
| 11 | `/admin` (CalsanControlCenter) | CRM command center | Daily ops |
| 12 | `/admin/orders` | Order management | Core CRM |
| 13 | `/admin/customers` | Customer management | Core CRM |
| 14 | `/sales/leads` | Sales pipeline | Revenue driver |
| 15 | `/internal/calculator` | Internal quote builder | Sales tool |
| 16 | `/dispatch` | Dispatch dashboard | Operations |
| 17 | `/finance` | Finance dashboard | Collections |
| 18 | `/portal/dashboard` | Customer portal | Customer self-service |
| 19 | `/blog` | Content marketing | SEO value |
| 20 | `/admin/pricing/readiness` | Pricing readiness | Config health |

---

## RECOMMENDED CLEANUP ORDER

### Phase 1 — Safe Deletions (Zero Risk)
1. Delete 17 orphaned files
2. Remove 2 unused imports from App.tsx
3. Delete `src/pages/preview/` directory

### Phase 2 — Route Consolidation (Low Risk)
4. Remove `/admin/control-center` route (keep index)
5. Merge `/admin/config` and `/admin/configuration`
6. Merge `/admin/seo/health` and `/admin/qa/seo-health`
7. Review `/admin/pricing-engine` vs `/admin/pricing` overlap

### Phase 3 — Legacy Removal (Medium Risk)
8. Remove `/admin/legacy-dashboard` after confirmation
9. Remove `/driver/legacy` after confirmation
10. Evaluate `/quick-order` removal per dual-path policy
11. Evaluate Green Halo demo pages for removal

### Phase 4 — Architecture (Medium Risk)
12. Split App.tsx route definitions into modular files
13. Add router-level auth guard to `/internal/calculator` routes
14. Runtime smoke test all integration-dependent pages (AI, telephony, ads)

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
