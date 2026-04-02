# Pricing Versioning & Publish

Last updated: 2026-04-02

## Table: `pricing_versions`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| version_code | TEXT | Human-readable (e.g., v1.0, v2.1) |
| status | TEXT | draft / pending_approval / published / archived |
| effective_from | TIMESTAMPTZ | When version becomes active |
| effective_to | TIMESTAMPTZ | When version expires |
| created_by | UUID | User who created |
| approved_by | UUID | User who approved |
| published_at | TIMESTAMPTZ | Publication timestamp |
| archived_at | TIMESTAMPTZ | Archival timestamp |
| notes | TEXT | Version description |

## Lifecycle

```
draft → pending_approval → published → archived
```

1. Admin creates a draft version
2. Edits pricing tables tagged with version_id
3. Moves to pending_approval when ready
4. Approver reviews and publishes
5. Publishing triggers:
   a. Archive current published version
   b. Compile public_price_catalog via compilePriceCatalog()
   c. Run health checks
   d. Mark new version as published
   e. Invalidate public pricing cache

## Rules

- Only one version can be `published` at a time
- Draft versions are visible in admin and simulator only
- Archived versions are kept for rollback capability
- Publishing validates health before completing

## Service Layer

`pricingVersionService.ts`:
- `fetchVersions()` — list all versions
- `getPublishedVersion()` — get active published
- `createDraftVersion(code, notes)` — create new draft
- `publishVersion(versionId)` — full publish workflow

## Admin UI

`/admin/pricing?tab=versioning` — Version list, create draft, publish, health status
