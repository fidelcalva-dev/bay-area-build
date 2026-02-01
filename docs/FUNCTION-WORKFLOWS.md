# Calsan Platform: Function Workflows Documentation

> **Last Updated:** 2026-02-01 | **Version:** 1.0
> **Total Edge Functions:** 66 | **DB Triggers:** 25+ | **Cron Jobs:** 4

---

## 1. Executive Summary

The Calsan platform operates on a comprehensive automation architecture combining:
- **66 Edge Functions** handling telephony, leads, billing, dispatch, and AI operations
- **25+ Database Triggers** for state machine transitions and data integrity
- **4 pg_cron Scheduled Jobs** for daily operations and monitoring
- **Full end-to-end workflows** connecting customer acquisition to service delivery to billing

### System Modes

| Mode | Description |
|------|-------------|
| `DRY_RUN` | Default safe mode - logs actions but doesn't execute |
| `LIVE` | Full production mode - executes all actions |
| `LIVE_INTERNAL` | Master AI mode - internal notifications only, no customer messaging |

---

## 2. Edge Functions Inventory

### 2.1 Telephony (12 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `calls-inbound-handler` | POST | Handles incoming Twilio calls, routes to agents | Twilio | call_events, phone_numbers, customers |
| `calls-outbound-handler` | POST | Initiates outbound calls | Twilio | call_events |
| `calls-outbound-connect` | POST | TwiML for connected outbound calls | Twilio | - |
| `calls-status-callback` | POST | Twilio webhook for call status updates | Twilio | call_events, call_assignments |
| `calls-voicemail-handler` | POST | Processes voicemail recordings | Twilio | voicemails, call_events |
| `twilio-sms-webhook` | POST | Handles incoming SMS | Twilio | message_history, customers |
| `send-otp` | POST | Sends OTP for customer portal auth | Twilio | customer_sessions |
| `verify-otp` | POST | Verifies OTP codes | - | customer_sessions |
| `validate-session` | POST | Validates customer portal sessions | - | customer_sessions |
| `highlevel-webhook` | POST | Receives GoHighLevel webhooks | GHL | - |
| `ghl-inbound-webhook` | POST | GHL inbound message handler | GHL | customers, message_history |
| `ghl-send-message` | POST | Sends messages via GHL | GHL | message_queue |

### 2.2 Lead Capture (12 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `lead-capture` | POST | Generic lead capture endpoint | - | sales_leads, lead_events |
| `lead-omnichannel` | POST | Unified lead ingestion from all channels | - | sales_leads, lead_dedup_keys |
| `lead-from-quote` | POST | Creates lead from quote submission | - | sales_leads, quotes |
| `lead-from-phone` | POST | Creates lead from phone call | Twilio | sales_leads, customers |
| `lead-from-sms` | POST | Creates lead from SMS | Twilio | sales_leads |
| `lead-from-meta` | POST | Facebook/Instagram lead forms | Meta API | sales_leads |
| `lead-from-google-ads` | POST | Google Ads lead forms | Google Ads | sales_leads |
| `lead-manual-add` | POST | Manual lead creation by staff | - | sales_leads |
| `lead-ai-classify` | POST | AI classification of lead intent | Lovable AI | sales_leads, lead_events |
| `lead-export` | POST | Exports leads to CSV/external systems | - | sales_leads |
| `ai-chat-lead` | POST | AI chat for lead qualification | Lovable AI | sales_leads |
| `ai-sales-chat` | POST | Bilingual sales assistant | Lovable AI | sales_leads, quotes |

### 2.3 Quote & Order (7 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `save-quote` | POST | Saves quote to database | - | quotes |
| `quote-ai-recommend` | POST | AI size/material recommendations | Lovable AI | disposal_item_catalog |
| `send-quote-summary` | POST | Sends quote summary email/SMS | GHL/Resend | message_queue, quotes |
| `send-contract` | POST | Sends contract for e-signature | Resend | contracts, quotes |
| `create-order-from-quote` | POST | Converts quote to order | - | orders, quotes, customers |
| `generate-internal-pdf` | POST | Generates internal order PDFs | - | orders |
| `calculate-service-cost` | POST | Calculates service pricing | - | pricing_zones, dumpster_sizes |

