import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const HIGHLEVEL_API_KEY = Deno.env.get("HIGHLEVEL_API_KEY");
const HIGHLEVEL_LOCATION_ID = Deno.env.get("HIGHLEVEL_LOCATION_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HighLevelContactData {
  event: string;
  quote_id: string;
  name: string;
  phone: string;
  email?: string;
  zip: string;
  waste_type: 'general' | 'heavy';
  recommended_size: number;
  selected_size: number;
  included_tons: number;
  estimated_total: string;
  extras: string;
  page: string;
  zone_name?: string;
  project_type?: string;
  confidence_level?: string;
  tags: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!HIGHLEVEL_API_KEY || !HIGHLEVEL_LOCATION_ID) {
    console.log("HighLevel credentials not configured, skipping webhook");
    return new Response(
      JSON.stringify({ success: false, message: "HighLevel not configured" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const data: HighLevelContactData = await req.json();
    const {
      event,
      quote_id,
      name,
      phone,
      email,
      zip,
      waste_type,
      recommended_size,
      selected_size,
      included_tons,
      estimated_total,
      extras,
      page,
      zone_name,
      project_type,
      confidence_level,
      tags,
    } = data;

    console.log(`Processing ${event} from ${page}`);

    // Format phone number for HighLevel (E.164 format)
    const formattedPhone = phone.replace(/\D/g, '');
    const e164Phone = formattedPhone.length === 10 ? `+1${formattedPhone}` : `+${formattedPhone}`;

    // Build custom fields
    const customFields: Record<string, string> = {
      quote_id: quote_id,
      zip_code: zip,
      waste_type: waste_type === 'heavy' ? 'Heavy Materials' : 'General Debris',
      recommended_size: `${recommended_size} yard`,
      selected_size: `${selected_size} yard`,
      included_tons: `${included_tons} ton${included_tons !== 1 ? 's' : ''}`,
      estimated_total: estimated_total,
      extras: extras || 'None',
      source_page: page,
    };

    if (zone_name) customFields.zone = zone_name;
    if (project_type) customFields.project_type = project_type;
    if (confidence_level) customFields.confidence_level = confidence_level;

    // First, try to find existing contact by phone
    const searchUrl = `https://services.leadconnectorhq.com/contacts/search/duplicates`;
    
    const searchResponse = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HIGHLEVEL_API_KEY}`,
        "Content-Type": "application/json",
        "Version": "2021-07-28",
      },
      body: JSON.stringify({
        locationId: HIGHLEVEL_LOCATION_ID,
        phone: e164Phone,
      }),
    });

    let contactId: string | null = null;
    
    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.contacts && searchResult.contacts.length > 0) {
        contactId = searchResult.contacts[0].id;
        console.log("Found existing contact:", contactId);
      }
    }

    // Contact payload
    const contactPayload: Record<string, any> = {
      locationId: HIGHLEVEL_LOCATION_ID,
      name,
      phone: e164Phone,
      tags,
      customFields: Object.entries(customFields).map(([key, value]) => ({
        key,
        field_value: value,
      })),
    };

    if (email) {
      contactPayload.email = email;
    }

    let result;

    if (contactId) {
      // Update existing contact
      const updateUrl = `https://services.leadconnectorhq.com/contacts/${contactId}`;
      
      const updateResponse = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${HIGHLEVEL_API_KEY}`,
          "Content-Type": "application/json",
          "Version": "2021-07-28",
        },
        body: JSON.stringify(contactPayload),
      });

      result = await updateResponse.json();
      console.log("Updated contact in HighLevel:", result);
    } else {
      // Create new contact
      const createUrl = `https://services.leadconnectorhq.com/contacts/`;
      
      const createResponse = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HIGHLEVEL_API_KEY}`,
          "Content-Type": "application/json",
          "Version": "2021-07-28",
        },
        body: JSON.stringify(contactPayload),
      });

      result = await createResponse.json();
      contactId = result.contact?.id;
      console.log("Created contact in HighLevel:", result);
    }

    // Add opportunity/note with quote details
    if (contactId) {
      try {
        const notePayload = {
          contactId,
          body: `Quote Saved:\n` +
            `• Size: ${selected_size} yard (Recommended: ${recommended_size} yard)\n` +
            `• Material: ${waste_type === 'heavy' ? 'Heavy' : 'General'}\n` +
            `• ZIP: ${zip}\n` +
            `• Estimate: ${estimated_total}\n` +
            `• Included: ${included_tons} ton${included_tons !== 1 ? 's' : ''}\n` +
            `• Extras: ${extras || 'None'}\n` +
            `• Quote ID: ${quote_id}\n` +
            `• Source: ${page}`,
        };

        const noteUrl = `https://services.leadconnectorhq.com/contacts/${contactId}/notes`;
        
        await fetch(noteUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HIGHLEVEL_API_KEY}`,
            "Content-Type": "application/json",
            "Version": "2021-07-28",
          },
          body: JSON.stringify(notePayload),
        });
        
        console.log("Added note to contact");
      } catch (noteError) {
        console.error("Error adding note:", noteError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contactId,
        action: contactId ? 'updated' : 'created',
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in highlevel-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
