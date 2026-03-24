# Mobile-First Design Rules

## Global Rules

1. **No horizontal scrolling** on any important page
2. **No wide tables** as primary mobile UI — use stacked cards
3. **Single-column forms** on phone
4. **Sticky bottom action bar** on key action pages (44px min tap target)
5. **Typography readable** on small screens (min 14px body)
6. **Sidebars collapse** into drawers/sheets
7. **Modals become full-screen sheets** on phone where needed
8. **All destructive/primary actions stay visible**

## Public Pages

- Hero text stacks cleanly
- CTA buttons wrap or stack vertically
- Pricing cards stack to single column
- FAQ uses accordion
- Quote summary uses bottom drawer or sticky card
- Size cards are stacked (not cramped grids)
- Notes field and upload section full-width

## CRM / Admin Pages

- Tables collapse to cards via `MobileResponsiveView`
- Top actions move into `MobileStickyAction` bars
- Filters become drawers or sheets
- Side navigation becomes collapsible drawer
- Customer 360 tabs use `MobileScrollTabs` (horizontal swipe)
- Quote detail shows summary cards first
- Review/send actions stay visible on phone
- Admin pricing tabs scroll horizontally as pills only

## Component Library

| Component | Purpose |
|-----------|---------|
| `MobileLayout` | Top bar + content + bottom nav wrapper |
| `MobileTopBar` | Title, back button, user menu |
| `MobileBottomNav` | Tab-style bottom navigation |
| `MobileResponsiveView` | Table → card layout switcher |
| `MobileScrollTabs` | Horizontal scrolling tab pills |
| `MobileStickyAction` | Fixed bottom action bar |
| `MobileQuickActions` | FAB with quick actions |
| `MobileGlobalSearch` | Mobile search interface |

## Breakpoints

- Mobile: `< 768px` (via `useIsMobile()` or `useMobileMode()`)
- Tablet: `768px – 1024px`
- Desktop: `> 1024px`
