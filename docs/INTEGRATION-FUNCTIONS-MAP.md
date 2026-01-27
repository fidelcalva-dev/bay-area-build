# Integration Functions Map

> **Generated:** 2026-01-27  
> **Project:** Calsan Dumpster Rental Platform  
> **Supabase Project ID:** tvcwzohfycwfaqjyruow

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Edge Functions** | 49 |
| **Connected Integrations** | 5 |
| **Missing Integrations** | 3 |
| **Not Applicable** | 2 |

### Secrets Status

| Secret | Present |
|--------|---------|
| `TWILIO_ACCOUNT_SID` | ✅ |
| `TWILIO_AUTH_TOKEN` | ✅ |
| `TWILIO_PHONE_NUMBER` | ✅ |
| `GOOGLE_MAPS_API_KEY` | ✅ |
| `AUTHNET_API_LOGIN_ID` | ✅ |
| `AUTHNET_TRANSACTION_KEY` | ✅ |
| `AUTHNET_SIGNATURE_KEY` | ✅ |
| `HIGHLEVEL_API_KEY` | ✅ |
| `HIGHLEVEL_LOCATION_ID` | ✅ |
| `RESEND_API_KEY` | ❌ |
| `META_VERIFY_TOKEN` | ❌ |
| `META_APP_SECRET` | ❌ |
| `GOOGLE_ADS_CLIENT_ID` | ❌ |
| `GOOGLE_ADS_CLIENT_SECRET` | ❌ |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | ❌ |
| `GOOGLE_ADS_REFRESH_TOKEN` | ❌ |

---

## Functions by Category

### 📞 TELEPHONY (7 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `calls-inbound-handler` | `/functions/v1/calls-inbound-handler` | Handles inbound Twilio calls, routes to agents, creates voicemail fallback | Twilio Voice | TWILIO_AUTH_TOKEN ✅ | **CONNECTED** |
| `calls-outbound-handler` | `/functions/v1/calls-outbound-handler` | Initiates outbound calls via Twilio | Twilio Voice | TWILIO_ACCOUNT_SID ✅, TWILIO_AUTH_TOKEN ✅, TWILIO_PHONE_NUMBER ✅ | **CONNECTED** |
| `calls-outbound-connect` | `/functions/v1/calls-outbound-connect` | TwiML for outbound call connection | Twilio Voice | — | **CONNECTED** |
| `calls-status-callback` | `/functions/v1/calls-status-callback` | Twilio call status updates (answered, completed, failed) | Twilio Voice | — | **CONNECTED** |
| `calls-voicemail-handler` | `/functions/v1/calls-voicemail-handler` | Processes voicemail recordings and transcriptions | Twilio Voice | — | **CONNECTED** |
| `send-otp` | `/functions/v1/send-otp` | Sends OTP codes via Twilio SMS | Twilio SMS | TWILIO_ACCOUNT_SID ✅, TWILIO_AUTH_TOKEN ✅, TWILIO_PHONE_NUMBER ✅ | **CONNECTED** |
| `verify-otp` | `/functions/v1/verify-otp` | Verifies OTP codes | — | — | **CONNECTED** |

**Webhook URLs for Twilio:**
```
Voice Webhook (POST): https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-inbound-handler
Status Callback (POST): https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-status-callback
Voicemail Handler (POST): https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-voicemail-handler
SMS Webhook (POST): https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/twilio-sms-webhook
```

---

### 📱 MESSAGING (4 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `twilio-sms-webhook` | `/functions/v1/twilio-sms-webhook` | Handles inbound SMS, auto-replies for scheduling keywords | Twilio SMS | TWILIO_* ✅ | **CONNECTED** |
| `send-payment-receipt` | `/functions/v1/send-payment-receipt` | Sends payment receipt via SMS and Email | Twilio SMS, Resend Email | TWILIO_* ✅, RESEND_API_KEY ❌ | **PARTIAL** |
| `send-quote-summary` | `/functions/v1/send-quote-summary` | Sends quote summary via SMS | Twilio SMS | TWILIO_* ✅ | **CONNECTED** |
| `send-schedule-confirmation` | `/functions/v1/send-schedule-confirmation` | Sends delivery confirmation | Twilio SMS | TWILIO_* ✅ | **CONNECTED** |

