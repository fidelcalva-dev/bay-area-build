# Heavy Group Pricing Model — V2

Last updated: 2026-03-20

## Formula

```
total_price = service_cost + (size_yd × dump_fee_per_yard) + premiums
```

## Service Costs (Fixed per Size)

| Size | Service Cost |
|------|-------------|
| 5 yd | $290 |
| 8 yd | $340 |
| 10 yd | $390 |

## Material Groups

### CLEAN_NO_1 — $30/yd dump fee
- Clean Concrete, Clean Soil, Sand
- 5yd: $290 + $150 = **$440**
- 8yd: $340 + $240 = **$580**
- 10yd: $390 + $300 = **$690**

### CLEAN_NO_2 — $40/yd dump fee
- Tile, Rocks/Stone, Asphalt, Granite, Concrete w/rebar, Bricks
- 5yd: $290 + $200 = **$490**
- 8yd: $340 + $320 = **$660**
- 10yd: $390 + $400 = **$790**

### ALL_MIXED — $50/yd dump fee
- Any combination of heavy materials
- 5yd: $290 + $250 = **$540**
- 8yd: $340 + $400 = **$740**
- 10yd: $390 + $500 = **$890**

### OTHER_HEAVY — $50/yd dump fee (default)
- Unlisted material, pending manual review
- Same pricing as ALL_MIXED until classified

## Premiums
| Premium | Amount |
|---------|--------|
| Rebar | +$50 |
| Green Halo | +$75 |
| Contamination (standard) | +$150 |
| Contamination (severe) | +$300 |

## Size Restrictions
- Heavy materials: **5, 8, 10 yd ONLY**
- 6 yd: permanently removed
- 15 yd: permanently removed
- 20+ yd: automatically blocked

## Canonical Source
- Config: `src/config/heavyMaterialConfig.ts`
- Admin UI: `/admin/pricing?tab=heavy-rates`
- Service: `src/lib/masterPricingService.ts`

## Legacy Model (Retired)
The increment + volume factor model (Base 10yd + Increment × Size Factor) is retired.
DB tables `heavy_material_rules` and `size_volume_factors` are no longer used by the active pricing system.
