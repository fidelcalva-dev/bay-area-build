# ZIP Coverage Audit

Last updated: 2026-03-23

## Summary

| Metric | Value |
|--------|-------|
| Total ZIPs | 213 |
| Unique ZIPs | 213 |
| Duplicate ZIPs | 0 |
| Missing city_name | 0 |
| Missing county | 0 |
| Missing market_id | 0 |
| Missing zone_id | 0 |

## Market Distribution

| Market | ZIP Count |
|--------|-----------|
| oakland_east_bay | 112 |
| san_jose_south_bay | 52 |
| san_francisco_peninsula | 49 |

## Zone Distribution

| Zone | Slug | ZIP Count |
|------|------|-----------|
| Core Bay Area | core-bay | 179 |
| Extended Bay Area | extended-bay | 34 |

## County Distribution

| County | ZIP Count |
|--------|-----------|
| Alameda | 47 |
| Contra Costa | 31 |
| Marin | 13 |
| Napa | 5 |
| San Francisco | 27 |
| San Mateo | 22 |
| Santa Clara | 52 |
| Solano | 7 |
| Sonoma | 9 |

All 9 Bay Area counties are represented.

## Active Yards

| Yard | Slug |
|------|------|
| Oakland Yard | oakland |
| San Jose Yard | san-jose |

## Data Completeness

- ✅ All 213 ZIPs have city_name assigned
- ✅ All 213 ZIPs have county assigned
- ✅ All 213 ZIPs have market_id assigned
- ✅ All 213 ZIPs have zone_id (FK to pricing_zones) assigned
- ⚠️ No `nearest_yard_id` column exists on `zone_zip_codes` — yard assignment is inferred from market_id

## Issues Found

1. **No nearest_yard_id column** — The `zone_zip_codes` table uses `zone_id` (FK to `pricing_zones`) but does not have a direct `nearest_yard_id` column. Yard assignment is currently inferred via market → yard mapping in the smart pricing engine.

2. **Only 2 zones** — The system uses `core-bay` (1.00x) and `extended-bay` (1.15x) rather than the A–E zone model referenced in some docs. This is the active configuration.

3. **No quote_enabled / dispatch_enabled flags** — The `zone_zip_codes` table does not have per-ZIP quote or dispatch enablement flags. All ZIPs in the table are implicitly active.

## Recommendations

1. Consider adding `nearest_yard_id` to `zone_zip_codes` for direct yard-to-ZIP mapping
2. Consider adding `is_active` flag for per-ZIP deactivation without deletion
3. The current 2-zone model (core/extended) is functional; expand to A–E only if distance-based granularity is needed
4. ZIP health dashboard at `/admin/pricing?tab=zips` provides auto-fix and issue detection
