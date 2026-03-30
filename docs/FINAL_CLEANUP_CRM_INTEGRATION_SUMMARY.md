# Final Cleanup CRM Integration Summary

> Last updated: 2026-03-30

## What Already Existed

### Cleanup Website Assets
- **13 pages** under `/cleanup/...`: Home, Services, 4 Service Detail pages, For Contractors, Pricing, About, FAQs, Contact, Quote, Thank You, Before/After, Service Areas, 3 Local Pages (Oakland, Alameda, Bay Area)
- **5 layout components**: CleanupHeader, CleanupFooter, CleanupLayout, CleanupMobileBar, CleanupTrustStrip
- **Content config**: `src/config/cleanup/content.ts` with brand, services, pricing, homepage, FAQ content
- **Route cluster**: `src/routes/cleanupRoutes.tsx` with 16 routes + 3 legacy redirects
- **Quote form**: CleanupQuote.tsx already calling `lead-ingest` with `source_channel: 'CLEANUP_WEBSITE'` and `raw_payload.service_line: 'CLEANUP'`
- **Service verticals**: CONSTRUCTION_CLEANUP, POST_CONSTRUCTION_CLEANUP, DEMOLITION_SUPPORT, RECURRING_SITE_SERVICE defined in platform config

### CRM Infrastructure (Canonical)
- `lead-ingest` edge function with scoring, routing, SLA, dedup
- Lead Hub (`/sales/leads`) with tabs, filters, pipeline board
- Customer 360 (`/admin/customers/:id`) with 14 tabs
- Quote system with Master Calculator
- Document engine with templates
- Communication layer (GHL, SMS, email)
- Timeline service with 30+ milestones

## What Was Integrated

### Phase 1: Database Schema
Added `service_line` column to:
- `sales_leads` (+ 16 cleanup-specific fields)
- `customers`
- `quotes` (+ `cleanup_service_type`)
- `orders`

Created indexes for `service_line`, `contractor_flag`, `bundle_opportunity_flag`, `recurring_service_flag`.

### Phase 2: Lead Routing (lead-ingest)
Updated the `lead-ingest` edge function to:
- Extract `service_line` from `raw_payload` or infer from `source_channel`
- Map cleanup-specific fields: `cleanup_service_type`, `project_scope`, `requested_timeline`, `project_size_sqft`, `contractor_flag`, `recurring_service_flag`
- Auto-detect bundle opportunities when `need_dumpster_too = true`
- Support new source channels: `CLEANUP_WEBSITE`, `CLEANUP_CONTACT`, `CLEANUP_CONTRACTOR`, `CLEANUP_PHOTO_UPLOAD`, `CLEANUP_CALL`, `CLEANUP_TEXT`

### Phase 3: Lead Hub Updates
- Added **Service Line filter** dropdown (All Services / Dumpster / Cleanup / Bundle)
- Added **Service column** in lead table with color-coded badges
- Added **Contractor** and **Recurring** flag badges
- Added cleanup source labels to source filter
- Updated `useLeadHub` hook to support `serviceLine` filter parameter

### Phase 4: Customer 360 Updates
- Added `ServiceLineSummary` card to Overview tab showing service line, order count, quote count
- Added service line badge to customer header (Cleanup/Bundle)
- All existing tabs show unified data across both service lines

## Service Line Model

| Value | Meaning |
|---|---|
| `DUMPSTER` | Dumpster rental only (default) |
| `CLEANUP` | Construction cleanup only |
| `BOTH` | Bundle — needs both services |

## Team Workflow

The same Sales/CS team handles both service lines using:
- Service Line filter in Lead Hub to focus on cleanup, dumpster, or bundle leads
- Service-specific playbooks (Dumpster: size → price → contract → payment → dispatch; Cleanup: scope → photos → estimate → proposal → schedule)
- Unified Customer 360 for full relationship history

## Remaining Manual Review Items

1. **Communication templates**: Cleanup-specific SMS/email templates need to be created in the communications config
2. **Master Calculator**: Service line selector (Dumpster/Cleanup/Bundle) needs to be added to `/sales/quotes/new`
3. **Document templates**: Cleanup Quote, Cleanup Service Agreement, Recurring Proposal, Bundle Proposal templates need to be created in the document template system
4. **Auto-task creation**: Cleanup-specific auto-tasks (Request Photos, Review Scope, Schedule Site Visit) need to be added to the lead-ingest task creation logic
5. **Pipeline stages**: Cleanup-specific stages (Reviewing Scope, Waiting on Photos, Needs Site Visit, Estimating) could be added as optional pipeline_stage values
6. **Customer service_line auto-upgrade**: Trigger to auto-set `service_line = 'BOTH'` when a customer has both dumpster and cleanup records
7. **Cleanup brand phone/email**: Placeholders in `src/config/cleanup/content.ts` need real values (`[ADD_MAIN_PHONE]`, `[ADD_EMAIL_DOMAIN]`)
8. **Homepage gateway**: Main homepage could feature a two-service gateway (Dumpster Rentals / Construction Cleanup)

## Architecture Verification

✅ One canonical CRM — no second system created
✅ One canonical lead system — all leads enter `sales_leads` via `lead-ingest`
✅ One canonical quote system — `quotes` table with `service_line` field
✅ One canonical Customer 360 — unified view with ServiceLineSummary
✅ One canonical document system — same engine, different templates
✅ Same team can follow up on both service lines via Lead Hub filters
✅ Service lines clearly separated by fields, filters, and badges
✅ Bundle opportunities supported via `bundle_opportunity_flag` and `service_line = 'BOTH'`
