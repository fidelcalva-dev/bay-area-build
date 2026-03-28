# City Page QA Audit

Last updated: 2026-03-28

## Audit Criteria

| Check | Weight | Description |
|-------|--------|-------------|
| title_ok | Required | Title < 60 chars, includes city name |
| meta_ok | Required | Meta description < 160 chars, includes city + CTA |
| canonical_ok | Required | Canonical tag present and correct |
| schema_ok | Required | BreadcrumbList + FAQ schema present |
| cta_ok | Required | Quote CTA above fold + bottom CTA |
| content_depth_ok | Required | local_intro + permit_info + pricing_note present |
| stale_content_risk | Warning | No hardcoded prices in copy; uses pricing engine |
| internal_links_ok | Required | Links to /quote, /pricing, /sizes, /materials, nearby |

## Tier 1 Results

| City | title | meta | canonical | schema | CTA | content | stale_risk | links | Action |
|------|-------|------|-----------|--------|-----|---------|------------|-------|--------|
| Oakland | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| San Jose | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| San Francisco | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |

## Tier 2 Results

| City | title | meta | canonical | schema | CTA | content | stale_risk | links | Action |
|------|-------|------|-----------|--------|-----|---------|------------|-------|--------|
| Berkeley | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Alameda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| San Leandro | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Hayward | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Fremont | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Walnut Creek | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Concord | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Pleasanton | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Dublin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Livermore | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Emeryville | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Richmond | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Santa Clara | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Sunnyvale | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Mountain View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Palo Alto | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Milpitas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Cupertino | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Redwood City | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| San Mateo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| South SF | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Daly City | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |

## Tier 3 Results

| City | title | meta | canonical | schema | CTA | content | stale_risk | links | Action |
|------|-------|------|-----------|--------|-----|---------|------------|-------|--------|
| San Rafael | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Santa Rosa | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Petaluma | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Napa | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |
| Vallejo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None | ✅ | None |

## Summary

- **30/30 cities** pass all QA checks
- **0 blocking issues** found
- **0 stale content risks** — all pricing comes from live engine
- No action required for any city page
