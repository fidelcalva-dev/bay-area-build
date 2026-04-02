# Final Pricing Simplification Summary

Last updated: 2026-04-02

## Target Architecture — Achieved

| Layer | Purpose | Service | Source |
|-------|---------|---------|--------|
| A — Internal Base | CRM, quotes, docs, simulator | `masterPricingService.ts` | DB pricing tables |
| B — Public Catalog | Website display pricing | `publicPricingService.ts` | `public_price_catalog` |
| C — Exact Quote | Website/CRM exact quotes | `masterPricingService.ts` | Smart Engine + DB |

## Sources Audited: 26

See `docs/PRICING_SOURCE_AUDIT.md` for the complete table.

## What Was Consolidated

### New Canonical Tables Created
1. `public_price_catalog` — Compiled published prices for website (19 rows seeded)
2. `rental_term_catalog` — Rental period options with version binding (4 rows)
3. `public_quote_display_rules` — Website quote UI configuration (1 row)
4. `crm_calculator_rules` — Internal calculator configuration (1 row)
5. `pricing_change_log` — Field-level change tracking

### New Service Layer
1. `publicPricingService.ts` — Reads from public catalog with 5-min cache + config fallback
2. `pricingCatalogCompiler.ts` — Compiles public catalog from internal tables
3. `pricingVersionService.ts` — Draft/publish/archive version lifecycle

### Admin Hub Enhanced
- Added Versioning/Publish tab (`/admin/pricing?tab=versioning`)
- Added sticky action bar with Simulator, Health, Versioning, and Publish buttons
- Added right summary sidebar showing live version, health status, and quick nav
- Total: 33 tabs across 5 groups

## How Public Pricing Works

1. Admin edits prices in `/admin/pricing` (general debris, heavy rates, etc.)
2. Admin publishes version → `compilePriceCatalog()` runs
3. Compiler reads internal tables → writes to `public_price_catalog`
4. Website pages call `publicPricingService.ts` → reads from `public_price_catalog`
5. If DB is empty, falls back to `pricingConfig.ts` constants
6. Public pages show "From $X" representative pricing

## How Internal Pricing Works

1. User enters ZIP in quote flow
2. `masterPricingService.getPriceRangeForZip()` resolves:
   - Market from ZIP → yard → dump site → zone surcharge
3. Smart Pricing Engine calculates exact internal cost
4. Applies channel tier multiplier (BASE/CORE/PREMIUM)
5. Returns price range (low/high) for quote display
6. CRM, documents, and simulator use same engine

## Versioning Model

| Status | Who Sees | Editable |
|--------|----------|----------|
| draft | Admin, Simulator | ✅ |
| pending_approval | Admin | Read-only |
| published | Everyone | ❌ |
| archived | Admin (read-only) | ❌ |

## Audit Trail

- `pricing_audit_log` — High-level change tracking (existing)
- `pricing_change_log` — Field-level granular tracking (new)
- Both viewable at `/admin/pricing?tab=audit-log`

## Canonical Size Rules

| Category | Sizes | 6-yard |
|----------|-------|--------|
| General Debris | 5, 8, 10, 20, 30, 40, 50 | ❌ Decommissioned |
| Heavy Material | 5, 8, 10 | ❌ |

## Remaining Manual Review Items

1. **Progressive consumer migration**: Update `shared-data.ts` → `DUMPSTER_SIZES_DATA` to hydrate `priceFrom` from `publicPricingService` at app init (currently still hardcoded for SSR/SEO)
2. **SEO page pricing**: City landing pages still use `cityDisplayPricing.ts` → wire to public catalog for consistency
3. **Ads pricing sync**: `adsService.ts` → `BASE_PRICES` should sync with published catalog
4. **Import/Export**: CSV/JSON import/export UI for bulk catalog updates (tab placeholder ready)
5. **Draft comparison**: Side-by-side draft vs. live pricing comparison view
6. **Version binding**: Wire `pricing_version_id` into each catalog row for strict version enforcement
7. **Config fallback removal**: Once all DB rows are populated and stable, remove config file fallbacks
8. **Commission compatibility**: Ensure sales compensation calculations read current pricing version
