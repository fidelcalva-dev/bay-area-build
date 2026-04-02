# ZIP Coverage & Geography Model

Last updated: 2026-04-02

## Tables

### `zone_zip_codes`
| Field | Type | Description |
|-------|------|-------------|
| zip_code | TEXT | 5-digit ZIP |
| city_name | TEXT | City name |
| county | TEXT | County |
| market_id | TEXT | FK to markets |
| zone_code | TEXT | Zone A-E |
| nearest_yard_id | UUID | FK to yards |
| quote_enabled | BOOLEAN | Available for quotes |
| dispatch_enabled | BOOLEAN | Available for dispatch |

### `pricing_zones`
| Field | Type | Description |
|-------|------|-------------|
| zone_code | TEXT | A through E |
| label | TEXT | Display label |
| miles_min / miles_max | NUMERIC | Distance range |
| surcharge | NUMERIC | Zone surcharge ($0-$100+) |

### `yards`
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Yard name |
| address | TEXT | Physical address |
| lat / lng | NUMERIC | Coordinates |
| active_for_quotes | BOOLEAN | Available for pricing |
| active_for_dispatch | BOOLEAN | Available for dispatch |
| service_radius_miles | NUMERIC | Coverage radius |

### `markets`
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Market code (e.g., oakland_east_bay) |
| name | TEXT | Display name |
| status | TEXT | Active/inactive |
| default_yard_id | UUID | Primary yard |

### `city_display_pricing`
| Field | Type | Description |
|-------|------|-------------|
| city_slug | TEXT | URL-safe city name |
| city_name | TEXT | Display name |
| primary_zip | TEXT | ZIP used for pricing display |
| is_active | BOOLEAN | Show on SEO pages |

## Resolution Flow

```
ZIP → zone_zip_codes → market_id + zone_code + nearest_yard_id
  → pricing_zones → surcharge
  → yards → coordinates + service radius
  → markets → default rates
```

## Health Checks

- ZIP without zone assignment
- ZIP without market assignment
- ZIP without nearest yard
- City without principal ZIP
- Yard without coordinates
- Yard outside service radius
- Duplicate ZIP entries
