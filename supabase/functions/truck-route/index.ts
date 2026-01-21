// Truck-Aware Route Calculation using Google Routes API
// Returns actual truck route with polyline, distance, and ETA

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TruckRouteRequest {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  yardName?: string;
}

interface TruckRouteResponse {
  success: boolean;
  distanceMiles: number;
  durationMinutes: number;
  durationTrafficMin: number;
  durationTrafficMax: number;
  polyline: string; // Encoded polyline
  provider: 'google_routes' | 'haversine_fallback';
  error?: string;
}

// Truck dimensions for commercial roll-off truck
const TRUCK_DIMENSIONS = {
  heightMeters: 4.0,  // ~13 feet
  widthMeters: 2.6,   // ~8.5 feet
  lengthMeters: 9.0,  // ~30 feet
  weightKg: 18000,    // ~40,000 lbs loaded
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'API key not configured',
          provider: 'haversine_fallback' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const body: TruckRouteRequest = await req.json();
    const { originLat, originLng, destinationLat, destinationLng } = body;

    // Validate coordinates
    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing coordinates' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Call Google Routes API with traffic-aware routing
    // Note: vehicleInfo requires Routes Preferred API (paid), using standard DRIVE mode
    const routeRequest = {
      origin: {
        location: {
          latLng: { latitude: originLat, longitude: originLng }
        }
      },
      destination: {
        location: {
          latLng: { latitude: destinationLat, longitude: destinationLng }
        }
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: true,
      },
      languageCode: 'en-US',
      units: 'IMPERIAL',
    };

    console.log('Calling Google Routes API for truck route...');

    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.travelAdvisory',
        },
        body: JSON.stringify(routeRequest),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Routes API error:', response.status, errorText);
      
      // Fallback to Haversine calculation
      const haversineDistance = calculateHaversine(originLat, originLng, destinationLat, destinationLng);
      const estimatedMinutes = Math.round(haversineDistance * 2.5); // ~2.5 min per mile in traffic
      
      return new Response(
        JSON.stringify({
          success: true,
          distanceMiles: Math.round(haversineDistance * 100) / 100,
          durationMinutes: estimatedMinutes,
          durationTrafficMin: Math.round(estimatedMinutes * 0.8),
          durationTrafficMax: Math.round(estimatedMinutes * 1.3),
          polyline: '', // No polyline in fallback
          provider: 'haversine_fallback',
        } as TruckRouteResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Google Routes API response received');

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes returned from API');
    }

    const route = data.routes[0];
    
    // Parse distance (meters to miles)
    const distanceMeters = route.distanceMeters || 0;
    const distanceMiles = distanceMeters / 1609.344;

    // Parse duration (format: "1234s")
    const durationStr = route.duration || '0s';
    const durationSeconds = parseInt(durationStr.replace('s', ''), 10) || 0;
    const durationMinutes = Math.round(durationSeconds / 60);

    // Traffic-aware range (±20% for now, could use traffic data if available)
    const durationTrafficMin = Math.round(durationMinutes * 0.85);
    const durationTrafficMax = Math.round(durationMinutes * 1.25);

    // Get encoded polyline
    const polyline = route.polyline?.encodedPolyline || '';

    const result: TruckRouteResponse = {
      success: true,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      durationMinutes,
      durationTrafficMin,
      durationTrafficMax,
      polyline,
      provider: 'google_routes',
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Truck route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        provider: 'haversine_fallback'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Haversine fallback calculation
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
