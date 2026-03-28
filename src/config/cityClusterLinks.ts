/**
 * Bay Area City Cluster Links — Internal linking by geographic cluster
 * 
 * Each cluster groups cities by region for stronger topical authority.
 * Used by SeoCityPage to render "Nearby Cities" when seo_cities.nearby_cities_json
 * is empty or thin.
 */

export interface CityCluster {
  id: string;
  label: string;
  hubUrl: string;
  hubLabel: string;
  cities: string[]; // city slugs in priority order
}

export const CITY_CLUSTERS: CityCluster[] = [
  {
    id: 'east-bay',
    label: 'East Bay',
    hubUrl: '/dumpster-rental-east-bay',
    hubLabel: 'East Bay Dumpster Rental',
    cities: [
      'oakland', 'berkeley', 'alameda', 'san-leandro', 'hayward',
      'fremont', 'walnut-creek', 'concord', 'pleasanton', 'dublin',
      'livermore', 'emeryville', 'richmond',
    ],
  },
  {
    id: 'south-bay',
    label: 'South Bay & Peninsula',
    hubUrl: '/dumpster-rental-south-bay',
    hubLabel: 'South Bay Dumpster Rental',
    cities: [
      'san-jose', 'santa-clara', 'sunnyvale', 'mountain-view',
      'palo-alto', 'milpitas', 'cupertino', 'redwood-city',
      'san-mateo', 'south-san-francisco', 'daly-city',
    ],
  },
  {
    id: 'north-bay',
    label: 'North Bay',
    hubUrl: '/bay-area-dumpster-rental',
    hubLabel: 'Bay Area Dumpster Rental',
    cities: [
      'san-rafael', 'santa-rosa', 'petaluma', 'napa', 'vallejo',
    ],
  },
];

/** Get the cluster a city belongs to */
export function getCityCluster(citySlug: string): CityCluster | undefined {
  return CITY_CLUSTERS.find(c => c.cities.includes(citySlug));
}

/** Get nearby cities from the same cluster, excluding the current city, max N */
export function getClusterNearbyCities(citySlug: string, max = 5): string[] {
  const cluster = getCityCluster(citySlug);
  if (!cluster) return [];
  return cluster.cities.filter(s => s !== citySlug).slice(0, max);
}
