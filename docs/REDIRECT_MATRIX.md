# REDIRECT MATRIX

> Finalized: 2026-03-19

## Active Redirects (16)

| # | Source Route | Target Route | Type | Reason |
|---|-------------|-------------|------|--------|
| 1 | `/locations` | `/areas` | Navigate replace | Legacy rename |
| 2 | `/ai-dumpster-assistant` | `/` | Navigate replace | Retired feature |
| 3 | `/preview/quote` | `/quote` | Navigate replace | Dev preview retired |
| 4 | `/preview/home` | `/` | Navigate replace | Dev preview retired |
| 5 | `/admin/control-center` | `/admin` | Navigate replace | Consolidated to index |
| 6 | `/admin/legacy-dashboard` | `/admin` | Navigate replace | Legacy retired |
| 7 | `/admin/pricing-engine` | `/admin/pricing` | Navigate replace | Duplicate retired |
| 8 | `/admin/seo` | `/admin/seo/dashboard` | Navigate replace | Canonical path enforced |
| 9 | `/admin/qa/seo-health` | `/admin/seo/health` | Navigate replace | Moved under SEO |
| 10 | `/admin/ads/overview` | `/admin/ads` | Navigate replace | Duplicate retired |
| 11 | `/admin/markets/new` | `/admin/markets/new-location` | Navigate replace | Path corrected |
| 12 | `/sales/inbox` | `/sales/leads` | Navigate replace | Consolidated lead hub |
| 13 | `/sales/lead-hub` | `/sales/leads` | Navigate replace | Consolidated lead hub |
| 14 | `/driver/legacy` | `/driver` | Navigate replace | Legacy retired |
| 15 | `/:citySlug/:sizeSlug-yard-dumpster` | `/dumpster-rental/:citySlug/:sz-yard` | Legacy SEO | Historic URL pattern |
| 16 | `/:citySlug/:subSlug` | `/dumpster-rental/:citySlug/:subSlug` | Legacy SEO | Historic URL pattern |

## Intentional Aliases (6)

These are NOT redirects — they render the same canonical component at an alternate path for role convenience or backward compatibility.

| # | Alias Route | Canonical Target | Reason | Retirement Plan |
|---|-------------|-----------------|--------|-----------------|
| 1 | `/internal/calculator` | `/sales/quotes/new` | Role convenience | Low priority |
| 2 | `/ops/calculator` | `/sales/quotes/new` | Role convenience | Low priority |
| 3 | `/sales/calculator` | `/sales/quotes/new` | Role convenience | Low priority |
| 4 | `/cs/calculator` | `/sales/quotes/new` | Role convenience | Low priority |
| 5 | `/dispatch/calculator` | `/sales/quotes/new` | Role convenience | Low priority |
| 6 | `/portal/order/:orderId` | `/portal/orders/:orderId` | SMS backward compat | Keep indefinitely |

## Governance Rules

1. **No new redirects** without documenting them here first.
2. **No redirect loops** — every target must be a canonical route that renders a component.
3. **Aliases must not contain separate logic** — they must render the same component as the canonical route.
4. **Navigation links must point to canonical routes**, never to redirect sources.
5. **Query parameters and entity IDs** must be preserved through redirects where applicable.
