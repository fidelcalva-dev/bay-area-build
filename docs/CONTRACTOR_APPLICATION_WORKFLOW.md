# Contractor Application Workflow

> Last updated: 2026-04-01

## Overview

The contractor application workflow is a complete lifecycle system integrated into the canonical CRM. It does NOT create a separate CRM — all contractor data flows through the same Lead Hub, Customer 360, and Quote system.

## Flow

```
Website Application → Lead Created → Application Record → Review → Approve/Decline
                                                                      ↓
                                                              Convert to Customer
                                                              (new or link existing)
                                                                      ↓
                                                              Customer 360 + Quotes
```

## Entry Point

- **Route**: `/contractor-application`
- **Component**: `src/pages/ContractorApplication.tsx`
- **Steps**: Company Info → Profile → Service Needs → Documents → Review & Submit

## Lead Creation

Every submission calls `lead-ingest` with:
- `source_channel: 'CONTRACTOR_APPLICATION'`
- `lead_intent: 'CONTRACTOR_ACCOUNT'`
- `contractor_flag: true`
- `raw_payload.contractor_application_flag: true`

## Application Statuses

| Status | Description |
|---|---|
| `submitted` | New application, awaiting review |
| `under_review` | Staff has started reviewing |
| `waiting_on_info` | Additional info/docs requested |
| `qualified` | Meets basic criteria |
| `pricing_review` | Tier/discount being finalized |
| `approved` | Approved, ready for conversion |
| `declined` | Application declined |
| `converted` | Converted to customer record |

## CRM Views

| View | Route |
|---|---|
| Contractor Board | `/sales/leads?view=contractor-board` |
| Contractor Tab | Lead Hub "Contractors" tab |
| Application Detail | Inline in Lead Detail or Board |

## Actions

- Start Review → `under_review`
- Qualify → `qualified`
- Request Info → `waiting_on_info`
- Pricing Review → `pricing_review`
- Approve (with tier/discount) → `approved`
- Decline (with reason) → `declined`
- Convert to New Customer → creates customer + contractor_accounts record
- Link to Existing Customer → attaches to existing customer
