# Master Pricing Hub — Consolidation Report

## Canonical Route: `/admin/pricing`

## Hub Architecture: 23 Tabs in 5 Groups

### Core (4 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| General Debris | `overview` | PricingManager | Sizes, base prices, included tons, rental periods |
| Heavy (Location) | `heavy` | LocationPricingManager | Market-based dump fees, size pricing by tier |
| Heavy Rates | `heavy-rates` | HeavyPricingManager | Heavy material flat rates by group and size |
| Material Rules | `materials` | MaterialRulesDashboard | Material classes, dump fees, review rules |

### Geography (7 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Zone Surcharges | `zones` | ZoneSurchargesConfig | Distance-based zone surcharges (A-E) |
| Toll Surcharges | `tolls` | TollSurchargesManager | Toll-based surcharges by zone and yard |
| ZIP Health | `zips` | ZipHealthDashboard | ZIP → zone → market mapping and health |
| Yard Health | `yards` | YardHealthDashboard | Yard coordinates, service radius, status |
| Facility Costs | `facilities` | FacilityCostDashboard | Disposal site costs and surcharge rules |
| City Display | `cities` | CityDisplayZips | City principal ZIPs for SEO pricing display |
| City Rates | `city-rates` | CityRatesManager | Per-city extra ton rates and heavy base pricing |

### Fees & Tiers (3 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Rush Delivery | `rush` | RushDeliveryConfig | Same-day, next-day, and priority fees |
| Contractor Tiers | `contractor` | ContractorPricingConfig | Tier discounts and commercial rules |
| Extras Catalog | `extras` | ExtrasCatalogConfig | Add-on fees, driver-selectable items |

### Rules & Overrides (4 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Mixed / Overage | `mixed-rules` | MixedRulesManager | Mixed material rules, overage rates, included tons |
| Warnings & Caps | `warnings-caps` | WarningsCapsManager | Warning thresholds, price caps, overrides |
| Volume Commitments | `volume` | VolumeCommitmentsManager | Volume tier discounts and commitments |
| Customer Type Rules | `customer-rules` | CustomerTypeRulesPage | Auto-detection rules for customer type scoring |

### Analysis (5 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Simulator | `simulator` | PricingSimulator | Test pricing for any ZIP / material / size |
| Readiness | `readiness` | PricingReadinessDashboard | System-wide pricing integrity score |
| Rush Health | `rush-health` | RushHealthDashboard | Rush fee configuration health |
| Contractor Health | `contractor-health` | ContractorRulesHealth | Contractor rules health checks |
| Extras Health | `extras-health` | ExtrasHealthDashboard | Extras catalog completeness |

## Active Redirects to Hub (23 total)

| Old Route | Redirects To |
|-----------|-------------|
| `/admin/pricing/locations` | `?tab=heavy` |
| `/admin/pricing/simulator` | `?tab=simulator` |
| `/admin/pricing/yard-health` | `?tab=yards` |
| `/admin/pricing/zip-health` | `?tab=zips` |
| `/admin/pricing/facility-costs` | `?tab=facilities` |
| `/admin/pricing/material-rules` | `?tab=materials` |
| `/admin/pricing/zone-surcharges` | `?tab=zones` |
| `/admin/pricing/rush-delivery` | `?tab=rush` |
| `/admin/pricing/contractor-pricing` | `?tab=contractor` |
| `/admin/pricing/extras-catalog` | `?tab=extras` |
| `/admin/pricing/city-display-zips` | `?tab=cities` |
| `/admin/pricing/rush-health` | `?tab=rush-health` |
| `/admin/pricing/contractor-rules` | `?tab=contractor-health` |
| `/admin/pricing/extras-health` | `?tab=extras-health` |
| `/admin/pricing/readiness` | `?tab=readiness` |
| `/admin/pricing-engine` | `/admin/pricing` |
| `/admin/heavy-pricing` | `?tab=heavy-rates` |
| `/admin/mixed-rules` | `?tab=mixed-rules` |
| `/admin/warnings-caps` | `?tab=warnings-caps` |
| `/admin/city-rates` | `?tab=city-rates` |
| `/admin/toll-surcharges` | `?tab=tolls` |
| `/admin/volume-commitments` | `?tab=volume` |
| `/admin/customer-type-rules` | `?tab=customer-rules` |

## Build Status
- **TypeScript errors**: 0
- **All pricing config centralized**: ✅