### 2.4 Billing & Payments (7 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `create-hosted-session` | POST | Creates Authorize.Net hosted payment session | Authorize.Net | payments, invoices |
| `process-payment` | POST | Processes payment completion | Authorize.Net | payments, invoices, orders |
| `authnet-webhook` | POST | Authorize.Net payment webhooks | Authorize.Net | payments |
| `process-refund` | POST | Processes refunds | Authorize.Net | payments, invoices |
| `send-payment-request` | POST | Sends payment request to customer | GHL/Resend | message_queue, invoices |
| `send-payment-receipt` | POST | Sends payment confirmation | GHL/Resend | message_queue, payments |
| `overdue-billing-daily` | POST | Daily overdue billing automation | - | invoices, invoice_line_items, alerts |

### 2.5 Dispatch & Operations (6 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `calculate-operational-time` | POST | Calculates route times | Google Maps | - |
| `geocode-address` | POST | Geocodes delivery addresses | Google Maps | quotes, orders |
| `truck-route` | POST | Optimizes truck routing | Google Maps | runs |
| `nearest-facilities` | POST | Finds nearest disposal facilities | Google Maps | facilities |
| `run-automations` | POST | Triggers run-related automations | - | runs, run_events |
| `send-schedule-confirmation` | POST | Sends delivery confirmations | GHL/Resend | message_queue, orders |

### 2.6 Master AI (5 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `master-ai-scheduler` | POST | Enqueues AI jobs via pg_cron | - | ai_jobs |
| `master-ai-worker` | POST | Processes AI jobs (Control Tower, Reports) | Lovable AI | ai_jobs, ai_decisions, crm_tasks, alerts |
| `master-ai-admin` | POST | Admin AI commands | Lovable AI | ai_jobs |
| `master-ai-notifier` | POST | Sends AI-generated notifications | GHL/Resend | notifications_outbox |
| `send-service-receipt` | POST | Sends service completion receipts | GHL/Resend | message_queue |

### 2.7 Google Workspace (6 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `google-oauth-start` | POST | Initiates Google OAuth flow | Google OAuth | google_connections |
| `google-oauth-callback` | GET | OAuth callback handler | Google OAuth | google_connections |
| `google-send-email` | POST | Sends email via Gmail API | Gmail API | entity_google_links |
| `google-create-meet` | POST | Creates Google Meet links | Google Meet API | entity_google_links |
| `google-drive-folder` | POST | Creates Drive folders for orders | Google Drive API | entity_google_links |
| `google-chat-webhook` | POST | Google Chat notifications | Google Chat API | - |

### 2.8 Google Ads (2 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `ads-capacity-guard` | POST | Pauses ads when inventory low | Google Ads API | ads_campaigns, ads_markets |
| `ads-generate-campaigns` | POST | Auto-generates campaigns | Google Ads API | ads_campaigns, ads_adgroups |

### 2.9 Compensation (4 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `compensation-calc-on-payment` | POST | Calculates sales commission on payment | - | compensation_earnings |
| `compensation-calc-on-run` | POST | Calculates driver pay on run completion | - | compensation_earnings |
| `compensation-approval-worker` | POST | Processes compensation approvals | - | compensation_earnings |
| `compensation-kpi-evaluator` | POST | Evaluates KPI-based bonuses | - | compensation_earnings |

### 2.10 Messaging (2 Functions)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `ghl-message-worker` | POST | Processes message queue | GHL | message_queue, message_logs |
| `analyze-waste` | POST | AI waste analysis from photos | Lovable AI | - |

### 2.11 QA & Security (1 Function)

| Function | Endpoint | Description | External Services | Tables |
|----------|----------|-------------|-------------------|--------|
| `qa-runner` | POST | Runs automated QA checks | - | qa_results |

---

## 3. Database Triggers Inventory

### 3.1 Order State Machine

