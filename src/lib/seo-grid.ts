// SEO Grid — Structured yard-to-city mapping for Bay Area SEO domination
// Each yard hub controls a cluster of nearby cities for hyper-local content

import { YARD_HUBS, type YardHubData, type YardCoverageCity } from './yard-hub-data';

export interface GridServiceType {
  slug: string;
  label: string;
  routePrefix: string;
}

export const GRID_SERVICE_TYPES: GridServiceType[] = [
  { slug: 'dumpster-rental', label: 'Dumpster Rental', routePrefix: '/dumpster-rental' },
  { slug: 'concrete-disposal', label: 'Concrete Disposal', routePrefix: '/concrete-disposal' },
  { slug: 'yard-waste-disposal', label: 'Yard Waste Disposal', routePrefix: '/yard-waste-disposal' },
  { slug: 'construction-debris', label: 'Construction Debris Removal', routePrefix: '/construction-debris' },
  { slug: 'debris-removal', label: 'Debris Removal', routePrefix: '/debris-removal' },
  { slug: 'yard-waste-removal', label: 'Yard Waste Removal', routePrefix: '/yard-waste-removal' },
];

export const GRID_SIZES = [10, 20, 30, 40] as const;

export interface GridCity {
  name: string;
  slug: string;           // e.g. "berkeley" (no -ca)
  slugWithState: string;  // e.g. "berkeley-ca"
  distanceMiles: number;
  deliveryEstimate: string;
  yardHub: string;        // yard slug
  yardName: string;       // e.g. "Oakland Yard"
}

/** Get all cities across all yards, deduplicated */
export function getAllGridCities(): GridCity[] {
  const cities: GridCity[] = [];
  const seen = new Set<string>();

  for (const yard of YARD_HUBS) {
    for (const city of yard.coverageCities) {
      if (seen.has(city.slug)) continue;
      seen.add(city.slug);
      cities.push({
        name: city.name,
        slug: city.slug,
        slugWithState: `${city.slug}-ca`,
        distanceMiles: city.distanceMiles,
        deliveryEstimate: city.deliveryEstimate,
        yardHub: yard.slug,
        yardName: yard.name,
      });
    }
  }
  return cities;
}

/** Get the nearest yard for a given city slug */
export function getNearestYard(citySlug: string): YardHubData | undefined {
  const normalized = citySlug.replace(/-ca$/, '');
  for (const yard of YARD_HUBS) {
    if (yard.coverageCities.some(c => c.slug === normalized)) {
      return yard;
    }
  }
  return undefined;
}

/** Get coverage city info from any yard */
export function getCoverageCity(citySlug: string): (YardCoverageCity & { yardSlug: string; yardName: string }) | undefined {
  const normalized = citySlug.replace(/-ca$/, '');
  for (const yard of YARD_HUBS) {
    const city = yard.coverageCities.find(c => c.slug === normalized);
    if (city) return { ...city, yardSlug: yard.slug, yardName: yard.name };
  }
  return undefined;
}

/** Generate all page URLs for the grid (for sitemap) */
export function generateGridUrls(): string[] {
  const urls: string[] = [];
  const cities = getAllGridCities();

  // Yard hub pages
  for (const yard of YARD_HUBS) {
    urls.push(`/yards/${yard.slug}`);
  }

  for (const city of cities) {
    // City landing pages
    urls.push(`/dumpster-rental/${city.slug}`);

    // Size pages
    for (const size of GRID_SIZES) {
      urls.push(`/dumpster-rental/${city.slug}/${size}-yard`);
    }

    // Service-type pages (excluding dumpster-rental which is the city page)
    for (const svc of GRID_SERVICE_TYPES) {
      if (svc.slug === 'dumpster-rental') continue;
      urls.push(`${svc.routePrefix}/${city.slug}`);
    }
  }

  return urls;
}

/** Get grid stats */
export function getGridStats() {
  const cities = getAllGridCities();
  return {
    totalYards: YARD_HUBS.length,
    totalCities: cities.length,
    totalSizePages: cities.length * GRID_SIZES.length,
    totalServicePages: cities.length * (GRID_SERVICE_TYPES.length - 1),
    totalPages: YARD_HUBS.length + cities.length + (cities.length * GRID_SIZES.length) + (cities.length * (GRID_SERVICE_TYPES.length - 1)),
    yardClusters: YARD_HUBS.map(y => ({
      yard: y.name,
      cities: y.coverageCities.map(c => c.name),
    })),
  };
}
