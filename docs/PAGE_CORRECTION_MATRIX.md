# Page Correction Matrix

> Last updated: 2026-03-20

## Legend
- ✅ Uses canonical service
- 🔧 Corrected in this consolidation
- ⚪ Not applicable

## Pages Verified

| Route | Business Purpose | Lead Service | Pricing Service | GHL Send | Timeline | Notes |
|---|---|---|---|---|---|---|
| `/quote` | Public quote flow | ✅ lead-ingest | ✅ masterPricingService | ⚪ | ✅ milestones | V3 flow |
| `/schedule-delivery` | Delivery scheduling | ✅ lead-ingest | ⚪ | ⚪ | ⚪ | |
| `/quick-order` | Quick order | ✅ lead-ingest | ⚪ | ⚪ | ⚪ | |
| `/sales/leads` | Lead hub | ✅ lead-ingest | ⚪ | ✅ ghlCommunication | ✅ timeline | |
| `/sales/quotes/new` | Internal calculator | ✅ lead-ingest | ✅ locationPricing + calculator | ✅ ghlCommunication | ✅ timeline | |
| `/admin/pricing` | Master pricing hub | ⚪ | ✅ locationPricing | ⚪ | ⚪ | 24-tab hub |
| `/admin/pricing/simulator` | Pricing simulator | ⚪ | ✅ smartPricingEngine | ⚪ | ⚪ | |
| `/admin/messaging` | GHL admin | ⚪ | ⚪ | 🔧 getMessagingMode now delegates | ⚪ | |

## GHL Consolidation Detail

| Component | Before | After |
|---|---|---|
| `ghlMessaging.sendMessageDirect` | Direct `ghl-send-outbound` call | 🔧 Delegates to `ghlCommunication.sendOutboundMessage` |
| `ghlMessaging.getMessagingMode` | Duplicate config read | 🔧 Re-exports `ghlCommunication.getGHLMessagingMode` |
| `messaging/SendMessageDialog` | Used `sendMessageDirect` | Now uses canonical path via delegation |
| `communication/SendMessageDialog` | Used `sendOutboundMessage` | ✅ Already canonical |

## Dead Code Removed

| File | Lines | Reason |
|---|---|---|
| `src/lib/publicPricing.ts` | 284 | Zero imports |
| `src/lib/pricingEngine.ts` | 382 | Zero imports, superseded |
