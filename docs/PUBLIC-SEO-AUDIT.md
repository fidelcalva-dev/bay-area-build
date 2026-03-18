# Public Website SEO Audit

**Generated**: 2026-03-18  
**Strategy**: Bay Area-First  
**Status**: ✅ SPRINT 1 COMPLETE

---

## Executive Summary

The public website has been audited across all routes, content, metadata, and pricing references. Key fixes applied in Sprint 1:

1. **Stale heavy material pricing corrected** — Legacy flat-rate prices ($495/$595/$695.50) replaced with V2 canonical (Service Cost + Dump Fee) across Pricing page and shared-data
2. **5yd and 8yd now visible on Pricing page** — Filter that hid small general debris sizes removed
3. **Heavy pricing table labels updated** — "Base Materials / +$200 / +$300" replaced with "Clean No. 1 / Clean No. 2 / All Mixed" matching V2 groups
4. **robots.txt hardened** — Added /visualizer, /thank-you, /set-password to disallow list
5. **Market classification verified** — 3 CORE_DIRECT + 19 SUPPORT_RING markets active, 12 OUTSIDE/FUTURE correctly noindexed

---

## Page Inventory Summary

| Category | Count | Status |
|---|---|---|
| Static public pages | ~40 | ✅ Audited |
| City pages (dynamic) | 22 active | ✅ Market-classified |
| City + Size pages | ~88 | ✅ Via sitemap generator |
| City + Material pages | ~110 | ✅ Via sitemap generator |
| City + Job pages | ~176 | ✅ Via sitemap generator |
| ZIP pages | 300+ | ✅ Tier-prioritized |
| Blog pages | 24+ | ✅ Indexed |
| County pages | 9 (Bay Area) | ✅ Filtered |
| Use-case pages | ~8 | ✅ Indexed |
| Flagship city pages | 3 | ✅ Oakland/SJ/SF |
| Standalone size pages | 4 | ✅ 10/20/30/40 |
| Standalone material pages | 5 | ✅ Indexed |
| Regional hub pages | 5 | ⚠️ 2 paused (SoCal/Central Valley) |
| **Total estimated** | **800+** | |

---

## Page Classification

### KEEP_AS_IS
- `/` — Homepage, strong H1, conversion-ready
- `/quote` — Primary conversion page
- `/pricing` — ✅ Fixed (was stale, now V2-aligned)
- `/sizes` — Uses canonical getGeneralSizes()/getHeavySizes()
- `/materials` — Clean content
- `/contractors` — Money page
- `/areas` — Bay Area hub
- `/about`, `/contact` — Standard pages
- `/blog` — Blog index
- `/dumpster-rental/{citySlug}` — Dynamic city pages
- `/service-area/{zip}/dumpster-rental` — ZIP pages
- `/bay-area-dumpster-rental` — Hub page
- `/dumpster-rental-east-bay`, `/dumpster-rental-south-bay` — Regional

### KEEP_AND_IMPROVE
- `/contractor-best-practices` — Needs stronger internal links
- `/contractor-resources` — Needs CTA improvements
- `/capacity-guide` — Thin, needs expansion
- `/why-local-yards`, `/not-a-broker`, `/how-it-works`, `/why-calsan` — Positioning pages, needs cross-linking

### NOINDEX (correctly)
- `/technology` — Off-strategy "no-tech" brand rule
- `/green-halo` — Internal sustainability tool
- `/green-impact` — Internal map
- `/waste-vision` — Internal tool
- `/download-price-list` — Lead capture
- `/quick-order` — Internal CRM shortcut
- `/thank-you` — Utility
- `/visualizer` — Tool page
- `/set-password` — Auth
- `/staff`, `/app`, `/request-access` — CRM

### NOINDEX (via market classification)
- `/dumpster-rental/hollister` → REDIRECT to /dumpster-rental-south-bay
- `/dumpster-rental/modesto`, `/stockton`, `/sacramento`, etc. → NOINDEX until partner launch
- `/southern-california-dumpster-rental` → NOINDEX
- `/central-valley-dumpster-rental` → NOINDEX

---

## Stale Content Fixed (Sprint 1)

| Issue | File | Fix |
|---|---|---|
| Heavy base prices showing $495/$595/$695.50 | shared-data.ts | Updated to V2: $440/$580/$690 (CLEAN_NO_1) |
| Heavy pricing display legacy labels | shared-data.ts | Updated to "Clean No. 1" / "Clean No. 2" / "All Mixed" |
| Pricing page hid 5yd and 8yd general | Pricing.tsx | Removed filter, all 7 sizes now visible |
| Heavy table used "+$200" / "+$300" labels | Pricing.tsx | Updated to V2 group labels |
| Heavy savings notes ("20%/40% less") | Pricing.tsx | Removed (not accurate in V2 model) |

---

## Technical SEO Status

| Check | Status |
|---|---|
| All indexed pages have canonical | ✅ |
| All CRM pages have noindex | ✅ |
| robots.txt blocks all internal routes | ✅ |
| Sitemap filters non-indexable markets | ✅ |
| Flagship city pages in sitemap | ✅ |
| Schema: LocalBusiness, Organization, WebSite | ✅ |
| Schema: BreadcrumbList on city pages | ✅ |
| Schema: FAQPage on city/ZIP pages | ✅ |
| No duplicate titles across pages | ⚠️ Check templated city+material pages |

---

## Internal Linking Framework

| From | To | Status |
|---|---|---|
| Homepage → Quote, Pricing, Sizes | ✅ |
| Pricing → Quote, Sizes, Materials, Areas | ✅ |
| City pages → Quote, Pricing, Sizes | ✅ |
| Sizes → Quote, City pages | ✅ |
| Blog → Money pages | ⚠️ Needs audit |
| Contractor pages → Application, Quote | ✅ |

---

## Sprint Roadmap

### Sprint 1 ✅ COMPLETE
- [x] Pricing page — stale pricing fixed
- [x] Pricing page — all sizes visible (5–50)
- [x] Heavy pricing — V2 labels and prices
- [x] robots.txt — hardened
- [x] Market classification — verified

### Sprint 2 — Next
- [ ] Oakland/SJ/SF flagship pages — content depth
- [ ] Bay Area hub — internal linking
- [ ] CTA cleanup across all money pages
- [ ] Homepage internal linking improvements

### Sprint 3
- [ ] /Areas rebuild — focused hub
- [ ] Services dilution cleanup
- [ ] City/county/ZIP governance

### Sprint 4
- [ ] Blog pruning
- [ ] Schema cleanup
- [ ] Mobile pricing layout fixes
- [ ] Media/image improvements

### Sprint 5
- [ ] GBP/Bing/Apple alignment
- [ ] Reviews/photos operations
- [ ] Content calibration
