# Cleanup Service Line Model

> Last updated: 2026-03-30

## Service Line Enum

All entities (leads, quotes, orders, customers) now carry a `service_line` field:

| Value | Meaning |
|---|---|
| `DUMPSTER` | Traditional dumpster rental (default) |
| `CLEANUP` | Construction cleanup service |
| `BOTH` | Bundle — customer needs both dumpster + cleanup |

## Cleanup Service Types

| Code | Description |
|---|---|
| `CONSTRUCTION_CLEANUP` | Active jobsite cleanup |
| `POST_CONSTRUCTION_CLEANUP` | Final / post-construction cleanup |
| `DEMOLITION_DEBRIS_CLEANUP` | Demo debris removal |
| `RECURRING_JOBSITE_CLEANUP` | Ongoing scheduled cleanup |
| `LABOR_ASSISTED_CLEANUP` | Manual labor-assisted hauling |
| `NOT_SURE` | Customer unsure — needs review |

## Database Columns Added

### `sales_leads`
- `service_line` (text, default `DUMPSTER`)
- `cleanup_service_type` (text)
- `project_scope` (text)
- `project_stage` (text)
- `project_size_sqft` (text)
- `debris_condition` (text)
- `contractor_flag` (boolean)
- `recurring_service_flag` (boolean)
- `recurring_frequency` (text)
- `need_dumpster_too` (boolean)
- `bundle_opportunity_flag` (boolean)
- `photos_uploaded_flag` (boolean)
- `needs_site_visit` (boolean)
- `requested_timeline` (text)
- `requested_start_date` (date)
- `cleanup_notes` (text)

### `customers`
- `service_line` (text, default `DUMPSTER`)

### `quotes`
- `service_line` (text, default `DUMPSTER`)
- `cleanup_service_type` (text)

### `orders`
- `service_line` (text, default `DUMPSTER`)

## Quote Types

| Code | Use Case |
|---|---|
| `DUMPSTER_RENTAL` | Standard dumpster quote |
| `CLEANUP_SERVICE` | Cleanup-only quote |
| `BUNDLE_SERVICE` | Combined dumpster + cleanup |

## Bundle Detection

When `need_dumpster_too = true` in the lead payload, the system automatically:
1. Sets `service_line = 'BOTH'`
2. Sets `bundle_opportunity_flag = true`
