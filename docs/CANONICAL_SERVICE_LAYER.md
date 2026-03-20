# Canonical Service Layer

> Last updated: 2026-03-20

## Architecture Principle

Each major business function has **one canonical implementation**. Pages consume canonical services; they do not implement business logic locally.

## Service Map

### Lead & Quote

| Service | Canonical File | Responsibility |
|---|---|---|
| LeadOrchestrator | `supabase/functions/lead-ingest/` | Create/update leads, source attribution, dedup, next_best_action |
| QuoteSessionService | `src/components/quote/hooks/useQuoteSession.ts` | Step tracking, autosave, resume, abandon, 2h expiry |
| DraftQuoteService | `src/lib/draftQuoteService.ts` | Create/update quote drafts via `save-quote` edge function |

### Pricing

| Service | Canonical File | Responsibility |
|---|---|---|
| PricingGateway | `src/lib/masterPricingService.ts` | Unified entry: smart engine → static fallback |
| SmartPricingEngine | `src/lib/smartPricingEngine.ts` | Internal cost calc: yard, zone, distance, material |
| LocationPricingCRUD | `src/services/locationPricingService.ts` | Admin CRUD for market_size_pricing |
| CalculatorService | `src/services/calculatorService.ts` | Internal calculator business rules |
| ExtrasPricingEngine | `src/services/extrasPricingEngine.ts` | Extras catalog + margin calc |
| CityDisplayPricing | `src/lib/cityDisplayPricing.ts` | SEO city pricing via PricingGateway |

### Documents

| Service | Canonical File | Responsibility |
|---|---|---|
| DocumentDeliveryCenter | `src/components/documents/DocumentDeliveryCenter.tsx` | Preview, PDF gen, send, upload signed |
| PdfGeneration | `supabase/functions/generate-quote-pdf/` | PDF rendering |
| MergeTagResolver | `src/lib/mergeTagResolver.ts` | Template variable resolution |
| ContractService | `src/lib/contractService.ts` | MSA/Addendum lifecycle |

### Communication

| Service | Canonical File | Responsibility |
|---|---|---|
| GhlCommunication | `src/lib/ghlCommunication.ts` | **Canonical** — send, threads, messages, calls, mode |
| GhlMessaging | `src/lib/ghlMessaging.ts` | Templates, queue, render — delegates send to GhlCommunication |
| SendMessageDialog (rich) | `src/components/communication/SendMessageDialog.tsx` | Entity-aware messaging UI |
| SendMessageDialog (quick) | `src/components/messaging/SendMessageDialog.tsx` | Channel-first quick action UI |

### Timeline & Notifications

| Service | Canonical File | Responsibility |
|---|---|---|
| TimelineService | `src/lib/timelineService.ts` | Event logging to timeline |
| CommercialMilestones | `src/lib/commercialMilestones.ts` | 30+ canonical milestone definitions |
| NotificationService | `src/lib/notificationService.ts` | Staff notification CRUD |
| NotificationRouting | `src/config/notificationRoutingConfig.ts` | Role-based event routing |

### Portal & Identity

| Service | Canonical File | Responsibility |
|---|---|---|
| CustomerAuth | `src/hooks/useCustomerAuth.ts` | OTP + token validation |
| IdentityResolution | DB triggers + `identity_groups` | Phone/email matching, merge suggestions |

## Rules for New Code

1. **Never duplicate business logic in page components** — always import from the canonical service
2. **One edge function per business operation** — lead-ingest, save-quote, ghl-send-outbound, etc.
3. **Pricing consumers must go through `masterPricingService`** — never call `dumpster_pricing` table directly from UI
4. **Communication must go through `ghlCommunication.ts`** — never call `ghl-send-outbound` directly from components
5. **Timeline events must use `timelineService.ts`** or `commercialMilestones.ts` — never insert to timeline directly
