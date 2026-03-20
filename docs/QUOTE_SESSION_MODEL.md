# Quote Session Model

## Dual-Layer Persistence

### Layer 1: Client-Side (useQuoteDraftAutosave)

**File**: `src/components/quote/v3/useQuoteDraftAutosave.ts`

- **Storage**: localStorage (`v3_quote_draft_v1`)
- **Expiry**: 7 days
- **Debounce**: 400ms
- **Server sync**: When contact info exists, syncs to `quote_drafts` table via `save-quote-draft` edge function

**Persisted Fields**:
- step, zip, formattedAddress, lat, lng
- customerType, selectedProjectId
- size, wantsSwap
- customerName, customerPhone, customerEmail
- termsAccepted, useAddress
- draftToken (server reference)

### Layer 2: Server-Side Draft Quote (draftQuoteService)

**File**: `src/lib/draftQuoteService.ts`

- **Storage**: `quotes` table with `status = 'draft'`
- **Trigger**: When `meetsQuoteThreshold()` returns true (ZIP + material + size > 0)
- **Upsert**: Uses `save-quote` edge function with `draft_mode=true`

**Persisted Fields** (via save-quote):
- zip_code, material_type, user_type
- user_selected_size_yards, recommended_size_yards
- project_type, zone_id, yard_id, yard_name
- distance_miles, distance_bracket
- customer_lat, customer_lng
- street_address (delivery_address), city, state
- customer_name, customer_phone, customer_email
- is_heavy_material, material_class, heavy_material_class
- access_flags, placement_type, gate_code
- delivery_date, delivery_time_window, preferred_delivery_window
- driver_notes, subtotal, estimated_min, estimated_max

### Layer 3: Legacy Session (useQuoteSession)

**File**: `src/components/quote/hooks/useQuoteSession.ts`

- **Storage**: sessionStorage (`calsan_quote_session`)
- **Expiry**: 2 hours
- Kept for backward compatibility; primary persistence is Layer 1+2

## Session Lifecycle

```
User enters ZIP → localStorage draft created
User selects material + size → server draft quote created (save-quote draft_mode=true)
User provides contact → lead-ingest fires, server draft synced
User submits → save-quote (non-draft), lead linked, order created
User abandons → draft persists in localStorage (7 days) + quotes table
User returns → resume banner shown, draft restored
```

## Resume Behavior

1. URL draft token checked first (cross-device)
2. localStorage checked second
3. Step validated for safe resume (validateResumeStep)
4. Resume banner shown if past ZIP step
5. User accepts → state restored; declines → fresh start
