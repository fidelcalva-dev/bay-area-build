import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const HIGHLEVEL_API_KEY = Deno.env.get("HIGHLEVEL_API_KEY");
const HIGHLEVEL_LOCATION_ID = Deno.env.get("HIGHLEVEL_LOCATION_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HighLevelContactData {
  // Contact info
  name: string;
  phone: string;
  email?: string;
  
  // Quote data
  quoteId: string;
  zipCode: string;
  zoneName?: string;
  wasteType: 'general' | 'heavy';
  recommendedSizeYards: number;
  userSelectedSizeYards: number;
  includedTons: number;
  estimatedMin: number;
  estimatedMax: number;
  selectedExtras: string[];
  projectType?: string;
  confidenceLevel?: string;
  
  // Tags
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
      name,
      phone,
      email,
      quoteId,
      zipCode,
      zoneName,
      wasteType,
      recommendedSizeYards,
      userSelectedSizeYards,
      includedTons,
      estimatedMin,
      estimatedMax,
      selectedExtras,
      projectType,
      confidenceLevel,
      tags,
    } = data;

    // Format phone number for HighLevel (E.164 format)
    const formattedPhone = phone.replace(/\D/g, '');
    const e164Phone = formattedPhone.length === 10 ? `+1${formattedPhone}` : `+${formattedPhone}`;

    // Build custom fields
    const customFields: Record<string, string> = {
      quote_id: quoteId,
      zip_code: zipCode,
      waste_type: wasteType === 'heavy' ? 'Heavy Materials' : 'General Debris',
      recommended_size: `${recommendedSizeYards} yard`,
      selected_size: `${userSelectedSizeYards} yard`,
      included_tons: `${includedTons} ton${includedTons !== 1 ? 's' : ''}`,
      estimated_total: `$${estimatedMin} - $${estimatedMax}`,
      extras: selectedExtras.length > 0 ? selectedExtras.join(', ') : 'None',
    };

    if (zoneName) customFields.zone = zoneName;
    if (projectType) customFields.project_type = projectType;
    if (confidenceLevel) customFields.confidence_level = confidenceLevel;

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
            `• Size: ${userSelectedSizeYards} yard (Recommended: ${recommendedSizeYards} yard)\n` +
            `• Material: ${wasteType === 'heavy' ? 'Heavy' : 'General'}\n` +
            `• ZIP: ${zipCode}\n` +
            `• Estimate: $${estimatedMin} - $${estimatedMax}\n` +
            `• Included: ${includedTons} ton${includedTons !== 1 ? 's' : ''}\n` +
            `• Extras: ${selectedExtras.length > 0 ? selectedExtras.join(', ') : 'None'}\n` +
            `• Quote ID: ${quoteId}`,
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
