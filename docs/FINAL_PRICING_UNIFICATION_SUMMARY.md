# Final Pricing Unification Summary

Last updated: 2026-03-20

## Canonical Route
`/admin/pricing` — 24 tabs across 5 groups (Core, Geography, Fees, Rules, Analysis)

## Changes Made

### 1. Heavy Pricing Model Replaced
- **Old**: Increment + Volume Factor model (`heavy_material_rules` + `size_volume_factors`)
- **New**: V2 Service Cost + Dump Fee per Yard model (`heavyMaterialConfig.ts`)
- `HeavyPricingManager.tsx` completely rewritten to display V2 model
- Legacy formula "Heavy Price = (Base 10yd + Increment) × Size Factor" retired
- New formula: `total = service_cost + (size × dump_fee_per_yard) + premiums`

### 2. Stale Links Fixed
- ConfigurationHub "Programs & Discounts" link updated from `/admin/volume-commitments` → `/admin/pricing?tab=volume`

### 3. All Legacy Routes Redirect to Hub
23 legacy routes redirect to `/admin/pricing?tab=<key>` (see PRICING_ROUTE_REDIRECT_MAP.md)

## Editable Catalogs
| Catalog | Location | Source |
|---------|----------|--------|
| Size Catalog | `?tab=overview` | `dumpster_sizes` table |
| Material Rules | `?tab=materials` | `material_types` table |
| Heavy Groups | `?tab=heavy-rates` | `heavyMaterialConfig.ts` |
| Extras | `?tab=extras` | `extras_catalog` table |
| Zones | `?tab=zones` | `pricing_zones` table |
| Cities | `?tab=cities` | `city_display_pricing` table |
| Yards | `?tab=yards` | `yards` table |

## Pricing Consumers (Unified)
- Website quote, CRM calculator, Customer 360, contracts, SEO display, simulator → all use `masterPricingService.ts` / `heavyMaterialConfig.ts` / `pricingConfig.ts`

## Kept Diagnostic Subviews
ZIP Health, Yard Health, Rush Health, Contractor Health, Extras Health, Readiness — all as hub tabs

## No Competing Pages
No duplicate pricing overview or config pages remain active outside the hub.

## Remaining Manual Review
1. DB tables `heavy_material_rules` and `size_volume_factors` can be dropped when ready (no longer referenced in active code)
2. Future: make heavy group pricing DB-editable (currently config-file based)
3. Future: add inline editing to service costs and dump fee rates
