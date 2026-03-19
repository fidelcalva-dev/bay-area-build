# ADMIN HUB STRUCTURE

> Finalized: 2026-03-19

## Top-Level Admin Entry Points

| Page | Route | Purpose |
|------|-------|---------|
| Command Center | `/admin` | Operational dashboard — KPIs, alerts, quick actions |
| Module Registry | `/admin/modules` | Full list of 100+ modules with activation status |
| Configuration Hub | `/admin/configuration` | Visual navigation hub for all settings and module config |
| Business Config | `/admin/config` | Raw DB-backed key-value business rules editor |

### Configuration Hub vs Business Config

| Aspect | `/admin/configuration` | `/admin/config` |
|--------|----------------------|----------------|
| Purpose | Visual navigation to grouped settings & module status | Direct editing of database-backed business parameters |
| Audience | All admin staff | Technical admins |
| UI Style | Card grid with categories | Key-value table editor |
| Data Source | Static module definitions + live status | `config_settings` table |
| Helper Text | "Start here to find any setting or module" | "Edit raw business rules and system parameters" |

## Category Entry Pages

| Category | Canonical Route | Subpages |
|----------|----------------|----------|
| Customers | `/admin/customers` | `/:id` (Customer 360) |
| Orders | `/admin/orders` | `/:id` (Order Detail) |
| Leads | `/admin/leads` | — |
| Users | `/admin/users` | — |
| Pricing | `/admin/pricing` | Heavy rules, zones, ZIPs, yards, extras, contractor, health |
| SEO | `/admin/seo/dashboard` | `/admin/seo/health`, city pages, rules |
| GHL | `/admin/ghl` | — |
| Alerts | `/admin/alerts` | — |
| Ads | `/admin/ads` | Campaigns, rules, markets, logs |
| QA | `/admin/qa/control-center` | Domain health, route health, workflow explorer |

## Sidebar Sections

The admin sidebar (`src/lib/routeCategories.ts`) organizes routes into these collapsible sections:

1. **Control Center** — Command center, module registry, config
2. **Analytics** — Dashboards, reporting
3. **Sales** — Leads, quotes, calculator
4. **Customers** — Customer list, Customer 360
5. **Operations** — Orders, logistics, facilities, yards
6. **Driver** — Driver home, runs, pre-trip
7. **Fleet** — Asset management, maintenance
8. **Finance** — Payments, invoices, AR aging, collections
9. **SEO & Marketing** — SEO dashboard, health, ads, analytics
10. **Integrations** — GHL, telephony, email, payments
11. **Configuration** — Config hub, business config, locations
12. **AI** — AI control, copilots
13. **Admin QA** — Route health, build health, diagnostics

## Navigation Rules

- Sidebar links must point to **canonical routes only** (never to redirect sources).
- Each category has **one obvious entry page** in the sidebar.
- Subpages appear under their parent section, not as competing top-level entries.
- Detail pages (e.g., `/admin/customers/:id`) are not shown in the sidebar — they are navigated to from list views.
