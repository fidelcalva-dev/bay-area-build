/**
 * Facility Service - Disposal Routing Logic
 * Manages approved dump/transfer stations and disposal planning
 */
import { supabase } from '@/integrations/supabase/client';
import type { MaterialClassification } from './materialCategories';

// =====================================================
// TYPES
// =====================================================

export interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  facility_type: FacilityType;
  accepted_material_classes: string[];
  green_halo_certified: boolean;
  approved_by_city: string[];
  hours: string | null;
  phone: string | null;
  notes: string | null;
  status: 'active' | 'inactive';
}

export type FacilityType = 
  | 'transfer_station' 
  | 'landfill' 
  | 'recycler' 
  | 'organics' 
  | 'metal' 
  | 'inert' 
  | 'mixed_c_and_d' 
  | 'roofing';

export interface CityFacilityRule {
  id: string;
  city: string;
  market: string | null;
  default_facility_type_for_mixed: string;
  requires_green_halo_for_projects: boolean;
  facility_selection_policy: 'auto_suggest' | 'customer_request' | 'dispatch_confirm';
  manual_review_distance_miles: number | null;
}

export interface SuggestedFacility {
  facility_id: string;
  facility_name: string;
  address: string;
  distance_miles: number;
  duration_minutes: number;
  green_halo_certified: boolean;
  hours: string | null;
  phone: string | null;
}

export interface DisposalPlan {
  id: string;
  order_id: string;
  material_classification: string;
  required_facility_type: string;
  green_halo_required: boolean;
  suggested_facilities: SuggestedFacility[] | unknown; // JSONB from DB
  selected_facility_id: string | null;
  selection_method: 'auto' | 'dispatch' | 'driver' | 'customer' | null;
  route_miles_to_facility: number | null;
  route_minutes_to_facility: number | null;
  route_polyline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Helper to safely parse suggested_facilities from JSONB
 */
export function parseSuggestedFacilities(plan: DisposalPlan): SuggestedFacility[] {
  if (!plan.suggested_facilities) return [];
  if (Array.isArray(plan.suggested_facilities)) {
    return plan.suggested_facilities as SuggestedFacility[];
  }
  return [];
}

// =====================================================
// MATERIAL → FACILITY TYPE MAPPING
// =====================================================

/**
 * Maps material classifications to required facility types
 */
export function getRequiredFacilityType(materialClass: MaterialClassification): FacilityType {
  switch (materialClass) {
    case 'HEAVY_CLEAN_BASE':
      return 'inert'; // Concrete, soil, sand → inert facility
    case 'HEAVY_PLUS_200':
      return 'transfer_station'; // Roofing, tile, brick → transfer or specialized
    case 'HEAVY_MIXED':
      return 'transfer_station'; // Mixed heavy → transfer station
    case 'MIXED_GENERAL':
    default:
      return 'transfer_station'; // C&D mixed → transfer station
  }
}

/**
 * Special case mappings for specific material types
 */
export function getSpecialFacilityType(materialType: string): FacilityType | null {
  const lowerMaterial = materialType.toLowerCase();
  
  if (lowerMaterial.includes('metal')) return 'metal';
  if (lowerMaterial.includes('green') || lowerMaterial.includes('yard') || lowerMaterial.includes('organic')) return 'organics';
  if (lowerMaterial.includes('roofing')) return 'roofing';
  
  return null;
}

// =====================================================
// FACILITY QUERIES
// =====================================================

/**
 * Fetch all active facilities
 */
export async function getFacilities(): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }

  return (data || []) as Facility[];
}

/**
 * Fetch facilities approved for a specific city
 */
export async function getFacilitiesForCity(city: string): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .contains('approved_by_city', [city])
    .order('name');

  if (error) {
    console.error('Error fetching facilities for city:', error);
    return [];
  }

  return (data || []) as Facility[];
}

/**
 * Fetch facilities that accept a specific material classification
 */
export async function getFacilitiesForMaterial(
  materialClass: MaterialClassification,
  city?: string,
  requireGreenHalo?: boolean
): Promise<Facility[]> {
  let query = supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .contains('accepted_material_classes', [materialClass]);

  if (city) {
    query = query.contains('approved_by_city', [city]);
  }

  if (requireGreenHalo) {
    query = query.eq('green_halo_certified', true);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching facilities for material:', error);
    return [];
  }

  return (data || []) as Facility[];
}

