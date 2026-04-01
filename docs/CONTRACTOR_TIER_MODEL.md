# Contractor Tier Model

> Last updated: 2026-04-01

## Tier Table

**Table**: `contractor_tiers`

| Tier Code | Label | Discount | Min Margin | Approval Required |
|---|---|---|---|---|
| `RETAIL` | Retail | 0% | 20% | No |
| `CONTRACTOR_TIER_1` | Contractor Tier 1 | 5% | 18% | No |
| `CONTRACTOR_TIER_2` | Contractor Tier 2 | 8% | 16% | No |
| `COMMERCIAL_ACCOUNT` | Commercial Account | 10% | 15% | No |
| `MANUAL_RATE_CARD` | Custom / Manual | Variable | 10% | Yes |

## Pricing Rules Table

**Table**: `contractor_pricing_rules`

Rules can be defined per tier, per size, per material class:
- `tier_name` (references `contractor_tier` enum)
- `discount_percent`
- `minimum_margin_pct`
- `size_yd` (optional, for size-specific rules)
- `material_class` (optional, for material-specific rules)
- `base_override` (optional)
- `rush_fee_behavior` (apply/waive/discount)
- `zone_surcharge_behavior` (apply/waive/discount)

## Non-Discountable Items

These items are NOT subject to contractor discounts:
- Disposal pass-through fees
- Customer-required dump site premiums
- Green Halo premium
- Rebar premium
- Permit assistance
- Toll surcharges
- Rush / same-day / after-hours fees
- Dry run fees
- Contamination / reroute charges

## How Discounts Apply

1. Quote system looks up customer's `contractor_tier`
2. Fetches matching `contractor_pricing_rules` for tier
3. Applies `discount_percent` to **base price only**
4. Non-discountable line items are excluded
5. Ensures margin ≥ `minimum_margin_pct`
6. `MANUAL_RATE_CARD` requires admin approval

## Enum

```sql
contractor_tier: RETAIL | CONTRACTOR_TIER_1 | CONTRACTOR_TIER_2 | COMMERCIAL_ACCOUNT | MANUAL_RATE_CARD
```
