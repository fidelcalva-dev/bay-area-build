
# Pricing Simplification Plan

## Current State
- **DB tables**: `pricing_general_debris`, `pricing_heavy_groups`, `pricing_heavy_service_costs`, `pricing_policies`, `pricing_extras`, `pricing_versions`, `pricing_zones`, `pricing_audit_log` — all active with v1.0 published
- **Config fallbacks**: `pricingConfig.ts`, `heavyMaterialConfig.ts` — hardcoded prices matching DB
- **Shared data**: `shared-data.ts` → `DUMPSTER_SIZES_DATA` with hardcoded prices used across 98 files
- **Services**: `masterPricingService.ts` (smart pricing engine), `pricingCatalogService.ts` (DB-first CRUD)
- **Size catalog**: `dumpster_sizes` table exists, 7 general + heavy sizes
- **Material catalog**: `material_catalog` table exists
- **Waste profiles**: `waste_profiles` table exists
- **Existing geography**: `zone_zip_codes`, `yards`, `markets`, `city_display_pricing`

## Phase 1: Database Migration (canonical tables)
Add missing canonical tables while preserving existing ones:
1. `public_price_catalog` — compiled published prices for website consumption
2. `rental_term_catalog` — normalize rental periods with version binding
3. `heavy_price_matrix` — compiled heavy prices by market/group/size
4. `general_price_matrix` view — alias over `pricing_general_debris` with version binding
5. `public_quote_display_rules` — what the public quote UI shows
6. `crm_calculator_rules` — internal calculator configuration
7. `pricing_change_log` — field-level change tracking (extend existing `pricing_audit_log`)
8. Add `pricing_version_id` FK to existing catalog tables where missing

## Phase 2: Public Price Catalog Compiler
- Create `compilePriceCatalog()` function that reads published version and builds `public_price_catalog`
- General Debris: 7 sizes × market → public prices
- Heavy Materials: 4 groups × 3 sizes × market → public prices
- Include labels, descriptions, included tons/days

## Phase 3: Service Layer Consolidation
- Create `publicPricingService.ts` — reads only from `public_price_catalog`
- Update `shared-data.ts` to optionally hydrate from DB
- Keep `masterPricingService.ts` for exact internal quotes
- Keep `pricingCatalogService.ts` for admin CRUD

## Phase 4: Admin Hub Tabs
- Add missing tabs to `/admin/pricing`: Public Quote Display, CRM Calculator Rules, Import/Export, Versioning/Publish
- Add sticky top action bar and right summary sidebar

## Phase 5: Website Consumption
- Update public pages to read from `publicPricingService` 
- Keep "from $X" pattern but source from compiled catalog
- Exact quotes still use `masterPricingService`

## Phase 6: Documentation
- Create all 8 required docs
- Full pricing source audit table

## What We Preserve
- All existing tables and data
- All existing admin pricing tabs
- `masterPricingService` for internal exact quotes
- `pricingCatalogService` for admin CRUD
- Published v1.0 version and its data
