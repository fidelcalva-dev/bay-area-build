# Cleanup Board Specification

> Last updated: 2026-03-30

## Location

Inside the canonical Lead Hub at `/sales/leads` — accessible via the "Cleanup" tab.

## Cleanup Board Columns (Pipeline View)

| Column | Filter Logic | SLA |
|---|---|---|
| New Inbound | `service_line IN ('CLEANUP','BOTH') AND lead_status = 'new'` | 1h |
| Pending Contact | `lead_status = 'contacted'` | 24h |
| Waiting on Photos | `photos_uploaded_flag = false AND lead_status IN ('contacted','qualified')` | 48h |
| Scope Review | `lead_status = 'qualified'` | 24h |
| Needs Site Visit | `needs_site_visit = true` | 48h |
| Estimating | `lead_status IN ('quote_started','price_shown')` | 4h |
| Proposal Sent | `lead_status IN ('quote_sent','quote_ready')` | 24h follow-up |
| Follow-Up | `lead_status IN ('contacted','qualified','quoted') AND followup_count > 0` | Daily |
| Scheduled | `lead_status IN ('contract_signed','payment_received','ready_for_dispatch')` | — |
| Won | `lead_status = 'converted'` | — |
| Lost | `lead_status = 'lost'` | — |

## Saved Views (Inside Lead Hub)

| View Name | Filter |
|---|---|
| Cleanup Leads | `service_line IN ('CLEANUP','BOTH')` |
| Contractor Leads | `contractor_flag = true` |
| Recurring Service | `recurring_service_flag = true` |
| Bundle Leads | `service_line = 'BOTH' OR bundle_opportunity_flag = true` |
| Waiting on Photos | `photos_uploaded_flag = false` |
| Needs Site Visit | `needs_site_visit = true` |

## Lead Card Badges (Cleanup Context)

- **C&D** — amber badge for `brand = CALSAN_CD_WASTE_REMOVAL`
- **Cleanup** — emerald badge for `service_line = CLEANUP`
- **Bundle** — purple badge for `service_line = BOTH`
- **Contractor** — outline badge for `contractor_flag = true`
- **Recurring** — outline badge for `recurring_service_flag = true`
- **Photos** — camera icon if `photos_uploaded_flag = true`
- **Site Visit** — map pin icon if `needs_site_visit = true`

## Quick Actions

- Call
- Text
- Email
- Open Lead
- Create Quote
- Request Photos
- Schedule Site Visit
