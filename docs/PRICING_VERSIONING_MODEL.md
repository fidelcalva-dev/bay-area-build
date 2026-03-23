# Pricing Versioning Model

Last updated: 2026-03-23

## Table: `pricing_versions`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| version_code | TEXT | Human-readable code (e.g., `v1.0`, `v2.1`) |
| status | TEXT | `draft` / `pending_approval` / `published` / `archived` |
| effective_from | TIMESTAMPTZ | When this version becomes active |
| effective_to | TIMESTAMPTZ | When this version expires |
| created_by | UUID | User who created the draft |
| approved_by | UUID | User who approved publication |
| published_at | TIMESTAMPTZ | Timestamp of publication |
| archived_at | TIMESTAMPTZ | Timestamp of archival |
| notes | TEXT | Version description |

## Workflow

1. Admin creates a new version (status: `draft`)
2. Edits are made to pricing catalogs, tagged with version_id
3. Version moves to `pending_approval`
4. Approver reviews and publishes (status: `published`)
5. Previous published version moves to `archived`
6. Production consumers read only from `published` version

## Rules

- Only one version can be `published` at a time
- Draft versions are only visible in admin simulator
- Archived versions are kept for rollback capability
