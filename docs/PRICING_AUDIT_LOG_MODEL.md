# Pricing Audit Log Model

Last updated: 2026-03-23

## Table: `pricing_audit_log`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| changed_by_user_id | UUID | Auth user ID |
| changed_by_email | TEXT | User email for display |
| changed_at | TIMESTAMPTZ | Timestamp of change |
| config_area | TEXT | Category (e.g., `general_debris`, `heavy_groups`, `policies`) |
| entity_type | TEXT | Table name |
| entity_id | TEXT | Row ID that changed |
| field_name | TEXT | Specific field changed |
| old_value | TEXT | Previous value |
| new_value | TEXT | New value |
| change_reason | TEXT | Optional reason note |
| version_code | TEXT | Associated pricing version |

## Integration

- Every save in editable pricing panels calls `logPricingChange()`
- Audit log is viewable at `/admin/pricing?tab=audit-log`
- RLS allows all authenticated users to read, only authenticated to insert
