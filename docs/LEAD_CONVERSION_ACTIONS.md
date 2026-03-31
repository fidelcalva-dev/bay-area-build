# Lead Conversion Actions

> Last updated: 2026-03-31

## Available Actions

### From Lead Hub Table

| Action | Icon | Behavior |
|---|---|---|
| Call | Phone | Opens `tel:` link |
| Text | Message | Opens `sms:` link |
| Create Quote | FileText | Navigates to `/sales/quotes/new?lead_id={id}` |
| View Detail | Row click | Navigates to `/sales/leads/{id}` |

### From Lead Detail Page

| Action | Description |
|---|---|
| Create Dumpster Quote | Opens Master Calculator with lead context |
| Create Cleanup Proposal | Opens quote builder in cleanup mode |
| Create Bundle Quote | Opens quote builder with both service lines |
| Assign Owner | Reassign lead to another rep |
| Move Stage | Change pipeline status |
| Add Note | Add internal note to timeline |
| Mark Won | Set status to converted |
| Mark Lost | Set status to lost (requires loss_reason) |

### Automated Actions (via lead-ingest)

| Trigger | Action |
|---|---|
| New lead created | Auto-assign owner via round-robin |
| Hot priority | 15-min follow-up task |
| High priority | 1-hour follow-up task |
| Normal priority | 4-hour follow-up task |
| Contractor application | Set `contractor_flag = true` |
| Bundle opportunity | Set `bundle_opportunity_flag = true`, `service_line = 'BOTH'` |

## Role Permissions

| Action | Sales | CS | Admin |
|---|---|---|---|
| Create lead | ✅ | ❌ | ✅ |
| Edit lead | ✅ | Limited | ✅ |
| Move stages | ✅ | ❌ | ✅ |
| Create quote | ✅ | ❌ | ✅ |
| Reassign | ❌ | ❌ | ✅ |
| Add notes | ✅ | ✅ | ✅ |
| Call/Text | ✅ | ✅ | ✅ |
