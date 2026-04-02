# Pricing Source Audit

Last updated: 2026-04-02

## Full Audit Results

| Source | File/Table | Pricing Family | Used By | Editable | Canonical | Duplicate | Action |
|--------|-----------|---------------|---------|----------|-----------|-----------|--------|
| General Debris base prices | `pricing_general_debris` | Base pricing | CRM, Quote, Admin | ✅ | ✅ | No | — |
| General Debris config fallback | `pricingConfig.ts` → `GENERAL_DEBRIS_SIZES` | Base pricing | SEO, Fallback | No (code) | Fallback | Yes | Migrate consumers to DB |
| Heavy service costs | `pricing_heavy_service_costs` | Service cost | CRM, Quote, Admin | ✅ | ✅ | No | — |
| Heavy service costs config | `heavyMaterialConfig.ts` → `HEAVY_SERVICE_COSTS` | Service cost | Fallback | No (code) | Fallback | Yes | Migrate consumers to DB |
| Heavy groups + dump fees | `pricing_heavy_groups` | Dump fee/yd | CRM, Quote, Admin | ✅ | ✅ | No | — |
| Heavy groups config | `heavyMaterialConfig.ts` → `HEAVY_MATERIAL_GROUPS` | Dump fee/yd | Fallback | No (code) | Fallback | Yes | Migrate consumers to DB |
| Legacy heavy base prices | `shared-data.ts` → `DUMPSTER_SIZES_DATA` | Display pricing | SEO, Public pages | No (code) | ⚠️ Display | Yes | Wire to publicPricingService |
| Ads base prices | `adsService.ts` → `BASE_PRICES` | Ad copy pricing | Ads only | No (code) | ⚠️ Isolated | No | Sync with DB |
| Operational fees | `pricing_policies` | Fees/surcharges | CRM, Admin | ✅ | ✅ | No | — |
| Policies config fallback | `pricingConfig.ts` → `POLICIES` | Fees/surcharges | Fallback | No (code) | Fallback | Yes | Migrate consumers to DB |
| Extras catalog (DB) | `pricing_extras` | Add-on items | CRM, Admin | ✅ | ✅ | No | — |
| Extras catalog (operational) | `extra_catalog` | Operational extras | Dispatch | ✅ | Overlap | No | Consolidate with pricing_extras |
| Zone surcharges | `pricing_zones` | Zone pricing | CRM, Quote | ✅ | ✅ | No | — |
| Dumpster sizes | `dumpster_sizes` | Size catalog | CRM, Quote, Dispatch | ✅ | ✅ | No | — |
| Material catalog | `material_catalog` | Material types | CRM, Quote | ✅ | ✅ | No | — |
| Rental periods | `rental_periods` + `rental_term_catalog` | Rental terms | Quote, Admin | ✅ | ✅ | No | — |
| Waste profiles | `waste_profiles` | Weight behavior | Quote, CRM | ✅ | ✅ | No | — |
| Customer dump site rules | `customer_required_dump_rules` | Disposal premium | CRM, Quote | ✅ | ✅ | No | — |
| Rush fees | `rush_delivery_config` | Rush pricing | CRM, Quote | ✅ | ✅ | No | — |
| Contractor tiers | `contractor_tiers` | Discounts | CRM, Admin | ✅ | ✅ | No | — |
| Market rates | `market_rates` | Market pricing | CRM, Quote | ✅ | ✅ | No | — |
| City display pricing | `city_display_pricing` | SEO display | SEO pages | ✅ | ✅ | No | — |
| **Public price catalog** | `public_price_catalog` | Public display | Website | ✅ | ✅ | No | **NEW** |
| **CRM calculator rules** | `crm_calculator_rules` | Calculator config | CRM | ✅ | ✅ | No | **NEW** |
| **Public quote display rules** | `public_quote_display_rules` | Quote UI config | Website | ✅ | ✅ | No | **NEW** |
| **Pricing change log** | `pricing_change_log` | Audit trail | Admin | ✅ | ✅ | No | **NEW** |

## Remaining Config Fallbacks

These code files still serve as fallbacks when DB rows are missing:
1. `src/config/pricingConfig.ts` — General Debris sizes/prices, policies
2. `src/config/heavyMaterialConfig.ts` — Heavy service costs, groups, dump fees
3. `src/lib/shared-data.ts` → `DUMPSTER_SIZES_DATA` — Public display pricing (to be wired to publicPricingService)

## Dead/Deprecated Code

| Item | Status | Action |
|------|--------|--------|
| Legacy `HEAVY_MATERIAL` in pricingConfig.ts | Deprecated, kept for fallback | Remove after full DB migration |
| `HEAVY_BASE_PRICES` in shared-data.ts | Deprecated | Auto-mapped to V2 model |
| 6-yard size | Decommissioned | Auto-mapped to 5-yard |
