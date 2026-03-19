# Pricing Health Matrix

Last updated: 2026-03-19

## Health Checks by Category

### General Debris
- [ ] All 7 canonical sizes have base prices configured
- [ ] Included tons set for each size
- [ ] No duplicate size/market combinations
- [ ] Overage rate ($165/ton) applied consistently

### Heavy Materials
- [ ] All 4 groups × 3 sizes = 12 price points populated
- [ ] Service costs match canonical: 5yd=$290, 8yd=$340, 10yd=$390
- [ ] Dump fee formula produces correct totals
- [ ] No heavy materials allowed on sizes > 10yd

### ZIP / Zone / Market
- [ ] Every active ZIP has a zone assignment
- [ ] Every ZIP has a nearest_yard_id
- [ ] Every city has a principal_zip for SEO display
- [ ] No orphan ZIPs (ZIP without market)
- [ ] Zone surcharges cover A through E

### Yards
- [ ] Every active yard has coordinates (lat/lng)
- [ ] Every yard has a service_radius_miles
- [ ] No yard without a market assignment
- [ ] Fallback yards configured where needed

### Facilities / Dump Sites
- [ ] Every material class has at least one facility
- [ ] Facility costs have dump_cost_per_ton set
- [ ] Contamination and surcharge rules populated

### Rush Delivery
- [ ] Same-day and next-day fees configured
- [ ] Cutoff hours set
- [ ] Daily capacity limits defined

### Contractor Tiers
- [ ] At least one tier configured
- [ ] Discount percentages within 5-10% range
- [ ] Minimum margin floor set
- [ ] Non-discountable items list populated

### Extras
- [ ] Core extras configured (mattress, appliance, tire)
- [ ] Pricing modes set (flat vs per_unit)
- [ ] Driver-selectable flags correct

### Public Display
- [ ] Principal ZIP mapped for each SEO city
- [ ] Display mode configured (from_price, range, disabled)
- [ ] Public prices match quote engine output

## Health Dashboard Locations

| Check Category | Hub Tab |
|---------------|---------|
| ZIP/Zone integrity | `?tab=zips` |
| Yard status | `?tab=yards` |
| Rush completeness | `?tab=rush-health` |
| Contractor rules | `?tab=contractor-health` |
| Extras completeness | `?tab=extras-health` |
| System readiness | `?tab=readiness` |
