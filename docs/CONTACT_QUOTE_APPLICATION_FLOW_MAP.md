# Contact, Quote & Application Flow Map

> Last updated: 2026-03-30

## Flow Diagram

```
┌─────────────────────┐
│  /quote             │──→ lead-ingest (QUOTE_FLOW, DUMPSTER, CALSAN_DUMPSTERS_PRO)
└─────────────────────┘
┌─────────────────────┐
│  /cleanup/quote     │──→ lead-ingest (CLEANUP_WEBSITE, CLEANUP, CALSAN_CD_WASTE_REMOVAL)
└─────────────────────┘
┌─────────────────────┐
│  /contact-us        │──→ lead-ingest (CONTACT_FORM, DUMPSTER, CALSAN_DUMPSTERS_PRO)
└─────────────────────┘
┌─────────────────────┐
│  /cleanup/contact   │──→ lead-ingest (CLEANUP_CONTACT, CLEANUP, CALSAN_CD_WASTE_REMOVAL)
└─────────────────────┘
┌─────────────────────┐
│  /contractor-app    │──→ lead-ingest (CONTRACTOR_APPLICATION, DUMPSTER, CALSAN_DUMPSTERS_PRO)
└─────────────────────┘
┌─────────────────────┐
│  AI Chat Widget     │──→ lead-ingest (AI_CHAT, dynamic brand/service_line)
└─────────────────────┘
┌─────────────────────┐
│  Quick Order        │──→ lead-ingest (QUICK_ORDER, DUMPSTER, CALSAN_DUMPSTERS_PRO)
└─────────────────────┘
┌─────────────────────┐
│  Manual Add Lead    │──→ lead-ingest (MANUAL_ENTRY, DUMPSTER, CALSAN_DUMPSTERS_PRO)
└─────────────────────┘

All paths → sales_leads table → /sales/leads (Lead Hub) → Customer 360
```

## Key Principle

No form creates leads via direct DB insert. All paths call `lead-ingest` for consistent:
- Identity resolution & dedup
- Brand + service line tagging
- Lead scoring
- Owner assignment & SLA
- Timeline logging
- Internal notifications