/**
 * Fetch city facility rules
 */
export async function getCityFacilityRules(city: string): Promise<CityFacilityRule | null> {
  const { data, error } = await supabase
    .from('city_facility_rules')
    .select('*')
    .eq('city', city)
    .single();

  if (error) {
    console.error('Error fetching city rules:', error);
    return null;
  }

  return data as CityFacilityRule;
}

// =====================================================
// DISPOSAL PLAN OPERATIONS
// =====================================================

/**
 * Get disposal plan for an order
 */
export async function getDisposalPlan(orderId: string): Promise<DisposalPlan | null> {
  const { data, error } = await supabase
    .from('order_disposal_plans')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching disposal plan:', error);
    return null;
  }

  if (!data) return null;
  
  return {
    ...data,
    suggested_facilities: data.suggested_facilities || [],
  } as unknown as DisposalPlan;
}

/**
 * Create or update disposal plan
 */
export async function upsertDisposalPlan(
  orderId: string,
  plan: Partial<Omit<DisposalPlan, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; plan?: DisposalPlan; error?: string }> {
  const upsertData = {
    order_id: orderId,
    material_classification: plan.material_classification || 'MIXED_GENERAL',
    required_facility_type: plan.required_facility_type || 'transfer_station',
    green_halo_required: plan.green_halo_required || false,
    suggested_facilities: plan.suggested_facilities || [],
    selected_facility_id: plan.selected_facility_id || null,
    selection_method: plan.selection_method || null,
    route_miles_to_facility: plan.route_miles_to_facility || null,
    route_minutes_to_facility: plan.route_minutes_to_facility || null,
    route_polyline: plan.route_polyline || null,
    notes: plan.notes || null,
  };

  // Use raw query since table may not be in types yet
  const { data, error } = await supabase
    .from('order_disposal_plans' as 'order_disposal_plans')
    .upsert(upsertData as never, { onConflict: 'order_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting disposal plan:', error);
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    plan: {
      ...(data as Record<string, unknown>),
      suggested_facilities: (data as Record<string, unknown>).suggested_facilities || [],
    } as unknown as DisposalPlan 
  };
}

/**
 * Select a facility for an order
 */
export async function selectFacility(
  orderId: string,
  facilityId: string,
  method: 'auto' | 'dispatch' | 'driver' | 'customer',
  routeMiles?: number,
  routeMinutes?: number,
  routePolyline?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('order_disposal_plans')
    .update({
      selected_facility_id: facilityId,
      selection_method: method,
      route_miles_to_facility: routeMiles || null,
      route_minutes_to_facility: routeMinutes || null,
      route_polyline: routePolyline || null,
      updated_at: new Date().toISOString(),
    })
    .eq('order_id', orderId);

  if (error) {
    console.error('Error selecting facility:', error);
    return { success: false, error: error.message };
  }

  // Log the event
  await logDisposalEvent(orderId, `FACILITY_SELECTED_BY_${method.toUpperCase()}`, { facilityId });

  return { success: true };
}

// =====================================================
// AUDIT LOGGING
// =====================================================

/**
 * Log disposal-related events
 */
export async function logDisposalEvent(
  orderId: string,
  eventType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: eventType,
      metadata: {
        ...metadata,
        source: 'disposal_service',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Failed to log disposal event:', err);
  }
}

// =====================================================
// FACILITY TYPE LABELS
// =====================================================

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  transfer_station: 'Transfer Station',
  landfill: 'Landfill',
  recycler: 'Recycler',
  organics: 'Organics / Green Waste',
  metal: 'Metal Recycler',
  inert: 'Inert Materials',
  mixed_c_and_d: 'Mixed C&D',
  roofing: 'Roofing Materials',
};

export const MATERIAL_CLASS_LABELS: Record<string, string> = {
  HEAVY_CLEAN_BASE: 'Heavy - Clean Base',
  HEAVY_PLUS_200: 'Heavy (+$200)',
  HEAVY_MIXED: 'Heavy - Mixed',
  MIXED_GENERAL: 'Mixed C&D',
  GREEN_WASTE: 'Green Waste',
  METAL_CLEAN: 'Clean Metal',
  ORGANICS: 'Organics',
};
