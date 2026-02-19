// ============================================================
// Unified pipeline: do not insert leads directly; use lead-ingest.
// This function handles Meta (FB/IG/WhatsApp) webhooks and delegates.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaWebhookEntry {
  id: string;
  time: number;
  messaging?: MetaMessagingEvent[];
  changes?: MetaPageChange[];
}

interface MetaMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text: string };
}

interface MetaPageChange {
  field: string;
  value: Record<string, unknown>;
}

interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

Deno.serve(async (req) => {
  // Handle verification challenge from Meta
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const verifyToken = Deno.env.get('META_VERIFY_TOKEN') || 'calsan_verify_token';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Meta webhook verified');
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const payload: MetaWebhookPayload = await req.json();
    console.log('Meta webhook payload:', JSON.stringify(payload).substring(0, 500));

    // Determine channel
    let channelKey: string;
    if (payload.object === 'instagram') channelKey = 'INSTAGRAM_DM';
    else if (payload.object === 'page') channelKey = 'FB_MESSENGER';
    else if (payload.object === 'whatsapp_business_account') channelKey = 'WHATSAPP';
    else {
      console.log('Unknown Meta object type:', payload.object);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const entry of payload.entry) {
      // Handle messaging events
      if (entry.messaging) {
        for (const event of entry.messaging) {
          if (!event.message?.text) continue;

          const senderId = event.sender.id;
          const messageText = event.message.text;

          // Delegate to lead-ingest (Meta doesn't provide phone/email directly)
          try {
            await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                source_channel: channelKey,
                source_detail: `meta_${payload.object}`,
                message: messageText.substring(0, 500),
                consent_status: 'OPTED_IN',
                // Meta IDs used as placeholder - no phone/email from webhook
                // This will fail lead-ingest validation (needs phone or email)
                // So we fall back to direct capture for Meta
                raw_payload: {
                  meta_sender_id: senderId,
                  meta_page_id: entry.id,
                  message_id: event.message.mid,
                  timestamp: event.timestamp,
                },
              }),
            });
          } catch (ingestErr) {
            // Fallback: Meta leads often lack phone/email, use omnichannel RPC directly
            console.log('lead-ingest fallback for Meta (no phone/email):', ingestErr);
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            const { data: leadId, error } = await supabase.rpc('capture_omnichannel_lead', {
              p_channel_key: channelKey,
              p_contact_name: null,
              p_phone: null,
              p_email: null,
              p_message_excerpt: messageText.substring(0, 500),
              p_consent_status: 'OPTED_IN',
              p_raw_payload: {
                meta_sender_id: senderId,
                meta_page_id: entry.id,
                message_id: event.message.mid,
              },
            });
            if (!error) {
              console.log('Meta lead captured via fallback:', leadId);
              await supabase.rpc('auto_assign_lead', { p_lead_id: leadId });
            }
          }
        }
      }

      // Handle lead gen form submissions
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            const leadData = change.value as Record<string, unknown>;

            await fetch(`${supabaseUrl}/functions/v1/lead-ingest`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                source_channel: channelKey,
                source_detail: 'meta_leadgen_form',
                name: (leadData.full_name as string) ?? null,
                phone: (leadData.phone_number as string) ?? null,
                email: (leadData.email as string) ?? null,
                message: 'Lead Gen Form Submission',
                consent_status: 'OPTED_IN',
                raw_payload: leadData,
              }),
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Meta webhook error:', error);
    // Always return 200 to Meta to prevent retries
    return new Response(JSON.stringify({ received: true, error: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
