import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { quote_id } = await req.json();
    
    if (!quote_id) {
      return new Response(
        JSON.stringify({ error: 'quote_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating lead from quote:', quote_id);

    // Get quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quote_id)
      .maybeSingle();

    if (quoteError || !quote) {
      return new Response(
        JSON.stringify({ error: 'Quote not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if lead already exists for this quote
    const { data: existingLead } = await supabase
      .from('sales_leads')
      .select('id')
      .eq('quote_id', quote_id)
      .maybeSingle();

    if (existingLead) {
      console.log('Lead already exists for quote:', existingLead.id);
      return new Response(
        JSON.stringify({ success: true, lead_id: existingLead.id, action: 'existing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create lead via the capture function
    const { data: leadId, error: createError } = await supabase.rpc('create_or_update_lead', {
      p_source_key: 'WEBSITE_QUOTE',
      p_customer_name: quote.customer_name || null,
      p_customer_phone: quote.customer_phone || null,
      p_customer_email: quote.customer_email || null,
      p_company_name: null,
      p_address: quote.delivery_address || null,
      p_city: quote.city || null,
      p_zip: quote.zip_code || null,
      p_notes: `Quote #${quote_id.substring(0, 8)} - ${quote.material_type || 'Standard'} - ${quote.size_label || 'TBD'}`,
      p_utm_source: null,
      p_utm_campaign: null,
      p_utm_term: null,
      p_gclid: null,
      p_raw_payload: { quote_id, subtotal: quote.subtotal, material_type: quote.material_type },
      p_dedup_hours: 24,
    });

    if (createError) {
      console.error('Error creating lead:', createError);
      throw createError;
    }

    // Link lead to quote
    await supabase
      .from('sales_leads')
      .update({
        quote_id: quote_id,
        project_category: quote.material_type || 'general',
        requested_service: 'dumpster',
      })
      .eq('id', leadId);

    // Classify the lead
    await supabase.rpc('classify_and_route_lead', { p_lead_id: leadId });

    console.log('Lead created from quote:', leadId);

    // Dispatch internal alert (best effort)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      await fetch(`${supabaseUrl}/functions/v1/internal-alert-dispatcher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          event_type: 'LEAD_CREATED',
          entity_type: 'LEAD',
          entity_id: leadId,
          source: 'WEBSITE',
          payload: {
            customer_name: quote.customer_name,
            customer_phone: quote.customer_phone,
            customer_email: quote.customer_email,
            city: quote.city,
            zip_code: quote.zip_code,
            material_type: quote.material_type,
            source_key: 'WEBSITE_QUOTE',
          },
        }),
      });
    } catch (alertErr) {
      console.error('Internal alert failed (non-critical):', alertErr);
    }

    return new Response(
      JSON.stringify({ success: true, lead_id: leadId, action: 'created' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Lead from quote error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