---

### 🎯 LEADS (12 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `lead-capture` | `/functions/v1/lead-capture` | Website lead capture form handler | — | — | **CONNECTED** |
| `lead-omnichannel` | `/functions/v1/lead-omnichannel` | Multi-channel lead capture with deduplication | — | — | **CONNECTED** |
| `lead-from-quote` | `/functions/v1/lead-from-quote` | Creates lead from saved quote | — | — | **CONNECTED** |
| `lead-from-phone` | `/functions/v1/lead-from-phone` | Creates lead from phone call | — | — | **CONNECTED** |
| `lead-from-sms` | `/functions/v1/lead-from-sms` | Creates lead from SMS conversation | — | — | **CONNECTED** |
| `lead-from-meta` | `/functions/v1/lead-from-meta` | Meta (FB/IG/WhatsApp) webhook handler | Meta Graph API | META_VERIFY_TOKEN ❌ | **MISSING** |
| `lead-from-google-ads` | `/functions/v1/lead-from-google-ads` | Google Ads lead form webhook | Google Ads | — | **CONNECTED** |
| `lead-manual-add` | `/functions/v1/lead-manual-add` | Manual lead creation by staff | — | — | **CONNECTED** |
| `lead-ai-classify` | `/functions/v1/lead-ai-classify` | AI classification of lead intent/type | Lovable AI | LOVABLE_API_KEY ✅ | **CONNECTED** |
| `lead-export` | `/functions/v1/lead-export` | Export leads to CSV/JSON | — | — | **CONNECTED** |
| `ai-chat-lead` | `/functions/v1/ai-chat-lead` | AI chatbot lead qualification | Lovable AI | LOVABLE_API_KEY ✅ | **CONNECTED** |
| `ai-sales-chat` | `/functions/v1/ai-sales-chat` | AI-powered sales chat assistant | Lovable AI | LOVABLE_API_KEY ✅ | **CONNECTED** |

**Webhook URLs for Lead Sources:**
```
Website Form: https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-capture
Meta (FB/IG): https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-meta
Google Ads: https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-google-ads
```

---

### 📊 ADS (2 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `ads-generate-campaigns` | `/functions/v1/ads-generate-campaigns` | Generates campaign structures for markets | Google Ads API (LIVE mode) | GOOGLE_ADS_* ❌ | **DRY_RUN** |
| `ads-capacity-guard` | `/functions/v1/ads-capacity-guard` | Pauses/adjusts campaigns based on inventory | Google Ads API (LIVE mode) | GOOGLE_ADS_* ❌ | **DRY_RUN** |

