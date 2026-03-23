# Material & Item Catalog

Last updated: 2026-03-23

## Material Catalog (DB: `material_catalog`)

### General Debris Materials
| Code | Label | Class |
|------|-------|-------|
| HOUSEHOLD_JUNK | Household Junk | GENERAL_DEBRIS |
| FURNITURE_BULK | Furniture & Bulk | GENERAL_DEBRIS |
| GARAGE_STORAGE_CLEANOUT | Garage/Storage Cleanout | GENERAL_DEBRIS |
| CONSTRUCTION_DEBRIS | Construction Debris | GENERAL_DEBRIS |
| DEMOLITION_DEBRIS | Demolition Debris | GENERAL_DEBRIS |
| MIXED_REMODEL_DEBRIS | Mixed Remodel | GENERAL_DEBRIS |
| ROOFING_SHINGLES | Roofing Shingles | GENERAL_DEBRIS |
| YARD_WASTE | Yard Waste | GENERAL_DEBRIS |
| DRYWALL_PLASTER | Drywall/Plaster | GENERAL_DEBRIS |
| WOOD_FRAMING | Wood Framing | GENERAL_DEBRIS |
| CARPET_PADDING | Carpet/Padding | GENERAL_DEBRIS |

### Heavy Materials
| Code | Label | Heavy Group |
|------|-------|-------------|
| CLEAN_CONCRETE | Clean Concrete | CLEAN_NO_1 |
| CLEAN_SOIL | Clean Soil | CLEAN_NO_1 |
| SAND | Sand | CLEAN_NO_1 |
| TILE | Tile | CLEAN_NO_2 |
| ROCKS_STONE | Rocks/Stone | CLEAN_NO_2 |
| ASPHALT | Asphalt | CLEAN_NO_2 |
| CONCRETE_WITH_REBAR | Concrete w/ Rebar | CLEAN_NO_2 |
| BRICKS | Bricks | CLEAN_NO_2 |
| MIXED_HEAVY | Mixed Heavy | ALL_MIXED |

## Extras Catalog (DB: `pricing_extras`)

| Code | Label | Mode |
|------|-------|------|
| EXTRA_RENTAL_DAY | Extra Rental Day | flat |
| SWAP_SERVICE | Swap Service | flat |
| DUMP_AND_RETURN | Dump & Return | flat |
| SAME_DAY | Same Day Delivery | flat |
| PRIORITY_NEXT_DAY | Priority Next Day | flat |
| AFTER_HOURS_SERVICE | After Hours Service | flat |
| SPECIAL_PLACEMENT | Special Placement | flat |
| DRY_RUN_DELIVERY | Dry Run (Delivery) | flat |
| DRY_RUN_PICKUP | Dry Run (Pickup) | flat |
| DRIVER_WAIT_TIME | Driver Wait Time | per_hour |
| OVERFILL_ABOVE_RAIL | Overfill Above Rail | flat |
| CONTAMINATION_SURCHARGE | Contamination | flat |
| GREEN_HALO_PREMIUM | Green Halo Premium | flat |
| REBAR_PREMIUM | Rebar Premium | flat |
| PERMIT_ASSISTANCE | Permit Assistance | flat |

## Policies (DB: `pricing_policies`)

Operational fees managed via the Fees & Policies tab. Includes contamination fee, overage rate, extra day cost, trip fee, cancellation fee, etc.
