# Master Catalog & Pricing Control Center

Last updated: 2026-03-20

## Canonical Route

`/admin/pricing` — the **only** pricing/config page. All legacy routes redirect here.

## Tab Structure (5 Groups, 24 Tabs)

### Core (5 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Overview | `dashboard` | PricingOverviewPanel | Summary metrics, quick navigation |
| General Debris | `overview` | PricingManager | Size catalog, base prices, included tons, rental days |
| Heavy (Location) | `heavy` | LocationPricingManager | Market-based dump fees by location |
| Heavy Rates | `heavy-rates` | HeavyPricingManager | **V2 Model**: Service Cost + Dump Fee per Yard |
| Material Rules | `materials` | MaterialRulesDashboard | Material classes, dump fees, review rules |

### Geography (7 tabs)
| Tab | Key | Component |
|-----|-----|-----------|
| Zone Surcharges | `zones` | ZoneSurchargesConfig |
| Toll Surcharges | `tolls` | TollSurchargesManager |
| ZIP Health | `zips` | ZipHealthDashboard |
| Yard Health | `yards` | YardHealthDashboard |
| Facility Costs | `facilities` | FacilityCostDashboard |
| City Display | `cities` | CityDisplayZips |
| City Rates | `city-rates` | CityRatesManager |

### Fees & Tiers (3 tabs)
| Tab | Key | Component |
|-----|-----|-----------|
| Rush Delivery | `rush` | RushDeliveryConfig |
| Contractor Tiers | `contractor` | ContractorPricingConfig |
| Extras Catalog | `extras` | ExtrasCatalogConfig |

### Rules & Overrides (4 tabs)
| Tab | Key | Component |
|-----|-----|-----------|
| Mixed / Overage | `mixed-rules` | MixedRulesManager |
| Warnings & Caps | `warnings-caps` | WarningsCapsManager |
| Volume Commitments | `volume` | VolumeCommitmentsManager |
| Customer Type Rules | `customer-rules` | CustomerTypeRulesPage |

### Analysis (5 tabs)
| Tab | Key | Component |
|-----|-----|-----------|
| Simulator | `simulator` | PricingSimulator |
| Readiness | `readiness` | PricingReadinessDashboard |
| Rush Health | `rush-health` | RushHealthDashboard |
| Contractor Health | `contractor-health` | ContractorRulesHealth |
| Extras Health | `extras-health` | ExtrasHealthDashboard |

## Canonical Catalogs

### Size Catalog
- **General Debris**: 5, 8, 10, 20, 30, 40, 50 yd
- **Heavy Material**: 5, 8, 10 yd only
- Managed in: `dumpster_sizes` table + `pricingConfig.ts` + `heavyMaterialConfig.ts`

### Material/Trash Catalog
- General Debris: 17 customer-facing types
- Heavy Material: 11 customer-facing types
- Manual Review: 6 special handling types
- Prohibited: 12 hazardous types
- Managed in: `material_types` table + `heavyMaterialConfig.ts`

### Heavy Material Groups
| Group | Dump Fee/yd | Materials |
|-------|-------------|-----------|
| CLEAN_NO_1 | $30 | Concrete, Soil, Sand |
| CLEAN_NO_2 | $40 | Tile, Rocks, Asphalt, Granite, Concrete w/rebar, Bricks |
| ALL_MIXED | $50 | Any combination |
| OTHER_HEAVY | $50 | Unlisted (pending review) |

### Heavy Pricing Formula
```
total_price = service_cost + (size_yd × dump_fee_per_yard) + premiums
```

| Size | Service Cost |
|------|-------------|
| 5 yd | $290 |
| 8 yd | $340 |
| 10 yd | $390 |

### Extras Catalog
21 configurable extras including rush, swap, placement, contamination, and compliance items.

## Legacy Model (Retired)
The old increment + volume factor model (`heavy_material_rules` + `size_volume_factors` tables) is **retired**. The `HeavyPricingManager` now displays the canonical V2 model from `heavyMaterialConfig.ts`.

## Pricing Consumers
All consumers read from the same source:
- Website quote → `masterPricingService.ts`
- Internal calculator → `masterPricingService.ts`
- Customer 360 → `masterPricingService.ts`
- SEO city display → `city_display_pricing` table via principal ZIP
- Public pages → `pricingConfig.ts` constants
- Heavy materials → `heavyMaterialConfig.ts`
