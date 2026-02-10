

# Google Ads Full Integration Plan

## Overview

This plan connects your website to Google Ads end-to-end: capturing click attribution, firing conversion events, syncing metrics from the Google Ads API, and displaying it all in the existing admin dashboard. Everything respects DRY_RUN mode and keeps secrets server-side.

---

## What Already Exists

- **Database**: `ads_accounts`, `ads_campaigns`, `ads_adgroups`, `ads_keywords`, `ads_metrics`, `ads_sync_log`, `ads_alerts`, `ads_markets` tables are all in place.
- **Leads**: `sales_leads` already stores `gclid`, `utm_source`, `utm_campaign`, `utm_term`.
- **Admin UI**: `/admin/ads/overview`, `/admin/ads/campaigns`, `/admin/ads/markets`, `/admin/ads/rules`, `/admin/ads/logs` pages exist.
- **Edge Functions**: `lead-from-google-ads`, `ads-capacity-guard`, `ads-generate-campaigns` deployed.
- **No tracking code exists on the website** (no GTM, no GA4, no gclid capture).

---

## Phase 1 -- Attribution Capture (gclid + UTMs)

### 1a. Add attribution columns to `quotes`, `orders`, `payments`

Database migration to add:

```text
quotes:   gclid, utm_source, utm_campaign, utm_medium, utm_term, utm_content
orders:   gclid, utm_source, utm_campaign, utm_medium, utm_term, utm_content
payments: gclid, utm_source, utm_campaign, utm_medium, utm_term, utm_content
```

All nullable text columns with no constraints.

### 1b. Create `src/lib/attributionTracker.ts`

A small utility that:
- On page load, reads `gclid`, `utm_source`, `utm_campaign`, `utm_medium`, `utm_term`, `utm_content` from URL search params.
- Stores them in `sessionStorage` (session-scoped, privacy-friendly).
- Also stores first-touch values in `localStorage` if not already set.
- Exports a `getAttribution()` function returning `{ gclid, utm_source, utm_campaign, utm_medium, utm_term, utm_content }`.

### 1c. Hook into the app entry point

- Call the capture function once in `App.tsx` (or a layout wrapper) on mount so every landing page captures params.

### 1d. Pass attribution through the quote/order/payment flow

- Update `save-quote` edge function to accept and insert `gclid`, `utm_source`, `utm_campaign`, `utm_medium`, `utm_term`, `utm_content`.
- Update the Quote page component to include attribution data from `getAttribution()` when calling `save-quote`.
- Similarly, when `create-order-from-quote` runs, copy attribution from the quote to the order.
- When `process-payment` runs, copy attribution from the order to the payment.

---

## Phase 2 -- GTM / GA4 Conversion Events

### 2a. Add tracking config to `config_settings`

Insert these rows (via insert tool):

```text
ads | tracking_mode  | "GTM"    (options: GTM, SERVER, OFF)
ads | gtm_container_id | ""      (e.g., "GTM-XXXXXXX")
ads | ga4_measurement_id | ""   (e.g., "G-XXXXXXXXXX")
ads | conversion_actions | {}   (JSON map of event -> conversion action ID)
ads | mode | "DRY_RUN"          (already exists, reuse)
```

### 2b. Create `src/lib/trackingService.ts`

- Fetches `ads.tracking_mode` and `ads.gtm_container_id` from `config_settings`.
- If mode is `GTM` and container ID is set, injects the GTM script into `<head>`.
- Exposes `trackEvent(eventName, params)` that pushes to `window.dataLayer`.
- Supported events: `lead_submitted`, `quote_saved`, `order_confirmed`, `payment_captured`.
- If mode is `OFF`, all calls are no-ops.

### 2c. Fire events at key conversion points

- **Quote page**: After successful `save-quote`, call `trackEvent('quote_saved', { value, size, zip })`.
- **Lead capture**: After lead creation, call `trackEvent('lead_submitted', { channel })`.
- **Order confirmation**: After order creation, call `trackEvent('order_confirmed', { order_id, value })`.
- **Payment success**: After payment captured, call `trackEvent('payment_captured', { value, gclid })`.

