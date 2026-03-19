# PAGE PURPOSE AUDIT

> Generated: 2026-03-19

## Purpose Categories

| Purpose | Count | Key Pages |
|---------|-------|-----------|
| Lead Capture / Quote | 8 | /quote, /quote/contractor, /contractor-application, /contact, /download-price-list, /quick-order |
| SEO / Marketing | ~45 | City, county, ZIP, size, material, hub, domination, blog |
| Customer Portal | 15 | /portal/* — order tracking, payments, documents |
| Sales CRM | 11 | /sales/* — leads, quotes, calls, order builder |
| CS CRM | 8 | /cs/* — orders, requests, messages, calls |
| Dispatch CRM | 10 | /dispatch/* — today, calendar, control tower |
| Driver App | 8 | /driver/* — runs, pre-trip, issues |
| Finance CRM | 9 | /finance/* — invoices, payments, AR aging |
| Admin Configuration | ~40 | Pricing, zones, yards, facilities, materials, vendors |
| Admin Dashboards | ~25 | Executive, KPI, profitability, lead perf, customer health |
| AI Copilots | 11 | /admin/ai/* — per-role copilots |
| QA / Diagnostics | 13 | /admin/qa/* — build, route, SEO, env health |
| SEO Admin | 14 | /admin/seo/* — cities, pages, indexing, repair |
| Local Search | 7 | /admin/local/* — GBP, Bing, Apple, reviews |
| Marketing Analytics | 5 | /admin/marketing/* — visitors, GA4 |
| Telephony | 6 | /admin/telephony/* — calls, numbers, analytics |
| Google Ads | 5 | /admin/ads/* — campaigns, rules, markets |
| Maintenance | 4 | /admin/maintenance/* — trucks, issues, work orders |
| Auth / System | 8 | Login, role router, password, access request, system reset |
| Utility | 8 | Visualizer, waste vision, green impact, green halo |
| Legal | 2 | /terms, /privacy |

---

## PAGES WITH UNCLEAR PURPOSE

| Route | Issue | Confidence |
|-------|-------|------------|
| `/green-impact` | Demo/marketing — noindex, low traffic value | Low |
| `/green-halo` | Demo landing page — noindex | Low |
| `/waste-vision` | Demo/concept page — noindex | Low |
| `/technology` | Noindex — unclear if still relevant | Low |
| `/quick-order` | Off-strategy per dual-path policy? | Medium |
| `/admin/config` vs `/admin/configuration` | Two config entry points | Medium |
| `/admin/legacy-dashboard` | Why still kept? | Low |

---

## OVERLAPPING PAGES

| Page A | Page B | Overlap |
|--------|--------|---------|
| `/admin` (index) | `/admin/control-center` | Same component (CalsanControlCenter) |
| `/admin/config` | `/admin/configuration` | Both are config entry points |
| `/admin/pricing` | `/admin/pricing-engine` | Both pricing dashboards |
| `/admin/alerts` | `/admin/notifications/internal` | Both alerting systems |
| `/admin/dispatch` | `/dispatch` portal | Admin dispatch vs dept dispatch |
| `/admin/facilities` | `/admin/facilities/finder` + `/dispatch/facilities` | Facilities in 3 places |
| `/admin/seo/health` | `/admin/qa/seo-health` | Two SEO health dashboards |
