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

### Canonical Tables
1. `public_price_catalog` — Compiled published prices for website (19 rows seeded: 7 general + 12 heavy)
2. `rental_term_catalog` — Rental period options with version binding
3. `public_quote_display_rules` — Website quote UI configuration
4. `crm_calculator_rules` — Internal calculator configuration
5. `pricing_change_log` — Field-level change tracking
6. `pricing_versions` — Version lifecycle (v1.0 published)

### Service Layer
1. `publicPricingService.ts` — Reads from public catalog with 5-min cache + config fallback
2. `pricingCatalogCompiler.ts` — Compiles public catalog from internal tables on publish
3. `pricingVersionService.ts` — Draft/publish/archive version lifecycle

### React Hooks
1. `usePublicPricing.ts` — React Query wrapper for public general/heavy prices
2. `useDumpsterSizes.ts` — Drop-in replacement for `DUMPSTER_SIZES_DATA` imports
3. `useCityDisplayPricing.ts` — City-specific dynamic pricing

### Admin Hub
- `/admin/pricing` with 33+ tabs across 5 groups
- Sticky action bar: Simulator, Health, Versioning, Publish
- Right summary sidebar: live version, health status, quick nav
- `VersioningPublishPanel.tsx` for draft/publish lifecycle

### 6-Yard Cleanup
- Removed from `serviceAreas.ts` FAQ
- Removed from `ads-generate-campaigns` edge function
- No active 6yd entries in any canonical table

## How Public Pricing Works

1. Admin edits prices in `/admin/pricing` (general debris, heavy rates, etc.)
2. Admin publishes version → `compilePriceCatalog()` runs
3. Compiler reads internal tables → writes to `public_price_catalog`
4. `publicPricingService.ts` reads `public_price_catalog` with 5-min cache
5. `useDumpsterSizes` / `usePublicPricing` hooks serve data to React pages
6. If DB is empty, falls back to `pricingConfig.ts` / `shared-data.ts` constants
7. Public pages show "From $X" representative pricing

## How Internal Pricing Works

1. User enters ZIP in quote flow
2. `masterPricingService.getPriceRangeForZip()` resolves market → yard → zone
3. Smart Pricing Engine calculates exact internal cost
4. Applies channel tier multiplier (BASE/CORE/PREMIUM)
5. Returns price breakdown for quote, CRM, documents
6. Contractor tier discount applied to eligible items only

## Versioning Model

| Status | Who Sees | Editable |
|--------|----------|----------|
| draft | Admin, Simulator | ✅ |
| pending_approval | Admin | Read-only |
| published | Everyone | ❌ |
| archived | Admin (read-only) | ❌ |

**Current published version**: v1.0

## Audit Trail

- `pricing_change_log` — Field-level granular tracking
- `audit_logs` — High-level entity change tracking
- Both viewable at `/admin/pricing?tab=audit-log`

## Canonical Size Rules

| Category | Sizes | 6-yard |
|----------|-------|--------|
| General Debris | 5, 8, 10, 20, 30, 40, 50 | ❌ Decommissioned |
| Heavy Material | 5, 8, 10 | ❌ |

## Remaining Manual Review Items

1. **Progressive page migration**: ~30 files still import `DUMPSTER_SIZES_DATA` directly — work correctly via fallback, should adopt hooks progressively
2. **Import/Export UI**: Tab placeholder ready, needs CSV/JSON import with dry-run preview
3. **Draft comparison view**: Side-by-side draft vs. published not yet built
4. **Extras catalog consolidation**: `pricing_extras` and `extra_catalog` overlap — should merge
5. **Config fallback removal**: Remove config fallback paths once DB stability confirmed
6. **Commission compatibility**: Ensure sales compensation reads current pricing version
