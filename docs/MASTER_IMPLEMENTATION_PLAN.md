# Calsan Platform — Master Implementation Plan
## Bay Area-First Unified Operating System

Generated: 2026-03-13

---

## SYSTEM STATUS SUMMARY

### ✅ ALREADY WORKING (Do Not Rebuild)
| Module | Route | Status |
|--------|-------|--------|
| Homepage (11-section conversion) | `/` | Complete |
| Public Quote Flow V3 (9-step) | `/quote` | Complete |
| Waste Vision Photo AI | `/waste-vision` | Complete |
| Schedule Delivery | `/schedule-delivery` | Complete |
| Contractor Application | `/contractor-application` | Complete |
| Project Type Pages | `/projects/:slug` | Complete |
| SEO City Engine (32+ cities) | `/dumpster-rental/:citySlug` | Complete |
| Lead Ingest (unified) | Edge Function | Complete |
| Smart Pricing Engine | `smartPricingEngine.ts` | Complete |
| Master Pricing Service | `masterPricingService.ts` | Complete |
| Customer 360 (12 tabs) | `/admin/customers/:id` | Complete |
| Customer Create/Edit | `/admin/customers/new`, `/:id/edit` | Complete |
| Sales Dashboard | `/sales` | Complete |
| Sales Lead Hub | `/sales/leads` | Complete |
| Internal Quote Builder | `/sales/quotes/new` | Complete |
| CS Workspace | `/cs` | Complete |
| Dispatch Control Tower | `/dispatch/control-tower` | Complete |
| Driver App | `/driver` | Complete |
| Finance/Collections | `/finance` | Complete |
| Asset Control Tower | `/admin/assets` | Complete |
| Configuration Hub | `/admin/configuration` | Complete |
| Yards Manager | `/admin/yards` | Complete |
| Markets Manager | `/admin/markets` | Complete |
| Future Market Template | `/admin/markets/new-location` | Complete |
| QA Health Pages | `/admin/qa/*` | Complete |
| RBAC Role Router | `/app` | Complete |
| Customer Portal | `/portal/*` | Complete |

### 🔧 NEEDS COMPLETION / ENHANCEMENT
| Module | Gap | Priority |
|--------|-----|----------|
| Social Links Config | Missing LinkedIn, Pinterest, TikTok, Twitter in seo.ts + no admin config page | HIGH |
| Active Location Config | No unified admin page for activate/deactivate yards + markets | HIGH |
| Heavy Material Rules | Policy exists but not surfaced consistently in all views | MEDIUM |
| Homepage AI Chat | Works but could be more sales-focused | MEDIUM |
| Contractor Page | Exists but could be richer benefits page | MEDIUM |
| SEO Photos | No structured photo system for SEO pages | LOW |
| Footer Social Links | Only shows FB/IG/YT/Yelp — missing LinkedIn, TikTok | HIGH |

---

## PHASE EXECUTION ORDER (Prioritized)

### Sprint 1 — Foundation & Config (This Session)
1. ✅ Social Links Config — add all platforms to seo.ts, create admin page
2. ✅ Active Location Config — admin page for yard/market activation
3. ✅ Footer Social Links — update to use all configured public social URLs
4. ✅ Heavy Material Policy reference in config

### Sprint 2 — Homepage & Public Polish
5. Homepage AI Chat upgrade (sales-focused behavior)
6. Project Type pages content enhancement
7. Contractor page rebuild with benefits + FAQ
8. SEO photo system for city/size/material pages

### Sprint 3 — CRM Workflow Completion
9. Quote detail readiness badges
10. Contract/Payment status standardization
11. CS workspace quick actions completion
12. Collections workspace polish

### Sprint 4 — Operational & Mobile
13. Map-based dumpster placement integration
14. Mobile role UX optimization
15. Container inventory live update tools
16. Dispatch intelligence polish

### Sprint 5 — SEO & Cleanup
17. Public page audit and cleanup
18. Outside-area page pause plan
19. Stale content identification
20. Sitemap optimization

