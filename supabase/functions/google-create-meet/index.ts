import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getValidAccessToken, checkGoogleMode } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateMeetRequest {
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  attendees?: string[];
  entityType?: string;
  entityId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub as string;

    // Parse request
    const body: CreateMeetRequest = await req.json();
    const { title, description, startTime: meetStart, endTime: meetEnd, attendees = [], entityType, entityId } = body;

    if (!title || !meetStart || !meetEnd) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, startTime, endTime' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check mode
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const mode = await checkGoogleMode(supabaseAdmin);

    // Get valid access token
    const tokenData = await getValidAccessToken(supabaseAdmin, userId);
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'No Google account connected or token expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestPayload = { title, description, startTime: meetStart, endTime: meetEnd, attendees, entityType, entityId };

    if (mode === 'DRY_RUN') {
      // Log but don't create
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'CREATE_MEET',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: 'DRY_RUN',
        p_duration_ms: Date.now() - startTime,
      });

      console.log('[DRY_RUN] Would create Meet:', { title, startTime: meetStart });

      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: 'DRY_RUN',
          message: 'Meet would be created (DRY_RUN mode)',
          wouldCreate: { title, startTime: meetStart, endTime: meetEnd }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIVE mode - create calendar event with Meet
    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: meetStart,
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: meetEnd,
        timeZone: 'America/Los_Angeles',
      },
      attendees: attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Calendar API error:', errorText);
      
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'CREATE_MEET',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: 'FAILED',
        p_error_message: errorText,
        p_duration_ms: Date.now() - startTime,
      });

      throw new Error(`Calendar API error: ${errorText}`);
    }

    const result = await response.json();
    const meetLink = result.hangoutLink || result.conferenceData?.entryPoints?.[0]?.uri;

    // Log success
    await supabaseAdmin.rpc('log_google_event', {
      p_user_id: userId,
      p_action_type: 'CREATE_MEET',
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_request_json: requestPayload,
      p_response_json: { eventId: result.id, meetLink },
      p_status: 'SUCCESS',
      p_duration_ms: Date.now() - startTime,
    });

    // Link to entity
    if (entityType && entityId) {
      await supabaseAdmin.rpc('upsert_entity_google_link', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_meet_event_id: result.id,
        p_meet_link: meetLink,
      });
    }

    console.log('Meet created successfully:', result.id, meetLink);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mode: 'LIVE',
        eventId: result.id,
        meetLink,
        htmlLink: result.htmlLink,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Create meet error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
