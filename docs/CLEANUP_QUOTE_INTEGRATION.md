# Cleanup Quote Integration

> Last updated: 2026-03-30

## Architecture

Cleanup quotes use the **same canonical quote system** (`quotes` table). The `service_line` and `cleanup_service_type` columns distinguish cleanup quotes from dumpster quotes.

## Quote Types

| `service_line` | Use |
|---|---|
| `DUMPSTER` | Standard dumpster rental quote (existing) |
| `CLEANUP` | Cleanup service quote |
| `BOTH` | Bundle quote (dumpster + cleanup) |

## Cleanup Quote Line Items

For cleanup quotes, the system supports these line item types (from `platform/types.ts`):

| Type | Description |
|---|---|
| `LABOR` | Crew labor (hours × rate × crew size) |
| `DISPOSAL` | Debris disposal fees |
| `TRUCK` | Truck/vehicle charges |
| `MATERIAL_HANDLING` | Special material handling |
| `CLEANUP` | General cleanup scope charge |
| `SURCHARGE` | Rush, stairs, long carry, after-hours |
| `DUMPSTER` | Crossover dumpster rental (for bundles) |

## Cleanup-Specific Quote Fields

| Field | Purpose |
|---|---|
| `cleanup_service_type` | Which cleanup service |
| `project_scope` | Scope description |
| `project_size_sqft` | Square footage |
| `debris_condition` | Current site condition |
| `recurring_frequency` | If recurring, how often |

## Master Calculator Integration

The `/sales/quotes/new` Master Calculator will support a service line selector at the top (Dumpster / Cleanup / Bundle) to switch between quote creation modes.

## Document Templates (Cleanup)

| Template | Purpose |
|---|---|
| Cleanup Quote / Proposal | Standard cleanup estimate |
| Cleanup Service Agreement | Terms for cleanup work |
| Cleanup Recurring Proposal | Ongoing service proposal |
| Bundle Proposal | Combined dumpster + cleanup |
| Cleanup Payment Request | Payment request for cleanup job |
