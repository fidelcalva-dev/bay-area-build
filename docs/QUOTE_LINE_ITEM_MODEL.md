# Quote Line Item Model

## Current Implementation

The quotes table stores pricing as aggregate fields rather than separate line items:

### Quote Header (quotes table)

| Field | Purpose |
|---|---|
| `id` | Quote UUID |
| `customer_name/email/phone` | Customer contact |
| `user_type` | homeowner/contractor/commercial |
| `zip_code` | Service ZIP |
| `zone_id` | Pricing zone reference |
| `material_type` | general/heavy |
| `material_class` | Specific material classification |
| `heavy_material_class` | Heavy group (CLEAN_NO_1, etc.) |
| `project_type` | Project label |
| `user_selected_size_yards` | Customer's chosen size |
| `recommended_size_yards` | AI/system recommendation |
| `rental_days` | Standard 7 |
| `subtotal` | Calculated price |
| `estimated_min/max` | Price range |
| `extras` | JSON array of extras |
| `status` | draft/pending/sent/accepted/converted |
| `yard_id/yard_name` | Assigned yard |
| `distance_miles/bracket` | Distance pricing data |
| `delivery_date/time_window` | Delivery preferences |
| `access_flags/placement_type/gate_code` | Site access |
| `linked_lead_id` | Associated lead |

### Quote Events (quote_events table)

| Field | Purpose |
|---|---|
| `quote_id` | Parent quote |
| `event_type` | DRAFT_CREATED, DRAFT_UPDATED, QUOTE_SAVED, etc. |
| `event_data` | JSON metadata |
| `created_at` | Timestamp |

### Pricing Breakdown

Pricing is calculated dynamically by `masterPricingService.ts`:
- Base price from `dumpster_pricing` table (city-specific)
- Zone multiplier from `pricing_zones`
- Distance adjustment from yard distance
- Heavy material pricing from service cost + dump fee model
- Rush fees, contractor discounts, extras applied as layers

### Future: Formal Line Items

For multi-dumpster quotes and itemized proposals, the recommended schema:

```
quote_line_items:
  - quote_id (FK)
  - line_type: DUMPSTER | SWAP | EXTRA_DAY | RUSH | PLACEMENT | GREEN_HALO | OTHER
  - dumpster_size_yd
  - material_type / material_class
  - quantity
  - rental_days
  - included_tons
  - overage_rate
  - unit_price
  - line_total
  - sort_order
  - notes_customer / notes_internal
```

This would enable A/B/C option proposals and multi-dumpster quotes.
