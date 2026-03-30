# Canonical Service Map

> Last updated: 2026-03-30

## Architecture Principle

Each major business function has **one canonical implementation**. Pages consume canonical services; they do not implement business logic locally.

## Service Families

### Lead & Quote

| Service Family | Canonical File | Responsibility |
|---|---|---|
| LeadOrchestrator | `supabase/functions/lead-ingest/` | Normalize, dedup, create/enrich leads from all channels |
| QuoteSessionService | `src/components/quote/hooks/useQuoteSession.ts` | Step tracking, autosave, resume, abandon, 2h expiry |
| DraftQuoteService | `src/lib/draftQuoteService.ts` | Create/update quote drafts via `save-quote` edge fn |

### Pricing

| Service Family | Canonical File | Responsibility |
|---|---|---|
| PricingGateway | `src/lib/masterPricingService.ts` | Unified entry: smart engine → static fallback |
| SmartPricingEngine | `src/lib/smartPricingEngine.ts` | Internal cost calc: yard, zone, distance, material |
| PricingDisplayService | `src/lib/cityDisplayPricing.ts` | SEO city pricing via PricingGateway |
| GeographyResolutionService | `src/lib/marketService.ts` | ZIP → Market → Yard resolution |
| LocationPricingCRUD | `src/services/locationPricingService.ts` | Admin CRUD for market_size_pricing |
| CalculatorService | `src/services/calculatorService.ts` | Internal calculator business rules |
| ExtrasPricingEngine | `src/services/extrasPricingEngine.ts` | Extras catalog + margin calc |

### Documents & Contracts

| Service Family | Canonical File | Responsibility |
|---|---|---|
| DocumentPreviewService | `src/components/documents/DocumentDeliveryCenter.tsx` | Preview, PDF gen, send, upload signed |
| PdfGenerationService | `supabase/functions/generate-internal-pdf/` | PDF rendering |
| DocumentSendService | `src/lib/ghlCommunication.ts` | Send via SMS/Email |
| ContractService | `src/lib/contractService.ts` | MSA/Addendum lifecycle |
| MergeTagResolver | `src/lib/mergeTagResolver.ts` | Template variable resolution |

### Communication

| Service Family | Canonical File | Responsibility |
|---|---|---|
| GhlCommunicationService | `src/lib/ghlCommunication.ts` | Canonical send, threads, messages, calls |
| GhlMessaging | `src/lib/ghlMessaging.ts` | Templates, queue, render — delegates to GhlCommunication |
| NotificationService | `src/lib/notificationService.ts` | Staff notification CRUD |
| NotificationRouting | `src/config/notificationRoutingConfig.ts` | Role-based event routing |

### Customer & Identity

| Service Family | Canonical File | Responsibility |
|---|---|---|
| CustomerIdentityService | DB triggers + `identity_groups` | Phone/email matching, merge suggestions |
| Customer360AggregationService | `src/components/customer360/` | Unified customer profile with 14 tabs |
| PortalAccessService | `src/hooks/useCustomerAuth.ts` | OTP + token validation |

### Timeline & Events

| Service Family | Canonical File | Responsibility |
|---|---|---|
| TimelineEventService | `src/lib/timelineService.ts` | Unified event logging |
| CommercialMilestones | `src/lib/commercialMilestones.ts` | 30+ canonical milestone definitions |

### Operations

| Service Family | Canonical File | Responsibility |
|---|---|---|
| OrderCreationService | `supabase/functions/create-order-from-quote/` | Quote → Order conversion |
| PaymentRequestService | `supabase/functions/send-payment-request/` | Payment link generation |
| HealthSignalService | `supabase/functions/health-collector/` | System diagnostics |

### SEO & Content

| Service Family | Canonical File | Responsibility |
|---|---|---|
| SeoPageConfigService | `src/lib/seoPageConfig.ts` | Page metadata, canonical tags |

## Rules

1. Never duplicate business logic in page components — import from canonical service
2. One edge function per business operation
3. Pricing consumers must go through `masterPricingService`
4. Communication must go through `ghlCommunication.ts`
5. Timeline events must use `timelineService.ts` or `commercialMilestones.ts`
6. Lead creation must go through `lead-ingest` edge function
