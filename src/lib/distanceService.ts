// Distance Service - Geocoding and distance calculation
// Uses free Nominatim API for ZIP geocoding with fallback

import { supabase } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

export interface Yard {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  market: string;
  address?: string;
  isActive: boolean;
  priorityRank: number;
}

export interface DistanceBracket {
  id: string;
  bracketName: string;
  minMiles: number;
  maxMiles: number | null;
  priceAdjustment: number;
  requiresReview: boolean;
  displayOrder: number;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName?: string;
  success: boolean;
  error?: string;
}

export interface DistanceResult {
  distanceMiles: number;
  distanceMinutes?: number;
  yard: Yard;
  bracket: DistanceBracket | null;
  priceAdjustment: number;
  requiresReview: boolean;
}

// ============================================================
// ZIP CODE TO COORDINATES - US ZIP centroids
// ============================================================

// Bay Area ZIP centroids (fallback data for common ZIPs)
const ZIP_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  // Alameda County
  '94501': { lat: 37.7712, lng: -122.2824 }, // Alameda
  '94536': { lat: 37.5585, lng: -122.0504 }, // Fremont
  '94538': { lat: 37.5022, lng: -121.9496 }, // Fremont
  '94541': { lat: 37.6688, lng: -122.0876 }, // Hayward
  '94545': { lat: 37.6296, lng: -122.0885 }, // Hayward
  '94550': { lat: 37.6745, lng: -121.8746 }, // Livermore
  '94577': { lat: 37.7066, lng: -122.1562 }, // San Leandro
  '94601': { lat: 37.7766, lng: -122.2198 }, // Oakland
  '94602': { lat: 37.8046, lng: -122.2103 }, // Oakland
  '94605': { lat: 37.7637, lng: -122.1588 }, // Oakland
  '94606': { lat: 37.7910, lng: -122.2424 }, // Oakland
  '94607': { lat: 37.8044, lng: -122.2947 }, // Oakland
  '94608': { lat: 37.8358, lng: -122.2847 }, // Emeryville
  '94609': { lat: 37.8350, lng: -122.2619 }, // Oakland
  '94610': { lat: 37.8116, lng: -122.2415 }, // Oakland
  '94611': { lat: 37.8271, lng: -122.2152 }, // Oakland
  '94612': { lat: 37.8044, lng: -122.2711 }, // Oakland
  '94618': { lat: 37.8416, lng: -122.2449 }, // Oakland
  '94619': { lat: 37.7807, lng: -122.1836 }, // Oakland
  '94621': { lat: 37.7582, lng: -122.2050 }, // Oakland
  '94702': { lat: 37.8644, lng: -122.2844 }, // Berkeley
  '94703': { lat: 37.8638, lng: -122.2786 }, // Berkeley
  '94704': { lat: 37.8689, lng: -122.2608 }, // Berkeley
  '94705': { lat: 37.8606, lng: -122.2422 }, // Berkeley
  '94706': { lat: 37.8899, lng: -122.2978 }, // Albany
  '94707': { lat: 37.8929, lng: -122.2791 }, // Berkeley
  '94708': { lat: 37.8980, lng: -122.2651 }, // Berkeley
  '94709': { lat: 37.8802, lng: -122.2658 }, // Berkeley
  '94710': { lat: 37.8591, lng: -122.2961 }, // Berkeley
  // Contra Costa
  '94506': { lat: 37.8516, lng: -121.9644 }, // Danville
  '94507': { lat: 37.8341, lng: -122.0052 }, // Alamo
  '94518': { lat: 37.9503, lng: -122.0607 }, // Concord
  '94520': { lat: 37.9780, lng: -122.0311 }, // Concord
  '94521': { lat: 37.9617, lng: -121.9786 }, // Concord
  '94523': { lat: 37.9339, lng: -122.0755 }, // Pleasant Hill
  '94526': { lat: 37.8374, lng: -121.9960 }, // Danville
  '94530': { lat: 37.9201, lng: -122.3028 }, // El Cerrito
  '94553': { lat: 37.9985, lng: -122.1151 }, // Martinez
  '94556': { lat: 37.8456, lng: -122.1116 }, // Moraga
  '94563': { lat: 37.8806, lng: -122.1110 }, // Orinda
  '94564': { lat: 37.9352, lng: -122.3571 }, // Pinole
  '94565': { lat: 38.0085, lng: -121.8086 }, // Pittsburg
  '94583': { lat: 37.7676, lng: -121.9776 }, // San Ramon
  '94595': { lat: 37.8802, lng: -122.0657 }, // Walnut Creek
  '94596': { lat: 37.9014, lng: -122.0459 }, // Walnut Creek
  '94597': { lat: 37.9214, lng: -122.0259 }, // Walnut Creek
  '94598': { lat: 37.9114, lng: -122.0659 }, // Walnut Creek
  '94801': { lat: 37.9357, lng: -122.3477 }, // Richmond
  '94804': { lat: 37.9257, lng: -122.3577 }, // Richmond
  '94805': { lat: 37.9357, lng: -122.3177 }, // Richmond
  '94806': { lat: 37.9627, lng: -122.3357 }, // San Pablo
  // Santa Clara
  '94086': { lat: 37.3805, lng: -122.0255 }, // Sunnyvale
  '94087': { lat: 37.3505, lng: -122.0355 }, // Sunnyvale
  '95008': { lat: 37.2871, lng: -121.9500 }, // Campbell
  '95014': { lat: 37.3230, lng: -122.0322 }, // Cupertino
  '95035': { lat: 37.4323, lng: -121.8996 }, // Milpitas
  '95050': { lat: 37.3544, lng: -121.9552 }, // Santa Clara
  '95051': { lat: 37.3500, lng: -121.9835 }, // Santa Clara
  '95054': { lat: 37.3930, lng: -121.9622 }, // Santa Clara
  '95110': { lat: 37.3382, lng: -121.8863 }, // San Jose
  '95111': { lat: 37.2856, lng: -121.8282 }, // San Jose
  '95112': { lat: 37.3510, lng: -121.8895 }, // San Jose
  '95116': { lat: 37.3510, lng: -121.8495 }, // San Jose
  '95117': { lat: 37.3110, lng: -121.9495 }, // San Jose
  '95118': { lat: 37.2510, lng: -121.8895 }, // San Jose
  '95119': { lat: 37.2310, lng: -121.7895 }, // San Jose
  '95120': { lat: 37.2010, lng: -121.8495 }, // San Jose
  '95121': { lat: 37.3010, lng: -121.8095 }, // San Jose
  '95122': { lat: 37.3310, lng: -121.8295 }, // San Jose
  '95123': { lat: 37.2510, lng: -121.8395 }, // San Jose
  '95124': { lat: 37.2610, lng: -121.9195 }, // San Jose
  '95125': { lat: 37.3010, lng: -121.8995 }, // San Jose
  '95126': { lat: 37.3310, lng: -121.9195 }, // San Jose
  '95127': { lat: 37.3710, lng: -121.8195 }, // San Jose
  '95128': { lat: 37.3110, lng: -121.9395 }, // San Jose
  '95129': { lat: 37.3010, lng: -121.9895 }, // San Jose
  '95130': { lat: 37.2910, lng: -121.9795 }, // San Jose
  '95131': { lat: 37.3910, lng: -121.9095 }, // San Jose
  '95132': { lat: 37.4110, lng: -121.8595 }, // San Jose
  '95133': { lat: 37.3710, lng: -121.8695 }, // San Jose
  '95134': { lat: 37.4310, lng: -121.9395 }, // San Jose
  '95135': { lat: 37.2910, lng: -121.7695 }, // San Jose
  '95136': { lat: 37.2710, lng: -121.8495 }, // San Jose
  '95138': { lat: 37.2510, lng: -121.7395 }, // San Jose
  '95139': { lat: 37.2410, lng: -121.7795 }, // San Jose
  '95148': { lat: 37.3310, lng: -121.7695 }, // San Jose
  // San Mateo
  '94010': { lat: 37.5585, lng: -122.3664 }, // Burlingame
  '94014': { lat: 37.6890, lng: -122.4664 }, // Daly City
  '94015': { lat: 37.6790, lng: -122.4864 }, // Daly City
  '94025': { lat: 37.4522, lng: -122.1845 }, // Menlo Park
  '94027': { lat: 37.4622, lng: -122.2045 }, // Atherton
  '94030': { lat: 37.5922, lng: -122.4045 }, // Millbrae
  '94044': { lat: 37.6122, lng: -122.4845 }, // Pacifica
  '94061': { lat: 37.4622, lng: -122.2245 }, // Redwood City
  '94062': { lat: 37.4722, lng: -122.2545 }, // Redwood City
  '94063': { lat: 37.4822, lng: -122.2145 }, // Redwood City
  '94065': { lat: 37.5322, lng: -122.2545 }, // Redwood Shores
  '94066': { lat: 37.6222, lng: -122.3945 }, // San Bruno
  '94080': { lat: 37.6522, lng: -122.4145 }, // South San Francisco
  '94401': { lat: 37.5686, lng: -122.3244 }, // San Mateo
  '94402': { lat: 37.5486, lng: -122.3044 }, // San Mateo
  '94403': { lat: 37.5386, lng: -122.3244 }, // San Mateo
  '94404': { lat: 37.5586, lng: -122.2744 }, // San Mateo
  // Tracy / Stockton
  '95304': { lat: 37.8069, lng: -121.2523 }, // Tracy
  '95376': { lat: 37.7397, lng: -121.4252 }, // Tracy
  '95377': { lat: 37.7097, lng: -121.4552 }, // Tracy
  '95391': { lat: 37.6797, lng: -121.3852 }, // Tracy
  '95205': { lat: 37.9580, lng: -121.2796 }, // Stockton
  '95206': { lat: 37.9180, lng: -121.2996 }, // Stockton
  '95207': { lat: 37.9580, lng: -121.3096 }, // Stockton
  '95209': { lat: 37.9980, lng: -121.3596 }, // Stockton
  '95210': { lat: 38.0180, lng: -121.3296 }, // Stockton
  '95212': { lat: 38.0280, lng: -121.2596 }, // Stockton
};

