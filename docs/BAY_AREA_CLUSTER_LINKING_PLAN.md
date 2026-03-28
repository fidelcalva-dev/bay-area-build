# Bay Area Cluster Linking Plan

Last updated: 2026-03-28

## Cluster Architecture

Three geographic clusters power internal linking between Bay Area city pages.

### East Bay Cluster (13 cities)
- **Hub**: `/dumpster-rental-east-bay`
- **Cities**: Oakland, Berkeley, Alameda, San Leandro, Hayward, Fremont, Walnut Creek, Concord, Pleasanton, Dublin, Livermore, Emeryville, Richmond

### South Bay & Peninsula Cluster (11 cities)
- **Hub**: `/dumpster-rental-south-bay`
- **Cities**: San Jose, Santa Clara, Sunnyvale, Mountain View, Palo Alto, Milpitas, Cupertino, Redwood City, San Mateo, South San Francisco, Daly City

### North Bay Cluster (5 cities)
- **Hub**: `/bay-area-dumpster-rental`
- **Cities**: San Rafael, Santa Rosa, Petaluma, Napa, Vallejo

## Linking Rules

1. Every city page links to **up to 5 nearby cities** from its cluster
2. Priority: `seo_cities.nearby_cities_json` (DB) > cluster fallback
3. Every city page links to its **cluster hub**
4. Every city page links to: `/quote`, `/pricing`, `/sizes`, `/materials`, `/areas`
5. Contractor CTA appears on all pages via bottom CTA section

## Implementation

- Config: `src/config/cityClusterLinks.ts`
- Consumer: `SeoCityPage.tsx` — uses cluster fallback when nearby_cities_json is empty
- Internal links footer: All pages include size links, service links, and money page links

## Cross-Cluster Links

San Francisco acts as a bridge between East Bay and Peninsula clusters.
Fremont bridges East Bay and South Bay.
