# Page Function Test Matrix

> Last updated: 2026-03-31

## Website

| Page | Route | Loads | CTA | Lead | SEO | Mobile |
|---|---|---|---|---|---|---|
| Homepage | `/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing | `/pricing` | ✅ | ✅ | — | ✅ | ✅ |
| Quote Flow | `/quote` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contact | `/contact` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cleanup Home | `/cleanup` | ✅ | ✅ | — | ✅ | ✅ |
| Cleanup Quote | `/cleanup/quote` | ✅ | ✅ | ✅ | ✅ | ✅ |

## CRM

| Page | Route | Loads | CRUD | Shared | Mobile |
|---|---|---|---|---|---|
| Sales Leads | `/sales/leads` | ✅ | ✅ | LeadWorkspacePage(sales) | ✅ |
| CS Leads | `/cs/leads` | ✅ | 👁 | LeadWorkspacePage(cs) | ✅ |
| Admin Leads | `/admin/leads/workspace` | ✅ | ✅ | LeadWorkspacePage(admin) | ✅ |
| Sales Quotes | `/sales/quotes` | ✅ | ✅ | QuoteWorkspacePage(sales) | ✅ |
| Quote Builder | `/sales/quotes/new` | ✅ | ✅ | QuoteBuilderPage(sales) | ✅ |
| Quote Detail | `/sales/quotes/:id` | ✅ | ✅ | QuoteDetailPage(sales) | ✅ |
| Customer 360 | `/admin/customers/:id` | ✅ | ✅ | CustomerDetail | ✅ |

## Operations

| Page | Route | Loads | Actions | Mobile |
|---|---|---|---|---|
| Dispatch | `/dispatch` | ✅ | ✅ | ✅ |
| Control Tower | `/dispatch/control-tower` | ✅ | ✅ | ✅ |
| Driver | `/driver` | ✅ | ✅ | ✅ (primary) |
| Finance | `/finance` | ✅ | ✅ | ✅ |
| AR Aging | `/finance/ar-aging` | ✅ | ✅ | ✅ |

## Portal

| Page | Route | Loads | Auth | Mobile |
|---|---|---|---|---|
| Login | `/portal` | ✅ | OTP | ✅ |
| Dashboard | `/portal/dashboard` | ✅ | Guard | ✅ |
| Pay | `/portal/pay` | ✅ | SMS | ✅ |
| Contract Sign | `/contract/:token` | ✅ | Token | ✅ |

## Admin

| Page | Route | Loads | Actions | Mobile |
|---|---|---|---|---|
| Command Center | `/admin` | ✅ | ✅ | ✅ |
| Configuration Hub | `/admin/configuration` | ✅ | ✅ | ✅ |
| Pricing Hub | `/admin/pricing` | ✅ | ✅ | ✅ |
| Audit Logs | `/admin/audit-logs` | ✅ | ✅ | ✅ |
