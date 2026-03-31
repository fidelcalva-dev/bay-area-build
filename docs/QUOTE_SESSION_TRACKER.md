# Quote Session Tracker — Progressive Anonymous Capture

> Last updated: 2026-03-31

## Architecture

```
Visitor enters /quote
    ↓
[useQuoteSessionTracker] creates anonymous session (quote_sessions)
    ↓
Progressive autosave on every step change (debounced 800ms)
    ↓
Step events logged to lead_source_events
    ↓
Contact captured (phone/email)?
    ↓  YES → lead-ingest promotes to Lead
    ↓  NO  → session preserved for Sales recovery
    ↓
Quote submitted → session marked completed
Page closed without submit → session marked abandoned
```

## Two-Level Capture Model

### Level 1: Anonymous Quote Session
- Created immediately on quote page mount
- Captures: device, browser, OS, UTMs, gclid, fbclid, landing page, referrer
- Progressively updated: ZIP, project type, material, size, rental days, notes
- Stored in `quote_sessions` table with `session_token` for dedup

### Level 2: Identified Lead
- Promoted via `lead-ingest` when phone or email is captured
- `quote_sessions.lead_id` linked to `sales_leads.id`
- `promoted_to_lead_at` timestamp recorded
- All attribution carried forward to the lead

## Tables

### quote_sessions (extended)
New attribution fields: `session_token`, `brand_origin`, `service_line`, `source_channel`, `source_page`, `landing_page`, `referrer_url`, UTM fields, `gclid`, `fbclid`, device/browser/OS, `zip`, `city`, `customer_type`, contact fields, `status`, `abandoned_at`, `promoted_to_lead_at`

### lead_source_events (new)
Granular step-by-step event log linked to `quote_session_id` and optionally `lead_id`.

## Edge Function

**`save-quote-session`** handles three actions:
- `upsert` (default): Create or update session, auto-promote to lead on contact capture
- `log_event`: Record granular step events
- `abandon`: Mark session as abandoned (via sendBeacon on page unload)

## Client Hook

**`useQuoteSessionTracker`** (`src/components/quote/v3/hooks/useQuoteSessionTracker.ts`):
- Creates session on mount
- `updateSession(state)` — debounced progressive upsert
- `logEvent(name, payload)` — fire-and-forget event log
- `clearSession()` — clear token on successful submission
- Automatic abandon detection via `beforeunload`

## Integration Points

- Wired into `V3QuoteFlow.tsx` existing autosave effect
- Step completions logged via `goNext()`
- Quote submission logs `quote_submitted` event and clears session
- Compatible with existing `useQuoteDraftAutosave` (localStorage) and `draftQuoteService` (quotes table)
