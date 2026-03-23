# Master Pricing + Quote Calculator Config Center

Last updated: 2026-03-23

## Canonical Route

`/admin/pricing` — 26 tabs across 5 groups

## Hub Structure

### Core (7 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Overview | `dashboard` | PricingOverviewPanel | Summary, metrics, quick nav |
| General Debris | `overview` | PricingManager | Size catalog, base prices, included tons |
| Edit General Prices | `general-edit` | EditableGeneralDebrisPanel | DB-backed editable general debris pricing |
| Heavy (Location) | `heavy` | LocationPricingManager | Market-based dump fees by tier |
| Edit Heavy Rates | `heavy-rates` | EditableHeavyPricingPanel | Editable heavy service costs and dump fees |
| Material Rules | `materials` | MaterialRulesDashboard | Material classes, dump fees, review rules |
| Fees & Policies | `policies` | EditablePoliciesPanel | Editable operational fees and surcharges |

### Geography (7 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Zone Surcharges | `zones` | ZoneSurchargesConfig | Distance-based zone surcharges |
| Toll Surcharges | `tolls` | TollSurchargesManager | Toll-based surcharges |
| ZIP Health | `zips` | ZipHealthDashboard | ZIP → zone → market mapping and health |
| Yard Health | `yards` | YardHealthDashboard | Yard coordinates, service radius |
| Facility Costs | `facilities` | FacilityCostDashboard | Disposal site costs |
| City Display | `cities` | CityDisplayZips | City principal ZIPs for SEO pricing |
| City Rates | `city-rates` | CityRatesManager | Per-city extra ton rates |

### Fees & Tiers (3 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Rush Delivery | `rush` | RushDeliveryConfig | Same-day, next-day, priority fees |
| Contractor Tiers | `contractor` | ContractorPricingConfig | Tier discounts and commercial rules |
| Extras Catalog | `extras` | ExtrasCatalogConfig | Add-on fees, driver-selectable items |

### Rules & Overrides (4 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Mixed / Overage | `mixed-rules` | MixedRulesManager | Mixed material rules, overage rates |
| Warnings & Caps | `warnings-caps` | WarningsCapsManager | Warning thresholds, price caps |
| Volume Commitments | `volume` | VolumeCommitmentsManager | Volume tier discounts |
| Customer Type Rules | `customer-rules` | CustomerTypeRulesPage | Auto-detection scoring rules |

### Analysis (6 tabs)
| Tab | Key | Component | Purpose |
|-----|-----|-----------|---------|
| Simulator | `simulator` | PricingSimulator | Test pricing for any ZIP/material/size |
| Readiness | `readiness` | PricingReadinessDashboard | System-wide pricing integrity |
| Rush Health | `rush-health` | RushHealthDashboard | Rush fee completeness |
| Contractor Health | `contractor-health` | ContractorRulesHealth | Tier rules validation |
| Extras Health | `extras-health` | ExtrasHealthDashboard | Extras catalog completeness |
| Audit Log | `audit-log` | PricingAuditLogPanel | Change history and version control |

## Redirects (23 legacy routes → hub tabs)

All legacy pricing routes redirect to `/admin/pricing?tab=<key>`:
- `/admin/volume-commitments` → `?tab=volume`
- `/admin/customer-type-rules` → `?tab=customer-rules`
- `/admin/pricing/locations` → `?tab=heavy`
- `/admin/pricing/simulator` → `?tab=simulator`
- `/admin/pricing/yard-health` → `?tab=yards`
- `/admin/pricing/zip-health` → `?tab=zips`
- `/admin/pricing/facility-costs` → `?tab=facilities`
- `/admin/pricing/material-rules` → `?tab=materials`
- `/admin/pricing/zone-surcharges` → `?tab=zones`
- `/admin/pricing/rush-delivery` → `?tab=rush`
- `/admin/pricing/contractor-pricing` → `?tab=contractor`
- `/admin/pricing/extras-catalog` → `?tab=extras`
- `/admin/pricing/city-display-zips` → `?tab=cities`
- `/admin/pricing/rush-health` → `?tab=rush-health`
- `/admin/pricing/contractor-rules` → `?tab=contractor-health`
- `/admin/pricing/extras-health` → `?tab=extras-health`
- `/admin/pricing/readiness` → `?tab=readiness`
- `/admin/pricing-engine` → `/admin/pricing`
- `/admin/heavy-pricing` → `?tab=heavy-rates`
- `/admin/mixed-rules` → `?tab=mixed-rules`
- `/admin/warnings-caps` → `?tab=warnings-caps`
- `/admin/city-rates` → `?tab=city-rates`
- `/admin/toll-surcharges` → `?tab=tolls`

## DB Tables (Active)

| Table | Rows | Purpose |
|-------|------|---------|
| pricing_general_debris | 7 | Base prices by size (5–50 yd) |
| pricing_heavy_service_costs | 3 | Service costs for 5/8/10 yd |
| pricing_heavy_groups | 4 | Heavy group dump fees & premiums |
| pricing_policies | 13 | Operational fees & surcharges |
| pricing_extras | 7 | Add-on items catalog |
| pricing_versions | 1 | Draft/publish version control |
| pricing_audit_log | 0 | Field-level change tracking |
| pricing_zones | 2 | Zone surcharges (core-bay, extended-bay) |
| zone_zip_codes | 213 | ZIP → zone → market mapping |

## Consumers (Unified)

Website quote, CRM calculator, Customer 360, contracts, SEO display, simulator → all use `masterPricingService.ts` / `smartPricingEngine.ts` / `pricingCatalogService.ts`
