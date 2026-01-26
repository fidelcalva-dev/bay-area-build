import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Meta webhook payload types
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
  message?: {
    mid: string;
    text: string;
  };
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payload: MetaWebhookPayload = await req.json();
    console.log('Meta webhook payload:', JSON.stringify(payload).substring(0, 500));

    // Determine channel from webhook object type
    let channelKey: string;
    if (payload.object === 'instagram') {
      channelKey = 'INSTAGRAM_DM';
    } else if (payload.object === 'page') {
      channelKey = 'FB_MESSENGER';
    } else if (payload.object === 'whatsapp_business_account') {
      channelKey = 'WHATSAPP';
    } else {
      console.log('Unknown Meta object type:', payload.object);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process each entry
    for (const entry of payload.entry) {
      // Handle messaging events (Messenger, Instagram DM)
      if (entry.messaging) {
        for (const event of entry.messaging) {
          if (!event.message?.text) continue;

          const senderId = event.sender.id;
          const messageText = event.message.text;

          // We can't get phone/email from Meta IDs directly
          // In production, you'd call the Graph API to get user info
          // For now, we store the Meta ID as a reference
          
          const { data: leadId, error } = await supabase.rpc('capture_omnichannel_lead', {
            p_channel_key: channelKey,
            p_contact_name: null, // Would fetch from Graph API
            p_phone: null,
            p_email: null,
            p_message_excerpt: messageText.substring(0, 500),
            p_consent_status: 'OPTED_IN',
            p_raw_payload: {
              meta_sender_id: senderId,
              meta_page_id: entry.id,
              message_id: event.message.mid,
              timestamp: event.timestamp,
            },
          });

          if (error) {
            console.error('Error capturing Meta lead:', error);
          } else {
            console.log('Meta lead captured:', leadId, channelKey);
            await supabase.rpc('auto_assign_lead', { p_lead_id: leadId });
          }
        }
      }

      // Handle page changes (lead gen forms, etc.)
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            // This is a lead gen form submission
            const leadData = change.value as Record<string, unknown>;
            
            const { data: leadId, error } = await supabase.rpc('capture_omnichannel_lead', {
              p_channel_key: channelKey === 'FB_MESSENGER' ? 'GOOGLE_ADS' : channelKey, // Lead gen forms
              p_contact_name: (leadData.full_name as string) || null,
              p_phone: (leadData.phone_number as string) || null,
              p_email: (leadData.email as string) || null,
              p_message_excerpt: 'Lead Gen Form Submission',
              p_consent_status: 'OPTED_IN',
              p_raw_payload: leadData,
            });

            if (!error) {
              console.log('Meta lead gen captured:', leadId);
              await supabase.rpc('auto_assign_lead', { p_lead_id: leadId });
            }
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
