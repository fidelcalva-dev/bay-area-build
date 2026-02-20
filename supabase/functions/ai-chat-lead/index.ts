import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HIGHLEVEL_API_KEY = Deno.env.get("HIGHLEVEL_API_KEY");
const HIGHLEVEL_LOCATION_ID = Deno.env.get("HIGHLEVEL_LOCATION_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIChatLeadData {
  name: string;
  phone: string;
  email?: string;
  zip?: string;
  city?: string;
  county?: string;
  nearest_yard?: string;
  distance_miles?: number;
  waste_type?: "general" | "heavy";
  recommended_size?: number;
  included_tons?: number;
  preferred_date?: string;
  project_type?: string;
  notes?: string;
  conversation_transcript?: string;
  needs_human_followup?: boolean;
  // New routing fields
  is_existing_customer?: boolean;
  routing_target?: "sales" | "cs";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!HIGHLEVEL_API_KEY || !HIGHLEVEL_LOCATION_ID) {
    console.log("HighLevel credentials not configured, skipping lead capture");
    return new Response(
      JSON.stringify({ success: true, message: "Lead saved locally (CRM not configured)" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const data: AIChatLeadData = await req.json();
    const {
      name,
      phone,
      email,
      zip,
      city,
      county,
      nearest_yard,
      distance_miles,
      waste_type,
      recommended_size,
      included_tons,
      preferred_date,
      project_type,
      notes,
      conversation_transcript,
      needs_human_followup,
      is_existing_customer,
      routing_target,
    } = data;

    console.log("Processing AI chat lead:", name, phone);

    // =====================================================
    // Unified pipeline: delegate to lead-ingest (non-blocking)
    // =====================================================
    let leadId: string | null = null;
    try {
      const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          source_channel: 'AI_CHAT',
          source_detail: 'ai_chat_widget',
          name: name ?? null,
          phone: phone ?? null,
          email: email ?? null,
          city: city ?? null,
          zip: zip ?? null,
          project_type: project_type ?? (waste_type === 'heavy' ? 'Heavy Materials' : 'General Debris'),
          material_category: waste_type === 'heavy' ? 'heavy' : 'general',
          size_preference: recommended_size ? `${recommended_size}yd` : null,
          message: notes ?? null,
          consent_status: 'OPTED_IN',
          raw_payload: {
            county,
            nearest_yard,
            distance_miles,
            waste_type,
            recommended_size,
            included_tons,
            preferred_date,
            conversation_transcript: conversation_transcript?.substring(0, 500),
            needs_human_followup,
            is_existing_customer,
            routing_target,
          },
        }),
      });

      if (ingestResponse.ok) {
        const ingestResult = await ingestResponse.json();
        leadId = ingestResult.lead_id;
        console.log('AI chat lead ingested via pipeline:', leadId);
      } else {
        const errText = await ingestResponse.text();
        console.error('lead-ingest error (non-critical):', errText);
      }
    } catch (ingestErr) {
      console.error('lead-ingest call failed (non-critical):', ingestErr);
    }

    // GHL sync (kept for backward compat)
    let contactId: string | null = null;

    if (HIGHLEVEL_API_KEY && HIGHLEVEL_LOCATION_ID) {
      // Format phone for HighLevel (E.164)
      const formattedPhone = phone.replace(/\D/g, "");
      const e164Phone = formattedPhone.length === 10 ? `+1${formattedPhone}` : `+${formattedPhone}`;

      const customFields: Record<string, string> = { source: "AI Chat Widget" };
      if (zip) customFields.zip_code = zip;
      if (city) customFields.city = city;
      if (county) customFields.county = county;
      if (nearest_yard) customFields.nearest_yard = nearest_yard;
      if (distance_miles !== undefined) customFields.distance_miles = `${distance_miles.toFixed(1)} miles`;
      if (waste_type) customFields.waste_type = waste_type === "heavy" ? "Heavy Materials" : "General Debris";
      if (recommended_size) customFields.recommended_size = `${recommended_size} yard`;
      if (included_tons !== undefined) customFields.included_tons = `${included_tons} tons`;
      if (preferred_date) customFields.preferred_date = preferred_date;
      if (project_type) customFields.project_type = project_type;
      if (notes) customFields.notes = notes;

      const tags = ["AI Chat Lead"];
      if (waste_type === "heavy") tags.push("Heavy Materials");
      if (needs_human_followup) tags.push("Needs Human Follow-up");
      if (is_existing_customer) { tags.push("existing_customer"); tags.push("Route: Customer Service"); }
      else { tags.push("new_lead"); tags.push("Route: Sales"); }
      if (routing_target) tags.push(`Assigned: ${routing_target.toUpperCase()}`);

      const searchUrl = `https://services.leadconnectorhq.com/contacts/search/duplicates`;
      const searchResponse = await fetch(searchUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HIGHLEVEL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify({ locationId: HIGHLEVEL_LOCATION_ID, phone: e164Phone }),
      });

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.contacts?.length > 0) contactId = searchResult.contacts[0].id;
      }

      const contactPayload: Record<string, any> = {
        locationId: HIGHLEVEL_LOCATION_ID,
        name,
        phone: e164Phone,
        tags,
        customFields: Object.entries(customFields).map(([key, value]) => ({ key, field_value: value })),
      };
      if (email) contactPayload.email = email;

      if (contactId) {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${HIGHLEVEL_API_KEY}`, "Content-Type": "application/json", Version: "2021-07-28" },
          body: JSON.stringify(contactPayload),
        });
      } else {
        const createResponse = await fetch(`https://services.leadconnectorhq.com/contacts/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${HIGHLEVEL_API_KEY}`, "Content-Type": "application/json", Version: "2021-07-28" },
          body: JSON.stringify(contactPayload),
        });
        const result = await createResponse.json();
        contactId = result.contact?.id;
      }

      if (contactId && conversation_transcript) {
        try {
          await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
            method: "POST",
            headers: { Authorization: `Bearer ${HIGHLEVEL_API_KEY}`, "Content-Type": "application/json", Version: "2021-07-28" },
            body: JSON.stringify({ contactId, body: `AI Chat Conversation:\n\n${conversation_transcript}` }),
          });
        } catch (noteError) {
          console.error("Error adding note:", noteError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        contactId,
        lead_id: leadId,
        action: contactId ? "updated" : "created",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in ai-chat-lead function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
