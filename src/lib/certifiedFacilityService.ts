/**
 * Certified Facility Service
 * Handles city-certified facility lookups, recommendations, and compliance logic
 * 
 * Key behaviors:
 * - Contractors/permit jobs → Recommend city-certified C&D recycling facilities
 * - Homeowners/junk → Default to standard disposal (landfill/transfer)
 * - Stores recommendations per order for Dispatch/Driver visibility
 */
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { Facility, SuggestedFacility, FacilityType } from './facilityService';

// =====================================================
// TYPES
// =====================================================

export type ProjectType = 'homeowner' | 'contractor' | 'business';
export type CertificationType = 'city_certified' | 'city_approved' | 'authorized' | 'unknown';
export type SelectionMethod = 'auto' | 'dispatch' | 'customer_request' | 'driver';

export interface CertifiedSource {
  id: string;
  source_name: string;
  city_or_market: string;
  source_type: 'city_webpage' | 'pdf' | 'map' | 'api' | 'manual_csv';
  source_url: string | null;
  last_checked_at: string | null;
  last_success_at: string | null;
  parse_status: 'ok' | 'failed' | 'pending' | null;
  facilities_found: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacilityRecommendation {
  id?: string;
  order_id: string;
  project_type: ProjectType;
  compliance_required: boolean;
  city_or_market: string | null;
  recommended_facilities: RecommendedFacilityInfo[];
  recommended_reason: string | null;
  compliance_guidance: string | null;
  selected_facility_id: string | null;
  selection_method: SelectionMethod;
  created_at?: string;
  updated_at?: string;
}

export interface RecommendedFacilityInfo {
  facility_id: string;
  facility_name: string;
  address: string;
  certification_type: CertificationType;
  certification_city: string | null;
  distance_miles?: number;
  duration_minutes?: number;
  green_halo_related?: boolean;
  is_city_certified: boolean;
}

export interface CertifiedFacility extends Facility {
  certification_type: CertificationType | null;
  certification_city: string | null;
  green_halo_related: boolean;
  source_id: string | null;
  source_url: string | null;
}

// =====================================================
// CONSTANTS
// =====================================================

export const CITY_COMPLIANCE_INFO: Record<string, {
  programName: string;
  guidance: string;
  usesGreenHalo: boolean;
  requiresWeightTickets: boolean;
}> = {
  'San Jose': {
    programName: 'City of San José C&D Recycling',
    guidance: 'Use City-Certified C&D facilities for permit compliance. Keep all weight tickets for project records.',
    usesGreenHalo: false,
    requiresWeightTickets: true,
  },
  'Oakland': {
    programName: 'Oakland Waste Reduction & Recycling Program (WRRP)',
    guidance: 'For permit compliance, use city-approved facilities. Green Halo is used for CDSR reporting. Keep weight tickets.',
    usesGreenHalo: true,
    requiresWeightTickets: true,
  },
  'Santa Clara': {
    programName: 'Santa Clara C&D Diversion',
    guidance: 'Use authorized C&D recycling facilities and maintain disposal records for permit closeout.',
    usesGreenHalo: false,
    requiresWeightTickets: true,
  },
};

// =====================================================
// CERTIFIED SOURCES OPERATIONS
// =====================================================

/**
 * Fetch all certified sources (admin view)
 */
export async function getCertifiedSources(): Promise<CertifiedSource[]> {
  const { data, error } = await supabase
    .from('certified_sources')
    .select('*')
    .order('city_or_market');

  if (error) {
    console.error('Error fetching certified sources:', error);
    return [];
  }

  return (data || []) as CertifiedSource[];
}

/**
 * Add or update a certified source
 */
export async function upsertCertifiedSource(
  source: Partial<CertifiedSource>
): Promise<{ success: boolean; source?: CertifiedSource; error?: string }> {
  const { data, error } = await supabase
    .from('certified_sources')
    .upsert({
      source_name: source.source_name,
      city_or_market: source.city_or_market,
      source_type: source.source_type || 'manual_csv',
      source_url: source.source_url || null,
      notes: source.notes || null,
      is_active: source.is_active ?? true,
      parse_status: source.parse_status || 'pending',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting certified source:', error);
    return { success: false, error: error.message };
  }

  return { success: true, source: data as CertifiedSource };
}

// =====================================================
// CERTIFIED FACILITIES QUERIES (MARKET-BASED)
// =====================================================

/**
 * Get city-certified facilities for a specific market
 * MARKET is the primary filter - city is fallback
 */
export async function getCertifiedFacilitiesForMarket(
  marketId: string
): Promise<CertifiedFacility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .eq('market_id', marketId)
    .in('certification_type', ['city_certified', 'city_approved', 'authorized'])
    .order('name');

  if (error) {
    console.error('Error fetching certified facilities:', error);
    return [];
  }

  return (data || []) as CertifiedFacility[];
}

/**
 * Get city-certified facilities for a specific city (legacy/fallback)
 */
export async function getCertifiedFacilitiesForCity(
  city: string
): Promise<CertifiedFacility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .or(`certification_city.eq.${city},approved_by_city.cs.{${city}}`)
    .in('certification_type', ['city_certified', 'city_approved', 'authorized'])
    .order('name');

