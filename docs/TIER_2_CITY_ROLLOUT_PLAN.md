# Tier 2 City Rollout Plan

Last updated: 2026-03-27

## Rollout Criteria

A city page is published only when ALL of the following are met:

1. ✅ City is in Bay Area scope (9 counties)
2. ✅ ZIP coverage is valid (principal ZIP mapped in city_display_pricing)
3. ✅ Nearest yard or fallback exists
4. ✅ Pricing display can be resolved via Smart Pricing Engine
5. ✅ Page has unique local content (not just city-name swap)
6. ✅ Has at least 2 local FAQs
7. ✅ Internal links to money pages present

## Phase 1 — Already Published (19 cities)

Berkeley, Alameda, San Leandro, Hayward, Fremont, Walnut Creek, Concord, Pleasanton, Dublin, Livermore, Santa Clara, Sunnyvale, Mountain View, Palo Alto, Milpitas, Richmond, Emeryville, Redwood City, San Mateo

## Phase 2 — New Additions (8 cities)

| City | County | Status | Notes |
|------|--------|--------|-------|
| Cupertino | Santa Clara | ✅ Added to DB | Content in serviceAreas.ts |
| Daly City | San Mateo | ✅ Added to DB | Content in serviceAreas.ts |
| South San Francisco | San Mateo | ✅ In DB | Content in serviceAreas.ts |
| San Rafael | Marin | ✅ Added to DB | Content in serviceAreas.ts |
| Santa Rosa | Sonoma | ✅ Reactivated | Content in serviceAreas.ts |
| Petaluma | Sonoma | ✅ Added to DB | Content in serviceAreas.ts |
| Napa | Napa | ✅ Added to DB | Content in serviceAreas.ts |
| Vallejo | Solano | ✅ Reactivated | Content in serviceAreas.ts |

## Content Requirements Per City

Each Tier 2 page (via SeoCityPage.tsx) renders:

1. **H1**: "Dumpster Rental in {City}, CA"
2. **Local intro** from `seo_cities.local_intro` or `serviceAreas.ts` fallback
3. **CityPricingBlock**: Dynamic pricing from Smart Pricing Engine
4. **Size grid**: Common dumpster sizes with links
5. **Material options**: Accepted materials with links
6. **How it works**: Standard 3-step process
7. **Local FAQ**: Minimum 2 city-specific questions
8. **Nearby markets**: Links to adjacent city pages
9. **CTA block**: "Get Exact Price" → /quote

## Pricing Display Strategy

- Each city maps to a principal ZIP via `city_display_pricing` table
- CityPricingBlock renders "From $X" based on live pricing engine
- If no ZIP mapping exists, shows generic "Get Your Exact Price" CTA
- 15-minute cache for performance

## Internal Linking Strategy

Every Tier 2 page links to:
- /quote (primary conversion)
- /pricing (price transparency)
- /sizes (size guide)
- /materials (material guide)
- /contractors (if relevant)
- 3-5 nearby Bay Area city pages
- Parent hub page (East Bay, South Bay, etc.)

## Next Sprint Priorities

1. Add `local_intro` content for all 30 cities in DB
2. Map principal ZIPs for new cities in `city_display_pricing`
3. Add permit info for new cities
4. Generate city-specific schema markup
