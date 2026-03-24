# Quote Conversion Audit — V3 Quote Flow

## Current Step Sequence

| Step | Current Name | Purpose | Fields Collected | Friction Level | Missing Fields | Missed Sales Opportunity | Recommended Change |
|------|-------------|---------|-----------------|----------------|----------------|--------------------------|-------------------|
| 1 | ZIP | Location / yard match | zip, address (optional) | LOW | — | No project hint shown | Add "What are you working on?" teaser |
| 2 | Customer Type | Segment (homeowner/contractor/commercial) | customerType | LOW | — | No perks preview | Show segment benefits inline |
| 3 | Project | Project picker (4 cards per type) | selectedProject | MEDIUM | Custom project text, material sub-type | Limited to 4 projects per type; no "Other" | Expand to 8-12 projects; add "Other + describe" |
| 4 | Size | Recommended + alternatives | size | MEDIUM | Budget preference, quantity | No multi-dumpster; no rental day choice; no extras | Add quantity selector, rental days, "add another" |
| 5 | Contact | Name, phone, email | name, phone, email, consentSms, consentTerms | HIGH (gate) | Company name (contractor), notes | No customer notes field; no photo upload | Add notes textarea + photo upload |
| 6 | Price | Price range display | — (read-only) | LOW | — | No upsell to extras, no rental day upgrade, no text-me-this-quote follow-through | Add extras, rental days, "add heavy dumpster" |
| 7 | Access | Placement & access constraints | accessData (flags, placement, gate code) | MEDIUM | Permit awareness, special dump site | No customer-required dump site | Add dump site option |
| 8 | Confirm | Order summary + terms | termsAccepted | LOW | Delivery date, time window, customer notes | No scheduling; no proposal format; no option A/B/C | Add scheduling + proposal format |
| 9 | Placement | Map placement (post-confirm) | placement geometry | LOW | — | — | Keep as-is |

## Key Findings

### Fields NOT Collected But Needed
1. **Customer notes / special instructions** — No free-text field anywhere in the flow
2. **Rental days** — Hardcoded to 7 days, no selection
3. **Quantity / multi-dumpster** — Cannot add a second dumpster
4. **Extras** — No extras selection (extra days, mattress, tire, etc.)
5. **Customer-required dump site** — No option to specify preferred facility
6. **Photo upload** — No ability to upload job site photos
7. **Delivery date / time window** — Not captured until post-confirm redirect
8. **Company name** — Contractors have no company field
9. **Detailed material sub-type** — Project determines heavy/general but no granular material selection
10. **Permit awareness** — Not asked during quote

### Drop-Off Risk Points
1. **Step 5 (Contact)** — Highest friction: user must provide PII before seeing price
2. **Step 3 (Project)** — Only 4 options per type; users may not find their exact project
3. **Step 8 (Confirm)** — No scheduling means user must wait for callback
4. **Step 6 (Price)** — Price range (not exact) may cause hesitation

### Confusion Points
1. Material classification invisible — user picks "Garage Cleanout" but doesn't know it maps to "general debris"
2. Heavy material rules only shown at price step — too late if user picked wrong project
3. Swap option buried in price card footer
4. No explanation of what happens after confirm

### Missing Upsell / Cross-Sell Opportunities
1. No "add another dumpster" option
2. No rental day upgrade (7 → 14 days)
3. No extras (mattress removal, tire disposal, etc.)
4. No "add heavy-material dumpster" for mixed jobs
5. No dump-and-return option prominently shown
6. Upsell nudge only fires for 10yd → 20yd homeowner scenario

### Weak Trust Sections
1. No real customer testimonial in flow
2. Trust badges generic ("Licensed & Insured") — no specifics
3. No photo of actual team/yard
4. No "money-back" or "price-match" guarantee messaging

### Weak CTA Moments
1. "Continue Booking" on price step is vague
2. "Confirm Order" suggests finality but no payment is taken
3. No "Talk to a specialist" prominent CTA in flow
4. "Text Me This Quote" fires a toast but no actual SMS send confirmed

## Architecture Notes

### Current File: 2,157 lines (V3QuoteFlow.tsx)
- Monolithic component — all 9 steps in one file
- State management: 20+ useState hooks at top level
- Draft auto-save: integrated via useQuoteDraftAutosave
- Lead capture: progressive via lead-ingest edge function
- Draft quote: via draftQuoteService upsert
- Pricing: masterPricingService + legacy fallback
- Analytics: GA4 + custom analytics

### Shared Systems (Already Canonical)
- `masterPricingService` — pricing source of truth
- `lead-ingest` edge function — lead pipeline
- `draftQuoteService` — draft quote persistence
- `save-quote` edge function — quote submission
- `create-order-from-quote` — order conversion
- `useQuoteDraftAutosave` — session persistence
- `usePricingData` — size/pricing catalog
- `useDistanceCalculation` — yard distance

## Recommended Implementation Phases

### Phase A — Quick Wins (Low Risk, High Impact)
1. Add customer notes textarea to Contact step
2. Add rental day selector to Size or Price step
3. Expand project cards to include "Other" option
4. Add company name field for contractors

### Phase B — Service Customization (Medium Effort)
1. Add extras selector (extra days, special items)
2. Add multi-dumpster support (quantity + "add another")
3. Add customer-required dump site option
4. Add photo upload capability

### Phase C — Proposal Format (Medium Effort)
1. Redesign Confirm step as proposal summary
2. Add A/B/C option format when multiple sizes shown
3. Add scheduling (date + time window) before confirm
4. Add "share this quote" / "email this quote" 

### Phase D — Material Granularity (Higher Effort)
1. Add detailed material sub-selection after project
2. Map customer material choices to internal classification
3. Show material-specific warnings earlier in flow

### Phase E — CRM Alignment (Backend Heavy)
1. Ensure quote model supports multi-line items
2. Align CRM calculator with same quote structure
3. Add extras/notes/dump-site to CRM quote editing
4. Enable Sales to edit same draft quotes
