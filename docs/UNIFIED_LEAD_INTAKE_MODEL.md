# Unified Lead Intake Model

> Last updated: 2026-03-30

## Canonical Orchestrator

**`lead-ingest`** (`supabase/functions/lead-ingest/index.ts`) is the single canonical lead intake function.

All inbound channels MUST call `lead-ingest` either directly or via a thin proxy.

## Required Fields

Every intake call MUST provide:

| Field | Required | Example |
|---|---|---|
| `source_channel` | ✅ | `QUOTE_FLOW`, `CLEANUP_WEBSITE`, `CONTACT_FORM` |
| `phone` OR `email` | ✅ | At least one identity signal |
| `brand` | Auto-inferred | `CALSAN_DUMPSTERS_PRO` or `CALSAN_CD_WASTE_REMOVAL` |
| `lead_intent` | Auto-inferred | `QUOTE_REQUEST`, `CONTACT_REQUEST`, etc. |
| `source_page` | Recommended | `/quote`, `/cleanup/contact` |
| `source_module` | Recommended | `cleanup_quote_form`, `contact_us_form` |

## Brand Inference

If `brand` is not explicitly set, `lead-ingest` infers it:
- Source channel starts with `CLEANUP_` → `CALSAN_CD_WASTE_REMOVAL`
- All others → `CALSAN_DUMPSTERS_PRO`
- Can also be set in `raw_payload.brand`

## Intent Inference

| Source Channel | Inferred Intent |
|---|---|
| `QUOTE_FLOW`, `CLEANUP_WEBSITE`, `QUICK_ORDER`, `WEBSITE_QUOTE` | `QUOTE_REQUEST` |
| `CONTACT_FORM`, `CLEANUP_CONTACT`, `CLICK_TO_TEXT` | `CONTACT_REQUEST` |
| `CONTRACTOR_APPLICATION`, `CLEANUP_CONTRACTOR` | `CONTRACTOR_APPLICATION` |
| `PHOTO_UPLOAD`, `CLEANUP_PHOTO_UPLOAD` | `PHOTO_REVIEW` |
| `SCHEDULE_DELIVERY` | `SCHEDULE_REQUEST` |
| `CALLBACK_REQUEST`, `CLICK_TO_CALL` | `CALLBACK_REQUEST` |
| `AI_CHAT` | `CHAT_HANDOFF` |
| `MANUAL_STAFF` | `MANUAL_STAFF_LEAD` |

## Service Line Inference

- `CLEANUP_*` channels → `service_line = CLEANUP`
- All others → `service_line = DUMPSTER`
- `raw_payload.need_dumpster_too = true` → `service_line = BOTH` + `bundle_opportunity_flag = true`

## Processing Pipeline

1. Flatten `lead_context` into top-level
2. Normalize field aliases (`size_intent` → `size_preference`, etc.)
3. Dedup via `capture_omnichannel_lead` RPC
4. Write brand, intent, service_line, and cleanup fields
5. Score lead (quality + risk)
6. Route + auto-assign owner
7. Set SLA based on priority
8. Create follow-up task
9. Log timeline event
10. Send internal notification
