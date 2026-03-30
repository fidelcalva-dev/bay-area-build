# Lead & Quote Logic Unification Report

> Generated: 2026-03-30

## Unified Service Layer

| Function | Old Location(s) | Canonical Service | Pages Rewired |
|---|---|---|---|
| Lead intake / enrichment | `lead-ingest` edge fn | `lead-ingest` edge fn (unchanged) | All intake paths |
| Lead list + filtering | `SalesLeads`, `CSLeads`, `CSLeadInbox` | `SalesLeads` via `LeadWorkspacePage` | `/sales/leads`, `/cs/leads`, `/admin/leads/workspace` |
| Lead detail | `LeadDetail` (sales only) | `LeadDetail` via `LeadDetailPage` | `/sales/leads/:id`, `/cs/leads/:id`, `/admin/leads/workspace/:id` |
| Lead assignment | `useLeadHub` hook | `useLeadHub` (unchanged) | All lead views |
| Lead status transitions | `SalesLeads`, `CSLeads` (duplicated) | `useLeadHub.updateLeadStatus` | Unified via shared workspace |
| Quote session persistence | `useQuoteDraftAutosave`, `useQuoteSession` | Unchanged (dual-layer) | All quote flows |
| Quote create/update | `SalesQuoteDetail` inline | `SalesQuoteDetail` via `QuoteDetailPage` | `/sales/quotes/:id`, `/cs/quotes/:id`, `/admin/quotes/:id` |
| Quote list + filtering | `SalesQuotes` (sales only) | `SalesQuotes` via `QuoteWorkspacePage` | `/sales/quotes`, `/cs/quotes`, `/admin/quotes` |
| Quote builder | `InternalCalculator` | `InternalCalculator` via `QuoteBuilderPage` | `/sales/quotes/new`, `/admin/quotes/new` |
| Preview/PDF/Send | `DocumentDeliveryCenter` | `DocumentDeliveryCenter` (unchanged) | All quote detail views |
| Timeline event logging | `timelineService.ts` | `timelineService.ts` (unchanged) | All lead/quote detail views |
| Notification dispatch | `lead-ingest` + GHL | Unchanged | All |
| Customer 360 linking | `LeadDetail` → customer link, `QuoteDetail` → customer link | Unchanged | All detail views |

## Duplicated Logic Eliminated

| Was Duplicated | Old Files | Now |
|---|---|---|
| Lead table rendering | `SalesLeads`, `CSLeads`, `CSLeadInbox` | `SalesLeads` only |
| Lead status config/badges | 3 different `STATUS_CONFIG` objects | 1 in `SalesLeads` |
| Lead filtering | `useLeadHub` + `useLeadCapture` (CS) | `useLeadHub` only |
| Lead stats | `useLeadHubStats` + `useLeadStats` (CS) | `useLeadHubStats` via shared workspace |

## Legacy Pages Retired

| Page | File | Status |
|---|---|---|
| `CSLeads` | `src/pages/cs/CSLeads.tsx` | Replaced by `LeadWorkspacePage(cs)` — file preserved for reference |
| `CSLeadInbox` | `src/pages/cs/CSLeadInbox.tsx` | Redirected to `/cs/leads` — file preserved for reference |
