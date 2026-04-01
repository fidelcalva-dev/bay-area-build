# Contractor Application Workflow — Final Summary

> Last updated: 2026-04-01

## Overview

The contractor application workflow is fully integrated into the canonical CRM. There is ONE Lead Hub, ONE Customer 360, ONE pricing source, and ONE contractor application pipeline.

## Form Fields (Public Application)

### Step 1: Company Info
- legal_business_name, dba_name, contact_name, role_title, phone, email, website, business_address, city, state, zip

### Step 2: Contractor Profile
- contractor_type, license_number, is_insured, years_in_business, service_area, typical_project_type, current_active_projects, average_project_size

### Step 3: Service Needs
- service_line_interest (DUMPSTER | CLEANUP | BOTH), monthly_dumpster_usage_estimate, monthly_cleanup_usage_estimate, recurring_service_interest, preferred_cleanup_frequency, common_dumpster_sizes, common_materials, need_priority_service, need_net_terms, required_dump_sites, notes

### Step 4: Documents
- contractor_license_file, insurance_certificate, w9, project_photos, company_logo (all optional, stored in `contractor-documents` bucket)

### Step 5: Review & Submit

## Lead Creation

Every submission creates a lead via `lead-ingest` with:
- `source_channel: CONTRACTOR_APPLICATION`
- `lead_intent: CONTRACTOR_ACCOUNT`
- `contractor_flag: true`
- `service_line` based on form selection
- Fit score calculated and passed in `raw_payload`

## Contractor Application Record

Stored in `contractor_applications` table with statuses:
- SUBMITTED → UNDER_REVIEW → WAITING_ON_INFO → APPROVED / DECLINED → CONVERTED

## CRM Views

- **Contractors Tab**: `/sales/leads` → "Contractors" tab (filters `contractor_flag = true`)
- **Contractor Board**: `/sales/leads?view=contractor-board` — Kanban board with columns: New Application, Under Review, Waiting on Info, Approved, Declined, Converted
- Same views available at `/admin/leads` and `/cs/leads`

## Approve / Decline / Convert Process

### Approve
- Select pricing tier (RETAIL, CONTRACTOR_TIER_1, CONTRACTOR_TIER_2, COMMERCIAL_ACCOUNT, MANUAL_RATE_CARD)
- Custom discount % for manual tier
- Adds review notes and approved_by

### Request More Info
- Sets status to WAITING_ON_INFO
- Creates follow-up task

### Decline
- Requires decline reason
- Sets status to DECLINED

### Convert to Customer
- Creates customer record with contractor flags
- Links contractor_application_id
- Sets contractor_tier, discount_pct, service_line_permissions
- Redirects to Customer 360

## Tier / Discount Model

| Tier | Discount | Approval |
|------|----------|----------|
| RETAIL | 0% | No |
| CONTRACTOR_TIER_1 | 5% | No |
| CONTRACTOR_TIER_2 | 8% | No |
| COMMERCIAL_ACCOUNT | 10% | No |
| MANUAL_RATE_CARD | Custom | Yes |

Non-discountable items: disposal pass-through, customer-required dump site premium, Green Halo premium, rebar premium, permit assistance, toll surcharges, rush/same-day/after-hours, dry run, contamination/reroute.

## Contractor Fit Score (0–100)

Positive: Bay Area location (+15), business email (+10), phone+contact (+10), recurring interest (+10), 3+ active projects (+15), both service lines (+10), docs uploaded (+10), aligned contractor type (+5), insurance (+5), 5+ years (+5), license (+5).

## Customer 360 Integration

- `ContractorAccountCard` shows in Overview tab for contractor accounts
- Displays: type, tier/discount, service lines, net terms, recurring interest, active projects, fit score, application status, docs status
- Quick actions: View Application, Create Quote

## Quote Integration

Approved contractors can create DUMPSTER_RENTAL, CLEANUP_SERVICE, or BUNDLE_SERVICE quotes with tier/discount automatically applied via the canonical pricing system.

## Database Changes

- `contractor_applications` table expanded with 20+ new fields
- `sales_leads` table: added `contractor_application_id`
- `customers` table: added `is_contractor_account`, `contractor_type`, `contractor_application_id`, `service_line_permissions`, `net_terms_approved`, `documents_status`
- `contractor-documents` storage bucket created

## Remaining Manual Review Items

- Email/SMS notification templates for application status changes (can be added via transactional email system)
- Automated task creation on application submit (can be wired to existing task system)
- KPI card on Sales Dashboard linking to contractor applications view
- Link to Existing Customer flow (currently only Convert to New Customer implemented)
