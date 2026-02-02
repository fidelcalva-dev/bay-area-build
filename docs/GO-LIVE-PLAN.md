# Go-Live Plan: Uber-Like Customer Experience

**Generated**: 2026-02-02  
**Version**: 2.0

---

## Overview

This document outlines the phased rollout strategy for the Uber-like customer booking experience, ensuring 100% functionality validation before public release.

---

## Phase 1: Design System Components

### Completed Components
- [x] PageShellPublic - Container for public pages with trust bar
- [x] TrackingTimeline - Order progress visualization (Uber-style)
- [x] ProgressBar6 - 6-step progress indicator
- [x] CardSelectable - Touch-friendly selection cards
- [x] PriceHero - Price display with psychology optimizations
- [x] InfoBox - Neutral/warning/success notices
- [x] SummaryCard - Order summary display
- [x] OrderTrackingCard - Full tracking card for portal
- [x] PrimaryButtonSticky - Floating CTA button
- [x] BadgePill - Status and category badges

### Design Principles
- Clean, modern, mobile-first
- Large typography, generous whitespace
- Card-based choices
- Sticky primary CTA on key screens
- No emojis; Lucide icons only
- Semantic color tokens from design system

---

## Phase 2: Quote Flow v2

### 6-Step Flow
1. **ZIP** - Location entry with auto-detect
2. **Items** - Smart chip selection (East Bay-tuned materials list)
3. **Size** - AI-recommended with alternatives (max 3 options)
4. **Price** - Hero price moment with value badge
5. **Notice** - Conditional (heavy/yard/recycling materials only)
6. **Confirm** - Contact + terms, schedule later

### Optimizations
- 60-90 second completion target
- Pre-selection based on AI recommendation (Gemini-2.5-Flash)
- De-risking micro-copy near CTAs ("No hidden fees")
- Maximum 3 size options to prevent choice paralysis
- Loss aversion hint for undersized selections

### Hard Rules Enforced
- Grass/Yard Waste → Forces DEBRIS_HEAVY category
- Heavy/Inert materials → 5/6/8/10 yd only
- Contamination warning for mixed heavy loads

---

## Phase 3: Customer Portal

### Tracking Timeline
- Order placed → Scheduled → Delivered → Pickup → Complete
- ETA badges for current step
- Timestamp formatting (relative for <24h)
- Status colors: pending (amber), active (blue), complete (green)

### Placement Tool
- Dumpster rectangle by size (rotatable with 15° snapping)
- Truck clearance rectangle (35x10ft default)
- Entry point marker with approach direction
- Saved to storage bucket with signed URL
- Visible to dispatch and driver portals

### Portal Link System
- Token-based magic links (30-day expiration)
- Triggers: Agreement signed, Order confirmed, Payment received
- SMS and Email delivery with mandatory STOP opt-out

---

## Phase 4: Consistency Engine

### Price Display Rules
| Context | Display Format | Source |
|---------|----------------|--------|
| Public Pages | "From $X" | BASE tier from `market_size_pricing` |
| Marketing | "$X–$Y range" | Lowest to highest BASE tier |
| Calculator | Exact price | ZIP-based zone lookup |
| Portal | Confirmed quote | `quotes.subtotal` |

### Canonical Pricing Rules
- Extra ton rate: **$165/ton** (all general debris sizes)
- Overdue daily fee: **$35/day**
- Heavy sizes: **5/6/8/10 yd only**
- Heavy pricing: **FLAT FEE** (no overage)
- Grass → Debris Heavy (mandatory routing)
- Same-day delivery fee: **$75**

### Pricing Architecture
```
market_size_pricing (customer rates by market)
  ├── BASE tier (public "From" pricing)
  ├── CORE tier (+6%)
  └── PREMIUM tier (+15%)

dump_fee_profiles (internal costs by facility)
heavy_material_rates (flat-fee heavy pricing)
```

---

## Phase 5: QA Control Center

**Route**: `/admin/qa/control-center`

### P0 Blocking Checks (Must Pass for Go-Live)
1. Public pages show From/range only (no exact prices)
2. Calculator returns exact ZIP-based price
3. Extra ton rate = $165 (no hardcoded conflicts)
4. Heavy sizes 5/6/8/10 enforced
5. Grass routes to Debris Heavy
6. Payment flow works (sandbox)
7. Portal link generation works
8. Placement tool saves image + notes
9. Driver sees placement on run detail

### P1 Warning Checks
1. No emojis detected on public pages
2. Telephony system accessible
3. Master AI mode configured (DRY_RUN default)
4. All pricing from DB, not hardcoded

### Go-Live Gate
- **All P0 checks must PASS**
- Feature flag `public_theme.v2_uber` **locked** until P0 ready
- Feature flag `quote_flow.v2_minimal` **locked** until P0 ready
- Admin can override after acknowledging risk

---

## Phase 6: Rollout Strategy

### Feature Flags
| Flag | Default | Description | Requires P0 |
|------|---------|-------------|-------------|
| `public_theme.v2_uber` | false | Uber-like public design | Yes |
| `quote_flow.v2_minimal` | false | 6-step minimal flow | Yes |
| `portal.tracking_enabled` | true | Order tracking timeline | No |
| `portal.placement_enabled` | true | Site placement tool | No |
| `preview.enabled` | true | Preview mode routes | No |

### Preview URLs (Always Use v2)
- `/preview/quote` - Quote flow v2
- `/preview/home` - Homepage v2

### Rollout Steps
1. **Internal Preview**: Enable preview mode, test internally
2. **Staff Testing**: Share preview URLs with team for feedback
3. **Bug Fixes**: Address any issues found in preview
4. **P0 Validation**: Run QA Control Center, ensure all P0 pass
5. **Enable Flags**: Set v2 flags to true in QA Control Center
6. **Monitor**: Watch analytics for conversion changes

---

## Appendix A: File Structure

### New Components
```
src/components/quote/ui/
├── PageShellPublic.tsx
├── TrackingTimeline.tsx
├── ProgressBar6.tsx
├── CardSelectable.tsx
├── PriceHero.tsx
├── InfoBox.tsx
├── SummaryCard.tsx
├── PrimaryButtonSticky.tsx
├── BadgePill.tsx
└── index.ts

src/components/portal/
└── OrderTrackingCard.tsx
```

### Feature Management
```
src/lib/featureFlags.ts
src/pages/admin/qa/QaControlCenter.tsx
```

### Pricing Consistency
```
src/lib/publicPricing.ts
src/lib/shared-data.ts (canonical constants)
```

---

## Appendix B: Database Tables

### Pricing Architecture
- `market_size_pricing` - Customer-facing prices by market
- `dump_fee_profiles` - Internal facility costs
- `heavy_material_rates` - Flat-fee heavy pricing
- `market_templates` - Seeding templates for new markets

### Feature Management
- `config_settings` - Feature flags (key: `feature.*`)
- `qa_checks` - QA check definitions
- `qa_results` - QA run results
- `qa_runs` - QA run history

---

## Sign-Off Checklist

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | [ ] |
| Product | | | [ ] |
| Operations | | | [ ] |

### Pre-Launch Verification
- [ ] All P0 checks PASS in QA Control Center
- [ ] Preview URLs tested on mobile and desktop
- [ ] Pricing matches DB values (no hardcoded conflicts)
- [ ] No emojis on public-facing pages
- [ ] Portal link delivery tested (SMS + Email)
- [ ] Placement tool saves correctly
- [ ] Driver portal shows placement

---

*This document is the canonical Go-Live reference. Update after each major change.*
