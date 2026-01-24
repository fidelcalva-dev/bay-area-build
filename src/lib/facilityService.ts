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

export type FacilitySelectionMode = 'auto' | 'customer_requested' | 'driver_preferred' | 'dispatch_override';
export type RequestedBy = 'customer' | 'driver' | 'dispatch' | 'system';

export interface DisposalPlan {
  id: string;
  order_id: string;
  material_classification: string;
  required_facility_type: string;
  green_halo_required: boolean;
  suggested_facilities: SuggestedFacility[] | unknown; // JSONB from DB
  selected_facility_id: string | null;
  selection_method: 'auto' | 'dispatch' | 'driver' | 'customer' | null;
  facility_selection_mode: FacilitySelectionMode;
  requested_by: RequestedBy;
  request_reason: string | null;
  dump_fee_at_cost: boolean;
  handling_fee_possible: boolean;
  market: string | null;
  route_miles_to_facility: number | null;
  route_minutes_to_facility: number | null;
  route_polyline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverFacilityPreference {
  id: string;
  driver_id: string;
  facility_id: string;
  market: string;
  rank: number;
  is_default: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  facility?: Facility;
}

export interface DisposalRequest {
  id: string;
  order_id: string;
  requested_by: 'customer' | 'driver';
  requested_facility_id: string | null;
  requested_facility_name_text: string | null;
  notes: string | null;
  status: 'submitted' | 'approved' | 'denied';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  facility?: Facility;
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

export const FACILITY_MODE_LABELS: Record<FacilitySelectionMode, string> = {
  auto: 'Auto-Selected',
  customer_requested: 'Customer Requested',
  driver_preferred: 'Driver Preferred',
  dispatch_override: 'Dispatch Override',
};

// =====================================================
// DRIVER FACILITY PREFERENCES
// =====================================================

/**
 * Get driver's facility preferences for a market
 */
export async function getDriverPreferences(
  driverId: string,
  market?: string,
  greenHaloOnly?: boolean
): Promise<DriverFacilityPreference[]> {
  let query = supabase
    .from('driver_facility_preferences' as 'driver_facility_preferences')
    .select('*, facility:facilities(*)')
    .eq('driver_id', driverId)
    .order('rank', { ascending: true });

  if (market) {
    query = query.eq('market', market);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching driver preferences:', error);
    return [];
  }

  let preferences = (data || []) as unknown as DriverFacilityPreference[];

  // Filter for green halo if required
  if (greenHaloOnly) {
    preferences = preferences.filter(p => p.facility?.green_halo_certified);
  }

  return preferences;
}

/**
 * Add or update driver facility preference
 */
export async function upsertDriverPreference(
  driverId: string,
  facilityId: string,
  market: string,
  rank: number = 1,
  isDefault: boolean = false,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('driver_facility_preferences' as 'driver_facility_preferences')
    .upsert({
      driver_id: driverId,
      facility_id: facilityId,
      market,
      rank,
      is_default: isDefault,
      notes: notes || null,
    } as never, { onConflict: 'driver_id,facility_id' });

  if (error) {
    console.error('Error upserting driver preference:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Remove driver facility preference
 */
export async function removeDriverPreference(
  driverId: string,
  facilityId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('driver_facility_preferences' as 'driver_facility_preferences')
    .delete()
    .eq('driver_id', driverId)
    .eq('facility_id', facilityId);

  if (error) {
    console.error('Error removing driver preference:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// =====================================================
// DISPOSAL REQUESTS
// =====================================================

/**
 * Create a disposal request (customer or driver)
 */
export async function createDisposalRequest(
  orderId: string,
  requestedBy: 'customer' | 'driver',
  facilityId?: string,
  facilityNameText?: string,
  notes?: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const { data, error } = await supabase
    .from('disposal_requests' as 'disposal_requests')
    .insert({
      order_id: orderId,
      requested_by: requestedBy,
      requested_facility_id: facilityId || null,
      requested_facility_name_text: facilityNameText || null,
      notes: notes || null,
      status: 'submitted',
    } as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating disposal request:', error);
    return { success: false, error: error.message };
  }

  // Log the event
  const eventType = requestedBy === 'customer' 
    ? 'CUSTOMER_DISPOSAL_REQUEST_SUBMITTED' 
    : 'DRIVER_DISPOSAL_REQUEST_SUBMITTED';
  await logDisposalEvent(orderId, eventType, { 
    requestId: (data as unknown as DisposalRequest).id,
    facilityId,
    facilityNameText,
    notes,
  });

  return { success: true, requestId: (data as unknown as DisposalRequest).id };
}

/**
 * Get disposal requests for an order
 */
export async function getDisposalRequests(orderId: string): Promise<DisposalRequest[]> {
  const { data, error } = await supabase
    .from('disposal_requests' as 'disposal_requests')
    .select('*, facility:facilities(*)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching disposal requests:', error);
    return [];
  }

  return (data || []) as unknown as DisposalRequest[];
}

/**
 * Approve a disposal request
 */
export async function approveDisposalRequest(
  requestId: string,
  reviewedBy: string,
  reviewNotes?: string
): Promise<{ success: boolean; error?: string }> {
  // Get the request first
  const { data: request, error: fetchError } = await supabase
    .from('disposal_requests' as 'disposal_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    return { success: false, error: 'Request not found' };
  }

  const req = request as unknown as DisposalRequest;

  // Update the request status
  const { error: updateError } = await supabase
    .from('disposal_requests' as 'disposal_requests')
    .update({
      status: 'approved',
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null,
    } as never)
    .eq('id', requestId);

  if (updateError) {
    console.error('Error approving request:', updateError);
    return { success: false, error: updateError.message };
  }

  // Update the disposal plan with the approved facility
  if (req.requested_facility_id) {
    await supabase
      .from('order_disposal_plans' as 'order_disposal_plans')
      .update({
        selected_facility_id: req.requested_facility_id,
        facility_selection_mode: 'customer_requested',
        requested_by: req.requested_by,
        request_reason: req.notes,
        dump_fee_at_cost: true,
        handling_fee_possible: true,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('order_id', req.order_id);
  }

  // Log the event
  await logDisposalEvent(req.order_id, 'CUSTOMER_DISPOSAL_REQUEST_APPROVED', {
    requestId,
    facilityId: req.requested_facility_id,
    reviewedBy,
  });

  return { success: true };
}

/**
 * Deny a disposal request
 */
export async function denyDisposalRequest(
  requestId: string,
  reviewedBy: string,
  reviewNotes?: string
): Promise<{ success: boolean; error?: string }> {
  // Get the request first
  const { data: request, error: fetchError } = await supabase
    .from('disposal_requests' as 'disposal_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    return { success: false, error: 'Request not found' };
  }

  const req = request as unknown as DisposalRequest;

  // Update the request status
  const { error: updateError } = await supabase
    .from('disposal_requests' as 'disposal_requests')
    .update({
      status: 'denied',
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null,
    } as never)
    .eq('id', requestId);

  if (updateError) {
    console.error('Error denying request:', updateError);
    return { success: false, error: updateError.message };
  }

  // Revert to auto mode
  await supabase
    .from('order_disposal_plans' as 'order_disposal_plans')
    .update({
      facility_selection_mode: 'auto',
      requested_by: 'system',
      dump_fee_at_cost: false,
      handling_fee_possible: false,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('order_id', req.order_id);

  // Log the event
  await logDisposalEvent(req.order_id, 'CUSTOMER_DISPOSAL_REQUEST_DENIED', {
    requestId,
    reviewedBy,
    reason: reviewNotes,
  });

  return { success: true };
}

/**
 * Select facility with full mode tracking
 */
export async function selectFacilityWithMode(
  orderId: string,
  facilityId: string,
  mode: FacilitySelectionMode,
  requestedBy: RequestedBy,
  requestReason?: string,
  routeMiles?: number,
  routeMinutes?: number
): Promise<{ success: boolean; error?: string }> {
  const updateData: Record<string, unknown> = {
    selected_facility_id: facilityId,
    selection_method: requestedBy === 'system' ? 'auto' : requestedBy,
    facility_selection_mode: mode,
    requested_by: requestedBy,
    request_reason: requestReason || null,
    route_miles_to_facility: routeMiles || null,
    route_minutes_to_facility: routeMinutes || null,
    updated_at: new Date().toISOString(),
  };

  // Set fee flags for customer requests
  if (mode === 'customer_requested') {
    updateData.dump_fee_at_cost = true;
    updateData.handling_fee_possible = true;
  } else {
    updateData.dump_fee_at_cost = false;
    updateData.handling_fee_possible = false;
  }

  const { error } = await supabase
    .from('order_disposal_plans' as 'order_disposal_plans')
    .update(updateData as never)
    .eq('order_id', orderId);

  if (error) {
    console.error('Error selecting facility with mode:', error);
    return { success: false, error: error.message };
  }

  // Log the appropriate event
  let eventType = 'FACILITY_AUTO_SELECTED';
  if (mode === 'customer_requested') eventType = 'CUSTOMER_DISPOSAL_REQUEST_SUBMITTED';
  if (mode === 'driver_preferred') eventType = 'FACILITY_SELECTED_BY_DRIVER';
  if (mode === 'dispatch_override') eventType = 'FACILITY_SELECTED_BY_DISPATCH';

  await logDisposalEvent(orderId, eventType, {
    facilityId,
    mode,
    requestedBy,
    requestReason,
  });

  return { success: true };
}