// ============================================================
// GEOCODING
// ============================================================

/**
 * Geocode a ZIP code to lat/lng using Nominatim (free) with fallback
 */
export async function geocodeZip(zip: string): Promise<GeocodingResult> {
  // First check local fallback data
  if (ZIP_CENTROIDS[zip]) {
    return {
      lat: ZIP_CENTROIDS[zip].lat,
      lng: ZIP_CENTROIDS[zip].lng,
      success: true,
    };
  }

  // Try Nominatim API (free, no key required)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Calsan-Dumpsters/1.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
          success: true,
        };
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  // Fallback: estimate based on first 3 digits (ZIP3)
  const zip3 = zip.substring(0, 3);
  const estimatedCoords = estimateZipLocation(zip3);
  
  if (estimatedCoords) {
    return {
      lat: estimatedCoords.lat,
      lng: estimatedCoords.lng,
      success: true,
    };
  }

  return {
    lat: 0,
    lng: 0,
    success: false,
    error: 'Could not geocode ZIP code',
  };
}

/**
 * Estimate location based on ZIP3 prefix (Bay Area only)
 */
function estimateZipLocation(zip3: string): { lat: number; lng: number } | null {
  const zip3Map: Record<string, { lat: number; lng: number }> = {
    '940': { lat: 37.7749, lng: -122.4194 }, // San Francisco
    '941': { lat: 37.7749, lng: -122.4194 }, // San Francisco
    '944': { lat: 37.4419, lng: -122.1430 }, // Palo Alto area
    '945': { lat: 37.6879, lng: -122.4702 }, // Daly City area
    '946': { lat: 37.7749, lng: -122.2285 }, // Oakland area
    '947': { lat: 37.8716, lng: -122.2727 }, // Berkeley area
    '948': { lat: 37.9358, lng: -122.3478 }, // Richmond area
    '949': { lat: 37.9735, lng: -122.5311 }, // San Rafael area
    '950': { lat: 37.3382, lng: -121.8863 }, // San Jose
    '951': { lat: 37.3382, lng: -121.8863 }, // San Jose
    '952': { lat: 37.9577, lng: -121.2908 }, // Stockton
    '953': { lat: 37.7397, lng: -121.4252 }, // Tracy
    '954': { lat: 38.5816, lng: -121.4944 }, // Sacramento
    '956': { lat: 38.5816, lng: -121.4944 }, // Sacramento
  };
  
  return zip3Map[zip3] || null;
}

