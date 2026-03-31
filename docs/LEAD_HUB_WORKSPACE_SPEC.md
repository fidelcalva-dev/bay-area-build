# Lead Hub Workspace Specification

> Last updated: 2026-03-31

## Canonical Route

`/sales/leads` — shared by Sales, CS, and Admin via `LeadWorkspacePage`

## Views

| View | URL | Description |
|---|---|---|
| List (Table) | `/sales/leads` | Default tabular view |
| Pipeline Board | `/sales/leads` (toggle) | Kanban-style pipeline |
| Cleanup Board | `/sales/leads?view=cleanup-board` | Cleanup-focused 11-column board |

## Tabs

| Tab | Filter Logic |
|---|---|
| New | `lead_status = 'new'` |
| Needs Follow-Up | `lead_status IN ('contacted', 'qualified', 'quoted')` |
| My Leads | Client-side filter by `owner_user_id` |
| High Intent | `urgency_score >= 70` |
| Cleanup | `service_line IN ('CLEANUP', 'BOTH')` |
| Contractors | `contractor_flag = true` |
| Bundle | `service_line = 'BOTH' OR bundle_opportunity_flag = true` |
| AI Chat | `source_channel IN ('AI_CHAT', 'AI_ASSISTANT', 'WEBSITE_CHAT', 'WEBSITE_ASSISTANT')` |
| Contact Form | `source_channel IN ('CONTACT_FORM', 'CLEANUP_CONTACT', 'CALLBACK_REQUEST', ...)` |
| Existing Customer | `is_existing_customer = true` |
| High Risk | `lead_quality_label = 'RED'` |
| All | No filter |

## Filters

- Search (name, phone, email, company, city, zip)
- Source channel
- Quality label (GREEN / AMBER / RED)
- Service line (All / Dumpster / Cleanup / Bundle)
- Date range

## Lead Card Content

- Name, company, city
- Service line badge (Dumpster / Cleanup / Bundle)
- Brand badge (Waste Removal for C&D)
- Contractor badge
- Recurring badge
- Bundle badge
- Photos badge
- Site Visit badge
- Source label
- Quote progress (size, material, amount, last step)
- AI conversation summary (🤖)
- Quality score
- Status
- Next best action
- Quick actions: Call, Text, Create Quote

## Stats Row

Total, New, Hot Leads, Follow-Up, Quotes Pending, Jobs Scheduled, Converted, Conv. Rate, Existing, High Risk

## Role Access

| Role | Route | Mode |
|---|---|---|
| Sales | `/sales/leads` | `mode=sales` |
| CS | `/cs/leads` | `mode=cs` |
| Admin | `/admin/leads` | `mode=admin` |
