# Role Notification Routing

> Last updated: 2026-03-31

## Routing Matrix

| Event | Admin | Sales | CS |
|---|---|---|---|
| lead_created | ✅ Email+App | ✅ App | — |
| dumpster_lead_created | ✅ App | ✅ App | — |
| cleanup_lead_created | ✅ App | ✅ App | — |
| bundle_lead_created | ✅ Email+App | ✅ App | — |
| contractor_application_submitted | ✅ Email+App | ✅ Email+App | — |
| ai_chat_handoff_created | ✅ App | ✅ App | — |
| contact_form_submitted | ✅ App | ✅ App | — |
| photos_uploaded | — | ✅ App | — |
| recurring_service_interest | ✅ App | ✅ App | — |
| needs_site_visit | — | ✅ App | ✅ App |
| quote_high_intent_started | — | ✅ App | — |
| lead_unassigned | ✅ Email+App | — | — |
| follow_up_overdue | ✅ App | ✅ App | — |
| high_risk_lead | ✅ Email+App | — | — |
| quote_ready | — | ✅ App | — |
| proposal_sent | — | ✅ App | ✅ App |
| contract_sent | — | ✅ App | ✅ App |
| payment_link_sent | — | ✅ App | ✅ App |
| lead_won | ✅ App | ✅ App | ✅ App |
| lead_lost | ✅ App | ✅ App | — |

## Principles

1. **Admin sees everything** — plus system failures and SLA breaches
2. **Sales sees commercial events** — new leads, quotes, follow-ups
3. **CS sees coordination events** — missing info, resends, site visits
4. **No duplicate notifications** — dedupe_key prevents re-firing within 10 min
5. **Every notification has a deep link** — click goes to the relevant record
