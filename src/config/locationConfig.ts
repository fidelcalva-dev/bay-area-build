/**
 * Active Location Configuration — Canonical Source of Truth
 * 
 * Controls which yards and service markets are active for:
 * - Quote pricing
 * - Dispatch routing
 * - Public visibility
 */

export type LocationType = 'YARD' | 'SERVICE_MARKET' | 'OFFICE';
export type MarketType = 'CORE_DIRECT' | 'SUPPORT_RING' | 'OUTSIDE_CURRENT_FOCUS' | 'FUTURE_PARTNER';

export interface LocationConfig {
  id: string;
  name: string;
  type: LocationType;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  address?: string;
  /** Can this location be used for quote pricing? */
  isActiveForQuotes: boolean;
  /** Can this location receive dispatch assignments? */
  isActiveForDispatch: boolean;
  /** Should this location appear on public website? */
  isVisiblePublicly: boolean;
  /** Fallback yard if this location is disabled */
  nearestFallbackYardId?: string;
  /** Service radius in miles */
  serviceRadiusMiles: number;
  /** Market classification */
  marketType: MarketType;
  /** Priority rank (lower = higher priority) */
  priorityRank: number;
}

export const LOCATION_CONFIGS: LocationConfig[] = [
  // OFFICES
  {
    id: 'oakland-office',
    name: 'Oakland HQ (Mailing/Public)',
    type: 'OFFICE',
    city: 'Oakland',
    state: 'CA',
    zip: '94606',
    lat: 37.7979,
    lng: -122.2369,
    address: '1930 12th Ave #201, Oakland, CA 94606',
    isActiveForQuotes: false,
    isActiveForDispatch: false,
    isVisiblePublicly: true,
    serviceRadiusMiles: 0,
    marketType: 'CORE_DIRECT',
    priorityRank: 0,
  },
  // YARDS
  {
    id: 'oakland-yard',
    name: 'Oakland Operational Yard',
    type: 'YARD',
    city: 'Oakland',
    state: 'CA',
    zip: '94601',
    lat: 37.7692,
    lng: -122.2189,
    address: '1000 46th Ave, Oakland, CA 94601',
    isActiveForQuotes: true,
    isActiveForDispatch: true,
    isVisiblePublicly: true,
    serviceRadiusMiles: 35,
    marketType: 'CORE_DIRECT',
    priorityRank: 1,
  },
  {
    id: 'sanjose-yard',
    name: 'San Jose Operational Yard',
    type: 'YARD',
    city: 'San Jose',
    state: 'CA',
    zip: '95131',
    lat: 37.3861,
    lng: -121.9187,
    address: '2071 Ringwood Ave, San Jose, CA 95131',
    isActiveForQuotes: true,
    isActiveForDispatch: true,
    isVisiblePublicly: true,
    nearestFallbackYardId: 'oakland-yard',
    serviceRadiusMiles: 30,
    marketType: 'CORE_DIRECT',
    priorityRank: 2,
  },
  {
    id: 'sf-yard',
    name: 'San Francisco Yard',
    type: 'YARD',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    lat: 37.7650,
    lng: -122.3964,
    address: '1200 17th St, San Francisco, CA 94107',
    isActiveForQuotes: true,
    isActiveForDispatch: true,
    isVisiblePublicly: true,
    nearestFallbackYardId: 'oakland-yard',
    serviceRadiusMiles: 20,
    marketType: 'CORE_DIRECT',
    priorityRank: 3,
  },
];

/** Get all active yards for quoting */
export function getActiveQuoteYards(): LocationConfig[] {
  return LOCATION_CONFIGS.filter(l => l.type === 'YARD' && l.isActiveForQuotes);
}

/** Get all active yards for dispatch */
export function getActiveDispatchYards(): LocationConfig[] {
  return LOCATION_CONFIGS.filter(l => l.type === 'YARD' && l.isActiveForDispatch);
}

/** Get nearest active yard by coordinates */
export function getNearestActiveYard(lat: number, lng: number, forQuotes = true): LocationConfig | null {
  const yards = forQuotes ? getActiveQuoteYards() : getActiveDispatchYards();
  if (yards.length === 0) return null;

  let nearest = yards[0];
  let minDist = Infinity;

  for (const yard of yards) {
    const dist = Math.sqrt(Math.pow(yard.lat - lat, 2) + Math.pow(yard.lng - lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = yard;
    }
  }

  return nearest;
}

/** Get publicly visible locations */
export function getPublicLocations(): LocationConfig[] {
  return LOCATION_CONFIGS.filter(l => l.isVisiblePublicly);
}

/** Get a location by ID */
export function getLocationById(id: string): LocationConfig | undefined {
  return LOCATION_CONFIGS.find(l => l.id === id);
}
