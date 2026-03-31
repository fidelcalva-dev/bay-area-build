# Duplicated Logic Recheck

> Last updated: 2026-03-31

## Business Function Scan

| Business Function | Canonical Service | Previously Duplicated | Still Duplicated | Action Needed |
|---|---|---|---|---|
| Lead creation/enrichment | `lead-ingest` edge function | Multiple form handlers | ❌ No | ✅ Clean |
| Lead routing/assignment | `lead-ingest` + scoring engine | Local assignment logic | ❌ No | ✅ Clean |
| Lead workspace rendering | `LeadWorkspacePage` (src/features/leads/) | CSLeads, CSLeadInbox, SalesLeads | ❌ No | ✅ Unified |
| Quote session persistence | `useQuoteSession` + `useQuoteDraftAutosave` | Multiple save patterns | ❌ No | ✅ Clean |
| Draft quote creation | `draftQuoteService.ts` | Inline save logic | ❌ No | ✅ Clean |
| Quote workspace rendering | `QuoteWorkspacePage` (src/features/quotes/) | SalesQuotes standalone | ❌ No | ✅ Unified |
| Pricing calculations | `masterPricingService` | Scattered local calculations | ❌ No | ✅ Clean |
| Document preview | `DocumentDeliveryCenter` | Multiple preview implementations | ❌ No | ✅ Clean |
| PDF generation | `generate-internal-pdf` edge function | — | ❌ No | ✅ Clean |
| Send flows (quote/contract/payment) | `outboundQuoteService` + edge functions | — | ❌ No | ✅ Clean |
| Contract/addendum lifecycle | `contractService` | — | ❌ No | ✅ Clean |
| Timeline event logging | `timelineService.ts` + `logMilestone()` | Local event logging | ❌ No | ✅ Clean |
| Notification dispatch | `internal-alert-dispatcher` edge function | — | ❌ No | ✅ Clean |
| GHL communication | `ghlCommunication` service | — | ❌ No | ✅ Clean |
| Portal access validation | `PortalAuthGuard` + OTP | — | ❌ No | ✅ Clean |
| SEO pricing display | `cityDisplayPricing` + `CityPricingBlock` | — | ❌ No | ✅ Clean |
| Customer 360 linking | `identity_groups` + DB triggers | — | ❌ No | ✅ Clean |
| Lead status configs | Canonical `SalesLeads` STATUS_CONFIG | 3 separate STATUS_CONFIG objects | ❌ No | ✅ Unified |
| Lead hooks | `useLeadHub` | `useLeadCapture` + `useLeadHub` | ❌ No | ✅ Unified on useLeadHub |

## Summary

No duplicated business logic remains active across lead or quote pages. All functions route through canonical services.
