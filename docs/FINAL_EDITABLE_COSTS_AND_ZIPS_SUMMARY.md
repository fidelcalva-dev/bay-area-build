# Final Editable Costs and ZIPs Summary

Last updated: 2026-03-23

## Canonical Route

`/admin/pricing` — 26 tabs across 5 groups (Core, Geography, Fees, Rules, Analysis)

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

## ZIP Coverage Status

| Metric | Value |
|--------|-------|
| Total ZIPs | 213 |
| Duplicate ZIPs | 0 |
| Missing city | 0 |
| Missing county | 0 |
| Missing market | 0 |
| Missing zone | 0 |
| Counties covered | 9 (all Bay Area) |
| Markets | 3 (oakland_east_bay, san_jose_south_bay, san_francisco_peninsula) |
| Zones | 2 (core-bay 1.00x, extended-bay 1.15x) |

## Pricing Consumers (Unified)

- Website quote → `masterPricingService.ts` → `smartPricingEngine.ts`
- CRM calculator → `masterPricingService.ts`
- Customer 360 → `masterPricingService.ts`
- SEO city display → `city_display_pricing` table via principal ZIP
- Simulator → `smartPricingEngine.ts`
- Public pricing pages → `pricingConfig.ts` (synced with DB)

## Versioning Model

- `pricing_versions`: draft → pending_approval → published → archived
- Only one version can be `published` at a time

## Audit Trail

- `pricing_audit_log`: field-level change tracking
- Every edit via admin panels calls `logPricingChange()`
- Viewable at `/admin/pricing?tab=audit-log`

## Redirects

23 legacy pricing/config routes redirect to `/admin/pricing?tab=<key>`. No competing pricing overview pages remain active.

## Remaining Manual Review

1. Add `nearest_yard_id` column to `zone_zip_codes` for direct yard-to-ZIP mapping
2. Add `is_active` flag to `zone_zip_codes` for per-ZIP deactivation
3. Migrate rush/contractor/rules config from static files to DB tables
4. Add CSV/JSON import/export for bulk catalog updates
5. Wire `pricing_versions.version_id` into each catalog row for strict version binding
6. Add draft comparison view (side-by-side draft vs live)
