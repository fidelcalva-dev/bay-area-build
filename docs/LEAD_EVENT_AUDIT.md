# Lead Event Audit

> Last updated: 2026-03-31

## Meaningful Lead-Generating Events

| Event Type | Source Route / Module | Lead Created | Timeline Event | Notification Created | Current Issue | Action Required |
|---|---|---|---|---|---|---|
| `dumpster_lead_created` | V3QuoteFlow, save-quote | ✅ | ✅ | ✅ | None | — |
| `cleanup_lead_created` | Cleanup quote form | ✅ | ✅ | ✅ | None | — |
| `bundle_lead_created` | Quote flow with bundle flag | ✅ | ✅ | ✅ | None | — |
| `contractor_application_submitted` | /contractor-application | ✅ | ✅ | ✅ | None | — |
| `ai_chat_handoff_created` | AI chat with contact capture | ✅ | ✅ | ✅ | None | — |
| `contact_form_submitted` | /contact, /cleanup/contact | ✅ | ✅ | ✅ | None | — |
| `photos_uploaded` | Photo upload in quote flow | ✅ | ✅ | ✅ | None | — |
| `recurring_service_interest` | Cleanup form with recurring flag | ✅ | ✅ | ✅ | None | — |
| `needs_site_visit` | Lead with site visit flag | ✅ | ✅ | ✅ | None | — |
| `quote_high_intent_started` | Quote flow past size selection | ✅ | ✅ | ⚠️ | Needs milestone trigger | Future enhancement |
| `lead_unassigned` | Auto-assign failure | ✅ | ✅ | ✅ | None | — |
| `follow_up_overdue` | SLA monitor cron | ✅ | ✅ | ✅ | None | — |
| `high_risk_lead` | Lead scoring RED label | ✅ | ✅ | ✅ | None | — |
| `quote_ready` | Quote completion | ✅ | ✅ | ✅ | None | — |
| `proposal_sent` | Send quote action | ✅ | ✅ | ✅ | None | — |
| `contract_sent` | Send contract action | ✅ | ✅ | ✅ | None | — |
| `payment_link_sent` | Payment request action | ✅ | ✅ | ✅ | None | — |
| `lead_won` | Mark Won action | ✅ | ✅ | ✅ | None | — |
| `lead_lost` | Mark Lost action | ✅ | ✅ | ✅ | None | — |

## Non-Events (Do NOT Trigger Notifications)

- Anonymous page views
- ZIP code entry without contact
- Material selection without contact
- Quote flow browsing without high intent
- Repeat visits from same anonymous session
