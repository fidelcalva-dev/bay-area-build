// ============================================================
// FACILITY SELECTOR — Material stream → facility matching
// Maps material categories to facility types and selects
// the best disposal facility based on market and distance.
// ============================================================

import { supabase } from '@/integrations/supabase/client';

export type MaterialStream =
  | 'GENERAL_DEBRIS'      // C&D, mixed demo
  | 'HEAVY_CLEAN'         // Clean concrete, asphalt, rock, sand
  | 'HEAVY_CONTAMINATED'  // Dirt with debris, mixed heavy
  | 'GREEN_WASTE'         // Green waste, clean wood
  | 'CLEAN_RECYCLING'     // Cardboard, metal, clean recyclables
  | 'YARD_WASTE';         // Same as green waste for routing

/** Map material stream to facility material classes for DB matching */
const STREAM_TO_CLASSES: Record<MaterialStream, string[]> = {
  GENERAL_DEBRIS: ['MIXED_GENERAL', 'CD_WASTE'],
  HEAVY_CLEAN: ['HEAVY_CLEAN_BASE', 'INERT'],
  HEAVY_CONTAMINATED: ['HEAVY_MIXED', 'HEAVY_PLUS_200', 'MIXED_GENERAL'],
  GREEN_WASTE: ['GREEN_WASTE', 'ORGANIC'],
  CLEAN_RECYCLING: ['RECYCLING', 'MIXED_GENERAL'],
  YARD_WASTE: ['GREEN_WASTE', 'ORGANIC'],
};

/** Map material stream to preferred facility type */
const STREAM_TO_FACILITY_TYPE: Record<MaterialStream, string[]> = {
  GENERAL_DEBRIS: ['transfer_station', 'recycling_center'],
  HEAVY_CLEAN: ['inert', 'quarry', 'recycling_center'],
  HEAVY_CONTAMINATED: ['transfer_station'],
  GREEN_WASTE: ['green_waste', 'compost', 'transfer_station'],
  CLEAN_RECYCLING: ['recycling_center', 'transfer_station'],
  YARD_WASTE: ['green_waste', 'compost', 'transfer_station'],
};

export interface SelectedFacility {
  id: string;
  name: string;
  facilityType: string;
  lat: number;
  lng: number;
  /** Customer sees only the category, not the actual facility name */
  categoryLabel: string;
}

/**
 * Select the best facility for a given material stream and market.
 * Returns null if no facility found (customer sees "Disposal handled by our team").
 */
export async function selectFacility(
  materialStream: MaterialStream,
  marketCode?: string,
): Promise<SelectedFacility | null> {
  const materialClasses = STREAM_TO_CLASSES[materialStream] ?? ['MIXED_GENERAL'];
  const preferredTypes = STREAM_TO_FACILITY_TYPE[materialStream] ?? ['transfer_station'];

  let query = supabase
    .from('facilities')
    .select('id, name, lat, lng, facility_type, accepted_material_classes, market')
    .eq('status', 'active')
    .overlaps('accepted_material_classes', materialClasses);

  if (marketCode) {
    query = query.eq('market', marketCode);
  }

  const { data, error } = await query.limit(10);

  if (error || !data || data.length === 0) {
    console.warn('No facilities found for', materialStream, marketCode);
    return null;
  }

  // Sort: prefer matching facility_type, then by name as tiebreaker
  const sorted = [...data].sort((a, b) => {
    const aTypeMatch = preferredTypes.indexOf(a.facility_type) !== -1 ? 0 : 1;
    const bTypeMatch = preferredTypes.indexOf(b.facility_type) !== -1 ? 0 : 1;
    if (aTypeMatch !== bTypeMatch) return aTypeMatch - bTypeMatch;
    return (a.name ?? '').localeCompare(b.name ?? '');
  });

  const best = sorted[0];
  return {
    id: best.id,
    name: best.name,
    facilityType: best.facility_type,
    lat: best.lat,
    lng: best.lng,
    categoryLabel: getCategoryLabel(materialStream),
  };
}

/** Map material category from quote flow to material stream */
export function materialCategoryToStream(category: string): MaterialStream {
  switch (category) {
    case 'HEAVY':
    case 'HEAVY_MATERIALS':
      return 'HEAVY_CLEAN';
    case 'DEBRIS_HEAVY':
      return 'HEAVY_CONTAMINATED';
    case 'DEBRIS':
    case 'GENERAL_DEBRIS':
      return 'GENERAL_DEBRIS';
    case 'CLEAN_RECYCLING':
      return 'CLEAN_RECYCLING';
    case 'YARD_WASTE':
    case 'GREEN_WASTE':
      return 'GREEN_WASTE';
    default:
      return 'GENERAL_DEBRIS';
  }
}

function getCategoryLabel(stream: MaterialStream): string {
  switch (stream) {
    case 'GENERAL_DEBRIS': return 'Transfer station';
    case 'HEAVY_CLEAN': return 'Clean materials facility';
    case 'HEAVY_CONTAMINATED': return 'Transfer station';
    case 'GREEN_WASTE':
    case 'YARD_WASTE': return 'Green waste facility';
    case 'CLEAN_RECYCLING': return 'Recycling center';
    default: return 'Disposal facility';
  }
}
