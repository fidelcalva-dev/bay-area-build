# Final Bay Area City SEO Summary

Last updated: 2026-03-27

## Flagship City Winners

| City | Canonical URL | Status |
|------|---------------|--------|
| **Oakland** | /dumpster-rental-oakland-ca | ✅ Locked — hand-optimized domination page |
| **San Jose** | /dumpster-rental-san-jose-ca | ✅ Locked — hand-optimized domination page |
| **San Francisco** | /dumpster-rental-san-francisco-ca | ✅ Locked — hand-optimized domination page |

Programmatic equivalents (/dumpster-rental/oakland, etc.) redirect to domination pages.

## Tier 2 Published List (22 cities)

Berkeley, Alameda, San Leandro, Hayward, Fremont, Walnut Creek, Concord, Pleasanton, Dublin, Livermore, Emeryville, Richmond, Santa Clara, Sunnyvale, Mountain View, Palo Alto, Milpitas, Cupertino, Redwood City, San Mateo, South San Francisco, Daly City

## Tier 3 Published List (5 cities)

San Rafael, Santa Rosa, Petaluma, Napa, Vallejo

## Total Active City Pages: 30

## City Pages Retired (DB deactivated + redirect)

| City | County | Reason |
|------|--------|--------|
| Anaheim | Orange | Outside Bay Area |
| Bakersfield | Kern | Outside Bay Area |
| Fresno | Fresno | Outside Bay Area |
| Long Beach | Los Angeles | Outside Bay Area |
| Los Angeles | Los Angeles | Outside Bay Area |
| Modesto | Stanislaus | Outside Bay Area |
| Riverside | Riverside | Outside Bay Area |
| Sacramento | Sacramento | Outside Bay Area |
| San Bernardino | San Bernardino | Outside Bay Area |
| San Diego | San Diego | Outside Bay Area |
| Stockton | San Joaquin | Outside Bay Area |
| Hollister | San Benito | Outside Bay Area scope |

## Pages Redirected

| Source | Target |
|--------|--------|
| /dumpster-rental/oakland | /dumpster-rental-oakland-ca |
| /dumpster-rental/san-jose | /dumpster-rental-san-jose-ca |
| /dumpster-rental/san-francisco | /dumpster-rental-san-francisco-ca |
| /southern-california-dumpster-rental | /bay-area-dumpster-rental |
| /central-valley-dumpster-rental | /bay-area-dumpster-rental |
| All out-of-area city slugs | /bay-area-dumpster-rental (via market-classification) |

## Out-of-Area Pages Retired

- 11 out-of-area cities deactivated in `seo_cities` table
- All redirect to `/bay-area-dumpster-rental`
- Removed from sitemap via `isMarketIndexable()` returning false
- No internal links point to retired pages

## Content Rules

1. No thin pages — minimum unique local content per city
2. All pricing from Smart Pricing Engine (no hardcoded values)
3. Every page has conversion CTA → /quote
4. FAQs are city-specific (not generic)
5. Internal links to money pages present
6. Schema markup: BreadcrumbList + FAQPage

## Technical SEO Status

| Check | Status |
|-------|--------|
| Canonical tags | ✅ Present on all pages |
| Sitemap inclusion | ✅ Only indexable markets included |
| Redirect chains | ✅ None — all redirects are single-hop |
| Duplicate pages | ✅ None — programmatic redirects to domination |
| Out-of-area indexation | ✅ Blocked via market-classification |
| Title uniqueness | ✅ Each city has unique title |
| Meta description uniqueness | ✅ Each city has unique meta |
| H1 per page | ✅ Single H1 per city page |

## Local Authority Support Plan

### Google Business Profile
- 3 profiles: Oakland, San Jose, San Francisco
- 19 services listed per profile
- 10-entry Q&A per profile
- Monthly geo-tagged photo uploads
- Weekly GMB posts via rotating calendar

### Review Generation
- 3-touch SMS/Email post-service sequence
- Target: 5+ reviews/month per market
- Response SLA: 24 hours

### Citation Consistency
- 10+ platforms tracked (Yelp, BBB, Facebook, etc.)
- NAP data matches `localPresenceConfig.ts`
- Monthly audit via Citations Tracker

### Bing Places & Apple Business Connect
- Profiles active for all 3 yard markets
- Synced with GMB data

## Next SEO Sprint Priorities

1. **Content enrichment**: Add `local_intro` for all 30 cities in DB
2. **Pricing mapping**: Set principal ZIPs in `city_display_pricing` for new cities
3. **Schema enhancement**: Add LocalBusiness schema to Tier 2 pages
4. **Permit info**: Research and add permit details for each city
5. **Blog internal linking**: Connect blog posts to relevant city pages
6. **North Bay hubs**: Strengthen /north-bay-dumpster-rental content
7. **Performance monitoring**: Track organic rankings for target keywords per city
