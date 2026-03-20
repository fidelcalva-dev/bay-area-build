# Function Inventory — Canonical Service Layer

> Last updated: 2026-03-20

## Canonical Services

| Function Family | Canonical Service | File(s) | Notes |
|---|---|---|---|
| **Lead Orchestration** | `lead-ingest` Edge Function | `supabase/functions/lead-ingest/` | All pages call this single edge function |
| **Quote Session** | `useQuoteSession` | `src/components/quote/hooks/useQuoteSession.ts` | sessionStorage with 2h expiry |
| **Draft Quote** | `draftQuoteService` | `src/lib/draftQuoteService.ts` | Calls `save-quote` with `draft_mode=true` |
| **Pricing Gateway** | `masterPricingService` | `src/lib/masterPricingService.ts` | Smart engine → static fallback |
| **Smart Pricing Engine** | `smartPricingEngine` | `src/lib/smartPricingEngine.ts` | Internal cost calculation |
| **Location Pricing CRUD** | `locationPricingService` | `src/services/locationPricingService.ts` | Admin config for market_size_pricing |
| **Calculator Service** | `calculatorService` | `src/services/calculatorService.ts` | Internal calculator logic |
| **Extras Pricing** | `extrasPricingEngine` | `src/services/extrasPricingEngine.ts` | Extras catalog + margin calc |
| **City Display Pricing** | `cityDisplayPricing` | `src/lib/cityDisplayPricing.ts` | SEO city pages via masterPricingService |
| **GHL Communication** | `ghlCommunication` | `src/lib/ghlCommunication.ts` | **Canonical** — entity CRUD, threads, send |
| **GHL Messaging** | `ghlMessaging` | `src/lib/ghlMessaging.ts` | Templates, queue, now delegates send to ghlCommunication |
| **Timeline** | `timelineService` | `src/lib/timelineService.ts` | Unified event logging |
| **Commercial Milestones** | `commercialMilestones` | `src/lib/commercialMilestones.ts` | 30+ canonical milestone definitions |
| **Notifications** | `notificationService` | `src/lib/notificationService.ts` | Staff notification CRUD |
| **Notification Routing** | `notificationRoutingConfig` | `src/config/notificationRoutingConfig.ts` | Role-based event routing rules |
| **Contracts** | `contractService` | `src/lib/contractService.ts` | MSA/Addendum management |
| **Document Delivery** | `DocumentDeliveryCenter` | `src/components/documents/DocumentDeliveryCenter.tsx` | PDF gen, preview, send, upload |
| **PDF Generation** | `generate-quote-pdf` | `supabase/functions/generate-quote-pdf/` | Edge function |
| **Merge Tags** | `mergeTagResolver` | `src/lib/mergeTagResolver.ts` | Template variable resolution |
| **Portal Access** | Customer auth + session | `src/hooks/useCustomerAuth.ts` | OTP + token validation |

## Pages Using Lead Ingest (Canonical: `lead-ingest` Edge Function)

All of the following correctly call the canonical `lead-ingest` edge function:
- `QuoteOrderFlow.tsx` — website quote submission
- `CalsanAIChat.tsx` — AI chat contact capture + media upload
- `ScheduleDelivery.tsx` — delivery scheduling form
- `QuickOrder.tsx` — quick order flow
- `SalesLeads.tsx` — manual lead creation by staff
- `save-quote` edge function — post-quote lead pipeline
- `lead-from-phone` edge function — inbound phone call normalization

## Pricing Layer Architecture

```
masterPricingService.ts  ← Canonical public gateway
  └── smartPricingEngine.ts  ← Internal cost engine (yard/zone/distance)
  └── dumpster_pricing table  ← Static fallback

locationPricingService.ts  ← Admin CRUD for market_size_pricing table
calculatorService.ts  ← Internal calculator business logic
extrasPricingEngine.ts  ← Extras catalog + margin calculations
cityDisplayPricing.ts  ← SEO display (delegates to masterPricingService)
```

## Deleted Dead Code (2026-03-20)

| File | Reason |
|---|---|
| `src/lib/publicPricing.ts` | Zero imports — unused public pricing helper |
| `src/lib/pricingEngine.ts` | Zero imports — superseded by masterPricingService |
