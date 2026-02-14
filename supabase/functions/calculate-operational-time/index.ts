// Operational Time Calculator Edge Function
// Calculates realistic end-to-end service time for DELIVERY, PICKUP, and SWAP operations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ServiceType = 'DELIVERY' | 'PICKUP' | 'SWAP';
type MaterialCategory = 'DEBRIS' | 'HEAVY' | 'DEBRIS_HEAVY' | 'CLEAN_RECYCLING';
type TrafficMode = 'REAL_TIME' | 'AVERAGE';
type SlaClass = 'FAST' | 'STANDARD' | 'LONG';
type RunRecommendation = 'SAME_DAY' | 'NEXT_DAY' | 'SCHEDULED';

interface OperationalTimeRequest {
  origin_yard_id: string;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  service_type: ServiceType;
  material_category: MaterialCategory;
  dumpster_size?: number;
  disposal_facility_id?: string;
  market_code?: string;
  traffic_mode?: TrafficMode;
}

interface TimeBreakdown {
  yard_time: number;
  drive_time: number;
  jobsite_time: number;
  dump_time: number;
  buffer: number;
}

interface OperationalTimeResponse {
  success: boolean;
  service_type: ServiceType;
  origin_yard: string;
  job_site_city?: string;
  facility?: string;
  total_time_minutes: number;
  breakdown: TimeBreakdown;
  sla_class: SlaClass;
  recommended_run_type: RunRecommendation;
  route_details?: {
    yard_to_site_miles?: number;
    site_to_dump_miles?: number;
    dump_to_yard_miles?: number;
    dump_to_site_miles?: number;
    site_to_yard_miles?: number;
  };
  error?: string;
}

interface ConfigSettings {
  yard_pickup_time_min: number;
  yard_dropoff_time_min: number;
  jobsite_delivery_time_min: number;
  jobsite_pickup_time_min: number;
  swap_additional_time_min: number;
  dump_unload_debris_min: number;
  dump_unload_heavy_min: number;
  buffer_time_min: number;
  traffic_mode: TrafficMode;
}

// Calculate route time using Google Routes API
async function calculateRouteTime(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  trafficMode: TrafficMode
): Promise<{ durationMinutes: number; distanceMiles: number }> {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  
  if (!apiKey) {
    // Fallback to Haversine calculation
    const distanceMiles = calculateHaversine(originLat, originLng, destLat, destLng);
    const estimatedMinutes = Math.round(distanceMiles * 2.5); // ~2.5 min per mile in traffic
    return { durationMinutes: estimatedMinutes, distanceMiles };
  }

  try {
    const routeRequest = {
      origin: {
        location: { latLng: { latitude: originLat, longitude: originLng } }
      },
      destination: {
        location: { latLng: { latitude: destLat, longitude: destLng } }
      },
      travelMode: 'DRIVE',
      routingPreference: trafficMode === 'REAL_TIME' ? 'TRAFFIC_AWARE' : 'TRAFFIC_UNAWARE',
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: true,
        avoidHighways: false,
        avoidFerries: true,
      },
      languageCode: 'en-US',
      units: 'IMPERIAL',
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
    const distanceMiles = distanceMeters / 1609.344;
    const durationStr = route.duration || '0s';
    const durationSeconds = parseInt(durationStr.replace('s', ''), 10) || 0;
    const durationMinutes = Math.round(durationSeconds / 60);

    return { durationMinutes, distanceMiles: Math.round(distanceMiles * 100) / 100 };
  } catch (error) {
    console.error('Route calculation error, using fallback:', error);
    const distanceMiles = calculateHaversine(originLat, originLng, destLat, destLng);
    const estimatedMinutes = Math.round(distanceMiles * 2.5);
    return { durationMinutes: estimatedMinutes, distanceMiles };
  }
}

function calculateHaversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getSlaClass(totalMinutes: number): SlaClass {
  if (totalMinutes < 120) return 'FAST';
  if (totalMinutes <= 240) return 'STANDARD';
  return 'LONG';
}

