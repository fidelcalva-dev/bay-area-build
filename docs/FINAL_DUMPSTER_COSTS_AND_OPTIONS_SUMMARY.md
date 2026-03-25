# Final Dumpster Costs and Options Summary

Last updated: 2026-03-25

## Canonical Route

`/admin/pricing` — 34 tabs across 5 groups

## Editable Categories

| Category | Table | Editable | Tab |
|----------|-------|----------|-----|
| Dumpster sizes | `dumpster_sizes` | ✅ | `sizes` |
| Material/waste catalog | `material_catalog` | ✅ | `waste-catalog` |
| Waste profiles (weight) | `waste_profiles` | ✅ | `waste-profiles` |
| General debris pricing | `pricing_general_debris` | ✅ | `general-edit` |
| Heavy service costs | `pricing_heavy_service_costs` | ✅ | `heavy-rates` |
| Heavy groups + dump fees | `pricing_heavy_groups` | ✅ | `heavy-rates` |
| Rental periods | `rental_periods` | ✅ | `rental-terms` |
| Extras catalog | `pricing_extras` + `extra_catalog` | ✅ | `extras` |
| Customer dump site rules | `customer_required_dump_rules` | ✅ | `dump-site` |
| Operational fees | `pricing_policies` | ✅ | `policies` |
| Zone surcharges | `pricing_zones` | ✅ | `zones` |
| Rush delivery | Config-managed | ✅ | `rush` |
| Contractor tiers | Config-managed | ✅ | `contractor` |
| Mixed/overage rules | Config-managed | ✅ | `mixed-rules` |
| Warnings & caps | Config-managed | ✅ | `warnings-caps` |
| Volume commitments | Config-managed | ✅ | `volume` |
| Toll surcharges | Config-managed | ✅ | `tolls` |
| Public quote config | Config-managed | ✅ | `public-display` |
| CRM calculator rules | Config-managed | ✅ | `crm-rules` |

## ZIP Coverage

| Metric | Value |
|--------|-------|
| Total ZIPs | 213 |
| Duplicates | 0 |
| Missing city/county/market/zone | 0 |
| Counties | 9 |
| Markets | 3 |
| Zones | 2 |

## New Tables Created

1. `waste_profiles` — 7 seeded profiles (weight-behavior for general debris)
2. `customer_required_dump_rules` — 2 seeded rules (customer-specified disposal facilities)

## Remaining Manual Review

1. Add `nearest_yard_id`, `is_active`, `quote_enabled`, `dispatch_enabled` columns to `zone_zip_codes`
2. Consolidate `pricing_extras` and `extra_catalog` into one canonical extras table
3. Migrate rush/contractor/rules config from static files to DB tables
4. Remove deprecated `HEAVY_BASE_PRICES` from `shared-data.ts`
5. Sync `adsService.ts` `BASE_PRICES` with DB source
6. Add CSV/JSON import/export tab
7. Move Public Quote Display and CRM Calculator settings to DB-backed config
8. Wire `pricing_versions.version_id` into each catalog row for strict version binding
