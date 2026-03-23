# Pricing Consumer Map

Last updated: 2026-03-23

## Source of Truth

All pricing data originates from DB tables managed via `/admin/pricing`.
Config files (`pricingConfig.ts`, `heavyMaterialConfig.ts`) serve as **fallbacks only** when DB rows are not yet populated.

## Canonical Service Layer

`src/lib/pricingCatalogService.ts` — DB-first fetch with config fallback for:
- General debris pricing
- Heavy service costs
- Heavy material groups
- Operational policies/fees

## Consumer → Source Mapping

| Consumer | Current Source | Target Source | Status |
|----------|--------------|---------------|--------|
| Website Quote Flow | `pricingConfig.ts` | `pricingCatalogService` | Migration ready |
| CRM Calculator | `masterPricingService.ts` | `pricingCatalogService` | Migration ready |
| Quote Detail / Preview | `pricingConfig.ts` | `pricingCatalogService` | Migration ready |
| Customer 360 | `masterPricingService.ts` | `pricingCatalogService` | Migration ready |
| Contract Preview | `pricingConfig.ts` | `pricingCatalogService` | Migration ready |
| SEO City Pricing | `cityDisplayPricing.ts` → `pricingConfig.ts` | `pricingCatalogService` | Migration ready |
| Admin Pricing Hub | `pricingCatalogService` | `pricingCatalogService` | ✅ Live |
| Pricing Simulator | `smartPricingEngine.ts` | `pricingCatalogService` | Migration ready |
| Heavy Material Selector | `heavyMaterialConfig.ts` | `pricingCatalogService` | Migration ready |

## Migration Path

Each consumer can be migrated independently by replacing static config imports with async calls to `pricingCatalogService`. The service automatically falls back to config constants when DB rows are missing, ensuring zero downtime during migration.
