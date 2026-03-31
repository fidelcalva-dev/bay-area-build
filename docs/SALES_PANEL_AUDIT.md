# Sales Panel Audit

> Last updated: 2026-03-31

## Dashboard Audit (`/sales`)

| Card / Section | Previous Purpose | Useful | Should Navigate To | Issue Found | Recommendation |
|---|---|---|---|---|---|
| New Leads KPI | Show count | ✅ | `/sales/leads?tab=new` | Not clickable | Made clickable |
| Hot Leads KPI | Show count | ✅ | `/sales/leads?tab=high_intent` | Not clickable | Made clickable |
| Quotes Ready KPI | Show count | ✅ | `/sales/quotes?status=saved` | Not clickable | Made clickable |
| Pipeline Value KPI | Dollar amount | ⚠️ | `/sales/quotes` | Secondary metric on primary row | Moved to secondary |
| Contracts Pending | Count | ⚠️ | — | Belongs to finance/ops | Removed from primary |
| Payments Pending | Count | ⚠️ | — | Belongs to finance | Removed from primary |
| Orders Today | Count | ⚠️ | `/admin/orders` | Belongs to dispatch | Moved to secondary |
| Follow-Ups Due | Count | ✅ | `/sales/leads?tab=needs_followup` | Not clickable | Made clickable primary |
| Dashboard Filters | Status/source/readiness | ❌ | — | Filters apply to nothing visible | Removed |
| SalesPipelineCards | Hot/stale lead cards | ⚠️ | — | Redundant with Lead Hub | Removed |
| SalesScriptLibrary | Scripts reference | ⚠️ | — | Dashboard clutter | Removed |
| HotAILeadsQueue | AI lead queue | ✅ | — | Good but clutters launcher | Removed from dashboard, accessible in Lead Hub |
| Quick Actions | Links to pages | ✅ | Various | Missing contractor/cleanup links | Added |
| Recent Activity | Timeline | ✅ | Various | Not clickable | Made clickable |
| Contractor visibility | — | ❌ | `/sales/leads?tab=contractor` | Not visible on dashboard | Added KPI card |
| Bundle visibility | — | ❌ | `/sales/leads?tab=bundle` | Not visible on dashboard | Added KPI card |
| AI Chat visibility | — | ❌ | `/sales/leads?tab=ai_chat` | Not visible | Added secondary KPI |
| Contact Form visibility | — | ❌ | `/sales/leads?tab=contact_form` | Not visible | Added secondary KPI |

## Changes Made

1. **Redesigned as launcher** — Quick actions at top, primary KPIs, secondary metrics in compact grid
2. **All KPI cards clickable** — Navigate to filtered views
3. **Removed unused filters** — Dashboard filters that applied to nothing
4. **Removed clutter** — Pipeline cards, script library, lifecycle tabs moved to appropriate pages
5. **Added contractor/bundle/AI/contact visibility** — All lead sources represented
6. **Quotes Pending → `/sales/quotes?status=saved`** — Fixed navigation
7. **URL-based tab support** — `/sales/leads?tab=contractor` now works
