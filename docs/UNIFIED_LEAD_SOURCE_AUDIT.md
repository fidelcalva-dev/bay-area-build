# Unified Lead Source Audit

> Last updated: 2026-03-31

## Lead Source Matrix

| # | Source Name | Route / Module | Brand Origin | Service Line | Lead Created | Timeline Event | Notification | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Dumpster Quote (V3) | `/quote` → V3QuoteFlow | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ | ✅ | Working |
| 2 | Quote Order Flow | QuoteOrderFlow | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ | ✅ | Working |
| 3 | Cleanup Quote | `/cleanup/quote` → CleanupQuote | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ | ✅ | ✅ | Working |
| 4 | Main Contact Form | `/contact-us` → ContactUs | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ | ✅ | Working |
| 5 | Cleanup Contact | `/cleanup/contact` → CleanupContact | CALSAN_CD_WASTE_REMOVAL | CLEANUP | ✅ | ✅ | ✅ | Working |
| 6 | Contractor Application | `/contractor-application` | CALSAN_DUMPSTERS_PRO | CLEANUP | ✅ | ✅ | ✅ | Fixed — now sends service_line=CLEANUP |
| 7 | AI Chat (Calsan) | CalsanAIChat | Auto-detected | Auto-detected | ✅ | ✅ | ✅ | Working |
| 8 | AI Chat (hook) | useCalsanChat | Auto-detected | Auto-detected | ✅ | ✅ | ✅ | Working |
| 9 | Homepage Assistant | HomepageAIAssistant | Auto-detected | DUMPSTER | ✅ | ✅ | ✅ | Working |
| 10 | Schedule Delivery | `/schedule` → ScheduleDelivery | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ | ✅ | Working |
| 11 | Quick Order | QuickOrder | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ | ✅ | Working |
| 12 | Photo Upload | CalsanAIChat media | Auto-detected | Auto-detected | ✅ | ✅ | ✅ | Working |
| 13 | Manual Staff Entry | SalesLeads Add Lead | Selectable | Selectable | ✅ | ✅ | ✅ | Working |
| 14 | Lead Capture proxy | lead-capture Edge Function | Pass-through | Pass-through | ✅ | ✅ | ✅ | Working |
| 15 | Google Ads | lead-from-google-ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | ✅ | ✅ | ✅ | Working |
| 16 | Meta Ads | lead-from-meta | Dynamic | Dynamic | ✅ | ✅ | ✅ | Working |

## All Sources → `lead-ingest` → `sales_leads` → `/sales/leads`

Every source listed above calls the canonical `lead-ingest` edge function, which handles dedup, scoring, routing, SLA, task creation, and notification dispatch.

## Failsafe

If `lead-ingest` processing fails, the payload is written to `lead_fallback_queue` so no lead is ever lost.
