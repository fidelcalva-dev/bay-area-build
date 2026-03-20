# Quote to Rental Flow

## End-to-End Lifecycle

```
1. Customer visits /quote
2. Enters ZIP → zone lookup → yard determined
3. Selects customer type → project type → material determined
4. Selects size → draft quote auto-created (draftQuoteService)
5. Enters contact info → lead-ingest fires (progressive capture)
6. Sees price → quote session saved (localStorage + server)
7. Reviews access constraints → placement data saved
8. Confirms → save-quote (final) → lead linked → order created
9. Redirected to /quote/schedule → picks delivery date/window
10. Payment requested → customer pays via portal
11. Contract sent → customer signs via /contract/:token
12. Order confirmed → dispatched → delivered → picked up → completed
```

## Step-by-Step Data Flow

### Step 1-2: Location
- `zip` → `zone_zip_codes` → `pricing_zones` (zone, multiplier)
- `addressResult` → geocoding → yard distance calculation
- **Saved to**: localStorage draft, quote session

### Step 3: Customer/Project Type
- `customerType` → homeowner/contractor/commercial
- `selectedProject` → project card with material type, suggested size
- **Saved to**: localStorage draft

### Step 4: Size Selection
- `size` selected (or AI-recommended size accepted)
- Draft quote threshold met → `upsertDraftQuote()` fires
- **Saved to**: localStorage draft, `quotes` table (draft status)

### Step 5: Contact Info
- `customerName`, `customerPhone`, `customerEmail`
- `lead-ingest` fires via `capturePartialLead('contact_captured')`
- **Saved to**: localStorage draft, server draft, `sales_leads` table

### Step 6: Price Display
- Price calculated from `masterPricingService` (city-specific pricing)
- Fallback to zone multiplier × base price
- **Saved to**: quote draft updated with subtotal

### Step 7: Access Constraints
- `AccessConstraintStep` captures placement, gate code, access flags
- **Saved to**: quote draft updated

### Step 8: Confirmation & Submit
- `handleSaveQuote()` → `saveQuote()` → `save-quote` edge function
- `save-quote` (non-draft) triggers:
  - Lead ingest (creates/enriches lead)
  - Internal alert dispatch
  - Quote event logging
- `create-order-from-quote` auto-fires → order created
- Customer redirected to schedule delivery

### Step 9-12: Post-Quote
- `schedule-delivery` edge function → delivery date/window saved
- `send-payment-request` → payment link sent
- `send-contract` → contract/addendum sent
- Portal: `/portal/pay`, `/portal/sign-quote-contract`
- Order lifecycle: draft → confirmed → scheduled → delivered → completed

## Key Services Used

| Service | Role |
|---|---|
| `masterPricingService.ts` | Price calculation |
| `draftQuoteService.ts` | Auto-draft creation |
| `useQuoteDraftAutosave.ts` | Client-side persistence |
| `lead-ingest` (EF) | Lead orchestration |
| `save-quote` (EF) | Quote persistence |
| `create-order-from-quote` (EF) | Order creation |
| `schedule-delivery` (EF) | Delivery scheduling |
| `send-outbound-quote` (EF) | Quote delivery |
| `send-contract` (EF) | Contract delivery |
| `contractService.ts` | Contract management |
| `commercialMilestones.ts` | Timeline logging |
