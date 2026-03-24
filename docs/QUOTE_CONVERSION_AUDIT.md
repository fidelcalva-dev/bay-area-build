# Quote Conversion Audit — V3 Quote Flow (Redesigned)

## New Step Sequence (Implemented)

| Step | Name | Purpose | Fields Collected | Friction | Key Improvement |
|------|------|---------|-----------------|----------|-----------------|
| 1 | Project Type | Universal project picker (11 options) | selectedProject | LOW | Replaces customer-type + 4-card picker with universal 11-project grid |
| 2 | ZIP / Address | Location & yard match | zip, address, zone | LOW | Moved after project so customer starts with intent |
| 3 | Material / Waste | General vs Heavy + specific type | materialGroup, materialOption | LOW | New step — 14 general + 11 heavy options in customer language |
| 4 | Size | Recommended + alternatives with selling badges | size | MEDIUM | Redesigned as selling cards with best-for, capacity, badges |
| 5 | Service Customization | Extras, rental days, swap, dump site, notes | serviceOptions, rentalDays, notes | LOW | New step — captures swap, same-day, placement, dump site, notes |
| 6 | Contact | Name, phone, email, company, consent | name, phone, email, company | MEDIUM (gate) | Company name always visible; notes moved to Step 5 |
| 7 | Price | Price range + rental breakdown | — (read-only) | LOW | Rental selector kept here too for last-minute changes |
| 8 | Access | Placement & access constraints | accessData | MEDIUM | Unchanged |
| 9 | Confirm | Proposal-style order summary | termsAccepted | LOW | Shows full line items including service options |

## Key Changes from Previous Flow

### Added
1. **Universal project types** — 11 options replacing 4-per-customer-type
2. **Material/waste selection step** — 14 general + 11 heavy types in customer language
3. **Service customization step** — rental days, swap, same-day, special placement, dump site, notes
4. **Size selling cards** — badges (Recommended/Budget/More Capacity), best-for examples, capacity guidance
5. **Customer-required dump site** — captured with acknowledgement of pricing review
6. **Company name** — always visible, not gated by customer type
7. **Notes moved earlier** — in service step, not contact step

### Removed
1. **Customer type step** — eliminated; project type implies segment
2. **Per-segment project cards** — replaced by universal list

### Architecture
- `projectTypes.ts` — 11 universal projects with segment tags
- `materialTypes.ts` — general (14) + heavy (11) material options mapped to internal classes
- `ProjectTypeStep.tsx` — universal project grid
- `MaterialStep.tsx` — group selector → detail selector
- `ServiceCustomizationStep.tsx` — rental, swap, dump site, notes
- `SizeStep.tsx` — redesigned with selling badges
- `V3QuoteFlow.tsx` — orchestrator with new 10-step flow

## Remaining Phases

### Phase B — Multi-Dumpster Support
- Add "add another dumpster" button
- Create multiple quote line items
- Show combined proposal summary

### Phase C — Proposal Format
- Redesign confirm step as A/B/C proposal
- Add scheduling before confirm
- Add "share/email this quote"

### Phase D — Material Granularity
- Map customer selections to internal pricing groups
- Show material-specific warnings earlier

### Phase E — CRM Calculator Alignment
- Multi-line quotes in CRM
- Extras per line
- Negotiated pricing support
