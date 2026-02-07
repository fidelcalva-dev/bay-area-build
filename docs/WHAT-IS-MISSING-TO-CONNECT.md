# What's Missing to Connect — Production Readiness Report

> **Generated:** 2026-02-06  
> **Project:** Calsan Dumpster Rental Platform  
> **Supabase Project ID:** tvcwzohfycwfaqjyruow  
> **Base URL:** `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1`

---

## Go-Live Readiness: CONDITIONAL

All P0 items must be DONE before production activation.

---

## P0 — GO-LIVE BLOCKERS

### 1. Authorize.Net Webhook Configuration
**Category:** PAYMENTS  
**Status:** OPEN  
**What:** Payment status webhooks must fire to update order billing in real-time.

**Webhook URL:**
```
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/authnet-webhook
```

**Steps:**
1. Go to [Authorize.Net Merchant Dashboard](https://account.authorize.net)
2. Navigate to Account → Webhooks
3. Add new webhook endpoint with the URL above
4. Subscribe to events:
   - `net.authorize.payment.authcapture.created`
   - `net.authorize.payment.refund.created`
5. Set status to **Active**
6. Save

**Verify:** Process a test payment and check edge function logs for `authnet-webhook`.

---

### 2. Twilio Voice Webhook Configuration
**Category:** TELEPHONY  
**Status:** OPEN  
**What:** Inbound calls need to route to agents via webhooks.

**Webhook URLs:**
```
Voice Webhook (POST):     https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-inbound-handler
Status Callback (POST):   https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-status-callback
Voicemail Handler (POST): https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/calls-voicemail-handler
```

**Steps:**
1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Select your number
4. Under **Voice & Fax**:
   - Set "A Call Comes In" Webhook URL to `calls-inbound-handler`
   - Set "Status Callback URL" to `calls-status-callback`
5. Save changes

**Verify:** Make a test call to the Twilio number, check `call_events` table.

---

### 3. Twilio SMS Webhook Configuration
**Category:** TELEPHONY  
**Status:** OPEN  
**What:** Inbound SMS auto-replies and lead capture require webhook.

**Webhook URL:**
```
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/twilio-sms-webhook
```

**Steps:**
1. In Twilio Console → Phone Numbers → Active Numbers
2. Under **Messaging**, set Webhook URL to the URL above
3. Save

**Verify:** Send a test SMS, check `sms_messages` table.

---

### 4. Authorize.Net API Credentials (if missing)
**Category:** PAYMENTS  
**Env Vars:** `AUTHNET_API_LOGIN_ID`, `AUTHNET_TRANSACTION_KEY`, `AUTHNET_SIGNATURE_KEY`

**Steps:**
1. Go to Authorize.Net → Account → Settings → API Credentials & Keys
2. Copy API Login ID, Transaction Key, and Signature Key
3. Add as Cloud secrets

---

### 5. Twilio API Credentials (if missing)
**Category:** TELEPHONY  
**Env Vars:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

**Steps:**
1. Go to [Twilio Console](https://console.twilio.com)
2. Copy Account SID and Auth Token from dashboard
3. Get your Phone Number from Phone Numbers → Active Numbers
4. Add all 3 as Cloud secrets

---

### 6. Google Maps API Key (if missing)
**Category:** MAPS  
**Env Vars:** `GOOGLE_MAPS_API_KEY`

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable: Places API, Routes API, Distance Matrix API
3. Create API key, restrict to your domain
4. Add as Cloud secret: `GOOGLE_MAPS_API_KEY`

---

## P1 — IMPORTANT (Can Launch Without)

### 7. Resend Email API Key
**Category:** EMAIL  
**Env Vars:** `RESEND_API_KEY`  
**Impact:** Email receipts (payment & service) won't send without this.

**Steps:**
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create API key
3. Add as Cloud secret: `RESEND_API_KEY`
4. Verify domain `calsandumpsterspro.com` in Resend for production sending

---

### 8. Meta (FB/IG/WhatsApp) Lead Integration
**Category:** LEADS  
**Env Vars:** `META_VERIFY_TOKEN`, `META_APP_SECRET`

**Webhook URL:**
```
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-meta
```

**Steps:**
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create/configure app with Messenger & Instagram webhooks
3. Add secrets:
   - `META_VERIFY_TOKEN` (any secure string you choose)
   - `META_APP_SECRET` (from app settings)
4. Set webhook URL to the URL above

---

### 9. GoHighLevel Inbound Webhook
**Category:** MESSAGING  
**Impact:** CRM sync for contacts, notes, and call logs.

**Webhook URL:**
```
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/ghl-webhook-inbound
```

**Steps:**
1. Go to GoHighLevel → Settings → Webhooks
2. Add webhook URL above
3. Select events: Contact Created, Contact Updated, Note Created
4. Save

---

### 10. Google Workspace OAuth Credentials
**Category:** GOOGLE_WORKSPACE  
**Env Vars:** `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_ENCRYPTION_KEY`

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Set authorized redirect URI:
   ```
   https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/google-oauth-callback
   ```
4. Add secrets: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
5. Generate a 32-char encryption key → `GOOGLE_ENCRYPTION_KEY`

---

### 11. Google Chat Webhook for Notifications
**Category:** GOOGLE_WORKSPACE  
**Env Vars:** `GOOGLE_CHAT_WEBHOOKS`

**Steps:**
1. In Google Chat, create a Space for notifications
2. Space Settings → Apps & Integrations → Manage Webhooks
3. Create webhook, copy URL
4. Add as Cloud secret: `GOOGLE_CHAT_WEBHOOKS` (JSON array)

---

## P2 — NICE TO HAVE

### 12. Google Ads API Credentials
**Category:** ADS  
**Env Vars:** `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`  
**Current Mode:** DRY_RUN (database-only operations)

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Ads API
3. Create OAuth 2.0 credentials
4. Add all 5 secrets to Cloud

---

### 13. Enable Leaked Password Protection
**Category:** SECURITY  
**Type:** Manual setting

**Steps:**
1. Go to Cloud View → Authentication → Settings
2. Enable "Leaked Password Protection"
3. Save

---

### 14. Move Extensions Out of Public Schema
**Category:** SECURITY  
**Type:** Database migration

**Steps:**
1. Create an `extensions` schema if not exists
2. Move `pg_net` and other extensions to the extensions schema
3. Update search_path if needed

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
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-meta
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/lead-from-google-ads

# CRM (GHL)
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/ghl-webhook-inbound

# GOOGLE OAUTH CALLBACK
https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1/google-oauth-callback
```

---

*Last updated: 2026-02-06*
