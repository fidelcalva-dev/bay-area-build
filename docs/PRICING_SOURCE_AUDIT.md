# Pricing Source Audit

Last updated: 2026-04-02

## Full Audit Results

| Source | File/Table | Pricing Family | Used By | Editable | Canonical | Duplicate | Action |
|--------|-----------|---------------|---------|----------|-----------|-----------|--------|
| General Debris base prices | `pricing_general_debris` | Base pricing | CRM, Quote, Admin | ✅ | ✅ | No | — |
| General Debris config fallback | `pricingConfig.ts` → `GENERAL_DEBRIS_SIZES` | Base pricing | Fallback only | No (code) | Fallback | Yes | Migrate consumers to DB |
| Heavy service costs | `pricing_heavy_service_costs` | Service cost | CRM, Quote, Admin | ✅ | ✅ | No | — |
| Heavy service costs config | `heavyMaterialConfig.ts` → `HEAVY_SERVICE_COSTS` | Service cost | Fallback | No (code) | Fallback | Yes | Migrate consumers to DB |
| Heavy groups + dump fees | `pricing_heavy_groups` | Dump fee/yd | CRM, Quote, Admin | ✅ | ✅ | No | — |
| Heavy groups config | `heavyMaterialConfig.ts` → `HEAVY_MATERIAL_GROUPS` | Dump fee/yd | Fallback | No (code) | Fallback | Yes | Migrate consumers to DB |
| Dumpster size metadata | `shared-data.ts` → `DUMPSTER_SIZES_DATA` | Display pricing | SEO pages | No (code) | Fallback | Yes | ✅ Pages wired to `useDumpsterSizes` hook |
| Ads base prices | `ads-generate-campaigns` edge fn | Ad copy pricing | Ads only | No (code) | ⚠️ Isolated | Yes | ✅ Updated to match canonical prices |
| Operational fees | `pricing_policies` | Fees/surcharges | CRM, Admin | ✅ | ✅ | No | — |
| Policies config fallback | `pricingConfig.ts` → `POLICIES` | Fees/surcharges | Fallback | No (code) | Fallback | Yes | Migrate consumers to DB |
| Extras catalog (DB) | `pricing_extras` | Add-on items | CRM, Admin | ✅ | ✅ | No | — |
| Extras catalog (operational) | `extra_catalog` | Operational extras | Dispatch | ✅ | Overlap | No | Consolidate with pricing_extras |
| Zone surcharges | `pricing_zones` | Zone pricing | CRM, Quote | ✅ | ✅ | No | — |
| Dumpster sizes | `dumpster_sizes` | Size catalog | CRM, Quote, Dispatch | ✅ | ✅ | No | — |
| Material catalog | `material_catalog` | Material types | CRM, Quote | ✅ | ✅ | No | — |
| Rental periods | `rental_term_catalog` | Rental terms | Quote, Admin | ✅ | ✅ | No | — |
| Waste profiles | `waste_profiles` | Weight behavior | Quote, CRM | ✅ | ✅ | No | — |
| Customer dump site rules | `customer_required_dump_rules` | Disposal premium | CRM, Quote | ✅ | ✅ | No | — |
| Rush fees | `rush_delivery_config` | Rush pricing | CRM, Quote | ✅ | ✅ | No | — |
| Contractor tiers | `contractor_tiers` | Discounts | CRM, Admin | ✅ | ✅ | No | — |
| Market rates | `market_rates` | Market pricing | CRM, Quote | ✅ | ✅ | No | — |
| City display pricing | `city_display_pricing` | SEO display | SEO pages | ✅ | ✅ | No | — |
| **Public price catalog** | `public_price_catalog` | Public display | Website via hooks | ✅ | ✅ | No | ✅ Seeded v1.0 |
| **CRM calculator rules** | `crm_calculator_rules` | Calculator config | CRM | ✅ | ✅ | No | — |
| **Public quote display rules** | `public_quote_display_rules` | Quote UI config | Website | ✅ | ✅ | No | — |
| **Pricing change log** | `pricing_change_log` | Audit trail | Admin | ✅ | ✅ | No | — |

## 6-Yard Status

- **DECOMMISSIONED** — no active 6-yard entries in any canonical table
- `serviceAreas.ts` FAQ fixed: "6 to 50 yards" → "5 to 50 yards"
- `ads-generate-campaigns` edge function fixed: removed 6yd key, prices aligned to canonical

## Config Fallback Files

These code files remain as fallbacks when DB rows are missing:
1. `src/config/pricingConfig.ts` — General Debris sizes/prices, policies
2. `src/config/heavyMaterialConfig.ts` — Heavy service costs, groups, dump fees
3. `src/lib/shared-data.ts` → `DUMPSTER_SIZES_DATA` — Size metadata (used by `useDumpsterSizes` as fallback)

**Strategy**: DB-first with config fallback. Key pages wired to hooks.

## Pages Wired to Public Catalog

| Page | Hook | Status |
|------|------|--------|
| `SeoCityPage.tsx` | `useDumpsterSizes` | ✅ |
| `CommercialLandingPage.tsx` | `useDumpsterSizes` | ✅ |
| `ServicePage.tsx` | `useDumpsterSizes` | ✅ |
| `cityData.ts` (JSON-LD) | Direct import | ⬜ Acceptable for build-time |
| `sitemap-generator.ts` | Direct import | ⬜ Acceptable for build-time |
| Other SEO pages (~30 files) | Direct import | ⬜ Progressive migration |

## Dead/Deprecated Code

| Item | Status | Action |
|------|--------|--------|
| Legacy `HEAVY_MATERIAL` in pricingConfig.ts | Deprecated, kept for fallback | Remove after full DB migration |
| 6-yard size | Decommissioned | Auto-mapped to 5-yard |
