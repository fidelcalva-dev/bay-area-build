# Pricing Configuration Model

Last updated: 2026-03-19

## General Debris Pricing

| Field | Type | Description |
|-------|------|-------------|
| size_yd | number | Dumpster size (5, 8, 10, 20, 30, 40, 50) |
| label | string | Display label |
| active | boolean | Whether size is available |
| public_visible | boolean | Shown on public pages |
| base_price | number | Starting price |
| included_tons | number | Weight included in base price |
| rental_days | number | Standard rental period (default: 7) |
| overage_rate | number | Per-ton charge above included ($165) |
| market_code | string | Market this price applies to |

## Heavy Material Pricing (V2 Model)

**Formula**: `total_price = service_cost + (size_yd × dump_fee_per_yard) + premiums`

| Field | Type | Description |
|-------|------|-------------|
| heavy_group_code | enum | CLEAN_NO_1, CLEAN_NO_2, ALL_MIXED, OTHER_HEAVY |
| size_yd | number | 5, 8, or 10 |
| service_cost | number | Base service cost (5yd: $290, 8yd: $340, 10yd: $390) |
| dump_fee_per_yard | number | Per-yard dump fee (Clean 1: $30, Clean 2: $40, Mixed: $50) |
| dump_fee_total | computed | size_yd × dump_fee_per_yard |
| total_price | computed | service_cost + dump_fee_total |
| rebar_premium | number | Additional charge for concrete with rebar |
| green_halo_premium | number | Green Halo compliance premium |

## Geography Model

### Cities
| Field | Type |
|-------|------|
| city_slug | string |
| city_name | string |
| market_code | string (FK) |
| principal_zip | string |
| display_pricing_enabled | boolean |

### ZIP Codes
| Field | Type |
|-------|------|
| zip_code | string |
| city_name | string |
| market_code | string (FK) |
| zone_code | string |
| nearest_yard_id | uuid (FK) |

### Zones
| Field | Type |
|-------|------|
| zone_code | string (A-E) |
| label | string |
| miles_min / miles_max | number |
| surcharge | number ($0-$100+) |

### Yards
| Field | Type |
|-------|------|
| yard_id | uuid |
| name | string |
| lat / lng | number |
| service_radius_miles | number |
| active_for_quotes | boolean |
| active_for_dispatch | boolean |

## Rush Delivery
| Field | Type |
|-------|------|
| standard_fee | number |
| next_day_fee | number |
| same_day_small_fee / same_day_large_fee | number |
| after_hours_fee | number |
| same_day_cutoff_hour | number |
| daily_capacity | number |

## Contractor / Commercial
| Field | Type |
|-------|------|
| tier_code | string |
| discount_pct | number (5-10%) |
| minimum_margin_pct | number |
| non_discountable_items_json | json |

**Non-discountable**: Heavy flat rates, contamination surcharges, Green Halo, permits, emergency fees.

## Extras
| Field | Type |
|-------|------|
| extra_code | string |
| label | string |
| amount | number |
| pricing_mode | enum (flat, per_unit, per_hour) |
| driver_selectable | boolean |
| customer_visible | boolean |
