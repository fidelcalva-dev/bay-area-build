// Vendor Selection Logic for Quote System
import { supabase } from '@/integrations/supabase/client';

export interface VendorCandidate {
  vendorId: string;
  vendorName: string;
  isPrimary: boolean;
  priorityRank: number;
  cost: number;
  margin: number;
}

export interface VendorSelectionResult {
  selectedVendor: VendorCandidate | null;
  isCalsanFulfillment: boolean;
  vendorCost: number | null;
  margin: number | null;
  candidates: VendorCandidate[];
}

/**
 * Find and select the best vendor for a given zone and dumpster size.
 * 
 * Selection criteria (in order):
 * 1. Find vendors that cover the customer's zone
 * 2. Filter to vendors with pricing for the requested size
 * 3. Sort by: primary zone first, then priority_rank (lower = higher priority), then best margin
 * 4. If no vendor found, default to Calsan fulfillment
 */
export async function selectVendorForQuote(params: {
  zoneId: string;
  sizeId: string;
  basePrice: number;
}): Promise<VendorSelectionResult> {
  const { zoneId, sizeId, basePrice } = params;

  try {
    // Query vendors that cover this zone with their pricing for the requested size
    const { data: vendorData, error } = await supabase
      .from('vendor_zones')
      .select(`
        is_primary,
        vendor:vendors!inner(
          id,
          name,
          is_active,
          priority_rank
        ),
        zone:pricing_zones!inner(
          id
        )
      `)
      .eq('zone_id', zoneId)
      .eq('vendors.is_active', true);

    if (error) {
      console.error('Error fetching vendors for zone:', error);
      return createCalsanFallback();
    }

    if (!vendorData || vendorData.length === 0) {
      return createCalsanFallback();
    }

    // Get pricing for these vendors for the requested size
    const vendorIds = vendorData.map((v) => (v.vendor as any).id);
    
    const { data: pricingData, error: pricingError } = await supabase
      .from('vendor_pricing')
      .select('vendor_id, size_id, cost')
      .in('vendor_id', vendorIds)
      .eq('size_id', sizeId);

    if (pricingError) {
      console.error('Error fetching vendor pricing:', pricingError);
      return createCalsanFallback();
    }

    // Build vendor candidates with pricing
    const pricingMap = new Map<string, number>();
    pricingData?.forEach((p) => {
      pricingMap.set(p.vendor_id, Number(p.cost));
    });

    const candidates: VendorCandidate[] = vendorData
      .filter((v) => pricingMap.has((v.vendor as any).id))
      .map((v) => {
        const vendor = v.vendor as any;
        const cost = pricingMap.get(vendor.id) || 0;
        const margin = basePrice - cost;

        return {
          vendorId: vendor.id,
          vendorName: vendor.name,
          isPrimary: v.is_primary,
          priorityRank: vendor.priority_rank,
          cost,
          margin,
        };
      });

    if (candidates.length === 0) {
      return createCalsanFallback();
    }

    // Sort candidates by:
    // 1. Primary zone vendors first
    // 2. Lower priority_rank = higher priority
    // 3. Higher margin (more profitable)
    candidates.sort((a, b) => {
      // Primary vendors first
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }
      // Lower priority rank = higher priority
      if (a.priorityRank !== b.priorityRank) {
        return a.priorityRank - b.priorityRank;
      }
      // Higher margin preferred
      return b.margin - a.margin;
    });

    const selectedVendor = candidates[0];

    return {
      selectedVendor,
      isCalsanFulfillment: false,
      vendorCost: selectedVendor.cost,
      margin: selectedVendor.margin,
      candidates,
    };
  } catch (err) {
    console.error('Vendor selection error:', err);
    return createCalsanFallback();
  }
}

function createCalsanFallback(): VendorSelectionResult {
  return {
    selectedVendor: null,
    isCalsanFulfillment: true,
    vendorCost: null,
    margin: null,
    candidates: [],
  };
}

/**
 * Save a quote record to the database with vendor selection
 */
