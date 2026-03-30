# Role → Route Matrix

> Generated: 2026-03-30

## Sales

| Route | Component | Shared Module |
|---|---|---|
| `/sales/leads` | `LeadWorkspacePage mode="sales"` | `src/features/leads` |
| `/sales/leads/:id` | `LeadDetailPage mode="sales"` | `src/features/leads` |
| `/sales/quotes` | `QuoteWorkspacePage mode="sales"` | `src/features/quotes` |
| `/sales/quotes/new` | `QuoteBuilderPage mode="sales"` | `src/features/quotes` |
| `/sales/quotes/:id` | `QuoteDetailPage mode="sales"` | `src/features/quotes` |

## Customer Service

| Route | Component | Shared Module |
|---|---|---|
| `/cs/leads` | `LeadWorkspacePage mode="cs"` | `src/features/leads` |
| `/cs/leads/:id` | `LeadDetailPage mode="cs"` | `src/features/leads` |
| `/cs/quotes` | `QuoteWorkspacePage mode="cs"` | `src/features/quotes` |
| `/cs/quotes/:id` | `QuoteDetailPage mode="cs"` | `src/features/quotes` |

## Admin

| Route | Component | Shared Module |
|---|---|---|
| `/admin/leads` | `AdminLeadsHub` (analytics) | Direct |
| `/admin/leads/workspace` | `LeadWorkspacePage mode="admin"` | `src/features/leads` |
| `/admin/leads/workspace/:id` | `LeadDetailPage mode="admin"` | `src/features/leads` |
| `/admin/quotes` | `QuoteWorkspacePage mode="admin"` | `src/features/quotes` |
| `/admin/quotes/new` | `QuoteBuilderPage mode="admin"` | `src/features/quotes` |
| `/admin/quotes/:id` | `QuoteDetailPage mode="admin"` | `src/features/quotes` |

## Redirects

| From | To |
|---|---|
| `/sales/inbox` | `/sales/leads` |
| `/sales/lead-hub` | `/sales/leads` |
| `/sales/calculator` | `/sales/quotes/new` |
| `/cs/lead-inbox` | `/cs/leads` |
| `/cs/calculator` | `/cs/quotes` |
