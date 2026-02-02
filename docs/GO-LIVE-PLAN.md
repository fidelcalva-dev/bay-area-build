// ============================================================
// GO-LIVE PLAN DOCUMENTATION
// Uber-like redesign rollout strategy
// ============================================================

# Go-Live Plan: Uber-Like Customer Experience

Generated: {{DATE}}

## Overview

This document outlines the phased rollout strategy for the Uber-like customer booking experience, ensuring 100% functionality validation before public release.

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

### Design Principles
- Clean, modern, mobile-first
- Large typography, generous whitespace
- Card-based choices
- Sticky primary CTA on key screens
- No emojis; Lucide icons only

## Phase 2: Quote Flow v2

### 6-Step Flow
1. **ZIP** - Location entry with auto-detect
2. **Items** - Smart chip selection
3. **Size** - AI-recommended with alternatives
4. **Price** - Hero price moment with value badge
5. **Notice** - Conditional (heavy/yard/recycling)
6. **Confirm** - Contact + terms, schedule later

### Optimizations
- 60-90 second completion target
- Pre-selection based on AI recommendation
- De-risking micro-copy near CTAs
- Maximum 3 size options to prevent choice paralysis

## Phase 3: Customer Portal

### Tracking Timeline
- Order placed → Scheduled → Delivered → Pickup → Complete
- ETA badges for current step
- Timestamp formatting (relative for <24h)

### Placement Tool
- Dumpster rectangle by size (rotatable)
- Truck clearance rectangle
- Entry point marker
- Saved to storage bucket with signed URL

## Phase 4: Consistency Engine

### Price Display Rules
- **Public Pages**: "From $X" using BASE tier only
- **Calculator**: Exact ZIP-based pricing
- **Portal**: Confirmed quote price

### Canonical Rules
- Extra ton rate: $165/ton (all debris)
- Overdue daily fee: $35/day
- Heavy sizes: 5/6/8/10 yd only
- Grass → Debris Heavy (mandatory)

## Phase 5: QA Control Center

### P0 Blocking Checks
1. Public pages show From/range only
2. Calculator returns exact ZIP price
3. Extra ton rate = $165
4. Heavy sizes 5/6/8/10 enforced
5. Grass routes to Debris Heavy
6. Payment flow works (sandbox)
7. Portal link generation works

### Warning Checks
1. No emojis detected
2. Telephony system accessible
3. Placement tool database ready
4. Master AI mode configured

### Go-Live Gate
- All P0 checks must PASS
- Feature flag `public_theme.v2_uber` locked until ready

## Phase 6: Rollout Strategy

### Feature Flags
| Flag | Default | Description |
|------|---------|-------------|
| `public_theme.v2_uber` | false | Uber-like public design |
| `quote_flow.v2_minimal` | false | 6-step minimal flow |
| `portal.tracking_enabled` | true | Order tracking timeline |
| `portal.placement_enabled` | true | Site placement tool |
| `preview.enabled` | true | Preview mode routes |

### Preview URLs
- `/preview/quote` - Quote flow v2
- `/preview/home` - Homepage v2

### Rollout Steps
1. **Internal Preview**: Enable preview mode, test internally
2. **Staff Testing**: Share preview URLs with team
3. **Soft Launch**: Enable v2 for 10% of traffic (if A/B available)
4. **Full Launch**: Set `public_theme.v2_uber = true`

## Appendix: File Changes

### New Files Created
- `src/components/quote/ui/PageShellPublic.tsx`
- `src/components/quote/ui/TrackingTimeline.tsx`
- `src/components/portal/OrderTrackingCard.tsx`
- `src/lib/featureFlags.ts`
- `src/pages/admin/qa/QAControlCenter.tsx`
- `docs/GO-LIVE-PLAN.md`

### Modified Files
- `src/components/quote/ui/index.ts` - Added new exports
- `src/App.tsx` - Added QA Control Center route

## Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | [ ] |
| Product | | | [ ] |
| Operations | | | [ ] |

---

*This document is auto-generated and should be updated after each QA run.*
