## Waste Selection Step Redesign

### Phase 1: Data Model Migration
- Add new columns to `quote_sessions`: `selected_materials_json`, `has_recyclable_materials`, `can_separate_recyclables`, `mixed_load_flag`, `possible_recycling_credit_flag`, `requires_manual_review`, `pricing_family`

### Phase 2: Material Catalog & Constants
- Create `src/components/quote/v3/wasteCatalog.ts` with:
  - Full general debris list (28 items)
  - Full heavy materials list (14 items)
  - Recyclable-eligible flags
  - Special handling items
  - Prohibited items list

### Phase 3: UI Components
- **New `WasteSelectionStep.tsx`** — replaces current `MaterialStep.tsx` behavior:
  - Category picker (General / Heavy / Not Sure)
  - Multi-select chip grid for materials within category
  - Recyclable separation question (Yes/No/Not Sure)
  - Mixed-load warning when both categories selected
  - Special handling callouts
  - Prohibited items disclosure
  - Mobile-first layout with grouped sections

### Phase 4: Integration
- Wire new step into `V3QuoteFlow` state
- Save selected materials to quote session
- Route heavy-only selections to 5/8/10yd sizing
- Show recyclable credit messaging when applicable

### Phase 5: Copy & Messaging
- All copy per the spec (title, subtitle, recycling credit, mixed load warning)

### Not included (future work)
- Edge function changes for pricing based on new fields
- CRM-side display of new material selections
