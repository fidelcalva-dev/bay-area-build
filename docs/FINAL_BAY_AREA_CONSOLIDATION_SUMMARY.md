# Final Bay Area Consolidation Summary

Last updated: 2026-03-23

## Changes Made

### 1. Counties Pruned (`seo-counties.ts`)
Removed 9 out-of-area counties. Only 9 Bay Area counties remain.

### 2. Regions Pruned (`service-area-config.ts`)
Removed Central Valley and Southern California regions. SF hubUrl updated to canonical `/dumpster-rental-san-francisco-ca`.

### 3. ZIP Codes Pruned (`seo-zips.ts`)
Removed ~35 Tracy/Stockton/Sacramento ZIP codes. All remaining ZIPs are Bay Area.

### 4. Hub Pages Consolidated (`SeoHubPage.tsx`, `seoRoutes.tsx`)
- `/southern-california-dumpster-rental` → redirects to `/bay-area-dumpster-rental`
- `/central-valley-dumpster-rental` → redirects to `/bay-area-dumpster-rental`

### 5. Top City Redirects (`seoRoutes.tsx`)
- `/dumpster-rental/oakland` → `/dumpster-rental-oakland-ca`
- `/dumpster-rental/san-jose` → `/dumpster-rental-san-jose-ca`
- `/dumpster-rental/san-francisco` → `/dumpster-rental-san-francisco-ca`

### 6. Internal Links Canonicalized
- `Header.tsx` → canonical domination URLs
- `Index.tsx` → canonical domination URLs
- `BlogArticle.tsx` → canonical domination URLs
- `Contractors.tsx` → canonical domination URLs

### 7. Route Categories Updated (`routeCategories.ts`)
SoCal and Central Valley hubs marked `indexable: false`.

### 8. Local Presence Config (`localPresenceConfig.ts`)
Removed Central Valley / SoCal references from business description.

### 9. Expansion Roadmap (`ExpansionRoadmapSection.tsx`)
Replaced Central Valley / SoCal milestones with North Bay and Peninsula Bay Area expansion.

### 10. Duplicate Pages Audit (`DuplicatePagesPage.tsx`)
Updated top 3 city entries from `KEEP_BOTH` to `REDIRECT_TO_CANONICAL`.

### 11. Market Classification (`market-classification.ts`)
Out-of-area markets changed from `NOINDEX` to `REDIRECT` → `/bay-area-dumpster-rental`.

### 12. Market Zones (`shared-data.ts`)
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

## CRM/Admin Pages Preserved
All CRM, admin, portal, sales, dispatch, finance, CS, and driver pages remain unchanged.

## Remaining Manual Review Items
1. `src/lib/cityData.ts` — Tracy entry retained for internal operations
2. `src/config/locationConfig.ts` — Tracy yard config retained for operational use
3. `src/components/sections/ServiceCoverageMapSection.tsx` — Stockton/Tracy "coming-soon" markers (cosmetic)
4. Blog posts mentioning out-of-area cities — content review recommended
5. `seo_cities` DB table — deactivate out-of-area rows via `is_active = false`