### 2d. Consent-aware loading

- GTM script only loads if `ads.tracking_mode !== 'OFF'`.
- A simple cookie consent banner component can be added as a follow-up (not blocking).

---

## Phase 3 -- Server-Side Conversion Upload

### 3a. Create Edge Function: `google-ads-upload-conversion`

- Triggered after `payment_captured` (called from `process-payment` function).
- If `ads.mode !== 'LIVE'` or Google Ads secrets missing, log to `ads_sync_log` as DRY_RUN and return.
- If LIVE: Use the Google Ads API offline conversion upload endpoint.
  - Requires: `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`.
  - Sends: `gclid`, `conversion_action`, `conversion_date_time`, `conversion_value`, `currency_code`.
- Logs result to `ads_sync_log`.

---

## Phase 4 -- Google Ads Metrics Sync

### 4a. Create Edge Function: `google-ads-sync-metrics`

- If `ads.mode !== 'LIVE'`, return immediately with DRY_RUN status.
- If LIVE:
  - Obtain OAuth access token using refresh token.
  - Execute GAQL query: `SELECT campaign.id, campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value, segments.date FROM campaign WHERE segments.date DURING LAST_7_DAYS`.
  - Upsert results into `ads_metrics` table (keyed on campaign_id + date).
  - Log sync to `ads_sync_log`.
- Designed to be called on a daily cron or manually from the admin UI.

### 4b. Add "Sync Metrics" button to `/admin/ads/overview`

- New button alongside existing "Check Capacity" and "Generate Campaigns".
- Calls `supabase.functions.invoke('google-ads-sync-metrics')`.
- Shows sync result toast.

### 4c. Enhance Overview with ROAS card

- Add a ROAS metric card to the existing 4-card grid (making it 5 or rearranging).

---

## Phase 5 -- Admin UI Enhancements

### 5a. Add credential status banner to `/admin/ads/overview`

- If `ads.mode === 'DRY_RUN'` or required secrets are missing, show a yellow banner:
  "Google Ads API is not connected. Configure credentials to enable live sync."
- Link to `/admin/setup/what-missing` for setup instructions.

### 5b. Add attribution column to campaign table

- In `/admin/ads/campaigns`, add a ROAS column from synced metrics.

---

## Phase 6 -- Capacity Guard Tie-In

No new work needed. The existing `ads-capacity-guard` function already pauses campaigns and adjusts messaging tiers based on inventory thresholds. The "Check Capacity" button on the overview page already triggers it.

---

## Technical Details

### Files to Create
1. `src/lib/attributionTracker.ts` -- URL param capture + storage
2. `src/lib/trackingService.ts` -- GTM/dataLayer manager
3. `supabase/functions/google-ads-sync-metrics/index.ts` -- Metrics pull from Google Ads API
4. `supabase/functions/google-ads-upload-conversion/index.ts` -- Server-side conversion upload

### Files to Modify
1. `index.html` -- (no change; GTM injected dynamically)
2. `src/App.tsx` -- Add attribution capture on mount
3. `src/pages/Quote.tsx` or the quote calculator component -- Pass attribution to save-quote
4. `supabase/functions/save-quote/index.ts` -- Accept and persist attribution fields
5. `supabase/functions/process-payment/index.ts` -- Trigger conversion upload after payment
6. `src/pages/admin/ads/AdsOverview.tsx` -- Add sync button, credential banner, ROAS card
7. `supabase/config.toml` -- Register new edge functions

### Database Changes
1. Migration: Add `gclid`, `utm_source`, `utm_campaign`, `utm_medium`, `utm_term`, `utm_content` to `quotes`, `orders`, `payments`.
2. Insert: Add `config_settings` rows for `ads.tracking_mode`, `ads.gtm_container_id`, `ads.ga4_measurement_id`, `ads.conversion_actions`.

### Security
- No API keys in frontend code.
- GTM container ID is safe to store in `config_settings` (it's a public identifier).
- All Google Ads API calls happen in edge functions using Cloud secrets.
- DRY_RUN mode is the default; LIVE requires all 5 Google Ads secrets to be present.

