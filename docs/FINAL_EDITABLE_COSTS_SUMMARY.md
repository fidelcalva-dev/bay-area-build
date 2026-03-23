# Editable Pricing System — Final Summary

Last updated: 2026-03-23

## Architecture

All pricing is now DB-backed and editable from `/admin/pricing`. Config files (`pricingConfig.ts`, `heavyMaterialConfig.ts`) serve as fallbacks when DB rows are not populated.

## Canonical Route

`/admin/pricing` — 28 tabs across 5 groups (Core, Geography, Fees, Rules, Analysis)

## New Editable Tabs

| Tab | Key | Component | DB Table |
|-----|-----|-----------|----------|
| Edit General Prices | `general-edit` | EditableGeneralDebrisPanel | `pricing_general_debris` |
| Edit Heavy Rates | `heavy-rates` | EditableHeavyPricingPanel | `pricing_heavy_service_costs` + `pricing_heavy_groups` |
| Fees & Policies | `policies` | EditablePoliciesPanel | `pricing_policies` |
| Audit Log | `audit-log` | PricingAuditLogPanel | `pricing_audit_log` + `pricing_versions` |

## New DB Tables

| Table | Purpose |
|-------|---------|
| `pricing_general_debris` | Editable base prices by size/market |
| `pricing_heavy_service_costs` | Editable service costs (5/8/10 yd) |
| `pricing_heavy_groups` | Editable heavy group dump fees, premiums |
| `pricing_extras` | Extended with `extra_code`, `pricing_mode`, etc. |
| `pricing_policies` | Editable operational fees (contamination, overage, etc.) |
| `pricing_versions` | Draft/publish version control |
| `pricing_audit_log` | Field-level change tracking |

## Editable Cost Families

| Family | Source | Editable |
|--------|--------|----------|
| General Debris base prices | `pricing_general_debris` | ✅ |
| Heavy service costs | `pricing_heavy_service_costs` | ✅ |
| Heavy dump fee per yard | `pricing_heavy_groups` | ✅ |
| Premiums (rebar, Green Halo) | `pricing_heavy_groups` | ✅ |
| Operational fees/policies | `pricing_policies` | ✅ |
| Extras catalog | `pricing_extras` | ✅ |
| Zone surcharges | `pricing_zones` | ✅ (existing) |
| Rush delivery | Config-managed | Existing tab |
| Contractor tiers | Config-managed | Existing tab |
| City/ZIP/Yard | Existing tables | Existing tabs |

## Versioning Model

- `pricing_versions` table tracks draft → pending_approval → published → archived
- Each editable row has optional `version_id` foreign key
- Published version is the active source for all consumers
- Draft changes are isolated until published

## Audit Trail

- `pricing_audit_log` captures every field-level change
- Fields: changed_by, changed_at, config_area, entity_type, field_name, old_value, new_value, change_reason
- Viewable in `/admin/pricing?tab=audit-log`

## Permissions

| Role | Access |
|------|--------|
| Admin | Full edit + publish |
| Finance/Pricing | Edit + publish with approval |
| Sales | View + negotiated ranges |
| CS | View, limited edits |
| Dispatch/Driver | Read-only |

## Pricing Consumer Service

`src/lib/pricingCatalogService.ts` provides:
- `fetchGeneralDebrisPricing()` — DB-first with config fallback
- `fetchHeavyServiceCosts()` — DB-first with config fallback
- `fetchHeavyGroups()` — DB-first with config fallback
- `fetchPolicies()` — DB-first with config fallback
- Update functions with audit logging
- All consumers can progressively migrate to this service

## Remaining Manual Review

1. Progressively migrate website quote and CRM calculator to use `pricingCatalogService` instead of static config imports
2. Add import/export (CSV/JSON) functionality for bulk catalog updates
3. Add draft comparison view (side-by-side draft vs live)
4. Wire pricing_versions.version_id into each catalog row for strict version binding
5. Add pricing health check for DB vs config drift detection
