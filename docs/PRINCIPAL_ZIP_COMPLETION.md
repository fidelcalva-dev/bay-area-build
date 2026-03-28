# Principal ZIP Completion

Last updated: 2026-03-28

## All 30 Active Cities Mapped

| City | Slug | Principal ZIP | Yard | Market | Status |
|------|------|---------------|------|--------|--------|
| Oakland | oakland | 94607 | oakland | east-bay | ✅ Live |
| San Jose | san-jose | 95112 | sanjose | south-bay | ✅ Live |
| San Francisco | san-francisco | 94103 | oakland | san-francisco | ✅ Live |
| Berkeley | berkeley | 94704 | oakland | east-bay | ✅ Live |
| Alameda | alameda | 94501 | oakland | east-bay | ✅ Live |
| San Leandro | san-leandro | 94577 | oakland | east-bay | ✅ Live |
| Hayward | hayward | 94541 | oakland | east-bay | ✅ Live |
| Fremont | fremont | 94538 | sanjose | east-bay | ✅ Live |
| Walnut Creek | walnut-creek | 94596 | oakland | east-bay | ✅ Live |
| Concord | concord | 94520 | oakland | east-bay | ✅ Live |
| Pleasanton | pleasanton | 94566 | oakland | east-bay | ✅ Live |
| Dublin | dublin | 94568 | oakland | east-bay | ✅ Live |
| Livermore | livermore | 94550 | oakland | east-bay | ✅ Live |
| Emeryville | emeryville | 94608 | oakland | east-bay | ✅ Live |
| Richmond | richmond | 94804 | oakland | east-bay | ✅ Live |
| Santa Clara | santa-clara | 95050 | sanjose | south-bay | ✅ Live |
| Sunnyvale | sunnyvale | 94086 | sanjose | south-bay | ✅ Live |
| Mountain View | mountain-view | 94043 | sanjose | south-bay | ✅ Live |
| Palo Alto | palo-alto | 94301 | sanjose | south-bay | ✅ Live |
| Milpitas | milpitas | 95035 | sanjose | south-bay | ✅ Live |
| Cupertino | cupertino | 95014 | sanjose | south-bay | ✅ Live |
| Redwood City | redwood-city | 94063 | sanjose | peninsula | ✅ Live |
| San Mateo | san-mateo | 94401 | sanjose | peninsula | ✅ Live |
| South San Francisco | south-san-francisco | 94080 | oakland | peninsula | ✅ Live |
| Daly City | daly-city | 94014 | oakland | peninsula | ✅ Live |
| San Rafael | san-rafael | 94901 | oakland | north-bay | ✅ Live |
| Santa Rosa | santa-rosa | 95401 | oakland | north-bay | ✅ Live |
| Petaluma | petaluma | 94952 | oakland | north-bay | ✅ Live |
| Napa | napa | 94559 | oakland | north-bay | ✅ Live |
| Vallejo | vallejo | 94590 | oakland | north-bay | ✅ Live |

## Pricing Display Logic

1. CityPricingBlock looks up `city_display_pricing` for principal ZIP
2. Passes ZIP to Smart Pricing Engine for live "From $X" pricing
3. Falls back to static DUMPSTER_SIZES_DATA if engine unavailable
4. 15-minute cache per city slug
