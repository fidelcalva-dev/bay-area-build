# Master Pricing Control Center

Canonical route: `/admin/pricing`  
Last updated: 2026-03-19

## Tab Structure (5 Groups, 24 Tabs)

### Core (4 tabs)
| Tab | Key | Component | Editable Fields |
|-----|-----|-----------|-----------------|
| Overview | `dashboard` | PricingOverviewPanel | — (summary/nav) |
| General Debris | `overview` | PricingManager | size_yd, base_price, included_tons, rental_days, overage_rate, market_code |
| Heavy (Location) | `heavy` | LocationPricingManager | Market-based dump fees, size pricing by tier |
| Heavy Rates | `heavy-rates` | HeavyPricingManager | heavy_group_code, size_yd, service_cost, dump_fee_per_yard, total_price |
| Material Rules | `materials` | MaterialRulesDashboard | material_code, material_class, dump_fee_per_yard, requires_manual_review |

### Geography (6 tabs)
| Tab | Key | Component | Editable Fields |
|-----|-----|-----------|-----------------|
| Zone Surcharges | `zones` | ZoneSurchargesConfig | zone_code, miles_min, miles_max, surcharge |
| Toll Surcharges | `tolls` | TollSurchargesManager | Toll-based zone fees |
| ZIP Health | `zips` | ZipHealthDashboard | zip_code, city_name, market_code, zone_code, nearest_yard_id |
| Yard Health | `yards` | YardHealthDashboard | yard_id, name, lat, lng, service_radius_miles |
| Facility Costs | `facilities` | FacilityCostDashboard | Disposal site costs, surcharge rules |
| City Display | `cities` | CityDisplayZips | city_slug, principal_zip, display_pricing_enabled |
| City Rates | `city-rates` | CityRatesManager | Per-city extra ton rates, heavy base pricing |

### Fees & Tiers (3 tabs)
| Tab | Key | Component | Editable Fields |
|-----|-----|-----------|-----------------|
| Rush Delivery | `rush` | RushDeliveryConfig | standard_fee, next_day_fee, same_day_fee, after_hours_fee, cutoff hours |
| Contractor Tiers | `contractor` | ContractorPricingConfig | tier_code, discount_pct, minimum_margin_pct |
| Extras Catalog | `extras` | ExtrasCatalogConfig | extra_code, amount, pricing_mode, driver_selectable |

### Rules & Overrides (4 tabs)
| Tab | Key | Component | Editable Fields |
|-----|-----|-----------|-----------------|
| Mixed / Overage | `mixed-rules` | MixedRulesManager | Mixed material rules, overage rates |
| Warnings & Caps | `warnings-caps` | WarningsCapsManager | Warning thresholds, price caps |
| Volume Commitments | `volume` | VolumeCommitmentsManager | Volume tier discounts |
| Customer Type Rules | `customer-rules` | CustomerTypeRulesPage | Auto-detection rules for scoring |

### Analysis (5 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Simulator | `simulator` | PricingSimulator | Test pricing for any ZIP/material/size |
| Readiness | `readiness` | PricingReadinessDashboard | System-wide pricing integrity |
| Rush Health | `rush-health` | RushHealthDashboard | Rush fee completeness |
| Contractor Health | `contractor-health` | ContractorRulesHealth | Tier rules validation |
| Extras Health | `extras-health` | ExtrasHealthDashboard | Extras catalog completeness |

## Routes Redirected Into Hub

All 23 legacy routes redirect to `/admin/pricing?tab=<key>`. See `docs/PRICING_FAMILY_AUDIT.md` for the complete matrix.

## Permission Model

| Role | Access |
|------|--------|
| Admin | Full edit all tabs |
| Finance / Pricing | Edit costs, rules, tiers, extras |
| Sales | View + negotiate within guardrails |
| CS | View pricing, limited changes |
| Dispatch / Driver | Read-only operational summaries |

## Pricing Source of Truth

- **Quote Engine**: `smartPricingEngine.ts` → reads from DB tables
- **CRM / Customer 360**: Uses `masterPricingService.ts`
- **SEO City Display**: Uses `city_display_pricing` table via principal ZIP
- **Public Pages**: `pricingConfig.ts` constants (synced with DB)
- **Heavy Materials**: `heavyMaterialConfig.ts` V2 model

## Future Extension Rules

1. New pricing categories → add as new tab in appropriate group
2. New fees/surcharges → add under Fees or Rules group
3. New health checks → add under Analysis group
4. Never create a separate pricing overview page
