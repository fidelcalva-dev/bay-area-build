import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type HealthEventType = 
  | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'CHARGEBACK' | 'REFUND' | 'DISPUTE'
  | 'CANCELLATION' | 'NO_SHOW' | 'BLOCKED_ACCESS' | 'RESCHEDULE'
  | 'CONTAMINATION' | 'OVERWEIGHT' | 'POD_MISSING'
  | 'REPEAT_ORDER' | 'HIGH_VOLUME' | 'FAST_PAY' | 'CLEAN_COMPLIANCE'
  | 'REVIEW_POSITIVE' | 'REVIEW_NEGATIVE';

type HealthEventSeverity = 'LOW' | 'MED' | 'HIGH';

interface HealthUpdateRequest {
  customer_id: string;
  event_type: HealthEventType;
  severity?: HealthEventSeverity;
  delta_score?: number;
  details?: Record<string, unknown>;
  source_entity_type?: string;
  source_entity_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: HealthUpdateRequest = await req.json();
    
    // Validate required fields
    if (!body.customer_id || !body.event_type) {
      return new Response(
        JSON.stringify({ error: "customer_id and event_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the database function to update health score
    const { data, error } = await supabase.rpc('update_customer_health_score', {
      p_customer_id: body.customer_id,
      p_event_type: body.event_type,
      p_severity: body.severity || 'LOW',
      p_delta_score: body.delta_score || null,
      p_details_json: body.details || {},
      p_source_entity_type: body.source_entity_type || null,
      p_source_entity_id: body.source_entity_id || null,
    });

    if (error) {
      console.error("Error updating health score:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the updated health score
    const { data: healthData } = await supabase
      .from('customer_health_scores')
      .select('*')
      .eq('customer_id', body.customer_id)
      .single();

    console.log(`Health score updated for customer ${body.customer_id}: event_id=${data}`);

    return new Response(
      JSON.stringify({
        success: true,
        event_id: data,
        health: healthData,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
