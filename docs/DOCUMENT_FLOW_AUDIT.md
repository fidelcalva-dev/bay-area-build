# DOCUMENT / PREVIEW / PDF AUDIT

> Generated: 2026-03-19

## Document Flows Identified

| # | Module | Route/Component | Preview | PDF | Send | Signed Doc | Notes |
|---|--------|----------------|---------|-----|------|------------|-------|
| 1 | Quote Preview | `/portal/quote/:quoteId` | ✅ | ⚠️ Unknown | Via SMS link | N/A | Customer-facing |
| 2 | Quote in Sales | `/sales/quotes/:id` | ✅ | ⚠️ Unknown | CRM send action | N/A | Internal |
| 3 | Contract Sign | `/portal/sign-quote-contract` | ✅ | N/A | N/A | ✅ E-sign flow | |
| 4 | Contract Sign (token) | `/contract/:token` | ✅ | N/A | N/A | ✅ E-sign flow | |
| 5 | Customer Documents | `/portal/documents` | ✅ | ⚠️ Unknown | N/A | ✅ View signed | |
| 6 | Invoice View | `/finance/invoices/:orderId` | ✅ | ⚠️ Unknown | N/A | N/A | Internal |
| 7 | Payment Receipt | `/portal/payment-complete` | ✅ | N/A | N/A | N/A | |
| 8 | Internal Docs | `/admin/docs` | ✅ | N/A | N/A | N/A | Knowledge base |

---

## Notes
- PDF generation uses `jspdf` + `jspdf-autotable` (installed dependencies)
- `html-to-image` also installed — may be used for document snapshots
- Runtime verification needed to confirm PDF download works for quotes/invoices
- Contract signing flow appears functional via token-based access
