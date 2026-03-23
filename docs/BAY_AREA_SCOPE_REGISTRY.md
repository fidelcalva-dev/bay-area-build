# Bay Area Scope Registry

Last updated: 2026-03-23

## Allowed Counties (9)

| County | Status |
|--------|--------|
| Alameda | CORE |
| Contra Costa | CORE |
| San Francisco | CORE |
| San Mateo | CORE |
| Santa Clara | CORE |
| Marin | SUPPORT_RING |
| Sonoma | SUPPORT_RING |
| Napa | SUPPORT_RING |
| Solano | SUPPORT_RING |

## Core Direct Cities (Tier 1)

- Oakland
- San Jose
- San Francisco

## Support Ring Cities (Tier 2)

Berkeley, Alameda, San Leandro, Hayward, Fremont, Walnut Creek, Concord, Pleasanton, Dublin, Livermore, Santa Clara, Sunnyvale, Mountain View, Palo Alto, Milpitas, Cupertino, Redwood City, Richmond, Emeryville

## Partner Network Cities (Bay Area Tier 3)

- Santa Rosa (Sonoma)
- Vallejo (Solano)

## Removed from Active Public SEO

### Regions Removed
- Central Valley (Sacramento, Stockton, Modesto, Fresno, Bakersfield)
- Southern California (Los Angeles, San Diego, Orange County, Riverside)

### Cities Removed from Active Routing
- Hollister, Modesto, Stockton, Sacramento, Bakersfield, Fresno
- Los Angeles, San Diego, Riverside, Anaheim

### Redirect Targets
- `/southern-california-dumpster-rental` → `/bay-area-dumpster-rental`
- `/central-valley-dumpster-rental` → `/bay-area-dumpster-rental`
- `/dumpster-rental/oakland` → `/dumpster-rental-oakland-ca`
- `/dumpster-rental/san-jose` → `/dumpster-rental-san-jose-ca`
- `/dumpster-rental/san-francisco` → `/dumpster-rental-san-francisco-ca`
- Out-of-area city pages → redirect via `market-classification.ts` REDIRECT status

## Internal Link Canonicalization (Completed)

All internal `<Link>` components now point to canonical URLs:
- Header nav → `-oakland-ca` / `-san-jose-ca` / `-san-francisco-ca`
- Homepage city links → canonical domination pages
- Blog footer links → canonical domination pages
- Contractors page → canonical domination pages
- SF region hubUrl → `/dumpster-rental-san-francisco-ca`

## Route Categories Update

- `/southern-california-dumpster-rental` marked `indexable: false`
- `/central-valley-dumpster-rental` marked `indexable: false`

## Expansion Roadmap (Public Content)

Updated to reflect Bay Area-only focus:
- Central Valley / SoCal milestones replaced with North Bay and Peninsula expansion
