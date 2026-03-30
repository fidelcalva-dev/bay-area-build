# Cleanup & Dumpster Service Line Model

> Last updated: 2026-03-30

## Brand Dimension

| Brand Code | Entity |
|---|---|
| `CALSAN_DUMPSTERS_PRO` | Calsan Dumpsters Pro LLC |
| `CALSAN_CD_WASTE_REMOVAL` | Calsan C&D Waste Removal (dba Calsan Services) |

Both brands share the same CRM, Lead Hub, Customer 360, and quote system.

## Service Line Dimension

| Value | Meaning |
|---|---|
| `DUMPSTER` | Traditional dumpster rental (default) |
| `CLEANUP` | Construction cleanup service |
| `BOTH` | Bundle — customer needs both dumpster + cleanup |

## Database Columns

`brand` and `lead_intent` added to:
- `sales_leads` (default: `CALSAN_DUMPSTERS_PRO`)
- `customers`
- `quotes`
- `orders`

`service_line` already exists on all four tables.

## Cleanup Service Types

| Code | Description |
|---|---|
| `CONSTRUCTION_CLEANUP` | Active jobsite cleanup |
| `POST_CONSTRUCTION_CLEANUP` | Final / post-construction cleanup |
| `DEMOLITION_DEBRIS_CLEANUP` | Demo debris removal |
| `RECURRING_JOBSITE_CLEANUP` | Ongoing scheduled cleanup |
| `LABOR_ASSISTED_CLEANUP` | Manual labor-assisted hauling |
| `NOT_SURE` | Customer unsure — needs review |

## Bundle Detection

When `need_dumpster_too = true` in the lead payload:
1. `service_line` → `BOTH`
2. `bundle_opportunity_flag` → `true`
