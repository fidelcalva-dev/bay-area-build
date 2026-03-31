# Unified Lead Intake Audit

> Last updated: 2026-03-31

## Entry Points

| Entry Point | Route | Brand | Service Line | Handler | Lead Created | Quote Session | Data Saved | Issue | Status |
|---|---|---|---|---|---|---|---|---|---|
| Dumpster Quote Flow | `/quote` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` (progressive) | ✅ | ✅ | ✅ | None | ✅ OK |
| Cleanup Quote | `/cleanup/quote` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | `lead-ingest` | ✅ | ✅ | ✅ | None | ✅ OK |
| Main Contact Form | `/contact-us` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` | ✅ | ❌ | ✅ | None | ✅ OK |
| Cleanup Contact | `/cleanup/contact` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | `lead-ingest` | ✅ | ❌ | ✅ | None | ✅ OK |
| Contractor Application | `/contractor-application` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `contractor_applications` + `lead-ingest` | ✅ | ❌ | ✅ | None | ✅ OK |
| AI Chat (useAIChat) | Widget | Both | Dynamic | `ai-chat-lead` → GHL + `lead-ingest` | ✅ | ❌ | ✅ | Indirect via ai-chat-lead | ✅ OK |
| Calsan Chat (useCalsanChat) | Widget | Both | Dynamic | `lead-ingest` | ✅ | ❌ | ✅ | None | ✅ OK |
| Quick Order | `/quick-order` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` | ✅ | ✅ | ✅ | None | ✅ OK |
| Schedule Delivery | `/schedule-delivery` | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-ingest` | ✅ | ❌ | ✅ | None | ✅ OK |
| Manual Staff Lead | `/sales/leads` Add | Both | Dynamic | `lead-ingest` | ✅ | ❌ | ✅ | None | ✅ OK |
| GHL Webhook | Inbound | Both | Dynamic | `ghl-webhook-inbound` → `lead-ingest` | ✅ | ❌ | ✅ | None | ✅ OK |
| Google Ads | Webhook | CALSAN_DUMPSTERS_PRO | DUMPSTER | `lead-from-google-ads` | ✅ | ❌ | ✅ | None | ✅ OK |
| Meta Ads | Webhook | Both | Dynamic | `lead-from-meta` | ✅ | ❌ | ✅ | None | ✅ OK |
| Phone Inbound | Twilio | Both | Dynamic | `lead-from-phone` | ✅ | ❌ | ✅ | None | ✅ OK |
| SMS Inbound | Twilio | Both | Dynamic | `lead-from-sms` | ✅ | ❌ | ✅ | None | ✅ OK |
| lead-capture (legacy) | Edge function | Both | Dynamic | Delegates to `lead-ingest` | ✅ | ❌ | ✅ | Pass-through | ✅ OK |

## Summary

- **16+ channels audited** — all converge on `lead-ingest`
- **0 disconnected** channels
- All entry points set `source_channel`, `brand`, `lead_intent`, and `service_line`
- Contractor applications save to both `contractor_applications` table and `sales_leads` via `lead-ingest`
- AI chat sessions persist in `ai_chat_sessions`/`ai_chat_messages` and link to leads via `ai_conversation_id`
