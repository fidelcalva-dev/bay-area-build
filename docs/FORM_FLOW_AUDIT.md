# FORM & SAVE FLOW AUDIT

> Generated: 2026-03-19

## Public-Facing Forms

| # | Page | Form | Entity | Progressive | Reliable | Data Loss Risk | Notes |
|---|------|------|--------|-------------|----------|----------------|-------|
| 1 | `/quote` | V3 Uber-Style Quote | sales_leads / quotes | ✅ Step-based | ✅ | Low | Multi-step wizard with state |
| 2 | `/quote/contractor` | Contractor Quote | sales_leads | ✅ | ✅ | Low | |
| 3 | `/quote/schedule` | Schedule Delivery | orders | ❌ Final | ✅ | Medium | Depends on quote ID in URL |
| 4 | `/quote/pay` | Payment | payments | ❌ Final | ⚠️ | Medium | External payment flow |
| 5 | `/contractor-application` | Application Form | sales_leads | ❌ Final | ✅ | Low | |
| 6 | `/contact` | Contact Form | sales_leads / ai_chat | ❌ Final | ✅ | Low | |
| 7 | `/download-price-list` | Email Capture | sales_leads | ❌ Final | ✅ | Low | |
| 8 | `/quick-order` | Quick Order | orders | ❌ Final | ⚠️ | Medium | Off-strategy? |
| 9 | `/schedule-delivery` | Schedule Form | orders | ❌ Final | ✅ | Low | |

## Portal Forms

| # | Page | Form | Entity | Notes |
|---|------|------|--------|-------|
| 10 | `/portal/pay` | Payment | payments | SMS-linked payment |
| 11 | `/portal/schedule` | Schedule | orders | SMS-linked scheduling |
| 12 | `/portal/sign-quote-contract` | Contract Sign | contracts | E-signature flow |
| 13 | `/contract/:token` | Contract Sign | contracts | Token-based sign |
| 14 | `/portal/activate` | Portal Activation | customers | Account activation |

## CRM Internal Forms

| # | Page | Form | Entity | Notes |
|---|------|------|--------|-------|
| 15 | `/admin/customers/new` | Customer Create | customers | ✅ |
| 16 | `/admin/customers/:id/edit` | Customer Edit | customers | ✅ |
| 17 | `/internal/calculator` | Internal Quote Builder | quotes | ✅ Primary CRM quote tool |
| 18 | `/sales/order-builder` | Order Builder | orders | ✅ |
| 19 | `/admin/markets/new-location` | New Location Wizard | markets/zones/pricing | Multi-step |
| 20 | Various /admin config pages | Config forms | config_settings, pricing_rules, etc. | Inline CRUD |
| 21 | `/driver/inspect` | Pre-Trip Inspection | inspections | ✅ |
| 22 | `/driver/report-issue` | Issue Report | issues | ✅ |

---

## Known Risks

1. **`/quote/schedule` and `/quote/pay`** — depend on quote state carried via URL params; if user navigates directly without quote context, may fail
2. **`/quick-order`** — may conflict with official dual-path conversion strategy
3. **`/portal/pay`** — external payment integration; error handling needs runtime verification
