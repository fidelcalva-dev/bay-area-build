# Bay Area City Scope — SEO Strategy

Last updated: 2026-03-27

## Official Scope: 9 Bay Area Counties

| County | Region | Service Model |
|--------|--------|---------------|
| Alameda | East Bay | DIRECT_OPERATION |
| Contra Costa | East Bay | DIRECT_OPERATION |
| San Francisco | San Francisco | DIRECT_OPERATION |
| San Mateo | Peninsula | DIRECT_OPERATION |
| Santa Clara | South Bay | DIRECT_OPERATION |
| Marin | North Bay | PARTNER_NETWORK |
| Sonoma | North Bay | PARTNER_NETWORK |
| Napa | North Bay | PARTNER_NETWORK |
| Solano | North Bay | PARTNER_NETWORK |

## Tier 1 — Flagship Domination Pages (3)

| City | Canonical URL | Yard | ZIP |
|------|---------------|------|-----|
| Oakland | /dumpster-rental-oakland-ca | oakland-yard | 94601 |
| San Jose | /dumpster-rental-san-jose-ca | sanjose-yard | 95112 |
| San Francisco | /dumpster-rental-san-francisco-ca | oakland-yard | 94110 |

## Tier 2 — Core Direct Markets (22)

| City | Slug | County | Yard | ZIP |
|------|------|--------|------|-----|
| Berkeley | berkeley | Alameda | oakland | 94704 |
| Alameda | alameda | Alameda | oakland | 94501 |
| San Leandro | san-leandro | Alameda | oakland | 94577 |
| Hayward | hayward | Alameda | oakland | 94541 |
| Fremont | fremont | Alameda | sanjose | 94538 |
| Pleasanton | pleasanton | Alameda | oakland | 94566 |
| Dublin | dublin | Alameda | oakland | 94568 |
| Livermore | livermore | Alameda | oakland | 94550 |
| Emeryville | emeryville | Alameda | oakland | 94608 |
| Walnut Creek | walnut-creek | Contra Costa | oakland | 94596 |
| Concord | concord | Contra Costa | oakland | 94520 |
| Richmond | richmond | Contra Costa | oakland | 94804 |
| Santa Clara | santa-clara | Santa Clara | sanjose | 95050 |
| Sunnyvale | sunnyvale | Santa Clara | sanjose | 94086 |
| Mountain View | mountain-view | Santa Clara | sanjose | 94043 |
| Palo Alto | palo-alto | Santa Clara | sanjose | 94301 |
| Milpitas | milpitas | Santa Clara | sanjose | 95035 |
| Cupertino | cupertino | Santa Clara | sanjose | 95014 |
| Redwood City | redwood-city | San Mateo | sanjose | 94063 |
| San Mateo | san-mateo | San Mateo | sanjose | 94401 |
| South San Francisco | south-san-francisco | San Mateo | oakland | 94080 |
| Daly City | daly-city | San Mateo | oakland | 94014 |

## Tier 3 — Partner Network (5)

| City | Slug | County | Yard | ZIP |
|------|------|--------|------|-----|
| San Rafael | san-rafael | Marin | oakland | 94901 |
| Santa Rosa | santa-rosa | Sonoma | oakland | 95401 |
| Petaluma | petaluma | Sonoma | oakland | 94952 |
| Napa | napa | Napa | oakland | 94559 |
| Vallejo | vallejo | Solano | oakland | 94590 |

## Total: 30 Active Bay Area Cities

## Out-of-Scope (Deactivated)

All cities outside the 9 Bay Area counties are deactivated from `seo_cities` and redirect to `/bay-area-dumpster-rental`:

- Anaheim, Bakersfield, Fresno, Long Beach, Los Angeles, Modesto, Riverside, Sacramento, San Bernardino, San Diego, Stockton
- Hollister (San Benito County — outside scope)

## Source Files

- `src/config/bayAreaCityScope.ts` — Canonical TypeScript scope
- `src/lib/market-classification.ts` — Market registry with indexation rules
- `src/lib/service-area-config.ts` — City directory and yard clusters