**Note:** Ads functions work in `DRY_RUN` mode (DB-only) without Google Ads credentials. LIVE mode requires:
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`

---

### 💰 BILLING/PAYMENTS (6 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `process-payment` | `/functions/v1/process-payment` | Process card payments via Accept.js | Authorize.Net | AUTHNET_API_LOGIN_ID ✅, AUTHNET_TRANSACTION_KEY ✅ | **CONNECTED** |
| `process-refund` | `/functions/v1/process-refund` | Process refunds via Authorize.Net | Authorize.Net | AUTHNET_* ✅ | **CONNECTED** |
| `authnet-webhook` | `/functions/v1/authnet-webhook` | Authorize.Net webhook handler | Authorize.Net | AUTHNET_SIGNATURE_KEY ✅ | **CONNECTED** |
| `create-hosted-session` | `/functions/v1/create-hosted-session` | Creates Authorize.Net hosted payment session | Authorize.Net | AUTHNET_* ✅ | **CONNECTED** |
| `send-payment-request` | `/functions/v1/send-payment-request` | Sends payment link via SMS | Twilio SMS | TWILIO_* ✅ | **CONNECTED** |
| `overdue-billing-daily` | `/functions/v1/overdue-billing-daily` | Daily overdue billing automation | — | — | **CONNECTED** |

---

### 🚚 DISPATCH/OPS (7 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `truck-route` | `/functions/v1/truck-route` | Truck-aware routing via Google Routes API | Google Maps | GOOGLE_MAPS_API_KEY ✅ | **CONNECTED** |
| `geocode-address` | `/functions/v1/geocode-address` | Address geocoding and autocomplete | Google Maps | GOOGLE_MAPS_API_KEY ✅ | **CONNECTED** |
| `nearest-facilities` | `/functions/v1/nearest-facilities` | Finds nearest disposal facilities | Google Maps | GOOGLE_MAPS_API_KEY ✅ | **CONNECTED** |
| `update-days-out` | `/functions/v1/update-days-out` | Updates asset days_out counters | — | — | **CONNECTED** |
| `run-automations` | `/functions/v1/run-automations` | Triggers dispatch automations | — | — | **CONNECTED** |
| `analyze-waste` | `/functions/v1/analyze-waste` | AI-powered waste analysis from photos | Lovable AI | LOVABLE_API_KEY ✅ | **CONNECTED** |
| `generate-internal-pdf` | `/functions/v1/generate-internal-pdf` | Generates dispatch documents | — | — | **CONNECTED** |

---

### 🤖 MASTER_AI (4 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `master-ai-worker` | `/functions/v1/master-ai-worker` | Processes AI job queue (Control Tower, Daily Brief, etc.) | — | — | **CONNECTED** |
| `master-ai-scheduler` | `/functions/v1/master-ai-scheduler` | Enqueues scheduled AI jobs (pg_cron trigger) | — | — | **CONNECTED** |
| `master-ai-notifier` | `/functions/v1/master-ai-notifier` | Sends notifications from outbox (IN_APP, Slack, etc.) | Slack, Google Chat (optional) | — | **CONNECTED** |
| `master-ai-admin` | `/functions/v1/master-ai-admin` | Admin controls for Master AI | — | — | **CONNECTED** |

---

### 📝 QUOTES/CONTRACTS (5 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `save-quote` | `/functions/v1/save-quote` | Saves quote and triggers CRM sync | HighLevel CRM | HIGHLEVEL_API_KEY ✅ | **CONNECTED** |
| `create-order-from-quote` | `/functions/v1/create-order-from-quote` | Converts quote to order | — | — | **CONNECTED** |
| `send-contract` | `/functions/v1/send-contract` | Sends contract for signature | Twilio SMS | TWILIO_* ✅ | **CONNECTED** |
| `send-service-receipt` | `/functions/v1/send-service-receipt` | Sends service completion receipt | Twilio SMS, Resend | TWILIO_* ✅, RESEND ❌ | **PARTIAL** |
| `quote-ai-recommend` | `/functions/v1/quote-ai-recommend` | AI-powered size/material recommendations | Lovable AI | LOVABLE_API_KEY ✅ | **CONNECTED** |

---

### 🔐 SECURITY/AUTH (2 functions)

| Function | Endpoint | Description | External Services | Env Vars (Present) | Status |
|----------|----------|-------------|-------------------|-------------------|--------|
| `validate-session` | `/functions/v1/validate-session` | Validates customer portal sessions | — | — | **CONNECTED** |
| `highlevel-webhook` | `/functions/v1/highlevel-webhook` | Syncs contacts to HighLevel CRM | HighLevel CRM | HIGHLEVEL_API_KEY ✅, HIGHLEVEL_LOCATION_ID ✅ | **CONNECTED** |

---

## Integration Configuration Guide

### 1. Twilio (Voice & SMS) ✅ CONNECTED

**Status:** All credentials present

**Configuration Required:**
1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to Phone Numbers → Manage → Active Numbers
3. For each number, configure:
   - **Voice Webhook (HTTP POST):** `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-inbound-handler`
   - **Status Callback URL:** `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-status-callback`
   - **SMS Webhook (HTTP POST):** `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/twilio-sms-webhook`

**Verification:**
```bash
curl -X POST https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "5101234567"}'
```

---

### 2. Authorize.Net (Payments) ✅ CONNECTED

**Status:** All credentials present

**Environment:** Currently using sandbox (apitest.authorize.net). Set `AUTHNET_ENV=production` for live.

**Verification:**
Test payment flow in the customer portal or admin billing page.

---

### 3. Google Maps ✅ CONNECTED

**Status:** API key present

**APIs Required:**
- Places API (geocoding, autocomplete)
- Routes API (truck routing)
- Distance Matrix API (optional)

**Verification:**
```bash
curl -X POST https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/truck-route \
  -H "Content-Type: application/json" \
  -d '{"originLat":37.7799,"originLng":-122.2264,"destinationLat":37.7766,"destinationLng":-122.2198}'
