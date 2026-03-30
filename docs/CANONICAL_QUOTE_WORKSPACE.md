# Canonical Quote Workspace

> Generated: 2026-03-30

## Architecture

```
src/features/quotes/
├── index.ts                     # Barrel exports
├── types.ts                     # CrmRole, QuoteWorkspaceConfig, QUOTE_ROLE_CONFIGS
├── QuoteWorkspaceContext.tsx     # React context for role-based permissions
├── QuoteWorkspacePage.tsx        # Wraps SalesQuotes with role context
├── QuoteDetailPage.tsx           # Wraps SalesQuoteDetail with role context
└── QuoteBuilderPage.tsx          # Wraps InternalCalculator with role context
```

## Canonical Base Components

| Component | File | Lines |
|---|---|---|
| Quote List | `src/pages/sales/SalesQuotes.tsx` | 307 |
| Quote Detail | `src/pages/sales/SalesQuoteDetail.tsx` | 1719 |
| Quote Builder | `src/pages/internal/InternalCalculator.tsx` | — |

## Route Matrix

| Route | Role | Component |
|---|---|---|
| `/sales/quotes` | Sales | `QuoteWorkspacePage mode="sales"` |
| `/sales/quotes/new` | Sales | `QuoteBuilderPage mode="sales"` |
| `/sales/quotes/:id` | Sales | `QuoteDetailPage mode="sales"` |
| `/cs/quotes` | CS | `QuoteWorkspacePage mode="cs"` |
| `/cs/quotes/:id` | CS | `QuoteDetailPage mode="cs"` |
| `/admin/quotes` | Admin | `QuoteWorkspacePage mode="admin"` |
| `/admin/quotes/new` | Admin | `QuoteBuilderPage mode="admin"` |
| `/admin/quotes/:id` | Admin | `QuoteDetailPage mode="admin"` |

## Quote List Features

- Stats: total, saved, scheduled, converted, pipeline value
- Search by name, phone, ZIP
- Filter by status
- Click to detail
- Convert to order
- Mark as converted

## Quote Detail Features

- Readiness badge (Ready / Follow-Up / Missing)
- Commercial status tracker (Quote → Sent → Contract → Payment → Order)
- Pricing breakdown with line items
- Inline editing (customer, job details, notes)
- Document Delivery Center (preview, PDF, send quote/contract/payment)
- Recommended script (SMS + call)
- Add notes
- Duplicate quote
- Schedule delivery
- Send payment link

## Quote Builder (Master Calculator)

- ZIP-based smart pricing
- Material class selection
- Size recommendation
- Multi-unit support
- Negotiated pricing ranges
- Option A/B/C proposal format

## Permissions by Role

| Capability | Sales | CS | Admin |
|---|---|---|---|
| Create quotes | ✅ | ❌ | ✅ |
| Edit quotes | ✅ | ❌ | ✅ |
| Send quote/contract | ✅ | ❌ | ✅ |
| Resend existing docs | ✅ | ✅ | ✅ |
| Generate PDF | ✅ | ✅ | ✅ |
| Convert to order | ✅ | ❌ | ✅ |
| Duplicate quote | ✅ | ❌ | ✅ |
| Override pricing | ❌ | ❌ | ✅ |
| View metrics | ❌ | ❌ | ✅ |
