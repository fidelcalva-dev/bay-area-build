// Geocode Address Edge Function
// Uses Google Geocoding API for reliable address lookup

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
  
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('GOOGLE_MAPS_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Geocoding not configured', results: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { query } = await req.json();
    
    if (!query || query.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Query too short', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Google Places Autocomplete for suggestions
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&components=country:us&key=${GOOGLE_MAPS_API_KEY}`;
    
    const autocompleteResponse = await fetch(autocompleteUrl);
    
    if (!autocompleteResponse.ok) {
      throw new Error(`Google API returned ${autocompleteResponse.status}`);
    }

    const autocompleteData = await autocompleteResponse.json();
    
    if (autocompleteData.status !== 'OK' && autocompleteData.status !== 'ZERO_RESULTS') {
      console.error('Google Places error:', autocompleteData.status, autocompleteData.error_message);
      throw new Error(autocompleteData.error_message || autocompleteData.status);
    }

    // Get details for each prediction to get coordinates
    const results = [];
    const predictions = autocompleteData.predictions?.slice(0, 5) || [];
    
    for (const prediction of predictions) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=formatted_address,geometry,address_components&key=${GOOGLE_MAPS_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === 'OK' && detailsData.result) {
          const result = detailsData.result;
          const addressComponents = result.address_components || [];
          
          // Extract address parts
          const getComponent = (type: string) => 
            addressComponents.find((c: any) => c.types.includes(type))?.long_name;
          
          results.push({
            display_name: result.formatted_address,
            lat: String(result.geometry.location.lat),
            lon: String(result.geometry.location.lng),
            address: {
              house_number: getComponent('street_number'),
              road: getComponent('route'),
              city: getComponent('locality') || getComponent('sublocality'),
              state: getComponent('administrative_area_level_1'),
              postcode: getComponent('postal_code'),
            }
          });
        }
      } catch (detailError) {
        console.warn('Failed to get details for prediction:', prediction.place_id);
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Geocode error:', message);
    return new Response(
      JSON.stringify({ error: message, results: [] }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