  if (error) {
    console.error('Error fetching certified facilities:', error);
    return [];
  }

  return (data || []) as CertifiedFacility[];
}

/**
 * Get standard disposal facilities (landfills/transfer stations) by market
 * Used for homeowner/junk jobs
 */
export async function getStandardDisposalFacilitiesByMarket(
  marketId: string
): Promise<Facility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .eq('market_id', marketId)
    .in('facility_type', ['landfill', 'transfer_station'])
    .order('name');

  if (error) {
    console.error('Error fetching standard facilities:', error);
    return [];
  }

  return (data || []) as Facility[];
}

/**
 * Get standard disposal facilities (landfills/transfer stations) by city (legacy)
 */
export async function getStandardDisposalFacilities(
  city?: string
): Promise<Facility[]> {
  let query = supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .in('facility_type', ['landfill', 'transfer_station'])
    .order('name');

  if (city) {
    query = query.or(`city.eq.${city},approved_by_city.cs.{${city}}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching standard facilities:', error);
    return [];
  }

  return (data || []) as Facility[];
}

/**
 * Get Green Halo related facilities by market
 */
export async function getGreenHaloFacilitiesByMarket(
  marketId: string
): Promise<CertifiedFacility[]> {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .eq('market_id', marketId)
    .eq('green_halo_related', true)
    .order('name');

  if (error) {
    console.error('Error fetching Green Halo facilities:', error);
    return [];
  }

  return (data || []) as CertifiedFacility[];
}

/**
 * Get Green Halo related facilities (legacy)
 */
export async function getGreenHaloFacilities(
  city?: string
): Promise<CertifiedFacility[]> {
  let query = supabase
    .from('facilities')
    .select('*')
    .eq('status', 'active')
    .eq('green_halo_related', true)
    .order('name');

  if (city) {
    query = query.or(`city.eq.${city},certification_city.eq.${city}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching Green Halo facilities:', error);
    return [];
  }

  return (data || []) as CertifiedFacility[];
}

// =====================================================
// RECOMMENDATION LOGIC (MARKET-BASED)
// =====================================================

/**
 * Generate facility recommendations based on project type and compliance
 * Uses MARKET as primary filter (with city fallback)
 * 
 * Logic:
 * - Contractors/permit jobs → City-certified C&D recyclers (top 3)
 * - Homeowners without compliance → Standard disposal (landfill/transfer)
 * - Homeowners with compliance flag → Treated like contractors
 */
export async function generateFacilityRecommendations(
  orderId: string,
  projectType: ProjectType,
  complianceRequired: boolean,
  city: string,
  marketId?: string,
  jobSiteLat?: number,
  jobSiteLng?: number
): Promise<FacilityRecommendation> {
  const isComplianceJob = complianceRequired || projectType === 'contractor';
  
  let facilities: (Facility | CertifiedFacility)[];
  let reason: string;
  let guidance: string | null = null;

  if (isComplianceJob) {
    // Contractor/compliance → City-certified facilities
    // Use market_id if available, fallback to city
    facilities = marketId 
      ? await getCertifiedFacilitiesForMarket(marketId)
      : await getCertifiedFacilitiesForCity(city);
    
    reason = marketId
      ? `City-certified C&D recycling facilities for market compliance`
      : `City-certified C&D recycling facilities for ${city} permit compliance`;
    
    const cityInfo = CITY_COMPLIANCE_INFO[city];
    if (cityInfo) {
      guidance = cityInfo.guidance;
    } else {
      guidance = 'For permit compliance, use city-approved recycling facilities and retain all weight tickets.';
    }
  } else {
    // Homeowner/junk → Standard disposal
    // Use market_id if available, fallback to city
    facilities = marketId
      ? await getStandardDisposalFacilitiesByMarket(marketId)
      : await getStandardDisposalFacilities(city);
    reason = 'Standard disposal options for residential cleanup';
    guidance = 'Recycling support available upon request. Contact us for Green Halo certified options.';
  }

  // Convert to RecommendedFacilityInfo format
  // TODO: Calculate actual distances using routing API when lat/lng available
  const recommendedFacilities: RecommendedFacilityInfo[] = facilities
    .slice(0, 3) // Top 3
    .map(f => {
      const certified = f as CertifiedFacility;
      return {
        facility_id: f.id,
        facility_name: f.name,
        address: `${f.address}, ${f.city}, ${f.state} ${f.zip}`,
        certification_type: certified.certification_type || 'unknown',
        certification_city: certified.certification_city || null,
        green_halo_related: certified.green_halo_related || false,
        is_city_certified: ['city_certified', 'city_approved', 'authorized'].includes(certified.certification_type || ''),
      };
    });

  const recommendation: FacilityRecommendation = {
    order_id: orderId,
    project_type: projectType,
    compliance_required: complianceRequired,
    city_or_market: city,
    recommended_facilities: recommendedFacilities,
    recommended_reason: reason,
    compliance_guidance: guidance,
    selected_facility_id: recommendedFacilities[0]?.facility_id || null,
    selection_method: 'auto',
  };

  return recommendation;
}

/**
 * Save facility recommendation to database
 */
export async function saveFacilityRecommendation(
  recommendation: FacilityRecommendation
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('facility_recommendations')
    .upsert({
      order_id: recommendation.order_id,
      project_type: recommendation.project_type,
      compliance_required: recommendation.compliance_required,
      city_or_market: recommendation.city_or_market,
      recommended_facilities: recommendation.recommended_facilities as unknown as Json,
      recommended_reason: recommendation.recommended_reason,
      compliance_guidance: recommendation.compliance_guidance,
      selected_facility_id: recommendation.selected_facility_id,
      selection_method: recommendation.selection_method,
    } as never, { onConflict: 'order_id' });

  if (error) {
    console.error('Error saving recommendation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get facility recommendation for an order
 */
export async function getFacilityRecommendation(
  orderId: string
): Promise<FacilityRecommendation | null> {
  const { data, error } = await supabase
    .from('facility_recommendations')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching recommendation:', error);
    return null;
  }

  if (!data) return null;

  // Safely parse recommended_facilities from JSONB
  let recommendedFacilities: RecommendedFacilityInfo[] = [];
  if (data.recommended_facilities) {
    if (Array.isArray(data.recommended_facilities)) {
      recommendedFacilities = data.recommended_facilities as unknown as RecommendedFacilityInfo[];
    }
  }

  return {
    ...data,
    recommended_facilities: recommendedFacilities,
  } as FacilityRecommendation;
}

/**
 * Update selected facility in recommendation
 */
export async function selectRecommendedFacility(
  orderId: string,
  facilityId: string,
  method: SelectionMethod
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('facility_recommendations')
    .update({
      selected_facility_id: facilityId,
      selection_method: method,
    })
    .eq('order_id', orderId);

  if (error) {
    console.error('Error selecting facility:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// =====================================================
// BULK IMPORT (CSV)
// =====================================================

export interface FacilityCSVRow {
  name: string;
  address: string;
  city: string;
  state?: string;
  zip: string;
  certification_type?: string;
  certification_city?: string;
  facility_type?: string;
  accepted_materials?: string;
  green_halo_related?: string;
  phone?: string;
  hours?: string;
  notes?: string;
}

/**
 * Bulk import facilities from CSV data
 */
export async function bulkImportFacilities(
  rows: FacilityCSVRow[],
  sourceId?: string
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  for (const row of rows) {
    try {
      const { error } = await supabase
        .from('facilities')
        .upsert({
          name: row.name.trim(),
          address: row.address.trim(),
          city: row.city.trim(),
          state: row.state?.trim() || 'CA',
          zip: row.zip.trim(),
          certification_type: (row.certification_type?.trim() as CertificationType) || 'unknown',
          certification_city: row.certification_city?.trim() || null,
          facility_type: (row.facility_type?.trim() as FacilityType) || 'transfer_station',
          accepted_material_classes: row.accepted_materials 
            ? row.accepted_materials.split(',').map(m => m.trim())
            : ['MIXED_GENERAL'],
          green_halo_related: row.green_halo_related?.toLowerCase() === 'true',
          phone: row.phone?.trim() || null,
          hours: row.hours?.trim() || null,
          notes: row.notes?.trim() || null,
          source_id: sourceId || null,
          status: 'active',
        }, { onConflict: 'name,address' });

      if (error) {
        errors.push(`${row.name}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (err) {
      errors.push(`${row.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Update source with facilities count
  if (sourceId && imported > 0) {
    await supabase
      .from('certified_sources')
      .update({
        facilities_found: imported,
        last_success_at: new Date().toISOString(),
        parse_status: 'ok',
      })
      .eq('id', sourceId);
  }

  return { success: errors.length === 0, imported, errors };
}

// =====================================================
// DISPLAY HELPERS
// =====================================================

export const CERTIFICATION_LABELS: Record<CertificationType, string> = {
  city_certified: 'City-Certified',
  city_approved: 'City-Approved',
  authorized: 'Authorized',
  unknown: 'Standard',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  homeowner: 'Homeowner',
  contractor: 'Contractor',
  business: 'Business',
};

/**
 * Get compliance badge color
 */
export function getComplianceBadgeColor(type: CertificationType): string {
  switch (type) {
    case 'city_certified':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'city_approved':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'authorized':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
