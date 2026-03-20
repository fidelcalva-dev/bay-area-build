# Quote Entry Audit

All quote-related entry points and their pipeline connectivity.

## Entry Points

| Entry Point | Route | Creates Lead | Creates Session | Creates Draft Quote | Save Behavior | Status |
|---|---|---|---|---|---|---|
| Website Quote Flow | `/quote` | ✅ via lead-ingest | ✅ useQuoteDraftAutosave (localStorage + server) | ✅ draftQuoteService (ZIP+material+size threshold) | Progressive at every step | ✅ LIVE |
| AI Estimator/Chat | `/chat`, `/estimate` | ✅ via ai-chat-lead | ✅ chat session | ✅ on handoff to quote | On chat milestones | ✅ LIVE |
| Upload Photo/Plan | `/upload-photo` | ✅ via lead-ingest | ❌ (single-action) | ❌ | On submission | ✅ LIVE |
| Schedule Delivery | `/quote/schedule` | ✅ via schedule-delivery EF | ❌ | ❌ (uses existing order) | On schedule confirm | ✅ LIVE |
| Contractor/Commercial | `/contractor`, `/commercial` | ✅ via lead-capture → lead-ingest | ❌ | ❌ | On form submit | ✅ LIVE |
| Callback/Contact | `/contact` | ✅ via lead-capture → lead-ingest | ❌ | ❌ | On form submit | ✅ LIVE |
| Internal Sales Quote | `/sales/quotes/new` | ✅ via save-quote → lead-ingest | ❌ (CRM-managed) | ✅ via save-quote (draft_mode) | On save/submit | ✅ LIVE |
| Customer 360 Actions | `/admin/customers/:id` | ❌ (customer exists) | ❌ | ✅ via QuotesTab create | On action | ✅ LIVE |
| Quote Detail Edit | `/sales/quotes/:id` | ❌ (lead exists) | ❌ | ✅ update existing | On inline save | ✅ LIVE |
| CRM Quick Actions | Various admin pages | ❌ | ❌ | ❌ | Via canonical services | ✅ LIVE |

## Pipeline Flow

```
Entry Point → lead-ingest (Lead Orchestrator) → save-quote (Quote Engine) → quotes table
                                                                          → quote_events table
                                                                          → sales_leads table (linked)
                                                                          → internal-alert-dispatcher
```

## Key Findings

1. **All entry points feed the same pipeline** — lead-ingest is the canonical lead orchestrator
2. **Progressive save is implemented** — V3QuoteFlow fires draft upserts at every step transition
3. **No duplicate lead creation systems** — all routes converge on lead-ingest
4. **Draft quotes auto-created** when threshold met (ZIP + material + size > 0)
