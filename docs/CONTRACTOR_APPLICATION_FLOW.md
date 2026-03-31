# Contractor Application Flow

> Last updated: 2026-03-31

## Entry Point

- **Route**: `/contractor-application`
- **Component**: `src/pages/ContractorApplication.tsx`
- **Brand**: `CALSAN_DUMPSTERS_PRO`

## Flow

1. User fills out contractor application form
2. Form inserts into `contractor_applications` table (primary record)
3. Form calls `lead-ingest` (non-blocking) with:
   - `source_channel: 'CONTRACTOR_APPLICATION'`
   - `lead_intent: 'CONTRACTOR_APPLICATION'`
   - `customer_type: 'contractor'`
   - `raw_payload.contractor_flag: true`
   - `raw_payload.service_line: 'DUMPSTER'`
4. `lead-ingest` creates/enriches `sales_leads` record with `contractor_flag = true`
5. Lead appears in Lead Hub under "Contractors" tab

## Fields Captured

- company_name, contact_name, phone, email
- service_cities, project_types, estimated_monthly_volume
- typical_sizes, materials_handled
- billing_preference, credit_terms_requested, notes

## Lead Hub Visibility

- **Tab**: Contractors (`contractor_flag = true`)
- **Badge**: "Contractor" badge in Service column
- **Source Label**: "Contractor App"
- **Intent**: `CONTRACTOR_APPLICATION`