| Trigger | Table | Event | Function | Side Effects |
|---------|-------|-------|----------|--------------|
| `handle_order_scheduled` | orders | UPDATE (→scheduled) | handle_order_scheduled() | Reserves asset, creates delivery run |
| `handle_order_delivered` | orders | UPDATE (→delivered) | handle_order_delivered() | Updates asset to deployed, logs movement |
| `handle_order_cancelled` | orders | UPDATE (→cancelled) | handle_order_cancelled() | Releases asset, cancels runs |
| `create_delivery_run_from_order` | orders | UPDATE (→scheduled) | create_delivery_run_from_order() | Creates DELIVERY run |
| `create_pickup_run_from_order` | orders | UPDATE (→delivered) | create_pickup_run_from_order() | Creates PICKUP run |
| `cancel_runs_on_order_close` | orders | UPDATE (→completed/cancelled) | cancel_runs_on_order_close() | Cancels pending runs |

### 3.2 Asset State Management

| Trigger | Table | Event | Function | Side Effects |
|---------|-------|-------|----------|--------------|
| `trigger_validate_asset_state` | assets_dumpsters | INSERT/UPDATE | validate_asset_state() | Enforces state consistency |
| `update_assets_dumpsters_updated_at` | assets_dumpsters | UPDATE | update_assets_dumpsters_updated_at() | Timestamps |

### 3.3 Lead Routing

| Trigger | Table | Event | Function | Side Effects |
|---------|-------|-------|----------|--------------|
| `route_new_lead` | sales_leads | INSERT | route_new_lead() | Auto-assigns to sales/cs |

### 3.4 Quote Processing

| Trigger | Table | Event | Function | Side Effects |
|---------|-------|-------|----------|--------------|
| `auto_populate_heavy_fields` | orders | INSERT | auto_populate_heavy_fields() | Copies heavy fields from quote |

### 3.5 Updated_At Triggers (15+)

All major tables have `update_updated_at_column()` triggers for timestamp management:
- ads_adgroups, ads_ads, ads_campaigns, ads_markets
- agent_availability, ai_jobs
- call_routing_rules, certified_sources
- city_facility_rules, config_settings
- contracts, crm_tasks
- customer_material_offers, customers
- disposal_item_catalog, and more...

---

## 4. Cron Jobs Inventory

| Job ID | Schedule | Function | Purpose |
|--------|----------|----------|---------|
| 1 | `0 6 * * *` (6 AM UTC daily) | `overdue-billing-daily` | Process overdue rentals, create invoices |
| 2 | `*/30 * * * *` (every 30 min) | `master-ai-scheduler` (CONTROL_TOWER) | Run health checks, create tasks |
| 3 | `0 16 * * *` (4 PM UTC / 8 AM PT) | `master-ai-scheduler` (DAILY_BRIEF) | Morning brief for team |
| 4 | `0 2 * * *` (2 AM UTC / 6 PM PT) | `master-ai-scheduler` (EOD_REPORT) | End of day summary |

---

## 5. UI Routes Inventory

### 5.1 Public Routes

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/` | Homepage | - |
| `/quote` | Quote calculator | save-quote, quote-ai-recommend |
| `/quote/contractor` | Contractor quote flow | save-quote |
| `/sizes` | Size guide | - |
| `/pricing` | Pricing page | - |
| `/waste-vision` | Waste AI analysis | analyze-waste |
| `/how-it-works` | Process guide | - |

### 5.2 Customer Portal (/portal)

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/portal` | Login (OTP) | send-otp, verify-otp |
| `/portal/dashboard` | Customer dashboard | validate-session |
| `/portal/orders` | Order list | validate-session |
| `/portal/order/:id` | Order detail | validate-session, create-hosted-session |
| `/portal/payment-complete` | Payment confirmation | - |

### 5.3 Sales Portal (/sales)

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/sales` | Dashboard | - |
| `/sales/leads` | Lead list | - |
| `/sales/lead-hub` | Omnichannel inbox | lead-ai-classify |
| `/sales/quotes` | Quote management | - |
| `/sales/calls` | Call log | - |

### 5.4 CS Portal (/cs)

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/cs` | Dashboard | - |
| `/cs/orders` | Order management | - |
| `/cs/requests` | Service requests | - |
| `/cs/calls` | Call log | - |
| `/cs/lead-hub` | CS lead inbox | - |

