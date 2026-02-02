import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const customerId = body.customer_id;

    let processed = 0;
    let errors: string[] = [];

    if (customerId) {
      // Recalculate single customer
      const { data, error } = await supabase.rpc('recalculate_customer_health', {
        p_customer_id: customerId,
      });

      if (error) {
        errors.push(`Customer ${customerId}: ${error.message}`);
      } else {
        processed = 1;
        console.log(`Recalculated health for customer ${customerId}: score=${data}`);
      }
    } else {
      // Daily batch recalculation - get all customers with orders in last 90 days
      const { data: customers, error: fetchError } = await supabase
        .from('customers')
        .select('id')
        .limit(500);

      if (fetchError) {
        console.error("Error fetching customers:", fetchError);
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Starting health recalculation for ${customers?.length || 0} customers`);

      for (const customer of customers || []) {
        const { error: recalcError } = await supabase.rpc('recalculate_customer_health', {
          p_customer_id: customer.id,
        });

        if (recalcError) {
          errors.push(`Customer ${customer.id}: ${recalcError.message}`);
        } else {
          processed++;
        }
      }
    }

    console.log(`Health recalculation complete: ${processed} processed, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        total_errors: errors.length,
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
