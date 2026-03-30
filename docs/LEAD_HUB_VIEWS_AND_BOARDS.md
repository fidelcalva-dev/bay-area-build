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
