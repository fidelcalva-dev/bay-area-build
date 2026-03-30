# Final Unified Intake Summary

> Last updated: 2026-03-30

## What Already Existed

- **`lead-ingest`** edge function as canonical orchestrator
- **Service line model** (DUMPSTER / CLEANUP / BOTH) on `sales_leads`, `customers`, `quotes`, `orders`
- **Cleanup-specific fields** (cleanup_service_type, contractor_flag, etc.)
- **Lead Hub** with service line filter and pipeline view
- **Customer 360** with ServiceLineSummary component
- **Dedup/identity resolution** via `capture_omnichannel_lead` RPC
- **Lead scoring** with quality/risk/priority
- **Auto-assignment** with SLA-based follow-up tasks

## What Was Integrated / Fixed

### 1. Brand + Intent Columns (NEW)
- Added `brand` column to `sales_leads`, `customers`, `quotes`, `orders`
- Added `lead_intent` column to `sales_leads`
- `lead-ingest` now auto-infers brand from source channel

### 2. CleanupContact Form (REBUILT)
- `/cleanup/contact` was a static page with no form — no lead was created
- Rebuilt with a full contact form that calls `lead-ingest` with brand=CALSAN_CD_WASTE_REMOVAL

### 3. useCalsanChat Handoff (FIXED)
- Was calling `lead-capture` instead of `lead-ingest`
- Now calls `lead-ingest` directly with proper brand/service_line/intent

### 4. ContractorApplication (FIXED)
- Added `brand`, `lead_intent`, and `service_line` to the `lead-ingest` payload

### 5. ContactUs Form (FIXED)
- Added `brand`, `lead_intent`, `source_module`, and `service_line` to the payload

### 6. CleanupQuote Form (FIXED)
- Added `brand` to payload and `raw_payload`

### 7. Manual Lead Add (FIXED)
- Added `brand`, `lead_intent`, and `source_module` to the Lead Hub manual add form

### 8. Lead Hub Brand Badge (NEW)
- C&D brand leads now show a distinct amber "C&D" badge in the Service column
- `brand` and `lead_intent` added to the `LeadHubLead` type and query

## Service Line Model

| Dimension | Values |
|---|---|
| Brand | `CALSAN_DUMPSTERS_PRO`, `CALSAN_CD_WASTE_REMOVAL` |
| Service Line | `DUMPSTER`, `CLEANUP`, `BOTH` |
| Intent | `QUOTE_REQUEST`, `CONTACT_REQUEST`, `CONTRACTOR_APPLICATION`, `PHOTO_REVIEW`, `SCHEDULE_REQUEST`, `CALLBACK_REQUEST`, `CHAT_HANDOFF`, `MANUAL_STAFF_LEAD`, `UNKNOWN` |

## Lead Routing

All channels → `lead-ingest` → `sales_leads` → `/sales/leads` (Lead Hub)

No second CRM, no second lead table, no second Customer 360.

## Board Structure

- Lead Hub at `/sales/leads` with tab-based views (New, Follow-Up, My Leads, High Intent, etc.)
- Service line filter (All / Dumpster / Cleanup / Bundle)
- Pipeline board view for Kanban-style management

## Team Workflow

Same Sales/CS team handles both brands:
- Dumpster: Size → Material → Price → Contract → Payment → Order
- Cleanup: Scope review → Photos → Estimate → Proposal → Schedule
- Bundle: Single rep owns both, coordinated timeline

## Remaining Manual Review Items

1. **Communication templates** — Need to create cleanup-specific SMS/email templates in the comms config
2. **Quote system** — Add Cleanup/Bundle quote type selector to `/sales/quotes/new`
3. **Document templates** — Draft Cleanup Proposal, Service Agreement, Recurring Proposal templates
4. **Auto-tasks** — Add cleanup-specific automated tasks (Request Photos, Schedule Site Visit)
5. **Cleanup contractor form** — Consider a dedicated `/cleanup/for-contractors` form for cleanup contractor applications
6. **useAIChat** — Consider migrating from `ai-chat-lead` to direct `lead-ingest` call for consistency