---

## SOCIAL LINKS CONFIGURATION

### Public-Facing URLs (Footer + Schema)
- Facebook: `https://facebook.com/calsandumpsterspro`
- Instagram: `https://instagram.com/calsandumpsterspro`
- YouTube: `https://youtube.com/@calsandumpsterspro`
- Yelp: `https://yelp.com/biz/calsan-dumpsters-pro-oakland`
- Google: `https://g.page/calsan-dumpsters-pro`
- LinkedIn: `https://linkedin.com/company/calsan-dumpsters-pro` (PUBLIC company page only)
- TikTok: `https://tiktok.com/@calsandumpsterspro`
- Twitter/X: `https://x.com/calsandumpsters`
- Pinterest: `https://pinterest.com/calsandumpsterspro` (PUBLIC profile only)

### ⚠️ NEVER expose on public website:
- LinkedIn admin/dashboard URLs
- Pinterest admin/analytics URLs
- Any platform admin/management URLs

---

## ACTIVE LOCATION MODEL

### Yards (Operational)
| Yard | City | Status | Serves |
|------|------|--------|--------|
| Oakland Yard | Oakland, CA | ACTIVE | East Bay, North Bay |
| San Jose Yard | San Jose, CA | ACTIVE | South Bay, Peninsula |
| SF Yard | San Francisco, CA | ACTIVE | SF, Daly City |

### Service Markets
| Market | Type | Nearest Yard |
|--------|------|--------------|
| Oakland/East Bay | CORE_DIRECT | Oakland |
| San Jose/South Bay | CORE_DIRECT | San Jose |
| San Francisco | CORE_DIRECT | SF |
| Berkeley/Alameda | SUPPORT_RING | Oakland |
| Walnut Creek/Concord | SUPPORT_RING | Oakland |
| Fremont/Hayward | SUPPORT_RING | Oakland/SJ |
| Santa Clara/Sunnyvale | SUPPORT_RING | San Jose |
| North Bay | OUTSIDE_CURRENT_FOCUS | Oakland |
| Central Valley | FUTURE_PARTNER | None |
| SoCal | FUTURE_PARTNER | None |

---

## HEAVY MATERIAL RULES ENGINE (Canonical)

### Material Classes
- GENERAL_DEBRIS — all sizes (5-50yd)
- CLEAN_SOIL — heavy only (5, 8, 10yd), flat-rate
- CLEAN_CONCRETE — heavy only (5, 8, 10yd), flat-rate
- MIXED_SOIL — heavy only (5, 8, 10yd), $300 premium over base
- MIXED_HEAVY — heavy only (5, 8, 10yd), tonnage-based
- ROOFING — general sizes, weight warnings
- YARD_WASTE — general sizes
- MIXED_CONSTRUCTION — general sizes, weight warnings
- MIXED_DEBRIS — general sizes, tonnage-based
- UNKNOWN — requires classification

### Enforcement Points
1. Quote flow — size restrictions, fill-line warnings
2. Quote summary — material policy disclosure
3. Sales quote detail — material class display + warnings
4. Customer 360 — order material tracking
5. Dispatch notes — material handling instructions
6. Driver app — material verification prompts
7. Billing — reclassification surcharges

### Reclassification Rules
- Clean → contaminated with trash → MIXED_DEBRIS + $150 surcharge
- Clean soil → mixed with concrete → MIXED_HEAVY (no penalty if notified in advance)
- No advance notice + wrong disposal site → actual cost difference + reroute cost + $150

---

## REMAINING MANUAL REVIEW ITEMS

1. Verify all social media profile URLs are live and correct
2. Update real container inventory counts in `assets_dumpsters` table
3. Review and update real photos for homepage/SEO pages
4. Confirm BBB accreditation link is valid
5. Review North Bay/Central Valley/SoCal partner page content accuracy
6. Validate Google Guarantee badge eligibility
7. Review stale blog posts for outdated pricing/size references
