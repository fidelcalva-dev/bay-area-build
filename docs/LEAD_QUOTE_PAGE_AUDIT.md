# Lead & Quote Page Audit

> Generated: 2026-03-30

## Lead Pages

| Route | Component | Role | Purpose | Duplicate? | Strongest? | Action |
|---|---|---|---|---|---|---|
| `/sales/leads` | `SalesLeads` | Sales | Full Lead Hub: table, pipeline, cleanup board, filters, badges, SLA, add lead, PDF export | No | **YES** | ✅ KEEP — canonical Lead Workspace |
| `/sales/leads/:id` | `LeadDetail` | Sales | Full lead detail with tabs: Overview, Lifecycle, Timeline, Attribution, Scoring, Follow-Up, AI Chat, Notes | No | **YES** | ✅ KEEP — canonical Lead Detail |
| `/admin/leads` | `AdminLeadsHub` | Admin | Channel analytics dashboard + channel toggle config | No | No | ✅ KEEP — serves different purpose (admin analytics) |
| `/admin/leads/workspace` | `LeadWorkspacePage(admin)` | Admin | Shared Lead Hub in admin mode | NEW | — | ✅ ADDED — admin access to canonical workspace |
| `/admin/leads/workspace/:id` | `LeadDetailPage(admin)` | Admin | Shared Lead Detail in admin mode | NEW | — | ✅ ADDED |
| `/cs/leads` | ~~`CSLeads`~~ → `LeadWorkspacePage(cs)` | CS | Was a basic duplicate (useLeadCapture, no pipeline/board). Now uses canonical workspace | **YES** was dup | — | 🔄 REPLACED — now wraps canonical |
| `/cs/lead-inbox` | ~~`CSLeadInbox`~~ → redirect `/cs/leads` | CS | Was a second duplicate inbox | **YES** was dup | — | ➡️ REDIRECT to `/cs/leads` |
| `/cs/leads/:id` | `LeadDetailPage(cs)` | CS | CS access to full lead detail | NEW | — | ✅ ADDED |

## Quote Pages

| Route | Component | Role | Purpose | Duplicate? | Strongest? | Action |
|---|---|---|---|---|---|---|
| `/sales/quotes` | `SalesQuotes` | Sales | Quote list: table, stats, filters, convert-to-order | No | **YES** | ✅ KEEP — canonical Quote List |
| `/sales/quotes/:id` | `SalesQuoteDetail` | Sales | Full quote detail: readiness, commercial status, pricing, docs, review/send, notes, timeline (1719 lines) | No | **YES** | ✅ KEEP — canonical Quote Detail |
| `/sales/quotes/new` | `InternalCalculator` | Sales | Master Calculator — canonical quote builder | No | **YES** | ✅ KEEP — canonical Quote Builder |
| `/admin/quotes` | `QuoteWorkspacePage(admin)` | Admin | Admin access to canonical quote list | NEW | — | ✅ ADDED |
| `/admin/quotes/:id` | `QuoteDetailPage(admin)` | Admin | Admin access to canonical quote detail | NEW | — | ✅ ADDED |
| `/admin/quotes/new` | `QuoteBuilderPage(admin)` | Admin | Admin access to canonical quote builder | NEW | — | ✅ ADDED |
| `/cs/quotes` | `QuoteWorkspacePage(cs)` | CS | CS access to canonical quote list | NEW | — | ✅ ADDED |
| `/cs/quotes/:id` | `QuoteDetailPage(cs)` | CS | CS access to canonical quote detail | NEW | — | ✅ ADDED |

## Calculator Aliases

| Route | Action |
|---|---|
| `/internal/calculator` | ✅ KEEP (internal/ops use) |
| `/ops/calculator` | ✅ KEEP |
| `/sales/calculator` | ➡️ REDIRECT → `/sales/quotes/new` |
| `/cs/calculator` | ➡️ REDIRECT → `/cs/quotes` |
| `/dispatch/calculator` | ✅ KEEP (dispatch use) |

## Legacy Redirects

| Route | Destination |
|---|---|
| `/sales/inbox` | → `/sales/leads` |
| `/sales/lead-hub` | → `/sales/leads` |
| `/cs/lead-inbox` | → `/cs/leads` |
