# Lead Hub Views & Boards

> Last updated: 2026-03-30

## Location

`/sales/leads` — single canonical Lead Hub for both brands.

## Tab Views

| Tab | Filter Logic |
|---|---|
| New | `lead_status = 'new'` |
| Needs Follow-Up | `lead_status IN ('contacted', 'qualified', 'quoted')` |
| My Leads | `owner_user_id = current_user` |
| High Intent | `urgency_score >= 70` |
| Cleanup | `service_line IN ('CLEANUP', 'BOTH')` |
| Contractors | `contractor_flag = true` |
| Bundle | `service_line = 'BOTH' OR bundle_opportunity_flag = true` |
| Existing Customer | `is_existing_customer = true` |
| High Risk | `lead_quality_label = 'RED'` |
| All | No filter |

## Filter Controls

- **Search**: Name, phone, email, company, city, zip
- **Source**: Channel-based filter dropdown
- **Quality**: GREEN / AMBER / RED
- **Service Line**: All / Dumpster / Cleanup / Bundle
- **Date Range**: From / To

## Service Column Badges

Each lead row displays:
- **Brand badge** (C&D) — shown for cleanup brand leads
- **Service line badge** — Dumpster / Cleanup / Bundle
- **Contractor badge** — if `contractor_flag = true`
- **Recurring badge** — if `recurring_service_flag = true`

## View Modes

- **List**: Table view with all columns
- **Pipeline**: Kanban board by `lead_status`

## Cleanup Board (Pipeline View)

Accessible via the Cleanup tab + Pipeline view toggle.

| Column | Status Filter |
|---|---|
| New Inbound | `new` |
| Pending Contact | `contacted` |
| Waiting on Photos | `qualified` + `photos_uploaded_flag = false` |
| Scope Review | `qualified` |
| Needs Site Visit | `needs_site_visit = true` |
| Estimating | `quote_started` / `price_shown` |
| Proposal Sent | `quote_sent` / `quote_ready` |
| Follow-Up | `contacted` / `qualified` with followup_count > 0 |
| Scheduled | `contract_signed` / `payment_received` |
| Won | `converted` |
| Lost | `lost` |
