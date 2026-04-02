
## Pricing Unification — Remaining Work

### What's Already Done ✓
- `public_price_catalog`, `rental_term_catalog`, `crm_calculator_rules`, `public_quote_display_rules`, `pricing_change_log` tables
- `publicPricingService.ts`, `pricingCatalogCompiler.ts`, `pricingVersionService.ts`
- MasterPricingHub with 33+ tabs, sticky action bar, right sidebar
- `VersioningPublishPanel.tsx`
- All documentation files
- Size/material/waste catalogs in DB

### Phase 1 — Seed Public Catalog & Fix 6yd References
1. Seed `public_price_catalog` with initial published data from config constants
2. Create initial `pricing_versions` record (v1.0 published)
3. Fix `serviceAreas.ts` 6-yard FAQ reference ("6 to 50 yards" → "5 to 50 yards")
4. Fix `ads-generate-campaigns` edge function hardcoded `BASE_PRICES` with 6yd key

### Phase 2 — Create `usePublicPricing` Hook
5. Create `src/hooks/usePublicPricing.ts` — React hook wrapping `publicPricingService.ts` with React Query
6. Create `src/hooks/useDumpsterSizes.ts` — hook that returns `DumpsterSizeData[]` from public catalog with `DUMPSTER_SIZES_DATA` fallback

### Phase 3 — Wire Key Website Pages to Public Catalog
7. Update `SeoCityPage.tsx` to use `usePublicPricing` instead of `DUMPSTER_SIZES_DATA`
8. Update `CommercialLandingPage.tsx` similarly
9. Update `ServicePage.tsx` similarly
10. Update `cityData.ts` schema generation to use public pricing

### Phase 4 — Updated Documentation
11. Update `PRICING_SOURCE_AUDIT.md` with current state
12. Update `FINAL_PRICING_SIMPLIFICATION_SUMMARY.md` with completion status
