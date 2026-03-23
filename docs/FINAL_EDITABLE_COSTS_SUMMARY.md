# Editable Pricing System — Final Summary

Last updated: 2026-03-23

## Architecture

All pricing is DB-backed and editable from `/admin/pricing`. Config files (`pricingConfig.ts`, `heavyMaterialConfig.ts`) serve as fallbacks when DB rows are not yet populated.

## Canonical Route

`/admin/pricing` — 26 tabs across 5 groups (Core, Geography, Fees, Rules, Analysis)

## DB Tables (Seeded & Active)

| Table | Rows | Purpose |
|-------|------|---------|
| `pricing_general_debris` | 7 | Base prices by size (5–50 yd) |
| `pricing_heavy_service_costs` | 3 | Service costs for 5/8/10 yd |
| `pricing_heavy_groups` | 4 | Heavy group dump fees & premiums |
| `pricing_policies` | 13 | Operational fees & surcharges |
| `pricing_extras` | 7 | Add-on items catalog |
| `pricing_versions` | 1 | Draft/publish version control |
| `pricing_audit_log` | — | Field-level change tracking |
| `pricing_zones` | — | Zone surcharges (A–E) |

## Editable Cost Families

| Family | Table | Editable | Tab |
|--------|-------|----------|-----|
| General Debris base prices | `pricing_general_debris` | ✅ | `general-edit` |
| Heavy service costs | `pricing_heavy_service_costs` | ✅ | `heavy-rates` |
| Heavy dump fee per yard | `pricing_heavy_groups` | ✅ | `heavy-rates` |
| Premiums (rebar, Green Halo) | `pricing_heavy_groups` | ✅ | `heavy-rates` |
| Operational fees/policies | `pricing_policies` | ✅ | `policies` |
| Extras catalog | `pricing_extras` | ✅ | `extras` |
| Zone surcharges | `pricing_zones` | ✅ | `zones` |
| Rush delivery | Config-managed | ✅ | `rush` |
| Contractor tiers | Config-managed | ✅ | `contractor` |
| City/ZIP/Yard | Existing tables | ✅ | `cities`/`zips`/`yards` |
| Mixed/overage rules | Config-managed | ✅ | `mixed-rules` |
| Warnings & caps | Config-managed | ✅ | `warnings-caps` |
| Volume commitments | Config-managed | ✅ | `volume` |
| Toll surcharges | Config-managed | ✅ | `tolls` |

## Versioning Model

- `pricing_versions`: draft → pending_approval → published → archived
- Only one version can be `published` at a time
- Production reads from published version

## Audit Trail

- `pricing_audit_log`: field-level change tracking
- Every edit via admin panels calls `logPricingChange()`
- Viewable at `/admin/pricing?tab=audit-log`

## Permissions

| Role | Access |
|------|--------|
| Admin | Full edit + publish |
| Finance/Pricing | Edit + publish with approval |
| Sales | View + negotiated ranges |
| CS | View, limited edits |
| Dispatch/Driver | Read-only |

## Service Layer

`src/lib/pricingCatalogService.ts`:
- `fetchGeneralDebrisPricing()` — DB-first with config fallback
- `fetchHeavyServiceCosts()` — DB-first with config fallback
- `fetchHeavyGroups()` — DB-first with config fallback
- `fetchPolicies()` — DB-first with config fallback
- Update + audit logging functions

## Remaining Manual Review

1. Progressively migrate consumers (website quote, CRM, SEO) to use `pricingCatalogService` instead of static config imports
2. Add CSV/JSON import/export for bulk catalog updates
3. Add draft comparison view (side-by-side draft vs live)
4. Wire `pricing_versions.version_id` into each catalog row for strict version binding
5. Add pricing health check for DB vs config drift detection
