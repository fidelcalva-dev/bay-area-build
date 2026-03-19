# Pricing Route Redirect Map

Last updated: 2026-03-19

## Active Redirects → `/admin/pricing`

| Legacy Route | Redirects To | Tab Key |
|-------------|-------------|---------|
| `/admin/pricing/locations` | `/admin/pricing?tab=heavy` | heavy |
| `/admin/pricing/simulator` | `/admin/pricing?tab=simulator` | simulator |
| `/admin/pricing/yard-health` | `/admin/pricing?tab=yards` | yards |
| `/admin/pricing/zip-health` | `/admin/pricing?tab=zips` | zips |
| `/admin/pricing/facility-costs` | `/admin/pricing?tab=facilities` | facilities |
| `/admin/pricing/material-rules` | `/admin/pricing?tab=materials` | materials |
| `/admin/pricing/zone-surcharges` | `/admin/pricing?tab=zones` | zones |
| `/admin/pricing/rush-delivery` | `/admin/pricing?tab=rush` | rush |
| `/admin/pricing/contractor-pricing` | `/admin/pricing?tab=contractor` | contractor |
| `/admin/pricing/extras-catalog` | `/admin/pricing?tab=extras` | extras |
| `/admin/pricing/city-display-zips` | `/admin/pricing?tab=cities` | cities |
| `/admin/pricing/rush-health` | `/admin/pricing?tab=rush-health` | rush-health |
| `/admin/pricing/contractor-rules` | `/admin/pricing?tab=contractor-health` | contractor-health |
| `/admin/pricing/extras-health` | `/admin/pricing?tab=extras-health` | extras-health |
| `/admin/pricing/readiness` | `/admin/pricing?tab=readiness` | readiness |
| `/admin/heavy-pricing` | `/admin/pricing?tab=heavy-rates` | heavy-rates |
| `/admin/mixed-rules` | `/admin/pricing?tab=mixed-rules` | mixed-rules |
| `/admin/warnings-caps` | `/admin/pricing?tab=warnings-caps` | warnings-caps |
| `/admin/city-rates` | `/admin/pricing?tab=city-rates` | city-rates |
| `/admin/toll-surcharges` | `/admin/pricing?tab=tolls` | tolls |
| `/admin/volume-commitments` | `/admin/pricing?tab=volume` | volume |
| `/admin/customer-type-rules` | `/admin/pricing?tab=customer-rules` | customer-rules |
| `/admin/pricing-engine` | `/admin/pricing` | (default) |

## Rules

1. All redirects use `replace` to prevent back-button loops
2. No redirect chains — each goes directly to canonical hub
3. Legacy bookmarks and links continue working
4. Navigation components must link to `/admin/pricing?tab=<key>`, never to legacy routes
