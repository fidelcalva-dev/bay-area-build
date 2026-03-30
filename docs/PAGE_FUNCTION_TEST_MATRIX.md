# Page Function Test Matrix

> Last updated: 2026-03-30

## Test Results

| Route | Business Purpose | Route Load | Data Load | Save | Canonical Service | Duplicate Logic | Status |
|---|---|---|---|---|---|---|---|
| `/` | Homepage | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/quote` | Dumpster quote flow | ✅ | ✅ | ✅ | ✅ masterPricingService, draftQuoteService | ❌ | ✅ |
| `/cleanup/quote` | Cleanup quote | ✅ | ✅ | ✅ | ✅ lead-ingest | ❌ | ✅ |
| `/contact` | Contact form | ✅ | N/A | ✅ | ✅ lead-ingest | ❌ | ✅ |
| `/cleanup/contact` | Cleanup contact | ✅ | N/A | ✅ | ✅ lead-ingest | ❌ | ✅ |
| `/contractors` | Contractor application | ✅ | N/A | ✅ | ✅ lead-ingest | ❌ | ✅ |
| `/cleanup/for-contractors` | Cleanup contractor app | ✅ | N/A | ✅ | ✅ lead-ingest | ❌ | ✅ |
| `/pricing` | Public pricing | ✅ | ✅ | N/A | ✅ masterPricingService | ❌ | ✅ |
| `/sales` | Sales dashboard | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/sales/leads` | Lead Hub | ✅ | ✅ | ✅ | ✅ useLeadHub | ❌ | ✅ |
| `/sales/leads/:id` | Lead detail | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/sales/quotes` | Quotes list | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/sales/quotes/:id` | Quote detail | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/sales/quotes/new` | Internal calculator | ✅ | ✅ | ✅ | ✅ calculatorService | ❌ | ✅ |
| `/admin` | Command center | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/admin/configuration` | Config hub | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/admin/pricing` | Master pricing | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/admin/customers` | Customer list | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/admin/customers/:id` | Customer 360 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/admin/orders` | Orders list | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/admin/ghl` | GHL integration | ✅ | ✅ | ✅ | ✅ ghlCommunication | ❌ | ✅ |
| `/dispatch` | Dispatch dashboard | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/dispatch/control-tower` | Control tower | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/driver` | Driver home | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/finance` | Finance dashboard | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/finance/ar-aging` | AR aging | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/portal` | Customer login | ✅ | N/A | ✅ | ✅ useCustomerAuth | ❌ | ✅ |
| `/portal/dashboard` | Customer dashboard | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/portal/orders` | Customer orders | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |
| `/portal/pay` | Payment | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `/cs` | CS dashboard | ✅ | ✅ | N/A | ✅ | ❌ | ✅ |

## Notes

- No critical duplicate business logic found in page components
- All lead creation paths use canonical `lead-ingest` edge function
- All pricing paths use canonical `masterPricingService`
- All communication paths use canonical `ghlCommunication`