### 5.5 Dispatch Portal (/dispatch)

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/dispatch` | Dashboard | - |
| `/dispatch/today` | Today's runs | - |
| `/dispatch/calendar` | Week view | - |
| `/dispatch/runs` | Runs list | - |
| `/dispatch/run/:id` | Run detail | - |

### 5.6 Driver App (/driver)

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/driver` | Home | - |
| `/driver/runs` | Assigned runs | - |
| `/driver/profile` | Profile/availability | - |

### 5.7 Finance Portal (/finance)

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/finance` | Dashboard | - |
| `/finance/invoices` | Invoice list | - |
| `/finance/payments` | Payment history | - |
| `/finance/ar-aging` | AR aging report | - |
| `/finance/payment-actions` | Payment actions | process-refund |

### 5.8 Admin Panel (/admin)

| Route | Description | Functions Called |
|-------|-------------|------------------|
| `/admin` | Dashboard | - |
| `/admin/orders` | Order management | - |
| `/admin/customers` | Customer CRM | - |
| `/admin/assets` | Asset control tower | - |
| `/admin/overdue` | Overdue billing | overdue-billing-daily |
| `/admin/approval-queue` | Approval requests | - |
| `/admin/telephony/*` | Telephony management | calls-* functions |
| `/admin/ads/*` | Google Ads management | ads-* functions |
| `/admin/google` | Google Workspace | google-* functions |
| `/admin/qa/control-center` | QA dashboard | qa-runner |
| `/admin/qa/workflows` | This documentation | - |
| `/admin/setup/functions` | Integration status | - |

---

## 6. End-to-End Workflows

### Workflow A: Lead → Quote → Order

```
┌─────────────────────────────────────────────────────────────────────┐
│ SOURCES                                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Website Quote → lead-from-quote                                      │
│ Phone Call → lead-from-phone (via calls-inbound-handler)            │
│ SMS → lead-from-sms (via twilio-sms-webhook)                        │
│ Google Ads → lead-from-google-ads                                    │
│ Meta/FB → lead-from-meta                                             │
│ AI Chat → ai-sales-chat                                              │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LEAD PROCESSING                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 1. capture_omnichannel_lead() - Dedup + normalize                   │
│ 2. route_new_lead() trigger - Assign to sales/cs                    │
│ 3. lead-ai-classify - Intent scoring                                 │
│ 4. auto_assign_lead() - Round-robin assignment                      │
│                                                                      │
│ Tables: sales_leads, lead_dedup_keys, lead_events                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ QUOTE CREATION                                                       │
├─────────────────────────────────────────────────────────────────────┤
│ 1. User fills calculator (/quote)                                    │
│ 2. quote-ai-recommend - Size suggestion                              │
│ 3. save-quote - Persist to DB                                        │
│ 4. send-quote-summary - Email/SMS to customer                       │
│ 5. send-contract - E-signature request                               │
│                                                                      │
│ Tables: quotes, contracts                                            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ ORDER CREATION & PAYMENT                                             │
├─────────────────────────────────────────────────────────────────────┤
│ 1. create-order-from-quote - Convert quote                           │
│ 2. create-hosted-session - Payment page                              │
│ 3. process-payment / authnet-webhook - Payment confirmation         │
│ 4. send-payment-receipt - Confirmation message                       │
│ 5. compensation-calc-on-payment - Sales commission                  │
│                                                                      │
│ Tables: orders, customers, invoices, payments, compensation_earnings│
│ Triggers: auto_populate_heavy_fields                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow B: Payment → Confirmation

```
┌─────────────────────────────────────────────────────────────────────┐
│ PAYMENT FLOW                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Customer Portal (/portal/order/:id)                                  │
│         │                                                            │
│         ▼                                                            │
│ create-hosted-session                                                │
│         │                                                            │
│         ▼                                                            │
│ Authorize.Net Hosted Payment Page                                    │
│         │                                                            │
│         ├─────────────────┐                                          │
│         │                 │                                          │
│         ▼                 ▼                                          │
│ authnet-webhook     process-payment                                  │
│         │                 │                                          │
│         └────────┬────────┘                                          │
│                  │                                                   │
│                  ▼                                                   │
│         payments table updated                                       │
│         invoices.payment_status = 'paid'                            │
│         orders.payment_status = 'paid'                               │
│                  │                                                   │
│                  ▼                                                   │
│         send-payment-receipt (DRY_RUN/LIVE)                         │
│                  │                                                   │
│                  ▼                                                   │
│         compensation-calc-on-payment                                 │
│                                                                      │
│ Tables: payments, invoices, orders, compensation_earnings            │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow C: Dispatch / Runs

```
┌─────────────────────────────────────────────────────────────────────┐
│ ORDER → RUN CREATION                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Order status → 'scheduled'                                           │
│         │                                                            │
│         ▼                                                            │
│ handle_order_scheduled() trigger                                     │
│   • Reserves asset (status → 'reserved')                            │
│         │                                                            │
│         ▼                                                            │
│ create_delivery_run_from_order() trigger                            │
│   • Creates DELIVERY run (status: SCHEDULED)                        │
│   • Creates run_checkpoints (DELIVERY_POD required)                 │
│         │                                                            │
│         ▼                                                            │
│ Dispatch assigns: driver, truck, yard (/dispatch/run/:id)           │
│   • calculate-operational-time for route ETA                        │
│   • Run status → ASSIGNED                                            │
│                                                                      │
│ Tables: orders, runs, run_checkpoints, assets_dumpsters              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ RUN EXECUTION                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Driver App (/driver/runs)                                            │
│         │                                                            │
│         ▼                                                            │
│ EN_ROUTE → ARRIVED → COMPLETED                                       │
│         │                                                            │
│ Each status change:                                                  │
│   • run_events INSERT                                                │
│   • Timestamp capture                                                │
│                                                                      │
│ On ARRIVED (DELIVERY):                                               │
│   • Upload placement photo (DELIVERY_POD)                           │
│                                                                      │
│ On COMPLETED:                                                        │
│   • can_complete_run() validates all POD uploaded                   │
│   • Order status → 'delivered'                                       │
│   • handle_order_delivered() trigger fires                          │
│   • Asset status → 'deployed', deployed_at = now()                  │
│   • inventory_movements INSERT (MOVE_OUT)                           │
│   • compensation-calc-on-run                                         │
│                                                                      │
│ Tables: runs, run_events, run_checkpoints, assets_dumpsters          │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow D: Driver POD (Proof of Delivery)

```
┌─────────────────────────────────────────────────────────────────────┐
│ POD REQUIREMENTS BY RUN TYPE                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ DELIVERY:                                                            │
│   □ DELIVERY_POD - Dumpster placed photo (required)                 │
│                                                                      │
│ PICKUP:                                                              │
│   □ PICKUP_POD - Full dumpster photo (required)                     │
│   □ DUMP_TICKET - Disposal ticket (required)                        │
│   □ MATERIAL_CLOSEUP - Material photo (conditional)                 │
│                                                                      │
│ SWAP:                                                                │
│   □ PICKUP_POD - Full dumpster photo (required)                     │
│   □ DUMP_TICKET - Disposal ticket (required)                        │
│   □ DELIVERY_POD - Empty dumpster placed (required)                 │
│                                                                      │
│ HEAVY MATERIAL (any type):                                          │
│   □ FILL_LINE_PHOTO - Fill line compliance (required)               │
│   □ PRE_PICKUP_WIDE - Wide shot (required if HIGH risk)             │
│   □ PRE_PICKUP_MATERIAL - Material close-up (required if HIGH risk) │
│                                                                      │
│ ENFORCEMENT:                                                         │
│   can_complete_run(run_id) blocks completion if missing              │
│                                                                      │
│ Tables: runs, run_checkpoints, pod_requirements                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow E: Heavy Material Enforcement

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEAVY MATERIAL FLOW                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Quote Creation:                                                      │
│   1. SmartMaterialSelector detects heavy material                   │
│   2. quote-ai-recommend enforces 5-10yd only                        │
│   3. estimate_heavy_weight() calculates risk                        │
│   4. Fill line warning displayed                                     │
│                                                                      │
│ Order Creation:                                                      │
│   5. auto_populate_heavy_fields() copies to order                   │
│   6. is_heavy_material = true, weight_risk_level set                │
│   7. requires_fill_line = true, requires_pre_pickup_photos = true   │
│                                                                      │
│ Pickup Run:                                                          │
│   8. Driver must upload FILL_LINE_PHOTO                             │
│   9. fill_line_compliant checkbox required                          │
│   10. If overfilled → flag_run_overfill()                           │
│   11. If contaminated → flag_run_contamination()                    │
│                                                                      │
│ Contamination Detected:                                              │
│   12. mark_order_contaminated(order_id) called                      │
│   13. Reclassifies to Mixed Debris pricing                          │
│   14. $165/ton overage applies                                       │
│   15. If delta > $250 → approval_request created                    │
│   16. Alert created for dispatch                                     │
│                                                                      │
│ Dump Ticket Processing:                                              │
│   17. Driver uploads ticket, enters weight                           │
│   18. apply_scale_ticket_weight() calculates overage                │
│   19. Invoice line item created                                      │
│   20. If charge > $250 → approval required                          │
│                                                                      │
│ Tables: orders, quotes, runs, invoices, invoice_line_items, alerts   │
│ Functions: estimate_heavy_weight, mark_order_contaminated,           │
│            apply_scale_ticket_weight                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow F: Billing / Overdue

```
┌─────────────────────────────────────────────────────────────────────┐
│ OVERDUE BILLING AUTOMATION                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Daily @ 6 AM UTC (pg_cron job #1):                                   │
│   1. overdue-billing-daily invoked                                   │
│   2. Reads overdue_assets_billing_vw                                │
│   3. Calculates billable_days = days_out - included_days - billed   │
│                                                                      │
│ For each asset with billable_days > 0:                               │
│   4. amount = billable_days × $35/day (config)                      │
│                                                                      │
│ If amount > $250 (auto_bill_max):                                   │
│   5. approval_request created (status: pending)                     │
│   6. Alert created                                                   │
│   7. Skip auto-billing                                               │
│                                                                      │
│ If amount <= $250:                                                   │
│   8. invoice_line_items INSERT (overdue_rental)                     │
│   9. invoices updated (amount_due += amount)                        │
│   10. overdue_billing_state updated                                  │
│   11. message_history INSERT (overdue notice)                       │
│        → status = 'pending' if LIVE, 'dry_run' if DRY_RUN           │
│                                                                      │
│ If overdue_days >= 3 (escalation_days):                             │
│   12. Alert created (overdue_pickup_needed)                         │
│   13. Dispatch task created                                          │
│                                                                      │
│ Tables: assets_dumpsters, overdue_billing_state, invoices,           │
│         invoice_line_items, alerts, message_history, approval_requests│
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow G: Master AI Control Tower

```
┌─────────────────────────────────────────────────────────────────────┐
│ MASTER AI SUPERVISOR                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Every 30 min (pg_cron job #2):                                       │
│   1. master-ai-scheduler enqueues CONTROL_TOWER job                 │
│   2. master-ai-worker claims job                                     │
│                                                                      │
│ CONTROL_TOWER checks:                                                │
│   A) Stale leads (5+ min, NEW status)                               │
│      → Create CRM task, IN_APP notification to team                 │
│   B) Stale quotes (60+ min, unpaid)                                 │
│      → Create follow-up task for high-value quotes                  │
│   C) Delayed runs (30+ min past scheduled)                          │
│      → Alert dispatch, create urgent task                           │
│   D) Heavy risk orders (HIGH weight_risk_level)                     │
│      → Create photo verification task                               │
│   E) Overdue assets (7+ days out)                                   │
│      → Alert billing, create review task                            │
│   F) Aging approvals (24h+ pending)                                 │
│      → Escalate to admin                                             │
│                                                                      │
│ For each finding:                                                    │
│   3. ai_decisions INSERT                                             │
│   4. ai_actions INSERT (DRAFTED or EXECUTED by mode)                │
│   5. enqueue_notification() for alerts                              │
│   6. crm_tasks INSERT for action items                              │
│                                                                      │
│ Daily @ 8 AM PT (pg_cron job #3):                                   │
│   DAILY_BRIEF job - Team morning summary                            │
│                                                                      │
│ Daily @ 6 PM PT (pg_cron job #4):                                   │
│   EOD_REPORT job - End of day summary                               │
│                                                                      │
│ Mode enforcement:                                                    │
│   LIVE_INTERNAL: Internal notifications only                        │
│   Customer messages marked SKIPPED in notifications_outbox          │
│                                                                      │
│ Tables: ai_jobs, ai_decisions, ai_actions, crm_tasks, alerts,        │
│         notifications_outbox                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow H: Telephony Migration (GHL → Twilio)

```
┌─────────────────────────────────────────────────────────────────────┐
│ GHL → TWILIO MIGRATION                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Phase 1: FORWARD (Current GHL numbers remain primary)               │
│   1. Configure GHL to forward to Twilio number                      │
│   2. calls-inbound-handler tags: call_source = 'GHL_FORWARD'        │
│   3. Metadata captures: original_did, forwarded_to                  │
│                                                                      │
│ Phase 2: DUAL-RING (Both systems receive calls)                     │
│   4. Point Twilio number to calls-inbound-handler webhook           │
│   5. GHL forward remains active                                      │
│   6. Validate routing rules work correctly                          │
│                                                                      │
│ Phase 3: PORT (Twilio becomes primary)                              │
│   7. Submit porting request with LOA                                │
│   8. Update phone_numbers table                                      │
│   9. Disable GHL forwarding                                          │
│                                                                      │
│ Admin Tools:                                                         │
│   /admin/telephony/migration - Wizard UI                            │
│   /admin/telephony/test - Simulate call routing                     │
│   /admin/telephony/import - Import historical calls                 │
│                                                                      │
│ Webhooks to configure:                                               │
│   Voice URL: /functions/v1/calls-inbound-handler                    │
│   Status Callback: /functions/v1/calls-status-callback              │
│   SMS URL: /functions/v1/twilio-sms-webhook                         │
│                                                                      │
│ Tables: phone_numbers, call_events, call_assignments                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Manual Setup Checklist

### External Services Configuration

| Service | Required Secrets | Webhook URLs |
|---------|------------------|--------------|
| **Twilio** | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER | Voice: `/functions/v1/calls-inbound-handler`, Status: `/functions/v1/calls-status-callback`, SMS: `/functions/v1/twilio-sms-webhook` |
| **Authorize.Net** | AUTHNET_API_LOGIN, AUTHNET_TRANSACTION_KEY | Webhook: `/functions/v1/authnet-webhook` |
| **Google OAuth** | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | Callback: `/functions/v1/google-oauth-callback` |
| **Google Ads** | GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_DEVELOPER_TOKEN | Lead Form: `/functions/v1/lead-from-google-ads` |
| **Meta/Facebook** | META_APP_ID, META_APP_SECRET | Lead Form: `/functions/v1/lead-from-meta` |
| **GoHighLevel** | GHL_API_KEY, GHL_LOCATION_ID | Inbound: `/functions/v1/ghl-inbound-webhook` |
| **Resend** | RESEND_API_KEY | - |
| **Google Maps** | GOOGLE_MAPS_API_KEY | - |

---

## 8. Debugging Guide

### Log Sources

| Log Type | Table/Function | Admin Route |
|----------|----------------|-------------|
| Edge Function logs | Supabase Dashboard | - |
| Call events | call_events | /admin/telephony/calls |
| Lead events | lead_events | /admin/dashboards/leads |
| AI decisions | ai_decisions, ai_actions | /admin/master-ai/decisions |
| Message logs | message_logs, message_queue | /admin/messaging |
| Audit logs | audit_logs | /admin/audit-logs |
| Automation runs | automation_runs | /admin/config/health |
| QA results | qa_results | /admin/qa/control-center |

### Config Settings Dashboard

- **/admin/config/health** - View all system modes and thresholds
- **/admin/security** - RLS and security status
- **/admin/setup/functions** - Integration connection status