```

---

### 4. HighLevel CRM ✅ CONNECTED

**Status:** All credentials present

**Usage:** Automatic contact sync on quote save.

---

### 5. Resend (Email) ❌ MISSING

**Status:** `RESEND_API_KEY` not configured

**Functions Affected:**
- `send-payment-receipt` (email portion)
- `send-service-receipt` (email portion)

**Setup Steps:**
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create API key
3. Add to Lovable Cloud secrets: `RESEND_API_KEY`
4. Verify domain `calsandumpsterspro.com` in Resend for production sending

---

### 6. Meta (Facebook/Instagram) ❌ MISSING

**Status:** `META_VERIFY_TOKEN` not configured

**Functions Affected:**
- `lead-from-meta`

**Setup Steps:**
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create/configure app with Messenger and Instagram webhooks
3. Add secrets:
   - `META_VERIFY_TOKEN` (any secure string)
   - `META_APP_SECRET` (from app settings)
4. Configure webhook URL: `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-meta`

---

### 7. Google Ads API ❌ NOT CONFIGURED (DRY_RUN MODE)

**Status:** Operating in DRY_RUN mode (database-only)

**Functions Affected:**
- `ads-generate-campaigns` (DB only, no API sync)
- `ads-capacity-guard` (DB only, no API sync)

**Required for LIVE Mode:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Ads API
3. Create OAuth credentials
4. Add secrets:
   - `GOOGLE_ADS_CLIENT_ID`
   - `GOOGLE_ADS_CLIENT_SECRET`
   - `GOOGLE_ADS_DEVELOPER_TOKEN`
   - `GOOGLE_ADS_REFRESH_TOKEN`
   - `GOOGLE_ADS_CUSTOMER_ID` (format: XXX-XXX-XXXX)

---

## UI Routes Using Edge Functions

| Route | Functions Used |
|-------|---------------|
| `/quote` | `save-quote`, `geocode-address`, `truck-route`, `highlevel-webhook` |
| `/admin/telephony/*` | `calls-inbound-handler`, `calls-status-callback`, `calls-voicemail-handler` |
| `/admin/ads/*` | `ads-generate-campaigns`, `ads-capacity-guard` |
| `/admin/leads/*` | `lead-*` functions, `lead-ai-classify` |
| `/sales/calls` | Telephony functions |
| `/cs/calls` | Telephony functions |
| `/billing/*` | `process-payment`, `process-refund`, `send-payment-receipt` |
| `/dispatch/*` | `truck-route`, `run-automations` |
| Customer Portal | `validate-session`, `send-otp`, `verify-otp` |

---

## Quick Reference: All Webhook URLs

```
# TWILIO VOICE
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-inbound-handler
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-status-callback
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-voicemail-handler

# TWILIO SMS
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/twilio-sms-webhook

# AUTHORIZE.NET
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/authnet-webhook

# LEADS
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-capture
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-meta
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-google-ads

# CRM
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/highlevel-webhook
```

---

## Current Mode Status

| System | Mode | Notes |
|--------|------|-------|
| `telephony.mode` | `DRY_RUN` | Ready for LIVE activation |
| `ads.mode` | `DRY_RUN` | Requires Google Ads credentials for LIVE |
| `messaging.mode` | `DRY_RUN` | SMS/Email automations logged only |
| `master_ai.mode` | `LIVE_INTERNAL` | Internal notifications active, customer messaging blocked |
| `leads.ai_mode` | `DRY_RUN` | AI classification logged only |

---

*Last updated: 2026-01-27*