// ============================================================
// YARDS & BRACKETS
// ============================================================

/**
 * Fetch all active yards from database
 */
export async function fetchYards(): Promise<Yard[]> {
  const { data, error } = await supabase
    .from('yards')
    .select('*')
    .eq('is_active', true)
    .order('priority_rank', { ascending: true });

  if (error || !data) {
    console.error('Error fetching yards:', error);
    return [];
  }

  return data.map((y: any) => ({
    id: y.id,
    name: y.name,
    slug: y.slug,
    latitude: parseFloat(y.latitude),
    longitude: parseFloat(y.longitude),
    market: y.market,
    address: y.address,
    isActive: y.is_active,
    priorityRank: y.priority_rank,
  }));
}

/**
 * Fetch distance brackets from database
 */
export async function fetchDistanceBrackets(): Promise<DistanceBracket[]> {
  const { data, error } = await supabase
    .from('distance_brackets')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error || !data) {
    console.error('Error fetching distance brackets:', error);
    // Return default brackets as fallback
    return [
      { id: 'local', bracketName: 'Local', minMiles: 0, maxMiles: 5, priceAdjustment: 0, requiresReview: false, displayOrder: 1 },
      { id: 'near', bracketName: 'Near', minMiles: 5, maxMiles: 10, priceAdjustment: 25, requiresReview: false, displayOrder: 2 },
      { id: 'standard', bracketName: 'Standard', minMiles: 10, maxMiles: 15, priceAdjustment: 50, requiresReview: false, displayOrder: 3 },
      { id: 'extended', bracketName: 'Extended', minMiles: 15, maxMiles: 25, priceAdjustment: 75, requiresReview: false, displayOrder: 4 },
      { id: 'far', bracketName: 'Far', minMiles: 25, maxMiles: null, priceAdjustment: 100, requiresReview: true, displayOrder: 5 },
    ];
  }

  return data.map((b: any) => ({
    id: b.id,
    bracketName: b.bracket_name,
    minMiles: parseFloat(b.min_miles),
    maxMiles: b.max_miles ? parseFloat(b.max_miles) : null,
    priceAdjustment: parseFloat(b.price_adjustment),
    requiresReview: b.requires_review,
    displayOrder: b.display_order,
  }));
}

