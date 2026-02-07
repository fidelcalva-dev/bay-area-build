import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScanItem {
  category: string;
  item_key: string;
  title: string;
  priority: string;
  detected_reason: string;
  required_env_vars_json: { name: string; present: boolean }[];
  required_webhooks_json: {
    service: string;
    label: string;
    url: string;
    configured: boolean;
  }[];
  manual_steps_json: string[];
  verification_steps_json: string[];
}

function checkEnv(name: string): boolean {
  const val = Deno.env.get(name);
  return !!val && val.trim().length > 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Fetch config_settings modes ──
    const { data: configRows } = await supabase
      .from("config_settings")
      .select("key, value")
      .in("key", [
        "telephony.mode",
        "messaging.mode",
        "ghl.messaging_mode",
        "ads.mode",
        "google.mode",
        "master_ai.mode",
      ]);

    const modes: Record<string, string> = {};
    (configRows || []).forEach((r: any) => {
      modes[r.key] = typeof r.value === "string" ? r.value : JSON.stringify(r.value);
    });

    // ── Env var checks ──
    const twilioVars = [
      { name: "TWILIO_ACCOUNT_SID", present: checkEnv("TWILIO_ACCOUNT_SID") },
      { name: "TWILIO_AUTH_TOKEN", present: checkEnv("TWILIO_AUTH_TOKEN") },
      { name: "TWILIO_PHONE_NUMBER", present: checkEnv("TWILIO_PHONE_NUMBER") },
    ];
    const resendVars = [
      { name: "RESEND_API_KEY", present: checkEnv("RESEND_API_KEY") },
    ];
    const metaVars = [
      { name: "META_VERIFY_TOKEN", present: checkEnv("META_VERIFY_TOKEN") },
      { name: "META_APP_SECRET", present: checkEnv("META_APP_SECRET") },
    ];
    const googleAdsVars = [
      { name: "GOOGLE_ADS_CLIENT_ID", present: checkEnv("GOOGLE_ADS_CLIENT_ID") },
      { name: "GOOGLE_ADS_CLIENT_SECRET", present: checkEnv("GOOGLE_ADS_CLIENT_SECRET") },
      { name: "GOOGLE_ADS_DEVELOPER_TOKEN", present: checkEnv("GOOGLE_ADS_DEVELOPER_TOKEN") },
      { name: "GOOGLE_ADS_REFRESH_TOKEN", present: checkEnv("GOOGLE_ADS_REFRESH_TOKEN") },
      { name: "GOOGLE_ADS_CUSTOMER_ID", present: checkEnv("GOOGLE_ADS_CUSTOMER_ID") },
    ];
    const googleMapsVars = [
      { name: "GOOGLE_MAPS_API_KEY", present: checkEnv("GOOGLE_MAPS_API_KEY") },
    ];
    const authnetVars = [
      { name: "AUTHNET_API_LOGIN_ID", present: checkEnv("AUTHNET_API_LOGIN_ID") },
      { name: "AUTHNET_TRANSACTION_KEY", present: checkEnv("AUTHNET_TRANSACTION_KEY") },
      { name: "AUTHNET_SIGNATURE_KEY", present: checkEnv("AUTHNET_SIGNATURE_KEY") },
    ];
    const highlevelVars = [
      { name: "HIGHLEVEL_API_KEY", present: checkEnv("HIGHLEVEL_API_KEY") },
      { name: "HIGHLEVEL_LOCATION_ID", present: checkEnv("HIGHLEVEL_LOCATION_ID") },
    ];
    const googleWorkspaceVars = [
      { name: "GOOGLE_OAUTH_CLIENT_ID", present: checkEnv("GOOGLE_OAUTH_CLIENT_ID") },
      { name: "GOOGLE_OAUTH_CLIENT_SECRET", present: checkEnv("GOOGLE_OAUTH_CLIENT_SECRET") },
      { name: "GOOGLE_ENCRYPTION_KEY", present: checkEnv("GOOGLE_ENCRYPTION_KEY") },
    ];

    const BASE_URL = supabaseUrl + "/functions/v1";

    // ── Build scan items ──
    const items: ScanItem[] = [];

    // --- TELEPHONY ---
    const twilioAllPresent = twilioVars.every((v) => v.present);
    if (!twilioAllPresent) {
      items.push({
        category: "TELEPHONY",
        item_key: "twilio_credentials",
        title: "Twilio API Credentials",
        priority: "P0",
        detected_reason: "Missing Twilio env vars required for voice & SMS",
        required_env_vars_json: twilioVars,
        required_webhooks_json: [],
        manual_steps_json: [
          "Go to https://console.twilio.com",
          "Copy Account SID, Auth Token, and Phone Number",
          "Add them as Cloud secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER",
        ],
        verification_steps_json: [
          "Run the scanner again to verify all 3 vars are present",
        ],
      });
    }

    // Twilio webhooks (always need manual confirmation)
    items.push({
      category: "TELEPHONY",
      item_key: "twilio_voice_webhooks",
      title: "Twilio Voice Webhook Configuration",
      priority: "P0",
      detected_reason:
        "Voice webhooks must be configured manually in Twilio Console",
      required_env_vars_json: [],
      required_webhooks_json: [
        {
          service: "Twilio",
          label: "Voice Webhook (POST)",
          url: `${BASE_URL}/calls-inbound-handler`,
          configured: false,
        },
        {
          service: "Twilio",
          label: "Status Callback (POST)",
          url: `${BASE_URL}/calls-status-callback`,
          configured: false,
        },
        {
          service: "Twilio",
          label: "Voicemail Handler (POST)",
          url: `${BASE_URL}/calls-voicemail-handler`,
          configured: false,
        },
      ],
      manual_steps_json: [
        "Go to Twilio Console → Phone Numbers → Manage → Active Numbers",
        "Select your number",
        "Under Voice & Fax, set Webhook URL to: " + `${BASE_URL}/calls-inbound-handler`,
        "Set Status Callback URL to: " + `${BASE_URL}/calls-status-callback`,
        "Save changes",
      ],
      verification_steps_json: [
        "Make a test call to the Twilio number",
        "Verify call_events table has a new record",
        "Mark this item DONE after testing",
      ],
    });

    items.push({
      category: "TELEPHONY",
      item_key: "twilio_sms_webhook",
      title: "Twilio SMS Webhook Configuration",
      priority: "P0",
      detected_reason:
        "SMS webhook must be configured manually in Twilio Console",
      required_env_vars_json: [],
      required_webhooks_json: [
        {
          service: "Twilio",
          label: "SMS Webhook (POST)",
          url: `${BASE_URL}/twilio-sms-webhook`,
          configured: false,
        },
      ],
      manual_steps_json: [
        "Go to Twilio Console → Phone Numbers → Manage → Active Numbers",
        "Select your number",
        "Under Messaging, set Webhook URL to: " + `${BASE_URL}/twilio-sms-webhook`,
        "Save changes",
      ],
      verification_steps_json: [
        "Send a test SMS to the Twilio number",
        "Check sms_messages table for the inbound record",
        "Mark DONE after testing",
      ],
    });

    // --- MESSAGING (GHL) ---
    const ghlMode = modes["ghl.messaging_mode"] || "DRY_RUN";
    items.push({
      category: "MESSAGING",
      item_key: "ghl_webhook_inbound",
      title: "GoHighLevel Inbound Webhook",
      priority: "P1",
      detected_reason: `GHL messaging_mode=${ghlMode}; inbound webhook must be configured in GHL`,
      required_env_vars_json: highlevelVars,
      required_webhooks_json: [
        {
          service: "GoHighLevel",
          label: "Inbound Webhook",
          url: `${BASE_URL}/ghl-webhook-inbound`,
          configured: false,
        },
      ],
      manual_steps_json: [
        "Go to GoHighLevel → Settings → Webhooks",
        "Add webhook URL: " + `${BASE_URL}/ghl-webhook-inbound`,
        "Select events: Contact Created, Contact Updated, Note Created",
        "Save",
      ],
      verification_steps_json: [
        "Create a test contact in GHL",
        "Verify crm_contacts table is updated",
      ],
    });

    // --- EMAIL (Resend) ---
    const resendPresent = resendVars[0].present;
    if (!resendPresent) {
      items.push({
        category: "EMAIL",
        item_key: "resend_api_key",
        title: "Resend Email API Key",
        priority: "P1",
        detected_reason:
          "RESEND_API_KEY not configured; email receipts will not send",
        required_env_vars_json: resendVars,
        required_webhooks_json: [],
        manual_steps_json: [
          "Go to https://resend.com/api-keys",
          "Create a new API key",
          "Add to Cloud secrets as RESEND_API_KEY",
          "Verify domain calsandumpsterspro.com in Resend for production sending",
        ],
        verification_steps_json: [
          "Re-run scanner to verify RESEND_API_KEY is present",
          "Send a test payment receipt",
        ],
      });
    }

    // --- PAYMENTS (Authorize.Net) ---
    const authnetAllPresent = authnetVars.every((v) => v.present);
    if (!authnetAllPresent) {
      items.push({
        category: "PAYMENTS",
        item_key: "authnet_credentials",
        title: "Authorize.Net API Credentials",
        priority: "P0",
        detected_reason: "Missing Authorize.Net env vars required for payments",
        required_env_vars_json: authnetVars,
        required_webhooks_json: [],
        manual_steps_json: [
          "Go to Authorize.Net merchant dashboard",
          "Navigate to Account → Settings → API Credentials & Keys",
          "Copy API Login ID, Transaction Key, and Signature Key",
          "Add as Cloud secrets",
        ],
        verification_steps_json: [
          "Re-run scanner to verify all 3 vars are present",
          "Process a test $0.01 payment in sandbox mode",
        ],
      });
    }

    items.push({
      category: "PAYMENTS",
      item_key: "authnet_webhook",
      title: "Authorize.Net Webhook Configuration",
      priority: "P0",
      detected_reason:
        "AuthNet webhook must be configured in merchant dashboard",
      required_env_vars_json: [],
      required_webhooks_json: [
        {
          service: "Authorize.Net",
          label: "Webhook URL",
          url: `${BASE_URL}/authnet-webhook`,
          configured: false,
        },
      ],
      manual_steps_json: [
        "Go to Authorize.Net → Account → Webhooks",
        "Add new webhook endpoint: " + `${BASE_URL}/authnet-webhook`,
        "Subscribe to: net.authorize.payment.authcapture.created, net.authorize.payment.refund.created",
        "Set status to Active",
      ],
      verification_steps_json: [
        "Process a test payment and verify webhook fires",
        "Check authnet_webhook edge function logs",
      ],
    });

    // --- MAPS ---
    const mapsPresent = googleMapsVars[0].present;
    if (!mapsPresent) {
      items.push({
        category: "MAPS",
        item_key: "google_maps_api_key",
        title: "Google Maps API Key",
        priority: "P0",
        detected_reason:
          "GOOGLE_MAPS_API_KEY missing; routing and geocoding will fail",
        required_env_vars_json: googleMapsVars,
        required_webhooks_json: [],
        manual_steps_json: [
          "Go to https://console.cloud.google.com",
          "Enable Places API, Routes API, and Distance Matrix API",
          "Create an API key and restrict to your domain",
          "Add as Cloud secret: GOOGLE_MAPS_API_KEY",
        ],
        verification_steps_json: [
          "Re-run scanner",
          "Test geocode-address edge function",
        ],
      });
    }

    // --- LEADS (Meta) ---
    const metaAllPresent = metaVars.every((v) => v.present);
    if (!metaAllPresent) {
      items.push({
        category: "LEADS",
        item_key: "meta_leads_integration",
        title: "Meta (FB/IG/WhatsApp) Lead Integration",
        priority: "P1",
        detected_reason:
          "META_VERIFY_TOKEN / META_APP_SECRET not configured",
        required_env_vars_json: metaVars,
        required_webhooks_json: [
          {
            service: "Meta",
            label: "Webhook URL",
            url: `${BASE_URL}/lead-from-meta`,
            configured: false,
          },
        ],
        manual_steps_json: [
          "Go to https://developers.facebook.com",
          "Create/configure app with Messenger and Instagram webhooks",
          "Add secrets: META_VERIFY_TOKEN (any secure string) and META_APP_SECRET (from app settings)",
          "Configure webhook URL: " + `${BASE_URL}/lead-from-meta`,
        ],
        verification_steps_json: [
          "Send a test message from Facebook Messenger",
          "Verify leads table has a new record",
        ],
      });
    }

    // --- ADS ---
    const adsAllPresent = googleAdsVars.every((v) => v.present);
    const adsMode = modes["ads.mode"] || "DRY_RUN";
    if (!adsAllPresent) {
      items.push({
        category: "ADS",
        item_key: "google_ads_credentials",
        title: "Google Ads API Credentials",
        priority: adsMode === "LIVE" ? "P0" : "P2",
        detected_reason: `Google Ads API vars missing; ads.mode=${adsMode}`,
        required_env_vars_json: googleAdsVars,
        required_webhooks_json: [],
        manual_steps_json: [
          "Go to https://console.cloud.google.com",
          "Enable Google Ads API",
          "Create OAuth 2.0 credentials",
          "Add secrets: GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CUSTOMER_ID",
        ],
        verification_steps_json: [
          "Re-run scanner to verify all 5 vars are present",
          "Run ads-generate-campaigns in DRY_RUN mode",
        ],
      });
    }

    // --- GOOGLE WORKSPACE ---
    const googleMode = modes["google.mode"] || "DRY_RUN";
    const wsAllPresent = googleWorkspaceVars.every((v) => v.present);
    if (!wsAllPresent) {
      items.push({
        category: "GOOGLE_WORKSPACE",
        item_key: "google_workspace_credentials",
        title: "Google Workspace OAuth Credentials",
        priority: "P1",
        detected_reason: `Google Workspace vars missing; google.mode=${googleMode}`,
        required_env_vars_json: googleWorkspaceVars,
        required_webhooks_json: [],
        manual_steps_json: [
          "Go to https://console.cloud.google.com → APIs & Services → Credentials",
          "Create OAuth 2.0 Client ID (Web application)",
          "Set authorized redirect URI: " + `${BASE_URL}/google-oauth-callback`,
          "Add secrets: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET",
          "Generate a 32-char encryption key and add as: GOOGLE_ENCRYPTION_KEY",
        ],
        verification_steps_json: [
          "Re-run scanner",
          "Test Google OAuth flow from /admin/google/setup",
        ],
      });
    }

    items.push({
      category: "GOOGLE_WORKSPACE",
      item_key: "google_chat_webhook",
      title: "Google Chat Webhook for Notifications",
      priority: "P1",
      detected_reason: "Google Chat webhook URL needed for team notifications",
      required_env_vars_json: [
        { name: "GOOGLE_CHAT_WEBHOOKS", present: checkEnv("GOOGLE_CHAT_WEBHOOKS") },
      ],
      required_webhooks_json: [],
      manual_steps_json: [
        "In Google Chat, create a Space for notifications",
        "Go to Space Settings → Apps & Integrations → Manage Webhooks",
        "Create a webhook and copy the URL",
        "Add as Cloud secret: GOOGLE_CHAT_WEBHOOKS (JSON array of webhook objects)",
      ],
      verification_steps_json: [
        "Send a test notification via master-ai-notifier",
      ],
    });

    // --- SECURITY ---
    items.push({
      category: "SECURITY",
      item_key: "leaked_password_protection",
      title: "Enable Leaked Password Protection",
      priority: "P2",
      detected_reason:
        "Leaked password protection is disabled (linter warning)",
      required_env_vars_json: [],
      required_webhooks_json: [],
      manual_steps_json: [
        "Go to Cloud View → Authentication → Settings",
        "Enable 'Leaked Password Protection'",
        "Save changes",
      ],
      verification_steps_json: [
        "Run security linter and verify warning is gone",
      ],
    });

    items.push({
      category: "SECURITY",
      item_key: "extension_public_schema",
      title: "Move Extensions Out of Public Schema",
      priority: "P2",
      detected_reason:
        "pg_net and other extensions installed in public schema (security best practice)",
      required_env_vars_json: [],
      required_webhooks_json: [],
      manual_steps_json: [
        "Create an 'extensions' schema if not exists",
        "Move pg_net and other extensions to the extensions schema",
        "Update search_path if needed",
      ],
      verification_steps_json: [
        "Run security linter and verify 'Extension in Public' warnings are gone",
      ],
    });

    // ── Upsert items ──
    const now = new Date().toISOString();
    for (const item of items) {
      // Check if item already exists and is DONE - don't override DONE status
      const { data: existing } = await supabase
        .from("missing_connections")
        .select("id, status")
        .eq("item_key", item.item_key)
        .maybeSingle();

      if (existing && existing.status === "DONE") {
        // Only update scan timestamp and env var presence
        await supabase
          .from("missing_connections")
          .update({
            required_env_vars_json: item.required_env_vars_json,
            last_scanned_at: now,
          })
          .eq("id", existing.id);
      } else if (existing) {
        // Update everything except status
        await supabase
          .from("missing_connections")
          .update({
            title: item.title,
            priority: item.priority,
            detected_reason: item.detected_reason,
            required_env_vars_json: item.required_env_vars_json,
            required_webhooks_json: item.required_webhooks_json,
            manual_steps_json: item.manual_steps_json,
            verification_steps_json: item.verification_steps_json,
            last_scanned_at: now,
          })
          .eq("id", existing.id);
      } else {
        // Insert new
        await supabase.from("missing_connections").insert({
          ...item,
          last_scanned_at: now,
        });
      }
    }

    // ── Fetch final state ──
    const { data: results } = await supabase
      .from("missing_connections")
      .select("*")
      .order("priority")
      .order("category");

    const p0Open = (results || []).filter(
      (r: any) => r.priority === "P0" && r.status === "OPEN"
    );

    return new Response(
      JSON.stringify({
        success: true,
        scanned_at: now,
        total_items: (results || []).length,
        p0_open: p0Open.length,
        go_live_ready: p0Open.length === 0,
        items: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("scan-missing-connections error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
