# Public Price Catalog Specification

Last updated: 2026-04-02

## Purpose

The `public_price_catalog` table provides a compiled, simplified pricing view for all public-facing website pages. It is populated by the catalog compiler when a pricing version is published.

## Table: `public_price_catalog`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| pricing_version_id | UUID | FK to pricing_versions |
| market_code | TEXT | Market this price applies to (default: 'default') |
| city_slug | TEXT | Optional city-specific override |
| zip_code | TEXT | Optional ZIP-specific override |
| service_line | TEXT | DUMPSTER_RENTAL, CLEANUP_SERVICE, BUNDLE_SERVICE |
| price_family | TEXT | GENERAL_DEBRIS, HEAVY_MATERIAL |
| size_yd | INTEGER | Dumpster size |
| material_group_code | TEXT | For heavy: CLEAN_NO_1, CLEAN_NO_2, ALL_MIXED, OTHER_HEAVY |
| public_price | NUMERIC | The published public price |
| included_days | INTEGER | Rental days included |
| included_tons | NUMERIC | Weight included in base price |
| overage_rate | NUMERIC | Per-ton charge above included |
| public_label | TEXT | Display label (e.g., "10 Yard Dumpster") |
| public_description | TEXT | Short description for public pages |
| public_visible | BOOLEAN | Whether shown on public pages |
| active | BOOLEAN | Whether active |

## Public Families

### General Debris
Rows by: market_code × size_yd (7 sizes: 5, 8, 10, 20, 30, 40, 50)

Shows: public price, included days, included tons, overage rate, description

### Heavy Materials
Rows by: market_code × heavy_group_code × size_yd (4 groups × 3 sizes)

Shows: public price, group label, description, disposal included note

## Compilation

The catalog is compiled by `pricingCatalogCompiler.ts` → `compilePriceCatalog()`:
1. Read general debris prices from `pricing_general_debris`
2. Read heavy pricing from `pricing_heavy_service_costs` + `pricing_heavy_groups`
3. Compute heavy totals: service_cost + (size × dump_fee_per_yard)
4. Upsert into `public_price_catalog`
5. Invalidate public pricing cache

## Consumption

Website pages use `publicPricingService.ts`:
- `fetchPublicGeneralPrices(marketCode)` — cached 5 min
- `fetchPublicHeavyPrices(marketCode)` — cached 5 min
- Falls back to config constants if DB is empty

## Rules

- Public pages must NOT read `pricing_general_debris` directly
- Public pages must NOT read `pricing_heavy_service_costs` directly
- Internal exact quotes continue using `masterPricingService.ts`
