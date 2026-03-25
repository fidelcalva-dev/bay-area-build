# Master Dumpster, Waste & Config Control Center

Last updated: 2026-03-25

## Canonical Route

`/admin/pricing` — 34 tabs across 5 groups (Core, Geography, Fees, Rules, Analysis)

## Hub Tab Architecture

### Core (11 tabs)
| Tab | Key | Purpose |
|-----|-----|---------|
| Overview | `dashboard` | Summary, metrics, navigation |
| Dumpster Sizes | `sizes` | Canonical size catalog |
| Waste / Materials | `waste-catalog` | Full material catalog |
| Waste Profiles | `waste-profiles` | Weight-behavior profiles |
| General Debris | `overview` | Size/price reference |
| Edit General Prices | `general-edit` | DB-backed general pricing |
| Heavy (Location) | `heavy` | Market-based heavy pricing |
| Edit Heavy Rates | `heavy-rates` | Service costs + dump fees |
| Material Rules | `materials` | Material class rules |
| Fees & Policies | `policies` | Operational fees |
| Rental Days | `rental-terms` | Rental period options |

### Geography (8 tabs)
| Tab | Key | Purpose |
|-----|-----|---------|
| Zone Surcharges | `zones` | Distance-based zones |
| Toll Surcharges | `tolls` | Toll-based fees |
| ZIP Health | `zips` | ZIP coverage audit |
| Yard Health | `yards` | Yard coordinates/status |
| Facility Costs | `facilities` | Disposal site costs |
| City Display | `cities` | SEO display ZIPs |
| City Rates | `city-rates` | Per-city pricing |
| Dump Site Rules | `dump-site` | Customer-required disposal |

### Fees & Tiers (3 tabs)
| Tab | Key | Purpose |
|-----|-----|---------|
| Rush Delivery | `rush` | Same-day/next-day fees |
| Contractor Tiers | `contractor` | Commercial discounts |
| Extras Catalog | `extras` | Add-on items |

### Rules & Overrides (6 tabs)
| Tab | Key | Purpose |
|-----|-----|---------|
| Mixed / Overage | `mixed-rules` | Mixed material rules |
| Warnings & Caps | `warnings-caps` | Price caps |
| Volume Commitments | `volume` | Volume discounts |
| Customer Type Rules | `customer-rules` | Auto-detection |
| Public Quote Config | `public-display` | Website visibility |
| CRM Calculator | `crm-rules` | Internal calculator rules |

### Analysis (6 tabs)
| Tab | Key | Purpose |
|-----|-----|---------|
| Simulator | `simulator` | Test any scenario |
| Readiness | `readiness` | Integrity score |
| Rush Health | `rush-health` | Rush config health |
| Contractor Health | `contractor-health` | Tier rules health |
| Extras Health | `extras-health` | Catalog completeness |
| Audit Log | `audit-log` | Change history |
