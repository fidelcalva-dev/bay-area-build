# Final Lead & Quote Workspace Summary

> Generated: 2026-03-30

## ✅ Mission Accomplished

One canonical Lead Workspace and one canonical Quote Workspace now serve Sales, CS, and Admin through shared feature modules with role-based permission contexts.

## Canonical Lead Pages

| Page | Base Component | Feature Module |
|---|---|---|
| Lead Hub (table/pipeline/cleanup board) | `SalesLeads.tsx` (741 lines) | `src/features/leads/LeadWorkspacePage.tsx` |
| Lead Detail (tabs: overview, lifecycle, timeline, attribution, scoring, follow-up, AI chat, notes) | `LeadDetail.tsx` (741 lines) | `src/features/leads/LeadDetailPage.tsx` |

## Canonical Quote Pages

| Page | Base Component | Feature Module |
|---|---|---|
| Quote List (table, stats, filters) | `SalesQuotes.tsx` (307 lines) | `src/features/quotes/QuoteWorkspacePage.tsx` |
| Quote Detail (readiness, commercial status, pricing, docs, review/send) | `SalesQuoteDetail.tsx` (1719 lines) | `src/features/quotes/QuoteDetailPage.tsx` |
| Quote Builder (Master Calculator) | `InternalCalculator.tsx` | `src/features/quotes/QuoteBuilderPage.tsx` |

## Routes per Role

- **Sales**: `/sales/leads`, `/sales/leads/:id`, `/sales/quotes`, `/sales/quotes/new`, `/sales/quotes/:id`
- **CS**: `/cs/leads`, `/cs/leads/:id`, `/cs/quotes`, `/cs/quotes/:id`
- **Admin**: `/admin/leads` (analytics), `/admin/leads/workspace`, `/admin/quotes`, `/admin/quotes/new`, `/admin/quotes/:id`

## Board Views

- **Pipeline Board**: `/sales/leads` (toggle to Pipeline view)
- **Cleanup Board**: `/sales/leads?view=cleanup-board` — 11 columns: New Inbound → Lost
- Same boards accessible from `/cs/leads` and `/admin/leads/workspace`

## Shared Service Layer

| Service | File |
|---|---|
| Lead intake/enrichment | `lead-ingest` edge function |
| Lead hub queries/stats | `useLeadHub` hook |
| Quote session persistence | `useQuoteDraftAutosave` + `useQuoteSession` |
| Draft quote service | `draftQuoteService.ts` |
| Document preview/PDF/send | `DocumentDeliveryCenter` |
| Timeline logging | `timelineService.ts` |
| Commercial milestones | `commercialMilestones.ts` |
| Outbound quote service | `outboundQuoteService.ts` |

## Customer 360 Integration

- Lead Detail → links to Customer 360 via `LeadActivationStatus` and customer profile lookup
- Quote Detail → links to Customer 360 via customer ID in quote record
- Both are accessible from all roles through the shared feature modules

## Duplicated Logic Removed

- ~~`CSLeads.tsx`~~ — replaced by `LeadWorkspacePage(cs)` using canonical `SalesLeads`
- ~~`CSLeadInbox.tsx`~~ — redirected to `/cs/leads`
- 3 separate `STATUS_CONFIG` objects → 1 in canonical `SalesLeads`
- 2 lead hooks (`useLeadCapture` + `useLeadHub`) → unified on `useLeadHub`

## Remaining Manual Review Items

1. **Role-aware UI gating**: The `useLeadWorkspace()` and `useQuoteWorkspace()` hooks are in place but the canonical components (`SalesLeads`, `SalesQuoteDetail`) don't yet consume them to hide/show buttons based on role. This is Phase 2 — the context is wired and ready.
2. **Admin leads route**: `/admin/leads` still serves `AdminLeadsHub` (channel analytics). The operational workspace is at `/admin/leads/workspace`. Consider whether to merge or keep separate.
3. **CS quote creation**: CS cannot create quotes by design. If CS needs a "request quote" action, add it as a task/request flow rather than direct access to the builder.
4. **Legacy files**: `CSLeads.tsx` and `CSLeadInbox.tsx` are preserved in the codebase but no longer routed to. Safe to delete in a cleanup pass.