// ============================================================
// DISTANCE CALCULATION
// ============================================================

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Find the nearest yard to a location
 */
export function findNearestYard(
  customerLat: number,
  customerLng: number,
  yards: Yard[]
): { yard: Yard; distance: number } | null {
  if (yards.length === 0) return null;

  let nearestYard = yards[0];
  let minDistance = calculateHaversineDistance(
    customerLat,
    customerLng,
    yards[0].latitude,
    yards[0].longitude
  );

  for (const yard of yards) {
    const distance = calculateHaversineDistance(
      customerLat,
      customerLng,
      yard.latitude,
      yard.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestYard = yard;
    }
  }

  return { yard: nearestYard, distance: minDistance };
}

/**
 * Get the distance bracket for a given distance
 */
export function getDistanceBracket(
  distanceMiles: number,
  brackets: DistanceBracket[]
): DistanceBracket | null {
  for (const bracket of brackets) {
    if (
      distanceMiles >= bracket.minMiles &&
      (bracket.maxMiles === null || distanceMiles < bracket.maxMiles)
    ) {
      return bracket;
    }
  }
  return null;
}

/**
 * Calculate complete distance info for a customer location
 */
export async function calculateDistanceInfo(
  customerLat: number,
  customerLng: number
): Promise<DistanceResult | null> {
  const [yards, brackets] = await Promise.all([
    fetchYards(),
    fetchDistanceBrackets(),
  ]);

  if (yards.length === 0) {
    console.error('No yards found');
    return null;
  }

  const nearestResult = findNearestYard(customerLat, customerLng, yards);
  if (!nearestResult) return null;

  const { yard, distance } = nearestResult;
  const bracket = getDistanceBracket(distance, brackets);

  // Estimate driving time (rough: 2 min per mile in Bay Area traffic)
  const estimatedMinutes = Math.round(distance * 2.5);

  return {
    distanceMiles: Math.round(distance * 100) / 100,
    distanceMinutes: estimatedMinutes,
    yard,
    bracket,
    priceAdjustment: bracket?.priceAdjustment || 0,
    requiresReview: bracket?.requiresReview || distance > 25,
  };
}

/**
 * Full distance lookup from ZIP code
 */
export async function getDistanceFromZip(zip: string): Promise<{
  geocoding: GeocodingResult;
  distance: DistanceResult | null;
}> {
  const geocoding = await geocodeZip(zip);
  
  if (!geocoding.success) {
    return { geocoding, distance: null };
  }

  const distance = await calculateDistanceInfo(geocoding.lat, geocoding.lng);
  
  return { geocoding, distance };
}
