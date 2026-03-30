# Lead Intake Matrix

> Last updated: 2026-03-30

## Entry Points

| Entry Point | Brand | Service Line | Intent | Handler | source_channel | Lead Created | Quote Session | Draft Quote | Status |
|---|---|---|---|---|---|---|---|---|---|
| `/quote` (V3QuoteFlow) | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST | lead-ingest | `QUOTE_FLOW` | ✅ | ✅ | ✅ | ✅ Fixed — added brand/intent |
| `/cleanup/quote` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | QUOTE_REQUEST | lead-ingest | `CLEANUP_WEBSITE` | ✅ | ✅ | N/A | ✅ |
| `/cleanup/contact` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | CONTACT_REQUEST | lead-ingest | `CLEANUP_CONTACT` | ✅ | ❌ | ❌ | ✅ |
| `/cleanup/for-contractors` | — | — | — | Links to /cleanup/quote | — | ❌ (landing page) | ❌ | ❌ | ✅ By design |
| `/contact-us` | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTACT_REQUEST | lead-ingest | `CONTACT_FORM` | ✅ | ❌ | ❌ | ✅ |
| `/contractor-application` | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTRACTOR_APPLICATION | lead-ingest | `CONTRACTOR_APPLICATION` | ✅ | ❌ | ❌ | ✅ |
| AI Chat | CALSAN_DUMPSTERS_PRO | DUMPSTER | CHAT_HANDOFF | lead-ingest | `AI_CHAT` | ✅ | ❌ | ❌ | ✅ Fixed — added brand/intent/service_line |
| Homepage AI Assistant | CALSAN_DUMPSTERS_PRO | DUMPSTER | — | lead-ingest | `WEBSITE_ASSISTANT` | ✅ | ❌ | ❌ | ✅ Fixed — added brand/source_page/module |
| Quick Order | CALSAN_DUMPSTERS_PRO | DUMPSTER | — | lead-ingest | `QUICK_ORDER` | ✅ | ❌ | ❌ | ✅ Fixed — added brand/service_line |
| Schedule Delivery | CALSAN_DUMPSTERS_PRO | DUMPSTER | SCHEDULE_REQUEST | lead-ingest | `SCHEDULE_DELIVERY` | ✅ | ❌ | ❌ | ✅ Fixed — added brand/intent/service_line |
| Manual Staff | Selectable | Selectable | MANUAL_STAFF_LEAD | lead-ingest | `MANUAL_ENTRY` | ✅ | ❌ | ❌ | ✅ |
| Phone Inbound | Auto-detected | DUMPSTER | CALLBACK_REQUEST | lead-from-phone → lead-ingest | `PHONE_INBOUND` | ✅ | ❌ | ❌ | ✅ |
| SMS Inbound | Auto-detected | DUMPSTER | CONTACT_REQUEST | twilio-sms-webhook | `SMS_INBOUND` | ✅ | ❌ | ❌ | ✅ |
| Google Ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST | lead-from-google-ads | `GOOGLE_ADS` | ✅ | ❌ | ❌ | ✅ |
| Meta Ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST | lead-from-meta | `META_ADS` | ✅ | ❌ | ❌ | ✅ |
| GHL Inbound | Auto-detected | DUMPSTER | CONTACT_REQUEST | ghl-webhook-inbound → lead-ingest | `GHL_INBOUND` | ✅ | ❌ | ❌ | ✅ |
| save-quote (final) | Auto-detected | DUMPSTER | QUOTE_REQUEST | save-quote → lead-ingest | `WEBSITE_QUOTE` | ✅ | ✅ | ✅ | ✅ |
| Media Upload (AI Chat) | CALSAN_DUMPSTERS_PRO | DUMPSTER | PHOTO_REVIEW | lead-ingest | `WEBSITE_MEDIA` | ✅ | ❌ | ❌ | ✅ |

## Required Fields per Lead

All leads capture:
- `brand` — CALSAN_DUMPSTERS_PRO or CALSAN_CD_WASTE_REMOVAL
- `service_line` — DUMPSTER, CLEANUP, or BOTH
- `lead_intent` — QUOTE_REQUEST, CONTACT_REQUEST, CONTRACTOR_APPLICATION, etc.
- `source_channel` — canonical source key
- `source_page` — originating URL path
- `source_module` — component module name

## Cleanup-Specific Fields

- `cleanup_service_type` — construction_cleanup, post_construction, demolition_debris, recurring
- `project_scope` — small, medium, large
- `contractor_flag` — boolean
- `recurring_service_flag` — boolean
- `needs_site_visit` — boolean
- `photos_uploaded_flag` — boolean

## Bundle Detection

- If `need_dumpster_too = true` on cleanup form → `service_line = BOTH`, `bundle_opportunity_flag = true`
- If form indicates both services → auto-set bundle fields

## Fixes Applied (2026-03-30)

| Entry Point | Issue | Fix |
|---|---|---|
| V3QuoteFlow | Missing `brand`, `lead_intent` | Added `CALSAN_DUMPSTERS_PRO`, `QUOTE_REQUEST` |
| CalsanAIChat | Missing `brand`, `lead_intent`, `service_line` | Added all three fields |
| HomepageAIAssistant | Missing `brand`, `source_page`, `source_module`, `service_line` | Added all fields |
| QuickOrder | Missing `brand`, `service_line`, `source_page`, `source_module` | Added all fields |
| ScheduleDelivery | Missing `brand`, `lead_intent`, `service_line`, `source_page`, `source_module` | Added all fields |
