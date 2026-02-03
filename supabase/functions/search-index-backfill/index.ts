import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackfillResult {
  entity_type: string;
  total: number;
  indexed: number;
  errors: number;
  duration_ms: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { entity_types = ["CUSTOMER", "CONTACT"], batch_size = 100 } = await req.json().catch(() => ({}));

    const results: BackfillResult[] = [];

    // Backfill Customers
    if (entity_types.includes("CUSTOMER")) {
      const startTime = Date.now();
      let indexed = 0;
      let errors = 0;

      // Get all customers
      const { data: customers, error: fetchError } = await supabaseClient
        .from("customers")
        .select("id");

      if (fetchError) {
        console.error("Error fetching customers:", fetchError);
        errors++;
      } else {
        const total = customers?.length || 0;

        // Process in batches
        for (let i = 0; i < total; i += batch_size) {
          const batch = customers.slice(i, i + batch_size);
          
          for (const customer of batch) {
            // Touch the customer to trigger the indexing trigger
            const { error: updateError } = await supabaseClient
              .from("customers")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", customer.id);

            if (updateError) {
              console.error(`Error indexing customer ${customer.id}:`, updateError);
              errors++;
            } else {
              indexed++;
            }
          }
        }

        results.push({
          entity_type: "CUSTOMER",
          total,
          indexed,
          errors,
          duration_ms: Date.now() - startTime,
        });
      }
    }

    // Backfill Contacts
    if (entity_types.includes("CONTACT")) {
      const startTime = Date.now();
      let indexed = 0;
      let errors = 0;

      // Get all contacts
      const { data: contacts, error: fetchError } = await supabaseClient
        .from("contacts")
        .select("id");

      if (fetchError) {
        console.error("Error fetching contacts:", fetchError);
        errors++;
      } else {
        const total = contacts?.length || 0;

        // Process in batches
        for (let i = 0; i < total; i += batch_size) {
          const batch = contacts.slice(i, i + batch_size);
          
          for (const contact of batch) {
            const { error: updateError } = await supabaseClient
              .from("contacts")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", contact.id);

            if (updateError) {
              console.error(`Error indexing contact ${contact.id}:`, updateError);
              errors++;
            } else {
              indexed++;
            }
          }
        }

        results.push({
          entity_type: "CONTACT",
          total,
          indexed,
          errors,
          duration_ms: Date.now() - startTime,
        });
      }
    }

    // Get current stats
    const { data: stats, error: statsError } = await supabaseClient.rpc("get_search_index_stats");

    return new Response(
      JSON.stringify({
        success: true,
        results,
        stats: stats || [],
        error: null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Backfill error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        results: [],
        stats: [],
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
