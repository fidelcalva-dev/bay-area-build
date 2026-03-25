# Extras and Customer Required Dump Site Model

Last updated: 2026-03-25

## Extras Catalog

Table: `pricing_extras` + `extra_catalog`

### Required Extras

| Code | Label | Default Amount | Mode | Driver Selectable |
|------|-------|---------------|------|-------------------|
| EXTRA_RENTAL_DAY | Extra Rental Day | $15 | flat | No |
| SWAP_SERVICE | Swap Service | $150 | flat | No |
| DUMP_AND_RETURN | Dump and Return | $200 | flat | No |
| SAME_DAY | Same Day Delivery | $75 | flat | No |
| PRIORITY_NEXT_DAY | Priority Next Day | $50 | flat | No |
| AFTER_HOURS_SERVICE | After Hours Service | $100 | flat | No |
| SPECIAL_PLACEMENT | Special Placement | $0 | review | No |
| DRY_RUN_DELIVERY | Dry Run (Delivery) | $75 | flat | Yes |
| DRY_RUN_PICKUP | Dry Run (Pickup) | $75 | flat | Yes |
| DRIVER_WAIT_TIME | Driver Wait Time | $75 | flat | Yes |
| OVERFILL_ABOVE_RAIL | Overfill Above Rail | $50 | flat | Yes |
| CONTAMINATION_SURCHARGE | Contamination Surcharge | $150 | flat | No |
| MISDECLARED_MATERIAL_REROUTE | Misdeclared Material Reroute | $300 | flat | No |
| GREEN_HALO_PREMIUM | Green Halo Premium | $75 | per_ton | No |
| REBAR_PREMIUM | Rebar Premium | $50 | flat | No |
| CUSTOMER_REQUIRED_DUMP_SITE | Customer Required Dump Site | varies | review | No |

## Customer Required Dump Site

Table: `customer_required_dump_rules`

### Fields

| Field | Description |
|-------|-------------|
| dump_requirement_code | Rule identifier |
| facility_name | Customer-specified facility |
| pricing_mode | flat_premium, per_ton_delta, per_yard_delta, per_mile_delta |
| flat_premium | Fixed premium amount |
| per_ton_delta | Per-ton cost adjustment |
| per_mile_delta | Per-mile cost adjustment |
| admin_fee | Administrative fee |
| requires_approval | Manager approval needed |

### Quote/Calculator Integration

Fields saved on quote:
- `customer_required_dump_flag` (boolean)
- `requested_dump_site_name` (text)
- `requested_dump_site_id` (uuid, optional)
- `required_dump_adjustment` (numeric)
- `disposal_rule_notes` (text)
