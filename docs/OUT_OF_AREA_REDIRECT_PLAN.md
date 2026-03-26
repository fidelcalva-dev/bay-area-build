# Out-of-Area Redirect Plan

Last updated: 2026-03-26

## Active Redirects (Already Implemented)

| Source | Target | Type | Status |
|--------|--------|------|--------|
| `/southern-california-dumpster-rental` | `/bay-area-dumpster-rental` | 301 (Navigate replace) | ✅ Active |
| `/central-valley-dumpster-rental` | `/bay-area-dumpster-rental` | 301 (Navigate replace) | ✅ Active |
| `/dumpster-rental/oakland` | `/dumpster-rental-oakland-ca` | 301 (Navigate replace) | ✅ Active |
| `/dumpster-rental/san-jose` | `/dumpster-rental-san-jose-ca` | 301 (Navigate replace) | ✅ Active |
| `/dumpster-rental/san-francisco` | `/dumpster-rental-san-francisco-ca` | 301 (Navigate replace) | ✅ Active |
| `/locations` | `/areas` | 301 (Navigate replace) | ✅ Active |
| Out-of-area city slugs | `/bay-area-dumpster-rental` | Via market-classification.ts REDIRECT | ✅ Active |

## Indexation Blocks (Already Implemented)

| Route | Method |
|-------|--------|
| `/southern-california-dumpster-rental` | indexable: false in routeCategories |
| `/central-valley-dumpster-rental` | indexable: false in routeCategories |

## Removed from Sitemap

- All out-of-area ZIPs (Tracy, Stockton, Sacramento, etc.)
- All out-of-area counties
- SoCal and Central Valley hub pages

## No Action Needed

No `/services` page with non-core services exists. The dumpster rental topical cluster is the sole public focus.
