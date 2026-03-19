# Pricing Family Audit

Last updated: 2026-03-19

## Pricing Page Audit Matrix

| Route | Purpose | Canonical | Unique | Hub Tab | Decision |
|-------|---------|-----------|--------|---------|----------|
| `/admin/pricing` | Master Pricing Hub | ✅ YES | All tabs | — | **Canonical hub** |
| `/admin/pricing/locations` | Location-based heavy pricing | ❌ | Market tier pricing | `heavy` | Redirect → `?tab=heavy` |
| `/admin/pricing/simulator` | Pricing simulator | ❌ | Quote simulation | `simulator` | Redirect → `?tab=simulator` |
| `/admin/pricing/yard-health` | Yard health diagnostics | ❌ | Yard coord/status checks | `yards` | Redirect → `?tab=yards` |
| `/admin/pricing/zip-health` | ZIP mapping health | ❌ | ZIP → zone → market checks | `zips` | Redirect → `?tab=zips` |
| `/admin/pricing/facility-costs` | Disposal facility costs | ❌ | Dump site cost basis | `facilities` | Redirect → `?tab=facilities` |
| `/admin/pricing/material-rules` | Material classification | ❌ | Material → dump fee mapping | `materials` | Redirect → `?tab=materials` |
| `/admin/pricing/zone-surcharges` | Zone surcharge config | ❌ | A-E zone surcharges | `zones` | Redirect → `?tab=zones` |
| `/admin/pricing/rush-delivery` | Rush fee config | ❌ | Same-day/next-day fees | `rush` | Redirect → `?tab=rush` |
| `/admin/pricing/contractor-pricing` | Contractor tier config | ❌ | Tier discounts | `contractor` | Redirect → `?tab=contractor` |
| `/admin/pricing/extras-catalog` | Extras/add-on fees | ❌ | Driver-selectable extras | `extras` | Redirect → `?tab=extras` |
| `/admin/pricing/city-display-zips` | City SEO pricing display | ❌ | Principal ZIP mapping | `cities` | Redirect → `?tab=cities` |
| `/admin/pricing/rush-health` | Rush config health | ❌ | Rush completeness checks | `rush-health` | Redirect → `?tab=rush-health` |
| `/admin/pricing/contractor-rules` | Contractor rules health | ❌ | Tier rule validation | `contractor-health` | Redirect → `?tab=contractor-health` |
| `/admin/pricing/extras-health` | Extras completeness | ❌ | Extras catalog health | `extras-health` | Redirect → `?tab=extras-health` |
| `/admin/pricing/readiness` | Pricing readiness | ❌ | System-wide integrity | `readiness` | Redirect → `?tab=readiness` |
| `/admin/heavy-pricing` | Heavy material flat rates | ❌ | V2 heavy rate grid | `heavy-rates` | Redirect → `?tab=heavy-rates` |
| `/admin/mixed-rules` | Mixed material rules | ❌ | Overage/mixed logic | `mixed-rules` | Redirect → `?tab=mixed-rules` |
| `/admin/warnings-caps` | Warning thresholds | ❌ | Price caps & warnings | `warnings-caps` | Redirect → `?tab=warnings-caps` |
| `/admin/city-rates` | City-level rates | ❌ | Per-city heavy/ton pricing | `city-rates` | Redirect → `?tab=city-rates` |
| `/admin/toll-surcharges` | Toll surcharges | ❌ | Toll-based zone fees | `tolls` | Redirect → `?tab=tolls` |
| `/admin/volume-commitments` | Volume tier discounts | ❌ | Volume commitment tiers | `volume` | Redirect → `?tab=volume` |
| `/admin/customer-type-rules` | Customer type scoring | ❌ | Auto-detection rules | `customer-rules` | Redirect → `?tab=customer-rules` |
| `/admin/pricing-engine` | Legacy pricing engine | ❌ | None (duplicate) | — | Redirect → `/admin/pricing` |

## Summary

- **Canonical hub**: `/admin/pricing` (23 tabs, 5 groups)
- **Active redirects**: 23 legacy routes → hub tabs
- **Duplicate overview pages eliminated**: All point to canonical hub
- **No competing pricing dashboards remain**
