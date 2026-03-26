# Final Bay Area Consolidation Summary

Last updated: 2026-03-26

## Sprint Results

### Bay Area Scope: LOCKED ✅
- 9 counties: Alameda, Contra Costa, San Francisco, San Mateo, Santa Clara, Marin, Sonoma, Napa, Solano
- 22 active cities (3 Tier 1 + 19 Tier 2 + 2 Tier 3)
- 213 active ZIPs
- 3 operational yards (Oakland, San Jose, SF)

### Public Pages Kept (Canonical Set)

| Category | Routes | Count |
|----------|--------|-------|
| Core Money Pages | /, /quote, /pricing, /sizes, /materials, /areas, /contractors | 7 |
| Trust/Authority | /about, /contact, /how-it-works, /why-calsan, /why-local-yards, /not-a-broker, /capacity-guide | 7 |
| Bay Area Hubs | /bay-area-dumpster-rental, /dumpster-rental-east-bay, /dumpster-rental-south-bay, /north-bay-dumpster-rental, /california-dumpster-rental | 5 |
| City Domination | /dumpster-rental-oakland-ca, /dumpster-rental-san-jose-ca, /dumpster-rental-san-francisco-ca | 3 |
| Size Intent | /10-yard, /20-yard, /30-yard, /40-yard | 4 |
| Material Intent | /concrete, /dirt, /roofing, /construction-debris, /residential | 5 |
| Commercial | /commercial-dumpster-rental, /construction-dumpsters, /warehouse-cleanout-dumpsters | 3 |
| Contractor Support | /contractor-best-practices, /contractor-resources | 2 |
| Dynamic City | /dumpster-rental/:citySlug | ~22 |
| Dynamic City×Size | /dumpster-rental/:citySlug/:size-yard | ~150+ |
| Dynamic City×Material | /dumpster-rental/:citySlug/:materialSlug | ~150+ |
| ZIP Pages | /service-area/:zip/dumpster-rental | ~213 |
| County Pages | /county/:countySlug/dumpster-rental | 9 |
| Use Cases | /use-cases/:useCaseSlug | ~10+ |
| Yard Hubs | /yards/:yardSlug | ~3+ |
| Blog | /blog, /blog/:articleSlug | Dynamic |
| Legal | /terms, /privacy | 2 |
| **Total estimated indexable** | | **700+** |

### Public Pages Redirected

| Source | Target |
|--------|--------|
| /southern-california-dumpster-rental | /bay-area-dumpster-rental |
| /central-valley-dumpster-rental | /bay-area-dumpster-rental |
| /dumpster-rental/oakland | /dumpster-rental-oakland-ca |
| /dumpster-rental/san-jose | /dumpster-rental-san-jose-ca |
| /dumpster-rental/san-francisco | /dumpster-rental-san-francisco-ca |
| /locations | /areas |
| Out-of-area city slugs | /bay-area-dumpster-rental (via market-classification) |

### Public Pages Noindexed

| Page | Reason |
|------|--------|
| /visualizer | Utility tool |
| /technology | Off-strategy |
| /waste-vision | Demo feature |
| /green-impact | Demo feature |
| /green-halo | Demo feature |
| /download-price-list | Lead capture utility |
| /thank-you | Post-conversion |
| /quick-order | Off-strategy |
| /schedule-delivery | Utility step |

### Changes Made This Sprint

1. **routeCategories.ts** — Set indexable: false for /technology, /visualizer, /waste-vision, /green-impact, /green-halo
2. **sitemap.ts** — Removed utility/demo pages and /locations redirect from sitemap
3. **Areas.tsx** — Fixed internal link from /dumpster-rental/san-francisco to /dumpster-rental-san-francisco-ca
4. **robots.txt** — Added disallow for /green-halo, /schedule-delivery

### Non-Core Services Status
No `/services` page exists. No dump truck, porta potty, soil solutions, or construction material delivery pages are present in any public route. The dumpster rental topical cluster is the sole public focus. ✅

### Top City Canonical Choices

| Market | Canonical Winner | Programmatic Redirects To |
|--------|-----------------|--------------------------|
| Oakland | /dumpster-rental-oakland-ca | /dumpster-rental/oakland → canonical |
| San Jose | /dumpster-rental-san-jose-ca | /dumpster-rental/san-jose → canonical |
| San Francisco | /dumpster-rental-san-francisco-ca | /dumpster-rental/san-francisco → canonical |

### Local Authority Recommendations
- See docs/LOCAL_SEO_EXECUTION_PLAN.md for full plan
- GBP optimization for 3 yard locations
- Review generation cadence
- Citation consistency monitoring

### Remaining Manual Review Items
1. `src/lib/cityData.ts` — Tracy entry retained for internal operations
2. `src/config/locationConfig.ts` — Tracy yard config retained for operational use
3. Blog posts mentioning out-of-area cities — content review recommended
4. `seo_cities` DB table — deactivate out-of-area rows via `is_active = false`
5. Google Search Console — submit updated sitemap, request indexing for money pages
6. Consider creating missing size pages: /5-yard, /8-yard, /50-yard
7. Consider creating /dumpster-rental-san-mateo-ca domination page
