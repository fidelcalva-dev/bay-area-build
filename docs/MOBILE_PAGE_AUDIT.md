# Mobile Page Audit

## Public Pages

| Route | Current Layout | Mobile Issue | Severity | Action |
|-------|---------------|--------------|----------|--------|
| / | Hero + cards | ✅ Responsive | Low | None |
| /quote | V3 flow in card | ✅ Mobile-first | Low | Rental day pills tight on 320px |
| /pricing | Grid of size cards | Medium — cards cramped | Medium | Stack to single column |
| /sizes/* | Size detail pages | ✅ Stack layout | Low | None |
| /materials/* | Material pages | ✅ Stack layout | Low | None |
| /areas/* | City/area pages | ✅ Stack layout | Low | None |
| /contractor | Landing page | ✅ Responsive | Low | None |
| /portal | Mobile-first design | ✅ Good | Low | None |
| /portal/quote/:id | Quote review | ✅ Card layout | Low | None |
| /portal/schedule | Calendar picker | ✅ Works | Low | None |
| /portal/pay | Payment form | ✅ Works | Low | None |

## CRM / Admin Pages

| Route | Current Layout | Mobile Issue | Severity | Action |
|-------|---------------|--------------|----------|--------|
| /admin | Dashboard grid | Uses MobileResponsiveView | Low | None |
| /admin/customers/:id | 14-tab C360 | Uses MobileScrollTabs | Low | None |
| /sales | Pipeline table | Uses MobileResponsiveView | Low | None |
| /sales/quotes/:id | Quote detail | Has MobileStickyAction | Low | None |
| /admin/pricing | 26-tab hub | Horizontal tab scroll | Medium | Tab pills scroll OK |
| /dispatch | Control tower | Dense grid | Medium | Needs card fallback |
| /driver | Run list | ✅ Mobile-first | Low | None |
| /driver/:id | Run detail | ✅ Card layout | Low | None |
| /finance | Invoice tables | Uses MobileResponsiveView | Low | None |

## Summary

- **Critical issues**: 0
- **Medium issues**: 3 (pricing page cards, admin pricing tabs, dispatch density)
- **Low/None**: All other pages already use mobile patterns (MobileResponsiveView, MobileScrollTabs, MobileStickyAction)
