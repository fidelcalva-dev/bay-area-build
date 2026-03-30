# AI Chat to Lead Handoff

> Last updated: 2026-03-30

## Chat Hooks

| Hook | Brand | Handler | Status |
|---|---|---|---|
| `useCalsanChat` | Both | `lead-ingest` (direct) | ✅ Fixed — was calling `lead-capture` |
| `useAIChat` | Both | `ai-chat-lead` → GHL + `lead-ingest` | ✅ OK (indirect) |

## `useCalsanChat` Handoff

When `captureLead()` is called:
1. Updates `chat_conversations` with customer info
2. Calls `lead-ingest` with:
   - `source_channel: 'AI_CHAT'`
   - `lead_intent: 'CHAT_HANDOFF'`
   - `brand`: Inferred from `context.serviceType` (cleanup → CALSAN_CD_WASTE_REMOVAL)
   - `service_line`: From `raw_payload`
   - Conversation transcript in `message`
3. Lead appears in Lead Hub immediately

## `useAIChat` Handoff

When `captureLead()` is called:
1. Calls `ai-chat-lead` edge function
2. `ai-chat-lead` delegates to `lead-ingest` internally
3. Also syncs to GHL if credentials configured
4. Lead appears in Lead Hub

## Data Captured

- Name, phone, email
- City, ZIP
- Material, size preference
- Project type
- Conversation transcript (last 20 messages)
- Service line + brand (dynamic based on chat context)
