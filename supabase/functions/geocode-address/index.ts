// Geocode Address Edge Function
// Proxies requests to OpenStreetMap Nominatim to avoid CORS issues

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

  try {
    const { query } = await req.json();
    
    if (!query || query.length < 5) {
      return new Response(
        JSON.stringify({ error: 'Query too short', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add California context for Bay Area searches
    const searchWithContext = `${query}, California, USA`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchWithContext)}&addressdetails=1&limit=5&countrycodes=us`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CALSAN-Dumpsters/1.0 (contact@calsandumpsters.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim returned ${response.status}`);
    }

    const data = await response.json();
    
    // Filter to California results only
    const californiaResults = data.filter((s: any) => 
      s.address?.state?.toLowerCase().includes('california') ||
      s.display_name.toLowerCase().includes('california')
    );

    return new Response(
      JSON.stringify({ results: californiaResults }),
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
