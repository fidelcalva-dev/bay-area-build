# Final Quote & Mobile Summary

## Website Quote Redesign ✅

The V3 quote flow has been redesigned as a 10-step guided proposal:

1. **Project Type** — 11 universal project types with suggested sizes
2. **ZIP / Address** — Yard matching, ETA display, availability meter
3. **Material** — General Debris / Heavy Materials / Not Sure groups with 25+ sub-types
4. **Size** — Selling cards with Recommended/Budget/More Capacity badges
5. **Service Customization** — Swap, same-day, special placement, required dump site, notes, photo upload hint
6. **Contact** — Name, phone, email, company, SMS consent, terms consent
7. **Price** — Price range, rental day selector, inclusions, availability, trust elements
8. **Access** — Placement constraints, gate code
9. **Confirm** — Full proposal summary with service options, key policies, pricing breakdown
10. **Placement** — Map-based placement (post-confirm)

## CRM Calculator Alignment ✅

- Website quote and CRM calculator share the same `save-quote` edge function
- Same `quotes` table structure
- Draft quotes created via `draftQuoteService.ts`
- All fields progressively saved to `sales_leads` via `lead-ingest`

## New Customer Options ✅

- **Rental Days**: 3, 7, 10, 14 days with $15/day extra
- **Swap / Dump & Return**: Toggle in Service step
- **Same-Day Delivery**: Request with rush fee awareness
- **Special Placement**: Flag for tight access, backyard, alley
- **Required Dump Site**: Facility name + review acknowledgement
- **Customer Notes**: 500-char free text for better pricing
- **Company Name**: Optional for all, visible for contractors
- **Photo Upload Hint**: Text-to-number CTA for job site photos

## Mobile-First System Rules ✅

- All public pages responsive (quote flow is mobile-first by design)
- CRM uses `MobileResponsiveView`, `MobileScrollTabs`, `MobileStickyAction`
- No horizontal scrolling on critical flows
- 44px minimum tap targets on CTAs
- Sticky bottom action bars on key pages

## Role Mobile Readiness

| Role | Status |
|------|--------|
| Sales | ✅ Fully Ready |
| Customer Service | ✅ Fully Ready |
| Driver | ✅ Fully Ready |
| Finance | ✅ Fully Ready |
| Dispatch | ⚠️ Control tower needs card fallback |

## Remaining Manual Review Items

| Item | Phase | Priority |
|------|-------|----------|
| Multi-dumpster line items | B | High |
| Schedule/delivery date step | C | Medium |
| A/B/C proposal options | C | Medium |
| Photo upload to storage | B | Medium |
| CRM calculator multi-line quotes | D | Medium |
| Dispatch control tower mobile | — | Low |
| Pricing page card stacking | — | Low |
