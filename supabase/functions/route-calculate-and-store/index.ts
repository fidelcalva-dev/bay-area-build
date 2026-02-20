import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RouteRequest {
  run_id: string;
}

interface RouteLeg {
  route_type: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
}

async function computeRoute(
  apiKey: string,
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): Promise<{ polyline: string; distanceMiles: number; durationMinutes: number; trafficMinutes: number | null }> {
  const body = {
    origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
    destination: { location: { latLng: { latitude: dest.lat, longitude: dest.lng } } },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    languageCode: "en-US",
    units: "IMPERIAL",
  };

  const res = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.staticDuration",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Routes API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("No route returned");

  const distanceMeters = route.distanceMeters || 0;
  const distanceMiles = distanceMeters * 0.000621371;
  
  // Duration comes as "123s" string
  const parseDuration = (d: string | undefined): number => {
    if (!d) return 0;
    return parseInt(d.replace("s", ""), 10) / 60;
  };

  const durationMinutes = parseDuration(route.duration);
  const staticMinutes = parseDuration(route.staticDuration);
  const trafficMinutes = durationMinutes !== staticMinutes ? durationMinutes : null;

  return {
    polyline: route.polyline?.encodedPolyline || "",
    distanceMiles: Math.round(distanceMiles * 100) / 100,
    durationMinutes: Math.round(staticMinutes * 100) / 100,
    trafficMinutes: trafficMinutes ? Math.round(trafficMinutes * 100) / 100 : null,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GOOGLE_MAPS_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { run_id } = (await req.json()) as RouteRequest;
    if (!run_id) {
      return new Response(JSON.stringify({ error: "run_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch run with yard + facility coords
    const { data: run, error: runErr } = await supabase
      .from("runs")
      .select(`
        id, run_type, status,
        origin_lat, origin_lng, origin_yard_id,
        destination_lat, destination_lng,
        destination_facility_id,
        origin_facility_id
      `)
      .eq("id", run_id)
      .single();

    if (runErr || !run) {
      return new Response(JSON.stringify({ error: "Run not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get origin yard coords if not on run
    let originLat = run.origin_lat;
    let originLng = run.origin_lng;
    if (!originLat && run.origin_yard_id) {
      const { data: yard } = await supabase
        .from("yards")
        .select("latitude, longitude")
        .eq("id", run.origin_yard_id)
        .single();
      if (yard) {
        originLat = yard.latitude;
        originLng = yard.longitude;
      }
    }

    const destLat = run.destination_lat;
    const destLng = run.destination_lng;

    // Get facility coords if applicable
    let facilityLat: number | null = null;
    let facilityLng: number | null = null;
    const facilityId = run.destination_facility_id || run.origin_facility_id;
    if (facilityId) {
      const { data: fac } = await supabase
        .from("facilities")
        .select("lat, lng")
        .eq("id", facilityId)
        .single();
      if (fac) {
        facilityLat = fac.lat;
        facilityLng = fac.lng;
      }
    }

    // Clear old routes for this run
    await supabase.from("run_routes").delete().eq("run_id", run_id);

    const legs: RouteLeg[] = [];
    const results: Array<{ route_type: string; distance: number; duration: number }> = [];

    // Leg 1: Yard to Site
    if (originLat && originLng && destLat && destLng) {
      const r = await computeRoute(apiKey, { lat: originLat, lng: originLng }, { lat: destLat, lng: destLng });
      await supabase.from("run_routes").insert({
        run_id,
        route_type: "YARD_TO_SITE",
        polyline: r.polyline,
        distance_miles: r.distanceMiles,
        duration_minutes: r.durationMinutes,
        duration_traffic_minutes: r.trafficMinutes,
        origin_lat: originLat,
        origin_lng: originLng,
        dest_lat: destLat,
        dest_lng: destLng,
      });
      results.push({ route_type: "YARD_TO_SITE", distance: r.distanceMiles, duration: r.durationMinutes });
    }

    // Leg 2: Site to Facility (if applicable)
    if (destLat && destLng && facilityLat && facilityLng) {
      const r = await computeRoute(apiKey, { lat: destLat, lng: destLng }, { lat: facilityLat, lng: facilityLng });
      await supabase.from("run_routes").insert({
        run_id,
        route_type: "SITE_TO_FACILITY",
        polyline: r.polyline,
        distance_miles: r.distanceMiles,
        duration_minutes: r.durationMinutes,
        duration_traffic_minutes: r.trafficMinutes,
        origin_lat: destLat,
        origin_lng: destLng,
        dest_lat: facilityLat,
        dest_lng: facilityLng,
      });
      results.push({ route_type: "SITE_TO_FACILITY", distance: r.distanceMiles, duration: r.durationMinutes });
    }

    // Leg 3: Facility to Yard (if applicable)
    if (facilityLat && facilityLng && originLat && originLng) {
      const r = await computeRoute(apiKey, { lat: facilityLat, lng: facilityLng }, { lat: originLat, lng: originLng });
      await supabase.from("run_routes").insert({
        run_id,
        route_type: "FACILITY_TO_YARD",
        polyline: r.polyline,
        distance_miles: r.distanceMiles,
        duration_minutes: r.durationMinutes,
        duration_traffic_minutes: r.trafficMinutes,
        origin_lat: facilityLat,
        origin_lng: facilityLng,
        dest_lat: originLat,
        dest_lng: originLng,
      });
      results.push({ route_type: "FACILITY_TO_YARD", distance: r.distanceMiles, duration: r.durationMinutes });
    }

    // Log route event
    const totalMiles = results.reduce((s, r) => s + r.distance, 0);
    const totalMins = results.reduce((s, r) => s + r.duration, 0);
    await supabase.from("run_events").insert({
      run_id,
      event_type: "ROUTE_CALCULATED",
      metadata: { legs: results, total_miles: totalMiles, total_duration_minutes: totalMins },
    });

    // Update estimated on the run
    await supabase.from("runs").update({
      estimated_miles: totalMiles,
      estimated_duration_mins: Math.round(totalMins),
    }).eq("id", run_id);

    return new Response(
      JSON.stringify({ success: true, legs: results.length, total_miles: totalMiles, total_duration_minutes: totalMins }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("route-calculate-and-store error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
