# Final Bay Area Consolidation Summary

Last updated: 2026-03-23

## Changes Made

### 1. Counties Pruned (`seo-counties.ts`)
Removed 9 out-of-area counties: Sacramento, San Joaquin, Los Angeles, San Diego, Orange, Riverside, Fresno, Kern, Stanislaus. Only 9 Bay Area counties remain.

### 2. Regions Pruned (`service-area-config.ts`)
Removed Central Valley and Southern California regions. Removed all Tier 3 partner cities outside Bay Area (Hollister, Modesto, Stockton, Sacramento, Bakersfield, LA, SD, Fresno, Riverside, Anaheim). Kept Santa Rosa and Vallejo as Bay Area Tier 3.

### 3. ZIP Codes Pruned (`seo-zips.ts`)
Removed all Tracy, Stockton, and Sacramento ZIP codes (~35 entries). All remaining ZIPs are within the 9 Bay Area counties.

### 4. Hub Pages Consolidated (`SeoHubPage.tsx`, `seoRoutes.tsx`)
- Removed SoCal and Central Valley hub configs
- `/southern-california-dumpster-rental` → redirects to `/bay-area-dumpster-rental`
- `/central-valley-dumpster-rental` → redirects to `/bay-area-dumpster-rental`

### 5. Top City Redirects Added (`seoRoutes.tsx`)
- `/dumpster-rental/oakland` → `/dumpster-rental-oakland-ca`
- `/dumpster-rental/san-jose` → `/dumpster-rental-san-jose-ca`
- `/dumpster-rental/san-francisco` → `/dumpster-rental-san-francisco-ca`

### 6. Market Classification Updated (`market-classification.ts`)
All out-of-area future partner markets changed from `NOINDEX` to `REDIRECT` with target `/bay-area-dumpster-rental`.

### 7. Sitemap Filtered (`sitemap.ts`, `SitemapPage.tsx`)
County pages now filtered to Bay Area only in both sitemap generators (matching `sitemap-generator.ts` which already had this filter).

### 8. Market Zones Cleaned (`shared-data.ts`)
Removed TRACY, CENTRAL, SAC market zones. Only OAK and SJ remain.

## Public Pages Kept

| Route | Category |
|-------|----------|
| `/` | Homepage |
| `/quote` | Quote |
| `/pricing` | Pricing |
| `/sizes` | Sizes |
| `/materials` | Materials |
| `/areas` | Areas Hub |
| `/contractors` | Contractors |
| `/contact` | Contact |
| `/about` | About |
| `/how-it-works` | How It Works |
| `/why-calsan` | Why Calsan |
| `/blog` | Blog Hub |
| `/bay-area-dumpster-rental` | Bay Area Hub |
| `/dumpster-rental-east-bay` | East Bay Hub |
| `/dumpster-rental-south-bay` | South Bay Hub |
| `/north-bay-dumpster-rental` | North Bay Hub |
| `/california-dumpster-rental` | California Hub |
| `/dumpster-rental-oakland-ca` | Oakland Domination |
| `/dumpster-rental-san-jose-ca` | San Jose Domination |
| `/dumpster-rental-san-francisco-ca` | SF Domination |
| `/dumpster-rental/:citySlug` | Dynamic city (Bay Area only) |
| `/service-area/:zip/dumpster-rental` | ZIP pages (Bay Area only) |
| `/county/:countySlug/dumpster-rental` | County pages (9 Bay Area only) |
| Size/material/use-case intent pages | Bay Area focused |

## CRM/Admin Pages Preserved
All CRM, admin, portal, sales, dispatch, finance, CS, and driver pages remain unchanged.

## Remaining Manual Review Items
1. `src/lib/cityData.ts` — Still contains Tracy entry; used internally for operations, not public SEO
2. `src/config/locationConfig.ts` — Tracy yard config retained for operational use
3. `src/components/sections/ServiceCoverageMapSection.tsx` — Still shows Stockton/Tracy as "coming-soon" markers; cosmetic only
4. Blog posts mentioning out-of-area cities — Content review recommended
5. `seo_cities` DB table — May contain out-of-area city rows; should be deactivated via `is_active = false`
