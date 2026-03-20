# Customer 360 Commercial Model

## Location

`/admin/customers/:id` — canonical commercial master record

## Tabs

| Tab | Component | Data Source | Status |
|---|---|---|---|
| Overview | `OverviewTab.tsx` | Customer + aggregated stats | ✅ |
| Contacts | `ContactsTab.tsx` | `customer_contacts` table | ✅ |
| Sites | `SitesTab.tsx` | `customer_sites` table | ✅ |
| Quotes | `QuotesTab.tsx` | `quotes` table + commercial status | ✅ |
| Contracts | `ContractsTab.tsx` | `contracts` + `quote_contracts` tables | ✅ |
| Payments | `PaymentsTab.tsx` | `payments` + `payment_requests` | ✅ |
| Orders | `OrdersTab.tsx` | `orders` table | ✅ |
| Documents | `DocumentsTab.tsx` | Unified: contracts, quotes, invoices, uploads | ✅ |
| Requests | `RequestsTab.tsx` | Service requests | ✅ |
| Service Intelligence | `ServiceIntelligenceTab.tsx` | Operational analytics | ✅ |
| Photos | `PhotosTab.tsx` | Customer photos/assessments | ✅ |
| Analytics | `AnalyticsTab.tsx` | Revenue/engagement metrics | ✅ |

## Quotes Tab Shows

- Quote ID and status (Draft, Sent, Accepted, Converted)
- Selected size and material type
- Subtotal / price range
- Contract status (pending/signed)
- Payment status
- Order readiness state
- Action buttons: View, Send, Duplicate, Create Contract, Request Payment

## Documents Tab Shows

- **Signed Documents** (priority section): MSAs and Addenda with signer metadata
- Quote PDFs
- Contracts (pending and signed)
- Addenda (pending and signed)
- Invoices
- Dump tickets
- Permits
- Uploaded files

## Contracts Tab Shows

- MSA contracts (by customer)
- Quote-specific contracts
- Version history (contract_version, terms_version)
- E-sign status (esign_consent_at)
- Signer identity (name, email, phone)
- Actions: Send, Preview, Upload Signed, Create Addendum

## Data Linkage

```
Customer
  ├── Leads (sales_leads.customer_id)
  ├── Quotes (quotes.linked_lead_id → lead.customer_id)
  ├── Contracts (contracts.customer_id)
  ├── Quote Contracts (quote_contracts.quote_id)
  ├── Orders (orders.customer_id)
  ├── Payments (payments.order_id → order.customer_id)
  ├── Invoices (invoices.order_id → order.customer_id)
  ├── Timeline Events (timeline_events.entity_id)
  ├── Customer Contacts (customer_contacts.customer_id)
  ├── Customer Sites (customer_sites.customer_id)
  └── Identity Groups (identity_groups → identity_merge_suggestions)
```