function getRunRecommendation(totalMinutes: number, serviceType: ServiceType): RunRecommendation {
  // For SWAP, always require scheduling due to complexity
  if (serviceType === 'SWAP' && totalMinutes > 180) return 'SCHEDULED';
  if (serviceType === 'SWAP') return 'NEXT_DAY';
  
  // DELIVERY is simplest
  if (serviceType === 'DELIVERY') {
    if (totalMinutes < 90) return 'SAME_DAY';
    if (totalMinutes < 150) return 'NEXT_DAY';
    return 'SCHEDULED';
  }
  
  // PICKUP
  if (totalMinutes < 120) return 'SAME_DAY';
  if (totalMinutes < 180) return 'NEXT_DAY';
  return 'SCHEDULED';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: OperationalTimeRequest = await req.json();
    const {
      origin_yard_id,
      destination_address,
      destination_lat,
      destination_lng,
      service_type,
      material_category,
      disposal_facility_id,
      traffic_mode: requestTrafficMode,
    } = body;

    // Validate required fields
    if (!origin_yard_id || !service_type || !material_category) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: origin_yard_id, service_type, material_category' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Load config settings
    const { data: configData } = await supabase
      .from('config_settings')
      .select('key, value')
      .eq('category', 'operational_time');

    const config: ConfigSettings = {
      yard_pickup_time_min: 10,
      yard_dropoff_time_min: 10,
      jobsite_delivery_time_min: 15,
      jobsite_pickup_time_min: 15,
      swap_additional_time_min: 20,
      dump_unload_debris_min: 20,
      dump_unload_heavy_min: 30,
      buffer_time_min: 10,
      traffic_mode: 'AVERAGE',
    };

    configData?.forEach((row: { key: string; value: unknown }) => {
      const key = row.key;
      const value = typeof row.value === 'string' ? row.value.replace(/"/g, '') : row.value;
      if (key === 'traffic_mode') {
        config.traffic_mode = value as TrafficMode;
      } else if (key === 'yard_pickup_time_min') {
        config.yard_pickup_time_min = parseInt(String(value), 10) || config.yard_pickup_time_min;
      } else if (key === 'yard_dropoff_time_min') {
        config.yard_dropoff_time_min = parseInt(String(value), 10) || config.yard_dropoff_time_min;
      } else if (key === 'jobsite_delivery_time_min') {
        config.jobsite_delivery_time_min = parseInt(String(value), 10) || config.jobsite_delivery_time_min;
      } else if (key === 'jobsite_pickup_time_min') {
        config.jobsite_pickup_time_min = parseInt(String(value), 10) || config.jobsite_pickup_time_min;
      } else if (key === 'swap_additional_time_min') {
        config.swap_additional_time_min = parseInt(String(value), 10) || config.swap_additional_time_min;
      } else if (key === 'dump_unload_debris_min') {
        config.dump_unload_debris_min = parseInt(String(value), 10) || config.dump_unload_debris_min;
      } else if (key === 'dump_unload_heavy_min') {
        config.dump_unload_heavy_min = parseInt(String(value), 10) || config.dump_unload_heavy_min;
      } else if (key === 'buffer_time_min') {
        config.buffer_time_min = parseInt(String(value), 10) || config.buffer_time_min;
      }
    });

    const trafficMode = requestTrafficMode || config.traffic_mode;

    // Get origin yard
    const { data: yard, error: yardError } = await supabase
      .from('yards')
      .select('*')
      .eq('id', origin_yard_id)
      .single();

    if (yardError || !yard) {
      return new Response(
        JSON.stringify({ success: false, error: 'Yard not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get destination coordinates (either from lat/lng or geocode address)
    let destLat = destination_lat;
    let destLng = destination_lng;
    let jobSiteCity = '';

    if (!destLat || !destLng) {
      if (destination_address) {
        // Try geocoding via the geocode-address function
        try {
          const geocodeResp = await fetch(
            `${supabaseUrl}/functions/v1/geocode-address`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({ query: destination_address }),
            }
          );
          const geocodeData = await geocodeResp.json();
          if (geocodeData.results && geocodeData.results.length > 0) {
            destLat = parseFloat(geocodeData.results[0].lat);
            destLng = parseFloat(geocodeData.results[0].lon);
            jobSiteCity = geocodeData.results[0].address?.city || destination_address.split(',')[0] || 'Unknown';
          }
        } catch (geoErr) {
          console.warn('Geocode failed, using yard as fallback:', geoErr);
        }
      }

      // Final fallback: use yard coordinates (zero-distance estimate)
      if (!destLat || !destLng) {
        console.warn('No destination provided, using yard coordinates as fallback for estimation');
        destLat = yard.latitude;
        destLng = yard.longitude;
        jobSiteCity = 'Same as yard (no destination provided)';
      }
    }

    // Get disposal facility if needed
    let facility: { name: string; lat: number; lng: number } | null = null;
    if ((service_type === 'PICKUP' || service_type === 'SWAP') && disposal_facility_id) {
      const { data: facilityData } = await supabase
        .from('facilities')
        .select('name, lat, lng')
        .eq('id', disposal_facility_id)
        .single();
      
      if (facilityData) {
        facility = facilityData;
      }
    }

    // Auto-select nearest facility if not provided
    if ((service_type === 'PICKUP' || service_type === 'SWAP') && !facility) {
      const materialClasses = material_category === 'HEAVY' || material_category === 'DEBRIS_HEAVY'
        ? ['HEAVY_CLEAN_BASE', 'HEAVY_MIXED']
        : ['MIXED_GENERAL'];

      const { data: facilities } = await supabase
        .from('facilities')
        .select('id, name, lat, lng, accepted_material_classes')
        .eq('status', 'active')
        .limit(10);

      if (facilities && facilities.length > 0) {
        // Find closest facility that accepts the material
        let closestDistance = Infinity;
        for (const f of facilities) {
          const accepts = f.accepted_material_classes?.some((m: string) => 
            materialClasses.includes(m)
          );
          if (accepts && f.lat && f.lng) {
            const dist = calculateHaversine(destLat, destLng, f.lat, f.lng);
            if (dist < closestDistance) {
              closestDistance = dist;
              facility = { name: f.name, lat: f.lat, lng: f.lng };
            }
          }
        }
        
        // Fallback to first facility if none match material
        if (!facility && facilities[0]?.lat && facilities[0]?.lng) {
          facility = { name: facilities[0].name, lat: facilities[0].lat, lng: facilities[0].lng };
        }
      }
    }

    // Calculate times based on service type
    const breakdown: TimeBreakdown = {
      yard_time: 0,
      drive_time: 0,
      jobsite_time: 0,
      dump_time: 0,
      buffer: config.buffer_time_min,
    };

    const routeDetails: OperationalTimeResponse['route_details'] = {};
    const isHeavy = material_category === 'HEAVY' || material_category === 'DEBRIS_HEAVY';

    if (service_type === 'DELIVERY') {
      // DELIVERY: Yard → Job Site
      breakdown.yard_time = config.yard_pickup_time_min;
      breakdown.jobsite_time = config.jobsite_delivery_time_min;

      const yardToSite = await calculateRouteTime(
        yard.latitude, yard.longitude, destLat, destLng, trafficMode
      );
      breakdown.drive_time = yardToSite.durationMinutes;
      routeDetails.yard_to_site_miles = yardToSite.distanceMiles;

    } else if (service_type === 'PICKUP') {
      // PICKUP: Yard → Job Site → Disposal → Yard
      breakdown.yard_time = config.yard_pickup_time_min;
      breakdown.jobsite_time = config.jobsite_pickup_time_min;
      breakdown.dump_time = isHeavy ? config.dump_unload_heavy_min : config.dump_unload_debris_min;

      // Yard to site
      const yardToSite = await calculateRouteTime(
        yard.latitude, yard.longitude, destLat, destLng, trafficMode
      );
      routeDetails.yard_to_site_miles = yardToSite.distanceMiles;

      if (facility) {
        // Site to dump
        const siteToDump = await calculateRouteTime(
          destLat, destLng, facility.lat, facility.lng, trafficMode
        );
        routeDetails.site_to_dump_miles = siteToDump.distanceMiles;

        // Dump to yard
        const dumpToYard = await calculateRouteTime(
          facility.lat, facility.lng, yard.latitude, yard.longitude, trafficMode
        );
        routeDetails.dump_to_yard_miles = dumpToYard.distanceMiles;

        breakdown.drive_time = yardToSite.durationMinutes + siteToDump.durationMinutes + dumpToYard.durationMinutes;
      } else {
        // No facility, estimate return trip
        breakdown.drive_time = yardToSite.durationMinutes * 3; // rough estimate
      }

    } else if (service_type === 'SWAP') {
      // SWAP: Yard → Job Site → Disposal → Job Site → Yard
      breakdown.yard_time = config.yard_pickup_time_min;
      breakdown.jobsite_time = config.jobsite_pickup_time_min + config.jobsite_delivery_time_min + config.swap_additional_time_min;
      breakdown.dump_time = isHeavy ? config.dump_unload_heavy_min : config.dump_unload_debris_min;

      // Yard to site
      const yardToSite = await calculateRouteTime(
        yard.latitude, yard.longitude, destLat, destLng, trafficMode
      );
      routeDetails.yard_to_site_miles = yardToSite.distanceMiles;

      if (facility) {
        // Site to dump
        const siteToDump = await calculateRouteTime(
          destLat, destLng, facility.lat, facility.lng, trafficMode
        );
        routeDetails.site_to_dump_miles = siteToDump.distanceMiles;

        // Dump back to site
        const dumpToSite = await calculateRouteTime(
          facility.lat, facility.lng, destLat, destLng, trafficMode
        );
        routeDetails.dump_to_site_miles = dumpToSite.distanceMiles;

        // Site to yard
        const siteToYard = await calculateRouteTime(
          destLat, destLng, yard.latitude, yard.longitude, trafficMode
        );
        routeDetails.site_to_yard_miles = siteToYard.distanceMiles;

        breakdown.drive_time = yardToSite.durationMinutes + siteToDump.durationMinutes + 
          dumpToSite.durationMinutes + siteToYard.durationMinutes;
      } else {
        breakdown.drive_time = yardToSite.durationMinutes * 4; // rough estimate
      }
    }

    const totalMinutes = breakdown.yard_time + breakdown.drive_time + 
      breakdown.jobsite_time + breakdown.dump_time + breakdown.buffer;

    const response: OperationalTimeResponse = {
      success: true,
      service_type,
      origin_yard: yard.name,
      job_site_city: jobSiteCity || undefined,
      facility: facility?.name,
      total_time_minutes: totalMinutes,
      breakdown,
      sla_class: getSlaClass(totalMinutes),
      recommended_run_type: getRunRecommendation(totalMinutes, service_type),
      route_details: routeDetails,
    };

    console.log('Operational time calculated:', JSON.stringify(response));

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calculate operational time error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
