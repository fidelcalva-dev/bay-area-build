/**
 * Nearest Facilities Edge Function
 * Finds the top 3 nearest approved facilities for an order based on:
 * - Material classification
 * - City rules
 * - Green Halo requirements
 * Uses Google Routes API for truck-aware distance/time calculations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NearestFacilitiesRequest {
  orderId: string;
  originLat: number;
  originLng: number;
  materialClassification: string;
  city: string;
  requireGreenHalo?: boolean;
}

interface FacilityWithDistance {
  facility_id: string;
  facility_name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  distance_miles: number;
  duration_minutes: number;
  green_halo_certified: boolean;
  hours: string | null;
  phone: string | null;
  facility_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: NearestFacilitiesRequest = await req.json();
    const { orderId, originLat, originLng, materialClassification, city, requireGreenHalo } = body;

    console.log(`Finding nearest facilities for order ${orderId}, material: ${materialClassification}, city: ${city}`);

    // 1. Get city facility rules
    const { data: cityRules } = await supabase
      .from('city_facility_rules')
      .select('*')
      .eq('city', city)
      .single();

    const greenHaloRequired = requireGreenHalo || cityRules?.requires_green_halo_for_projects || false;

    // 2. Query facilities that match criteria
    let query = supabase
      .from('facilities')
      .select('*')
      .eq('status', 'active')
      .contains('accepted_material_classes', [materialClassification]);

    // Filter by city if available
    if (city) {
      query = query.contains('approved_by_city', [city]);
    }

    // Filter by Green Halo if required
    if (greenHaloRequired) {
      query = query.eq('green_halo_certified', true);
    }

    const { data: facilities, error: facilitiesError } = await query;

    if (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError);
      throw new Error('Failed to fetch facilities');
    }

    if (!facilities || facilities.length === 0) {
      // Fallback: get any active facilities for the city without material filter
      const { data: fallbackFacilities } = await supabase
        .from('facilities')
        .select('*')
        .eq('status', 'active')
        .contains('approved_by_city', [city]);

      if (!fallbackFacilities || fallbackFacilities.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No facilities found for this location',
            suggested_facilities: [] 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use fallback facilities
      facilities.push(...fallbackFacilities);
    }

    // 3. Calculate distances for each facility
    const facilitiesWithDistance: FacilityWithDistance[] = [];

    for (const facility of facilities) {
      if (!facility.lat || !facility.lng) continue;

      let distanceMiles: number;
      let durationMinutes: number;

      // Try Google Routes API for accurate truck routing
      if (googleApiKey) {
        try {
          const routeResult = await calculateTruckRoute(
            googleApiKey,
            originLat,
            originLng,
            Number(facility.lat),
            Number(facility.lng)
          );
          distanceMiles = routeResult.distanceMiles;
          durationMinutes = routeResult.durationMinutes;
        } catch (routeError) {
          console.warn(`Route calculation failed for ${facility.name}, using Haversine:`, routeError);
          distanceMiles = calculateHaversine(originLat, originLng, Number(facility.lat), Number(facility.lng));
          durationMinutes = Math.round(distanceMiles * 2.5); // Estimate 2.5 min/mile
        }
      } else {
        // Fallback to Haversine
        distanceMiles = calculateHaversine(originLat, originLng, Number(facility.lat), Number(facility.lng));
        durationMinutes = Math.round(distanceMiles * 2.5);
      }

      facilitiesWithDistance.push({
        facility_id: facility.id,
        facility_name: facility.name,
        address: `${facility.address}, ${facility.city}, ${facility.state} ${facility.zip}`,
        city: facility.city,
        lat: Number(facility.lat),
        lng: Number(facility.lng),
        distance_miles: Math.round(distanceMiles * 100) / 100,
        duration_minutes: durationMinutes,
        green_halo_certified: facility.green_halo_certified,
        hours: facility.hours,
        phone: facility.phone,
        facility_type: facility.facility_type,
      });
    }

    // 4. Sort by distance and take top 3
    facilitiesWithDistance.sort((a, b) => a.distance_miles - b.distance_miles);
    const top3 = facilitiesWithDistance.slice(0, 3);

    // 5. Determine required facility type
    const requiredFacilityType = getRequiredFacilityType(materialClassification);

    // 6. Create or update disposal plan
    const disposalPlanData = {
      order_id: orderId,
      material_classification: materialClassification,
      required_facility_type: requiredFacilityType,
      green_halo_required: greenHaloRequired,
      suggested_facilities: top3,
      selection_method: 'auto',
      selected_facility_id: top3.length > 0 ? top3[0].facility_id : null,
      route_miles_to_facility: top3.length > 0 ? top3[0].distance_miles : null,
      route_minutes_to_facility: top3.length > 0 ? top3[0].duration_minutes : null,
    };

    const { data: disposalPlan, error: planError } = await supabase
      .from('order_disposal_plans')
      .upsert(disposalPlanData, { onConflict: 'order_id' })
      .select()
      .single();

    if (planError) {
      console.error('Error creating disposal plan:', planError);
    }

    // 7. Log the event
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: 'DISPOSAL_PLAN_CREATED',
      metadata: {
        material_classification: materialClassification,
        city,
        green_halo_required: greenHaloRequired,
        facilities_found: top3.length,
        auto_selected_facility: top3[0]?.facility_name || null,
      },
    });

    console.log(`Found ${top3.length} facilities, auto-selected: ${top3[0]?.facility_name || 'none'}`);

    return new Response(
      JSON.stringify({
        success: true,
        disposal_plan: disposalPlan,
        suggested_facilities: top3,
        required_facility_type: requiredFacilityType,
        green_halo_required: greenHaloRequired,
        city_rules: cityRules,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Nearest facilities error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getRequiredFacilityType(materialClass: string): string {
  switch (materialClass) {
    case 'HEAVY_CLEAN_BASE':
      return 'inert';
    case 'HEAVY_PLUS_200':
    case 'HEAVY_MIXED':
    case 'MIXED_GENERAL':
    default:
      return 'transfer_station';
    case 'GREEN_WASTE':
    case 'ORGANICS':
      return 'organics';
    case 'METAL_CLEAN':
      return 'metal';
  }
}

async function calculateTruckRoute(
  apiKey: string,
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<{ distanceMiles: number; durationMinutes: number }> {
  const routeRequest = {
    origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
    destination: { location: { latLng: { latitude: destLat, longitude: destLng } } },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    computeAlternativeRoutes: false,
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: true,
    },
  };

  const response = await fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
      },
      body: JSON.stringify(routeRequest),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Routes API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No routes returned');
  }

  const route = data.routes[0];
  const distanceMeters = route.distanceMeters || 0;
  const durationStr = route.duration || '0s';
  const durationSeconds = parseInt(durationStr.replace('s', ''), 10) || 0;

  return {
    distanceMiles: distanceMeters / 1609.344,
    durationMinutes: Math.round(durationSeconds / 60),
  };
}

function calculateHaversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
