# Internal Pricing Engine Specification

Last updated: 2026-04-02

## Purpose

The internal pricing engine provides exact, location-aware pricing for quotes, CRM calculators, documents, and the simulator. It is NOT used for public display pricing.

## Resolution Order

1. **Smart Pricing Engine** (`smartPricingEngine.ts`) — Location-aware, yard/facility-based
2. **Static Table** (`dumpster_pricing`) — Market-based fallback
3. **Config Constants** (`pricingConfig.ts`, `heavyMaterialConfig.ts`) — Last resort

## Smart Pricing Engine Flow

```
ZIP → resolveMarket(zip) → findNearestYard(zip) → findBestDumpSite(yard, material)
  → calculateInternalCost(delivery + pickup + dump + overhead)
  → applyMargins(channel tier)
  → publicPriceLow / publicPriceHigh
```

## Pricing Layers

| Layer | Source | Purpose |
|-------|--------|---------|
| Base Rate | `pricing_general_debris` | Starting price by size/market |
| Zone Surcharge | `pricing_zones` | Distance-based add-on |
| Material Adjustment | `pricing_heavy_groups` | Heavy material pricing |
| Rush Premium | `rush_delivery_config` | Delivery speed premium |
| Contractor Discount | `contractor_tiers` | Volume/tier discount |
| Extras | `pricing_extras` | Add-on items |
| Customer Dump Site | `customer_required_dump_rules` | Facility-specific premium |

## Heavy Material Formula (V2)

```
total_price = service_cost + (size_yd × dump_fee_per_yard) + premiums
```

| Size | Service Cost |
|------|-------------|
| 5 yd | $290 |
| 8 yd | $340 |
| 10 yd | $390 |

| Group | Dump Fee/yd |
|-------|-------------|
| CLEAN_NO_1 | $30 |
| CLEAN_NO_2 | $40 |
| ALL_MIXED | $50 |
| OTHER_HEAVY | $50 |

## Channel Tiers

| Channel | Tier | Adjustment |
|---------|------|-----------|
| Website | BASE | 0% |
| Sales | CORE | +6% |
| Dispatch | PREMIUM | +15% |

## Consumers

- Website quote flow → `masterPricingService.getPriceRangeForZip()`
- CRM calculator → `masterPricingService.getPriceRangeForZip()`
- Quote detail → uses saved quote amounts
- Customer 360 → reads from quotes table
- Simulator → `masterPricingService.getPriceRangeForZip()`
- Documents → reads from quotes/orders tables
