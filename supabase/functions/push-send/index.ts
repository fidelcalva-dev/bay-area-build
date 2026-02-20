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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify caller has admin or dispatcher role
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const allowedRoles = ['admin', 'dispatcher', 'cs', 'sales'];
    const hasRole = roles?.some((r: any) => allowedRoles.includes(r.role));
    if (!hasRole) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_ids, title, body, data: notifData, deep_link } = await req.json();

    if (!user_ids?.length || !title || !body) {
      return new Response(JSON.stringify({ error: 'user_ids, title, body required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch device tokens for target users
    const { data: devices, error: devErr } = await supabaseAdmin
      .from('push_devices')
      .select('device_token, platform, user_id')
      .in('user_id', user_ids)
      .eq('enabled', true);

    if (devErr) throw devErr;

    if (!devices?.length) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: 'no_devices' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store notification attempt for audit
    // In production, this would call FCM/APNs via their respective APIs
    // For now, log the intent and return token count
    console.log(`[push-send] Sending to ${devices.length} devices:`, {
      title,
      body,
      deep_link,
      platforms: [...new Set(devices.map((d: any) => d.platform))],
    });

    // TODO: Integrate with FCM/APNs when credentials are configured
    // const fcmTokens = devices.filter(d => d.platform !== 'ios').map(d => d.device_token);
    // const apnsTokens = devices.filter(d => d.platform === 'ios').map(d => d.device_token);

    return new Response(JSON.stringify({
      ok: true,
      sent: devices.length,
      platforms: [...new Set(devices.map((d: any) => d.platform))],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('push-send error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
