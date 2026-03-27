# Bay Area Scope Registry

Last updated: 2026-03-27

## Allowed Counties (9)

| County | Status | Region |
|--------|--------|--------|
| Alameda | CORE | East Bay |
| Contra Costa | CORE | East Bay |
| San Francisco | CORE | San Francisco |
| San Mateo | CORE | Peninsula |
| Santa Clara | CORE | South Bay |
| Marin | SUPPORT_RING | North Bay |
| Sonoma | SUPPORT_RING | North Bay |
| Napa | SUPPORT_RING | North Bay |
| Solano | SUPPORT_RING | North Bay |

## Core Direct Cities (Tier 1 — Domination Pages)

- Oakland → /dumpster-rental-oakland-ca
- San Jose → /dumpster-rental-san-jose-ca
- San Francisco → /dumpster-rental-san-francisco-ca

## Support Ring Cities (Tier 2 — Programmatic Pages)

Berkeley, Alameda, San Leandro, Hayward, Fremont, Walnut Creek, Concord, Pleasanton, Dublin, Livermore, Emeryville, Richmond, Santa Clara, Sunnyvale, Mountain View, Palo Alto, Milpitas, Cupertino, Redwood City, San Mateo, South San Francisco, Daly City

## Partner Network Cities (Tier 3 — Bay Area Only)

- San Rafael (Marin)
- Santa Rosa (Sonoma)
- Petaluma (Sonoma)
- Napa (Napa)
- Vallejo (Solano)

## Total Active Cities: 30

## Removed from Active Public SEO

### Regions Removed
- Central Valley (Sacramento, Stockton, Modesto, Fresno, Bakersfield)
- Southern California (Los Angeles, San Diego, Orange County, Riverside, San Bernardino)

### Cities Deactivated in DB
- Hollister, Modesto, Stockton, Sacramento, Bakersfield, Fresno
- Los Angeles, Long Beach, San Diego, Riverside, San Bernardino, Anaheim

### Redirect Targets
- `/southern-california-dumpster-rental` → `/bay-area-dumpster-rental`
- `/central-valley-dumpster-rental` → `/bay-area-dumpster-rental`
- `/dumpster-rental/oakland` → `/dumpster-rental-oakland-ca`
- `/dumpster-rental/san-jose` → `/dumpster-rental-san-jose-ca`
- `/dumpster-rental/san-francisco` → `/dumpster-rental-san-francisco-ca`
- All out-of-area city slugs → `/bay-area-dumpster-rental` via market-classification.ts

## Internal Link Canonicalization (Completed)

All internal `<Link>` components point to canonical URLs:
- Header nav → `-oakland-ca` / `-san-jose-ca` / `-san-francisco-ca`
- Homepage city links → canonical domination pages
- Blog footer links → canonical domination pages
- Contractors page → canonical domination pages
- SF region hubUrl → `/dumpster-rental-san-francisco-ca`

## Source Files

- `src/config/bayAreaCityScope.ts` — Canonical scope definition
- `src/lib/market-classification.ts` — Market registry & indexation control
- `src/lib/service-area-config.ts` — City directory & yard clusters
- `src/data/serviceAreas.ts` — City content (descriptions, FAQs)