---

## 9. Appendix: Complete Function List

| # | Function Name | Category |
|---|---------------|----------|
| 1 | ads-capacity-guard | ADS |
| 2 | ads-generate-campaigns | ADS |
| 3 | ai-chat-lead | LEADS |
| 4 | ai-sales-chat | LEADS |
| 5 | analyze-waste | OTHER |
| 6 | authnet-webhook | BILLING |
| 7 | calculate-operational-time | DISPATCH |
| 8 | calculate-service-cost | QUOTES |
| 9 | calls-inbound-handler | TELEPHONY |
| 10 | calls-outbound-connect | TELEPHONY |
| 11 | calls-outbound-handler | TELEPHONY |
| 12 | calls-status-callback | TELEPHONY |
| 13 | calls-voicemail-handler | TELEPHONY |
| 14 | compensation-approval-worker | BILLING |
| 15 | compensation-calc-on-payment | BILLING |
| 16 | compensation-calc-on-run | BILLING |
| 17 | compensation-kpi-evaluator | BILLING |
| 18 | create-hosted-session | BILLING |
| 19 | create-order-from-quote | QUOTES |
| 20 | generate-internal-pdf | QUOTES |
| 21 | geocode-address | DISPATCH |
| 22 | ghl-inbound-webhook | MESSAGING |
| 23 | ghl-message-worker | MESSAGING |
| 24 | ghl-send-message | MESSAGING |
| 25 | google-chat-webhook | GOOGLE |
| 26 | google-create-meet | GOOGLE |
| 27 | google-drive-folder | GOOGLE |
| 28 | google-oauth-callback | GOOGLE |
| 29 | google-oauth-start | GOOGLE |
| 30 | google-send-email | GOOGLE |
| 31 | highlevel-webhook | MESSAGING |
| 32 | lead-ai-classify | LEADS |
| 33 | lead-capture | LEADS |
| 34 | lead-export | LEADS |
| 35 | lead-from-google-ads | LEADS |
| 36 | lead-from-meta | LEADS |
| 37 | lead-from-phone | LEADS |
| 38 | lead-from-quote | LEADS |
| 39 | lead-from-sms | LEADS |
| 40 | lead-manual-add | LEADS |
| 41 | lead-omnichannel | LEADS |
| 42 | master-ai-admin | MASTER_AI |
| 43 | master-ai-notifier | MASTER_AI |
| 44 | master-ai-scheduler | MASTER_AI |
| 45 | master-ai-worker | MASTER_AI |
| 46 | nearest-facilities | DISPATCH |
| 47 | overdue-billing-daily | BILLING |
| 48 | process-payment | BILLING |
| 49 | process-refund | BILLING |
| 50 | qa-runner | QA |
| 51 | quote-ai-recommend | QUOTES |
| 52 | run-automations | DISPATCH |
| 53 | save-quote | QUOTES |
| 54 | send-contract | QUOTES |
| 55 | send-otp | TELEPHONY |
| 56 | send-payment-receipt | BILLING |
| 57 | send-payment-request | BILLING |
| 58 | send-quote-summary | QUOTES |
| 59 | send-schedule-confirmation | DISPATCH |
| 60 | send-service-receipt | MASTER_AI |
| 61 | truck-route | DISPATCH |
| 62 | twilio-sms-webhook | TELEPHONY |
| 63 | update-days-out | BILLING |
| 64 | validate-session | TELEPHONY |
| 65 | verify-otp | TELEPHONY |
| 66 | (total count) | - |

---

*Generated by Calsan Platform QA System*
