# Duplicated Function Audit

> Last updated: 2026-03-20

## Resolved Duplications

### 1. GHL Send — `sendMessageDirect` vs `sendOutboundMessage`

| Aspect | `ghlMessaging.sendMessageDirect` | `ghlCommunication.sendOutboundMessage` |
|---|---|---|
| File | `src/lib/ghlMessaging.ts` | `src/lib/ghlCommunication.ts` |
| Edge Function | `ghl-send-outbound` | `ghl-send-outbound` |
| Entity awareness | Basic (string params) | Full (typed entity linking) |
| **Resolution** | Now delegates to `sendOutboundMessage` | **Canonical** |

### 2. Messaging Mode — `getMessagingMode` vs `getGHLMessagingMode`

| Aspect | `ghlMessaging.getMessagingMode` | `ghlCommunication.getGHLMessagingMode` |
|---|---|---|
| Logic | Read `config_settings` → parse JSON | Read `config_settings` → parse JSON |
| **Resolution** | Now re-exports `getGHLMessagingMode` | **Canonical** |

### 3. Dead Pricing Files

| File | Status | Reason |
|---|---|---|
| `src/lib/publicPricing.ts` | **Deleted** | Zero imports across codebase |
| `src/lib/pricingEngine.ts` | **Deleted** | Zero imports — superseded by `masterPricingService.ts` |

### 4. SendMessageDialog — Two Implementations

| Component | File | Used By | Status |
|---|---|---|---|
| `communication/SendMessageDialog` | 318 lines, entity-typed | Exported via `communication/index.ts` | **Canonical** — richer entity awareness |
| `messaging/SendMessageDialog` | 260 lines, channel-typed | `CommunicationQuickActions` | **Retained** — different prop interface, delegates to canonical send |

Both now use the canonical `ghl-send-outbound` path. The `messaging` variant is a lightweight channel-first interface suited for quick actions.

## No Duplication Found (Verified Clean)

| Business Function | Canonical Implementation | Consumers |
|---|---|---|
| Lead creation | `lead-ingest` edge function | 7+ pages/functions |
| Quote session | `useQuoteSession.ts` | Quote flow only |
| Draft quote | `draftQuoteService.ts` | V3 quote flow |
| Timeline events | `timelineService.ts` | All CRM pages |
| Milestones | `commercialMilestones.ts` | logMilestone helper |
| Notifications | `notificationService.ts` + routing config | Notification dispatcher |
| Contract service | `contractService.ts` | Customer 360, portal |
| PDF generation | `generate-quote-pdf` edge function | DocumentDeliveryCenter |
| City pricing | `cityDisplayPricing.ts` → `masterPricingService` | SEO pages |
