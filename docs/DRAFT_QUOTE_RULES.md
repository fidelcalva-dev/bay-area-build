# Draft Quote Creation Rules

## Threshold

A draft quote is created automatically when ALL of these are true:
- `zip` exists and is 5 digits
- `materialType` is set (general or heavy)
- `size > 0`

**Function**: `meetsQuoteThreshold()` in `src/lib/draftQuoteService.ts`

## Upsert Logic

1. First call creates a new quote with `status = 'draft'`
2. Subsequent calls update the same quote via `existing_quote_id`
3. Session-level tracking prevents duplicate creation (`currentDraftQuoteId`)

## Draft Quote Statuses

| Status | Meaning |
|---|---|
| `draft` | Auto-created, user still in flow |
| `pending` | Submitted by customer (non-draft save) |
| `saved` | Saved by staff internally |
| `sent` | Quote sent to customer |
| `accepted` | Customer accepted |
| `converted` | Converted to order |
| `declined` | Customer declined |
| `expired` | Past validity period |

## Progressive Update Points

Draft quote is updated at every V3QuoteFlow step transition where the threshold is met:
- Size step → initial draft
- Contact step → adds contact info
- Price step → adds pricing
- Access step → adds access/placement data
- Confirm step → final pre-submit update

## Edge Function: save-quote

- `draft_mode=true`: Relaxed validation, no lead-ingest, no alerts
- `draft_mode=false`: Full validation, triggers lead-ingest + internal-alert-dispatcher
- `existing_quote_id`: Updates existing quote instead of creating new

## Event Logging

Every draft create/update logs to `quote_events`:
- `DRAFT_CREATED` — first creation
- `DRAFT_UPDATED` — subsequent updates
- `QUOTE_SAVED` — final non-draft submission
