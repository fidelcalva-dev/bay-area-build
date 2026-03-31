# Final Unified Lead and Alert Summary

> Last updated: 2026-03-31

## Status: FULLY UNIFIED ✅

All lead intake, notifications, and workspace views are consolidated into one canonical system.

## What Was Fixed

| Issue | Resolution |
|---|---|
| Contractor app sent `service_line: DUMPSTER` | Fixed to `CLEANUP` with `contractor_application_flag: true` |
| Contractor app sent `lead_intent: CONTRACTOR_APPLICATION` | Fixed to `CONTRACTOR_ACCOUNT` |
| Missing Lead Hub tabs (Won, Lost, Photos, Site Visit, Dumpster) | Added 6 new tabs with corresponding filter logic |
| No `useLeadHub` filters for new tabs | Added `dumpster`, `waiting_photos`, `needs_site_visit`, `won`, `lost` cases |

## Lead Sources (All → `lead-ingest`)

16 sources confirmed flowing through the canonical orchestrator. See `docs/UNIFIED_LEAD_SOURCE_AUDIT.md`.

## Contractor Application Visibility

- **Tab**: Contractors (`contractor_flag = true`)
- **Badge**: "Contractor" in Service column
- **Source Label**: "Contractor App"
- **Intent**: `CONTRACTOR_ACCOUNT`
- **Service Line**: `CLEANUP`
- **Board**: Cleanup Board (when relevant)

## AI Chat Persistence

- Anonymous sessions saved before contact capture
- `ai_conversation_summary` shown in lead cards (🤖 prefix)
- AI Chat tab filters by `source_channel IN ('AI_CHAT', 'AI_ASSISTANT', 'WEBSITE_CHAT', 'WEBSITE_ASSISTANT')`

## Contact Form Reliability

- Both `/contact-us` and `/cleanup/contact` call `lead-ingest` directly
- Contact Form tab filters by `source_channel IN ('CONTACT_FORM', 'CLEANUP_CONTACT', 'CALLBACK_REQUEST', ...)`
- Failsafe queue catches any processing errors

## Notification Routing

| Event Type | Admin | Sales | CS |
|---|---|---|---|
| dumpster_lead_created | ✅ | ✅ | — |
| cleanup_lead_created | ✅ | ✅ | — |
| bundle_lead_created | ✅ | ✅ | — |
| contractor_application_submitted | ✅ | ✅ | — |
| ai_chat_handoff_created | ✅ | ✅ | — |
| contact_form_submitted | ✅ | ✅ | — |
| needs_site_visit | ✅ | ✅ | ✅ |
| recurring_service_interest | ✅ | ✅ | — |

## Lead Hub Saved Views (18 tabs)

New, Needs Follow-Up, My Leads, High Intent, Dumpster, Cleanup, Contractors, Bundle, AI Chat, Contact Form, Waiting Photos, Site Visit, Existing Customer, High Risk, Won, Lost, All

## Board Presets

- **List**: Default table view
- **Pipeline**: Kanban by `lead_status`
- **Cleanup Board**: 11-column cleanup-specific board (`?view=cleanup-board`)

## Conversion Actions (Lead Detail)

- Create Dumpster Quote
- Create Cleanup Proposal
- Create Bundle Quote
- Mark Won / Mark Lost
- Call / Text / Email
- Create Quote (generic)

## Role-Based Access

| Role | Route | Capabilities |
|---|---|---|
| Sales | `/sales/leads` | Create, edit, move, send docs, convert |
| CS | `/cs/leads` | View, notes, follow-up |
| Admin | `/admin/leads` | Full access, reassign, override, metrics |

## Remaining Manual Review Items

1. Verify `my_leads` tab filters correctly by authenticated user's `owner_user_id`
2. Confirm `waiting_photos` filter logic matches business requirements (currently shows leads without `photos_uploaded_flag` in active statuses)
3. Monitor `lead-ingest` Edge Function logs for silent notification failures
4. Consider adding CS-specific notification events for missing info / resend actions
5. Consider building notification preferences UI for per-user channel toggles
