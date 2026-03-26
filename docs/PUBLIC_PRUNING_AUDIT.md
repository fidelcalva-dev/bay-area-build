# Public Pruning Audit

Last updated: 2026-03-26

## Pages Removed from Sitemap

| Page | Reason |
|------|--------|
| `/green-halo` | Demo/utility — not a ranking target |
| `/green-impact` | Demo/utility — not a ranking target |
| `/waste-vision` | Demo/utility — not a ranking target |
| `/visualizer` | Tool — no SEO intent |
| `/technology` | Off-strategy — dilutes dumpster rental focus |
| `/locations` | Redirect to `/areas` — should not be in sitemap |

## Pages Noindexed (routeCategories)

| Page | Previous | New | Reason |
|------|----------|-----|--------|
| `/technology` | indexable: true | indexable: false | Off-strategy |
| `/visualizer` | indexable: true | indexable: false | Utility tool |
| `/waste-vision` | indexable: true | indexable: false | Demo feature |
| `/green-impact` | indexable: true | indexable: false | Demo feature |
| `/green-halo` | indexable: true | indexable: false | Demo feature |

## Internal Link Fixes

| File | Old Link | New Link |
|------|----------|----------|
| `Areas.tsx` | `/dumpster-rental/san-francisco` | `/dumpster-rental-san-francisco-ca` |

## robots.txt Updates

Added disallow rules for: `/green-halo`, `/schedule-delivery`

## Non-Core Services Status

No `/services` page exists. Non-core services (dump truck, porta potty, soil solutions, construction material delivery) are NOT present in any public route, component, or navigation. No action needed.

## Stale Content Check

| Item | Status |
|------|--------|
| 6-yard size references | ✅ None in active public pages (only historical note in admin) |
| Out-of-area city pages | ✅ Already redirected via market-classification.ts |
| SoCal/Central Valley hubs | ✅ Already redirect to /bay-area-dumpster-rental |
| Top 3 city programmatic duplicates | ✅ Already redirect to domination pages |
