# Final Unified Lead Hub Summary

> Last updated: 2026-03-31

## Status: FULLY UNIFIED ✅

All lead and quote intake paths converge on the canonical `lead-ingest` orchestrator. Sales, CS, and Admin share the same underlying workspace components via role-based context providers.

## Canonical Systems

| System | Route / Module | Status |
|---|---|---|
| Lead Hub | `/sales/leads` → `LeadWorkspacePage` | ✅ |
| Lead Detail | `/sales/leads/:id` → `LeadDetailPage` | ✅ |
| Quote Workspace | `/sales/quotes` → `QuoteWorkspacePage` | ✅ |
| Quote Builder | `/sales/quotes/new` → `QuoteBuilderPage` | ✅ |
| Quote Detail | `/sales/quotes/:id` → `QuoteDetailPage` | ✅ |
| Customer 360 | `/admin/customers/:id` | ✅ |
| Lead Orchestrator | `lead-ingest` Edge Function | ✅ |
| Pricing Engine | `masterPricingService` | ✅ |
| Document Engine | `generate-internal-pdf` | ✅ |

## Lead Sources (All → `lead-ingest` → `sales_leads` → `/sales/leads`)

| # | Source | File | `source_channel` | Brand | Service Line |
|---|---|---|---|---|---|
| 1 | Website Quote (V3) | `V3QuoteFlow.tsx` | `QUOTE_FLOW` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 2 | Quote Order Flow | `QuoteOrderFlow.tsx` | `WEBSITE_QUOTE` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 3 | Cleanup Quote | `CleanupQuote.tsx` | `CLEANUP_WEBSITE` | CALSAN_CD_WASTE_REMOVAL | CLEANUP |
| 4 | Contact Us | `ContactUs.tsx` | `CONTACT_FORM` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 5 | Cleanup Contact | `CleanupContact.tsx` | `CLEANUP_CONTACT` | CALSAN_CD_WASTE_REMOVAL | CLEANUP |
| 6 | Contractor Application | `ContractorApplication.tsx` | `CONTRACTOR_APPLICATION` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 7 | AI Chat (Calsan) | `CalsanAIChat.tsx` | `AI_CHAT` | Auto-detected | Auto-detected |
| 8 | AI Chat (hook) | `useCalsanChat.ts` | `AI_CHAT` | Auto-detected | Auto-detected |
| 9 | Homepage Assistant | `HomepageAIAssistant.tsx` | `WEBSITE_ASSISTANT` | Auto-detected | DUMPSTER |
| 10 | Conversational Hero | `ConversationalHero.tsx` | `AI_ASSISTANT` | Auto-detected | Auto-detected |
| 11 | AI Start Hub | `AIStartHub.tsx` | `AI_EXPERT_REQUEST` | Auto-detected | Auto-detected |
| 12 | Schedule Delivery | `ScheduleDelivery.tsx` | `SCHEDULE_DELIVERY` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 13 | Quick Order | `QuickOrder.tsx` | `QUICK_ORDER` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 14 | Photo/Media Upload | `CalsanAIChat.tsx` | `WEBSITE_MEDIA` | Auto-detected | Auto-detected |
| 15 | Replacement Form | `ReplacementForm.tsx` | Via `lead-ingest` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 16 | Manual Staff Entry | `SalesLeads.tsx` | Selectable | Selectable | Selectable |
| 17 | Chat Handoff | `chatHandoffService.ts` | `AI_CHAT` | Auto-detected | Auto-detected |
| 18 | Lead Capture proxy | `lead-capture` Edge Function | Pass-through | Pass-through | Pass-through |
| 19 | Google Ads | `lead-from-google-ads` | `GOOGLE_ADS` | CALSAN_DUMPSTERS_PRO | DUMPSTER |
| 20 | Meta Ads | `lead-from-meta` | `META_ADS` | Dynamic | Dynamic |

## Lead Hub Tabs

All Leads, New, Needs Follow-Up, My Leads, High Intent, Cleanup, Contractors, Bundle, AI Chat, Contact Form, Existing Customer, High Risk

## Role-Based Access

| Role | Route | Capabilities |
|---|---|---|
| Sales | `/sales/leads`, `/sales/quotes` | Create, edit, move stages, send docs, convert |
| CS | `/cs/leads`, `/cs/quotes` | View, notes, resend, follow-up, limited edits |
| Admin | `/admin/leads`, `/admin/quotes` | Full access, reassign, override, metrics, audit |

## Shared Architecture

- `src/features/leads/` — `LeadWorkspaceContext`, `LeadWorkspacePage`, `ROLE_CONFIGS`
- `src/features/quotes/` — `QuoteWorkspaceContext`, `QuoteWorkspacePage`, `QUOTE_ROLE_CONFIGS`
- `src/hooks/useLeadHub.ts` — unified query hook with tab/filter/realtime

## Service Line Model

| Dimension | Values |
|---|---|
| Brand | `CALSAN_DUMPSTERS_PRO`, `CALSAN_CD_WASTE_REMOVAL` |
| Service Line | `DUMPSTER`, `CLEANUP`, `BOTH` |
| Intent | `QUOTE_REQUEST`, `CONTACT_REQUEST`, `CONTRACTOR_APPLICATION`, `PHOTO_REVIEW`, `SCHEDULE_REQUEST`, `CALLBACK_REQUEST`, `CHAT_HANDOFF`, `MANUAL_STAFF_LEAD`, `UNKNOWN` |

## Board Structure

- **List View**: Default table with all tabs and filters
- **Pipeline Board**: Kanban-style pipeline stages
- **Cleanup Board**: 11-column cleanup-specific board (`?view=cleanup-board`)

## Cleanup Board Columns

New Inbound → Pending Contact → Waiting on Photos → Scope Review → Needs Site Visit → Estimating → Proposal Sent → Follow-Up → Scheduled → Won → Lost

## Conversion Actions

Call, Text, Create Quote, Create Cleanup Proposal, Create Bundle Quote, Schedule Site Visit, Request Photos, Assign Owner, Merge Duplicate, Mark Won/Lost

## Remaining Manual Review Items

1. Verify `my_leads` tab filters correctly by authenticated user's `owner_user_id`
2. Confirm `/cleanup/for-contractors` also calls `lead-ingest`
3. Monitor `lead-ingest` Edge Function logs for silent failures
4. Cleanup-specific SMS/email templates needed
5. Bundle proposal template format
