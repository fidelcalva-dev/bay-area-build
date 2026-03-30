# Lead Intake Matrix

> Last updated: 2026-03-30

## Entry Points

| Entry Point | Brand | Service Line | Intent | Handler | Lead Created | Quote Session | Draft Quote | Status |
|---|---|---|---|---|---|---|---|---|
| `/quote` | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST | lead-ingest | ✅ | ✅ | ✅ | ✅ |
| `/cleanup/quote` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | QUOTE_REQUEST | lead-ingest | ✅ | ✅ | N/A | ✅ |
| `/contact` | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTACT_REQUEST | lead-ingest | ✅ | ❌ | ❌ | ✅ |
| `/cleanup/contact` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | CONTACT_REQUEST | lead-ingest | ✅ | ❌ | ❌ | ✅ |
| `/contractors` | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTRACTOR_APPLICATION | lead-ingest | ✅ | ❌ | ❌ | ✅ |
| `/cleanup/for-contractors` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | CONTRACTOR_APPLICATION | lead-ingest | ✅ | ❌ | ❌ | ✅ |
| AI Chat | Auto-detected | Auto-detected | CHAT_HANDOFF | lead-ingest | ✅ | ❌ | ❌ | ✅ |
| Schedule Delivery | CALSAN_DUMPSTERS_PRO | DUMPSTER | SCHEDULE_REQUEST | schedule-delivery | ✅ | ❌ | ❌ | ✅ |
| Phone Inbound | Auto-detected | DUMPSTER | CALLBACK_REQUEST | lead-from-phone | ✅ | ❌ | ❌ | ✅ |
| SMS Inbound | Auto-detected | DUMPSTER | CONTACT_REQUEST | twilio-sms-webhook | ✅ | ❌ | ❌ | ✅ |
| Google Ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST | lead-from-google-ads | ✅ | ❌ | ❌ | ✅ |
| Meta Ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST | lead-from-meta | ✅ | ❌ | ❌ | ✅ |
| Manual Staff | Selectable | Selectable | MANUAL_STAFF_LEAD | lead-ingest | ✅ | ❌ | ❌ | ✅ |
| GHL Inbound | Auto-detected | DUMPSTER | CONTACT_REQUEST | ghl-webhook-inbound | ✅ | ❌ | ❌ | ✅ |

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
