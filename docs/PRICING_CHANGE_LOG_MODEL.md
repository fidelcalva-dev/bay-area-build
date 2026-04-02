# Pricing Change Log Model

Last updated: 2026-04-02

## Table: `pricing_change_log`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| pricing_version_id | UUID | FK to pricing_versions |
| config_area | TEXT | Area: general_debris, heavy, policies, extras, zones, etc. |
| entity_type | TEXT | Table/entity changed |
| entity_id | TEXT | Row ID of changed entity |
| field_name | TEXT | Column that changed |
| old_value | TEXT | Previous value |
| new_value | TEXT | New value |
| changed_by_user_id | UUID | User who made the change |
| changed_at | TIMESTAMPTZ | Timestamp of change |
| reason | TEXT | Optional reason for change |

## Also: `pricing_audit_log`

Legacy audit table that logs higher-level changes. Both tables are active:
- `pricing_audit_log` — broader change tracking (email, config_area, summary)
- `pricing_change_log` — field-level granular tracking

## Access

- Admin, Sales, CS, Finance can **read** the change log
- Admin, Sales, Finance can **insert** new entries
- All edits via admin panels should call the appropriate logging function

## Viewable At

`/admin/pricing?tab=audit-log` — Combined view of both audit tables
