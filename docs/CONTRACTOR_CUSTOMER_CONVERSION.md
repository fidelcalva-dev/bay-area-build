# Contractor Customer Conversion

> Last updated: 2026-04-01

## Overview

When a contractor application is approved, staff can either:
1. **Convert to New Customer** — creates a new customer record
2. **Link to Existing Customer** — attaches to an existing customer

## Convert to New Customer Flow

### Step A: Auto-Check for Existing Match
Before creating, the system searches for existing customers by:
- Normalized phone
- Normalized email
If matches are found, the "Link to Existing" dialog opens instead.

### Step B: Create Customer Record
Fields populated:
- `company_name` ← legal_business_name
- `contact_name`, `phone`, `billing_email`
- `billing_address` ← combined address fields
- `customer_type` = 'contractor'
- `is_contractor_account` = true
- `contractor_type`
- `contractor_application_id`
- `contractor_tier` (from approval)
- `discount_pct` (from approval)
- `service_line_permissions` (DUMPSTER/CLEANUP/BOTH)
- `net_terms_approved`
- `documents_status`
- `is_active` = true

### Step C: Create Contractor Account Profile
**Table**: `contractor_accounts`
- `customer_id` → linked customer
- `application_id` → linked application
- `pricing_tier`
- `service_line_permissions`
- `recurring_service_flag`
- `contractor_type`
- `years_in_business`
- `active_projects_count`
- `monthly_volume_estimate`
- `common_materials`
- `required_dump_sites`
- `documents_status`
- `is_approved` = true, `is_active` = true

### Step D: Link Application
- `contractor_applications.status` → `converted`
- `contractor_applications.customer_id` → new customer ID
- `contractor_applications.converted_at` → now

### Step E: Navigate to Customer 360
Staff is redirected to `/admin/customers/{id}`

## Link to Existing Customer Flow

1. Staff clicks "Link Existing"
2. Search dialog appears (name, email, phone search)
3. Staff selects matching customer
4. System updates customer with contractor fields
5. Creates `contractor_accounts` profile
6. Links application → `converted`
7. Navigates to Customer 360

## Customer 360 Contractor Block

The `ContractorAccountCard` component shows:
- Contractor type
- Tier / discount
- Service lines
- Net terms status
- Recurring interest
- Active projects
- Fit score
- Application status
- Docs status
- Required dump sites
- Actions: View Application, Create Dumpster/Cleanup/Bundle Quote
