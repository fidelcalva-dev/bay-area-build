# INTEGRATION STATUS MATRIX

> Updated: 2026-03-19

## Status Legend

| Status | Meaning |
|--------|---------|
| LIVE | Fully operational, data flowing |
| DRY_RUN | Code deployed, messaging gated by safety mode |
| NEEDS_ENV | Routes and code ready, awaiting credentials/provider setup |
| FAILING | Deployed but returning errors |
| DISABLED | Intentionally turned off |

## Integration Registry

| # | Integration | Status | Canonical Edge Functions | Admin Route | Config Route | Blocker |
|---|-------------|--------|------------------------|-------------|--------------|---------|
| 1 | Google Maps | LIVE | get-maps-key | /dispatch/control-tower | — | — |
| 2 | Lead Ingest | LIVE | lead-ingest, lead-from-quote, lead-from-phone, lead-from-sms, lead-from-meta, lead-from-google-ads, lead-manual-add | /sales/leads | /admin/leads/settings | — |
| 3 | Lead SLA | LIVE | lead-sla-monitor | /admin/alerts | — | — |
| 4 | Quote Save | LIVE | save-quote | /quote | /admin/pricing | — |
| 5 | AI Assistant | LIVE | website-assistant, calsan-dumpster-ai, quote-ai-recommend | /quote | /admin/ai/performance | — |
| 6 | AI Control | LIVE | ai-control-brain, ai-action-runner | /admin/ai/control-center | — | — |
| 7 | Assistant Learning | LIVE | assistant-learning | /admin/ai/performance | — | — |
| 8 | Internal Alerts | LIVE | internal-alert-dispatcher | /admin/notifications/internal | /admin/notifications-config | — |
| 9 | Track Events | LIVE | track-event | — | — | — |
| 10 | Search Index | LIVE | search-index-backfill | /admin/setup/search-index | — | — |
| 11 | Customer Health | LIVE | customer-health-update, customer-health-recalc | /admin/customer-health | — | — |
| 12 | Portal Auth | LIVE | send-portal-link, validate-portal-token | /portal | — | — |
| 13 | Customer Activation | LIVE | send-activation, validate-activation | /admin/activation | — | — |
| 14 | SEO Engine | LIVE | seo-generate-page, seo-refresh-pages, seo-generate-grid-page, seo-audit-pages | /admin/seo/dashboard | — | — |
| 15 | PDF Generation | LIVE | generate-internal-pdf | /admin/customers/:id | — | — |
| 16 | Push Notifications | LIVE | push-register-device, push-send | — | — | — |
| 17 | Camera/Fleet | LIVE | camera-webhook, camera-clip-url, link-camera-event | /admin/fleet/cameras | — | — |
| 18 | GHL Omnichannel | DRY_RUN | ghl-send-outbound, ghl-webhook-inbound, ghl-sync-poller, highlevel-webhook | /admin/ghl | /admin/ghl | GHL API credentials |
| 19 | Quote Sending | DRY_RUN | send-outbound-quote | /sales/quotes | — | Messaging mode gate |
| 20 | Contract Sending | DRY_RUN | send-quote-contract | /admin/customers/:id | — | Email provider |
| 21 | Telephony | NEEDS_ENV | calls-inbound-handler, calls-outbound-connect, calls-status-callback, calls-voicemail-handler | /admin/telephony | /admin/telephony | Twilio credentials |
| 22 | Email Sending | NEEDS_ENV | send-test-email, google-send-email | /admin/email-config | /admin/email-config | Email domain setup |
| 23 | Payment Gateway | NEEDS_ENV | — | /finance/payments | — | Authorize.Net credentials |
| 24 | Google Ads | NEEDS_ENV | google-ads-sync-metrics, google-ads-upload-conversion | /admin/ads | /admin/ads/markets | Google Ads API key |
| 25 | Google Workspace | NEEDS_ENV | google-oauth-start, google-oauth-callback, google-create-meet, google-drive-folder, google-chat-webhook | /admin/google | /admin/google/setup | Google OAuth credentials |
| 26 | GA4 Analytics | NEEDS_ENV | ga4-fetch | /admin/marketing/dashboard | — | GA4 credentials |
| 27 | Search Console | NEEDS_ENV | gsc-fetch | /admin/seo/metrics | — | GSC credentials |
| 28 | GBP Insights | NEEDS_ENV | gbp-fetch-insights | /admin/local/google-business | — | GBP API credentials |

## Deprecated Functions (Removed)

| Function | Replaced By | Removed Date |
|----------|-------------|-------------|
| ghl-send-message | ghl-send-outbound | 2026-03-19 |
| ghl-message-worker | ghl-send-outbound | 2026-03-19 |
| ghl-inbound-webhook | ghl-webhook-inbound | 2026-03-19 |
