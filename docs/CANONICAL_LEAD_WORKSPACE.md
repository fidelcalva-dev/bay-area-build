# Canonical Lead Workspace

> Generated: 2026-03-30

## Architecture

```
src/features/leads/
├── index.ts                    # Barrel exports
├── types.ts                    # CrmRole, LeadWorkspaceConfig, ROLE_CONFIGS
├── LeadWorkspaceContext.tsx     # React context for role-based permissions
├── LeadWorkspacePage.tsx        # Wraps SalesLeads with role context
└── LeadDetailPage.tsx           # Wraps LeadDetail with role context
```

## Canonical Base Components

| Component | File | Lines |
|---|---|---|
| Lead Hub (table/pipeline/board) | `src/pages/sales/SalesLeads.tsx` | 741 |
| Lead Detail (tabs) | `src/pages/sales/LeadDetail.tsx` | 741 |
| Pipeline Board | `src/components/sales/SalesPipelineBoard.tsx` | — |
| Cleanup Board | `src/components/sales/CleanupBoard.tsx` | — |

## Route Matrix

| Route | Role | Component |
|---|---|---|
| `/sales/leads` | Sales | `LeadWorkspacePage mode="sales"` |
| `/sales/leads/:id` | Sales | `LeadDetailPage mode="sales"` |
| `/cs/leads` | CS | `LeadWorkspacePage mode="cs"` |
| `/cs/leads/:id` | CS | `LeadDetailPage mode="cs"` |
| `/admin/leads` | Admin | `AdminLeadsHub` (analytics dashboard) |
| `/admin/leads/workspace` | Admin | `LeadWorkspacePage mode="admin"` |
| `/admin/leads/workspace/:id` | Admin | `LeadDetailPage mode="admin"` |

## Views

| View | Type |
|---|---|
| List | Table with all columns, search, filters |
| Pipeline | Kanban board by `lead_status` |
| Cleanup Board | 11-column Kanban for cleanup/bundle leads |

## Saved View Tabs

New, Needs Follow-Up, My Leads, High Intent, Cleanup, Contractors, Bundle, Existing Customer, High Risk, All

## Lead Card Shows

- name, company, city, phone, email
- service_line badge (Dumpster / Cleanup / Bundle)
- source channel
- quality label + score
- status badge
- age, last activity
- contractor badge, recurring badge
- addresses

## Lead Detail Tabs

Overview, Lifecycle Timeline, Timeline, Source & Attribution, Risk & Quality, Risk Check, Follow-Up, AI Chat, Notes

## Permissions by Role

| Capability | Sales | CS | Admin |
|---|---|---|---|
| Create leads | ✅ | ❌ | ✅ |
| Edit leads | ✅ | ❌ | ✅ |
| Move stages | ✅ | ❌ | ✅ |
| Reassign | ❌ | ❌ | ✅ |
| Export PDF | ✅ | ❌ | ✅ |
| View metrics | ❌ | ❌ | ✅ |
| Override controls | ❌ | ❌ | ✅ |
