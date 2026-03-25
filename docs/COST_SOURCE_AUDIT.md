# Cost Source Audit

Last updated: 2026-03-25

## Audit Results

| Source | File/Table | Cost Type | Editable | Duplicated | Canonical | Action |
|--------|-----------|-----------|----------|------------|-----------|--------|
| General Debris base prices | `pricing_general_debris` | Base pricing | ✅ | No | ✅ | — |
| General Debris config fallback | `pricingConfig.ts` → `GENERAL_DEBRIS_SIZES` | Base pricing | No (code) | Yes | Fallback | Migrate consumers to DB |
| Heavy service costs | `pricing_heavy_service_costs` | Service cost | ✅ | No | ✅ | — |
| Heavy service costs config | `heavyMaterialConfig.ts` → `HEAVY_SERVICE_COSTS` | Service cost | No (code) | Yes | Fallback | Migrate consumers to DB |
| Heavy groups + dump fees | `pricing_heavy_groups` | Dump fee/yd | ✅ | No | ✅ | — |
| Heavy groups config | `heavyMaterialConfig.ts` → `HEAVY_MATERIAL_GROUPS` | Dump fee/yd | No (code) | Yes | Fallback | Migrate consumers to DB |
| Legacy heavy base prices | `shared-data.ts` → `HEAVY_BASE_PRICES` | Flat rate | No (code) | ⚠️ Deprecated | No | Remove after migration |
| Ads base prices | `adsService.ts` → `BASE_PRICES` | Ad copy pricing | No (code) | ⚠️ Isolated | No | Sync with DB |
| Operational fees | `pricing_policies` | Fees/surcharges | ✅ | No | ✅ | — |
| Policies config fallback | `pricingConfig.ts` → `POLICIES` | Fees/surcharges | No (code) | Yes | Fallback | Migrate consumers to DB |
| Extras catalog (DB) | `pricing_extras` | Add-on items | ✅ | No | ✅ | — |
| Extras catalog (operational) | `extra_catalog` | Operational extras | ✅ | Overlap | ✅ | Consolidate with pricing_extras |
| Zone surcharges | `pricing_zones` | Zone pricing | ✅ | No | ✅ | — |
| Dumpster sizes | `dumpster_sizes` | Size catalog | ✅ | No | ✅ | — |
| Material catalog | `material_catalog` | Material types | ✅ | No | ✅ | — |
| Rental periods | `rental_periods` | Rental terms | ✅ | No | ✅ | — |
| Waste profiles | `waste_profiles` | Weight behavior | ✅ | No | ✅ | NEW |
| Customer dump site rules | `customer_required_dump_rules` | Disposal premium | ✅ | No | ✅ | NEW |
| Rush fees | Config-managed | Rush pricing | ✅ via tab | No | ✅ | — |
| Contractor tiers | Config-managed | Discounts | ✅ via tab | No | ✅ | — |
| Mixed/overage rules | Config-managed | Rules | ✅ via tab | No | ✅ | — |
| Warnings/caps | Config-managed | Rules | ✅ via tab | No | ✅ | — |
| Volume commitments | Config-managed | Discounts | ✅ via tab | No | ✅ | — |
| Toll surcharges | Config-managed | Geography | ✅ via tab | No | ✅ | — |
| Market rates | `market_rates` | Market pricing | ✅ | No | ✅ | — |
| City display pricing | `city_display_pricing` | SEO display | ✅ | No | ✅ | — |

## Remaining Config Fallbacks

These code files still serve as fallbacks when DB rows are missing:
1. `src/config/pricingConfig.ts` — General Debris sizes/prices, policies
2. `src/config/heavyMaterialConfig.ts` — Heavy service costs, groups, dump fees

**Action**: Progressively migrate all consumers to use `pricingCatalogService.ts` (DB-first with config fallback).
