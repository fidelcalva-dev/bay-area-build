# Final Unified Lead Hub Summary

> Last updated: 2026-03-31

## Lead Sources (All → `lead-ingest` → `sales_leads` → `/sales/leads`)

| Source | Channel Code | Brand | Service Line | Status |
|---|---|---|---|---|
| Dumpster Quote Flow | `QUOTE_FLOW` | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Cleanup Quote | `CLEANUP_WEBSITE` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ |
| Main Contact Form | `CONTACT_FORM` | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Cleanup Contact | `CLEANUP_CONTACT` | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ |
| Contractor Application | `CONTRACTOR_APPLICATION` | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| AI Chat | `AI_CHAT` | Dynamic | Dynamic | ✅ |
| Quick Order | `QUICK_ORDER` | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Schedule Delivery | `SCHEDULE_DELIVERY` | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Manual Staff | `MANUAL_STAFF` / `MANUAL_ENTRY` | Dynamic | Dynamic | ✅ |
| Google Ads | `GOOGLE_ADS` | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ |
| Meta Ads | `META_ADS` | Dynamic | Dynamic | ✅ |
| Phone Inbound | `PHONE_INBOUND` | Dynamic | Dynamic | ✅ |
| SMS Inbound | `SMS_INBOUND` | Dynamic | Dynamic | ✅ |
| GHL Webhook | Various | Dynamic | Dynamic | ✅ |

## What Was Fixed / Added

1. **AI Chat tab** — New "AI Chat" tab in Lead Hub filters leads by AI chat source channels
2. **Contact Form tab** — New "Contact Form" tab filters contact/callback leads
3. **Source labels** — Added `CONTRACTOR_APPLICATION` and `MANUAL_STAFF` to source label map
4. **Tab type** — Extended `LeadHubTab` type with `ai_chat` and `contact_form`

## Service Line Model

| Dimension | Values |
|---|---|
| Brand | `CALSAN_DUMPSTERS_PRO`, `CALSAN_CD_WASTE_REMOVAL` |
| Service Line | `DUMPSTER`, `CLEANUP`, `BOTH` |
| Intent | `QUOTE_REQUEST`, `CONTACT_REQUEST`, `CONTRACTOR_APPLICATION`, `PHOTO_REVIEW`, `SCHEDULE_REQUEST`, `CALLBACK_REQUEST`, `CHAT_HANDOFF`, `MANUAL_STAFF_LEAD`, `UNKNOWN` |

## Board Structure

- **List View**: Default table with all tabs and filters
- **Pipeline Board**: Kanban-style for standard pipeline stages
- **Cleanup Board**: 11-column cleanup-specific board (`?view=cleanup-board`)

## Saved View Tabs

All Leads, New, Needs Follow-Up, My Leads, High Intent, Cleanup, Contractors, Bundle, AI Chat, Contact Form, Existing Customer, High Risk

## Conversion Actions

Call, Text, Create Quote (from table), full detail panel with stage management, notes, quote creation

## Remaining Manual Review Items

1. **Cleanup contractor form** — Consider `/cleanup/for-contractors` with `CLEANUP_CONTRACTOR` channel
2. **AI chat → lead-ingest direct** — `useAIChat` still uses `ai-chat-lead` (indirect, works fine)
3. **Communication templates** — Cleanup-specific SMS/email templates needed
4. **Cleanup-specific auto-tasks** — Photo request, site visit scheduling automation
5. **Bundle proposal templates** — Combined dumpster + cleanup proposal format