export async function saveQuote(params: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userType: string;
  zipCode: string;
  zoneId?: string;
  sizeId?: string;
  materialType: string;
  rentalDays: number;
  extras: string[];
  subtotal: number;
  estimatedMin: number;
  estimatedMax: number;
  discountPercent?: number;
  selectedVendorId?: string;
  vendorCost?: number;
  margin?: number;
  isCalsanFulfillment: boolean;
  // Smart recommendation fields
  recommendedSizeYards?: number;
  recommendationReason?: string;
  userSelectedSizeYards?: number;
  projectType?: string;
  // Confidence fields
  confidenceLevel?: string;
  confidenceNote?: string;
  // Distance-based pricing fields
  customerLat?: number;
  customerLng?: number;
  yardId?: string;
  yardName?: string;
  distanceMiles?: number;
  distanceBracket?: string;
  // Truck-aware routing fields
  truckDistanceMiles?: number;
  truckDurationMin?: number;
  truckDurationMax?: number;
  routePolyline?: string;
  routingProvider?: string;
  // Pre-purchase extra tons fields
  prePurchaseSuggested?: boolean;
  suggestedExtraTons?: number;
  extraTonsPrepurchased?: number;
  prepurchaseDiscountPct?: number;
  prepurchaseRate?: number;
  prepurchaseCityRate?: number;
  // Heavy material classification fields
  heavyMaterialClass?: string;
  heavyMaterialIncrement?: number;
  isTrashContaminated?: boolean;
  reclassifiedToMixed?: boolean;
  originalMaterialType?: string;
  // Volume commitment discount fields
  volumeCommitmentCount?: number;
  volumeDiscountPct?: number;
  discountCapApplied?: boolean;
  volumeAgreementId?: string;
  volumeValidityStart?: Date;
  volumeValidityEnd?: Date;
  requiresDiscountApproval?: boolean;
  // Green Halo pricing fields
  isGreenHalo?: boolean;
  greenHaloCategory?: string;
  greenHaloDumpFee?: number;
  greenHaloHandlingFee?: number;
  greenHaloDumpFeePerTon?: number;
  // Quick link reference
  quickLinkId?: string;
}): Promise<{ success: boolean; quoteId?: string; resumeLink?: string; error?: string }> {
  try {
    // Use edge function to bypass RLS (server-side insert with service role)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    const payload = {
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      user_type: params.userType,
      zip_code: params.zipCode,
      zone_id: params.zoneId,
      size_id: params.sizeId,
      material_type: params.materialType,
      rental_days: params.rentalDays,
      extras: params.extras,
      subtotal: params.subtotal,
      estimated_min: params.estimatedMin,
      estimated_max: params.estimatedMax,
      discount_percent: params.discountPercent || 0,
      selected_vendor_id: params.selectedVendorId,
      vendor_cost: params.vendorCost,
      margin: params.margin,
      is_calsan_fulfillment: params.isCalsanFulfillment,
      // Smart recommendation fields
      recommended_size_yards: params.recommendedSizeYards,
      recommendation_reason: params.recommendationReason,
      user_selected_size_yards: params.userSelectedSizeYards,
      project_type: params.projectType,
      // Confidence fields
      confidence_level: params.confidenceLevel,
      confidence_note: params.confidenceNote,
      // Distance-based pricing fields
      customer_lat: params.customerLat,
      customer_lng: params.customerLng,
      yard_id: params.yardId,
      yard_name: params.yardName,
      distance_miles: params.distanceMiles,
      distance_bracket: params.distanceBracket,
      // Truck-aware routing
      truck_distance_miles: params.truckDistanceMiles,
      truck_duration_min: params.truckDurationMin,
      truck_duration_max: params.truckDurationMax,
      route_polyline: params.routePolyline,
      routing_provider: params.routingProvider,
      // Pre-purchase extra tons
      pre_purchase_suggested: params.prePurchaseSuggested,
      suggested_extra_tons: params.suggestedExtraTons,
      extra_tons_prepurchased: params.extraTonsPrepurchased,
      prepurchase_discount_pct: params.prepurchaseDiscountPct,
      prepurchase_rate: params.prepurchaseRate,
      prepurchase_city_rate: params.prepurchaseCityRate,
      // Heavy material classification
      heavy_material_class: params.heavyMaterialClass,
      heavy_material_increment: params.heavyMaterialIncrement,
      is_trash_contaminated: params.isTrashContaminated,
      reclassified_to_mixed: params.reclassifiedToMixed,
      original_material_type: params.originalMaterialType,
      // Volume commitment discount fields
      volume_commitment_count: params.volumeCommitmentCount || 0,
      volume_discount_pct: params.volumeDiscountPct || 0,
      discount_cap_applied: params.discountCapApplied || false,
      volume_agreement_id: params.volumeAgreementId,
      volume_validity_start: params.volumeValidityStart?.toISOString(),
      volume_validity_end: params.volumeValidityEnd?.toISOString(),
      requires_discount_approval: params.requiresDiscountApproval || false,
      // Green Halo pricing fields
      is_green_halo: params.isGreenHalo || false,
      green_halo_category: params.greenHaloCategory,
      green_halo_dump_fee: params.greenHaloDumpFee,
      green_halo_handling_fee: params.greenHaloHandlingFee,
      green_halo_dump_fee_per_ton: params.greenHaloDumpFeePerTon,
      // Quick link reference
      quick_link_id: params.quickLinkId,
      // Source tracking
      source: 'website',
    };

    console.log('[saveQuote] Calling edge function to save quote...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/save-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('[saveQuote] Edge function error:', result.error);
      return { success: false, error: result.error || 'Failed to save quote' };
    }

    console.log('[saveQuote] Quote saved successfully:', result.quote_id);
    return { 
      success: true, 
      quoteId: result.quote_id, 
      resumeLink: result.resume_link,
    };
  } catch (err) {
    console.error('[saveQuote] Network or unexpected error:', err);
    return { success: false, error: 'Failed to save quote - network error' };
  }
}
