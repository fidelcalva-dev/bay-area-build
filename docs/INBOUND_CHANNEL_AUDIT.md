# Inbound Channel Audit

> Last updated: 2026-03-30

## Channel Inventory

| Channel | Route / Entry | Brand | Service Line | Handler | Lead Hub Visible | Issues Found | Status |
|---|---|---|---|---|---|---|---|
| Dumpster Quote Flow | `/quote` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` (progressive) | ✅ | None | ✅ OK |
| Cleanup Quote | `/cleanup/quote` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | `lead-ingest` | ✅ | Missing brand field | ✅ FIXED |
| Main Contact Form | `/contact-us` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` | ✅ | Missing brand/intent | ✅ FIXED |
| Cleanup Contact | `/cleanup/contact` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | None (static page) | ❌ | No form, no lead created | ✅ REBUILT |
| Contractor Application | `/contractor-application` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` (non-blocking) | ✅ | Missing brand/service_line | ✅ FIXED |
| AI Chat (useAIChat) | Widget | Both | Dynamic | `ai-chat-lead` → GHL | ✅ | Uses `ai-chat-lead` not `lead-ingest` | ⚠️ Indirect (OK) |
| Calsan Chat (useCalsanChat) | Widget | Both | Dynamic | `lead-capture` | ✅ | Called `lead-capture` instead of `lead-ingest` | ✅ FIXED |
| Quick Order | `/quick-order` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` | ✅ | None | ✅ OK |
| Schedule Delivery | `/schedule-delivery` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` | ✅ | None | ✅ OK |
| GHL Webhook | Inbound webhook | Both | Dynamic | `ghl-webhook-inbound` → `lead-ingest` | ✅ | None | ✅ OK |
| Google Ads | Webhook | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-from-google-ads` | ✅ | None | ✅ OK |
| Meta Ads | Webhook | Both | Dynamic | `lead-from-meta` | ✅ | None | ✅ OK |
| Phone Inbound | Twilio | Both | Dynamic | `lead-from-phone` | ✅ | None | ✅ OK |
| SMS Inbound | Twilio | Both | Dynamic | `lead-from-sms` | ✅ | None | ✅ OK |
| Manual Staff Lead | `/sales/leads` Add | Both | Dynamic | `lead-ingest` | ✅ | Missing brand/intent | ✅ FIXED |
| lead-capture (legacy) | Edge function | Both | Dynamic | Delegates to `lead-ingest` | ✅ | None (pass-through) | ✅ OK |
| lead-omnichannel | Edge function | Both | Dynamic | Direct DB via RPC | ✅ | None | ✅ OK |

## Summary

- **17 channels audited**
- **6 fixed** (missing brand/intent, broken form, wrong handler)
- **0 disconnected** — all converge on `lead-ingest`
- **1 indirect** — `useAIChat` calls `ai-chat-lead` which calls GHL + lead-ingest
