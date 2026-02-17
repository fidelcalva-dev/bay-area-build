# CURRENT-STATE INVENTORY
Generated: 2026-02-17

---

## A) WEBSITE ROUTES (Public)

### Core Pages
| Route | Component | Status |
|-------|-----------|--------|
| `/` | Index (Homepage) | LIVE |
| `/quote` | Quote → V3QuoteFlow | LIVE |
| `/quote/contractor` | ContractorQuote | LIVE |
| `/quote/schedule` | QuoteSchedule | LIVE |
| `/quote/pay` | QuotePayment | LIVE |
| `/quick-order` | QuickOrder | LIVE |
| `/pricing` | Pricing | LIVE |
| `/sizes` | Sizes | LIVE |
| `/visualizer` | DumpsterVisualizer | LIVE |
| `/areas` | Areas | LIVE |
| `/materials` | Materials | LIVE |
| `/capacity-guide` | CapacityGuide | LIVE |
| `/locations` | Locations | LIVE |
| `/how-it-works` | HowItWorks | LIVE |
| `/why-local-yards` | WhyLocalYards | LIVE |
| `/not-a-broker` | NotABroker | LIVE |
| `/waste-vision` | WasteVision | LIVE |
| `/about` | About | LIVE |
| `/contact` | Contact | LIVE |
| `/careers` | Careers | LIVE |
| `/terms` | Terms | LIVE |
| `/privacy` | Privacy | LIVE |
| `/thank-you` | ThankYou | LIVE |
| `/blog` | Blog | LIVE |
| `/blog/:articleSlug` | BlogArticle | LIVE |
| `/contractors` | Contractors | LIVE |
| `/contractor-best-practices` | ContractorBestPractices | LIVE |
| `/contractor-resources` | ContractorResources | LIVE |
| `/green-impact` | GreenImpactMap | LIVE |
| `/green-halo` | GreenHalo | LIVE |

### SEO City Engine Pages
| Route | Component | Notes |
|-------|-----------|-------|
| `/dumpster-rental-oakland-ca` | DumpsterRentalOakland | Flagship |
| `/dumpster-rental-san-jose-ca` | DumpsterRentalSanJose | Flagship |
| `/dumpster-rental-san-francisco-ca` | DumpsterRentalSanFrancisco | Flagship |
| `/dumpster-rental-east-bay` | RegionalLandingPage | Regional |
| `/dumpster-rental-south-bay` | RegionalLandingPage | Regional |
| `/commercial-dumpster-rental` | CommercialLandingPage | Commercial |
| `/construction-dumpsters` | CommercialLandingPage | Commercial |
| `/warehouse-cleanout-dumpsters` | CommercialLandingPage | Commercial |
| `/dumpster-rental/:citySlug` | SeoCityPage | Dynamic city engine |
| `/:citySlug/:sizeSlug-yard-dumpster` | SeoCitySizePage | City+Size |
| `/:citySlug/concrete-dumpster` | SeoCityMaterialPage | City+Material |
| `/:citySlug/dirt-dumpster` | SeoCityMaterialPage | City+Material |
| `/:citySlug/construction-debris-dumpster` | SeoCityMaterialPage | City+Material |
| `/:citySlug/yard-waste-dumpster` | SeoCityMaterialPage | City+Material |
| `/:citySlug/commercial-dumpster-rental` | SeoCityMaterialPage | City+Commercial |

### Quote Flow
- **Active flow**: V3 (`V3QuoteFlow` component)
- **Source**: `src/pages/Quote.tsx` directly imports `V3QuoteFlow`
- **No V2/V3 feature flag toggle** — V3 is hardcoded as the active flow
- **Preview routes**: `/preview/quote`, `/preview/home` exist for A/B testing

---

## B) CRM ROUTES

### Admin Portal (`/admin`)
| Route | Component | Category |
|-------|-----------|----------|
| `/admin` | AdminDashboard | Dashboard |
| `/admin/orders` | OrdersManager | Orders |
| `/admin/customers` | CustomersManager | CRM |
| `/admin/customers/:id` | CustomerDetail | CRM |
| `/admin/yards` | YardsManager | Ops |
| `/admin/zones` | ZonesManager | Ops |
| `/admin/pricing` | PricingManager | Pricing |
| `/admin/vendors` | VendorsManager | Ops |
| `/admin/extras` | ExtrasManager | Pricing |
| `/admin/config` | ConfigManager | Config |
| `/admin/configuration` | ConfigurationHub | Config |
| `/admin/volume-commitments` | VolumeCommitmentsManager | Pricing |
| `/admin/audit-logs` | AuditLogsPage | Compliance |
| `/admin/google` | AdminGoogleSettings | Integrations |
| `/admin/google/setup` | AdminGoogleSetup | Integrations |
| `/admin/google/logs` | AdminGoogleLogs | Integrations |
| `/admin/messaging` | AdminMessaging | Messaging |
| `/admin/email-test` | AdminEmailTest | Messaging |
| `/admin/ghl` | GHLIntegrationPage | Integrations |
| `/admin/toll-surcharges` | TollSurchargesManager | Pricing |
| `/admin/city-rates` | CityRatesManager | Pricing |
| `/admin/drivers` | DriversManager | Ops |
| `/admin/dispatch` | DispatchCalendar | Ops |
| `/admin/tickets` | TicketsManager | Ops |
| `/admin/inventory` | InventoryManager | Ops |
| `/admin/assets` | AssetsControlTower | Ops |
| `/admin/movements` | MovementsLog | Ops |
| `/admin/users` | UsersManager | RBAC |
| `/admin/access-requests` | AccessRequestsPage | RBAC |
| `/admin/alerts` | AlertsPage | Monitoring |
| `/admin/fraud-flags` | FraudFlagsPage | Risk |
| `/admin/risk` | RiskReviewPage | Risk |
| `/admin/quick-links` | QuickLinksManager | Config |
| `/admin/markets` | MarketsManager | Markets |
| `/admin/markets/new-location` | NewLocationWizard | Markets |
| `/admin/facilities` | FacilitiesManager | Ops |
| `/admin/overdue` | OverdueBillingPage | Billing |
| `/admin/approval-queue` | ApprovalQueuePage | Approvals |
| `/admin/compensation` | CompensationPage | HR |
| `/admin/config/health` | ConfigHealthPage | Health |
| `/admin/security` | SecurityHealthPage | Security |
| `/admin/setup/functions` | IntegrationFunctionsMap | Setup |
| `/admin/setup/what-missing` | WhatsMissingPage | Setup |
| `/admin/setup/search-index` | SearchIndexManager | Search |
| `/admin/materials/*` | MaterialCatalog/Categories/Offers | Materials |
| `/admin/customer-type-rules` | CustomerTypeRulesPage | Rules |
| `/admin/activity` | AdminActivityFeed | Activity |
| `/admin/customer-health` | CustomerHealthDashboard | Health |
| `/admin/heavy-risk` | HeavyRiskDashboard | Risk |
| `/admin/profitability` | ProfitabilityDashboard | Finance |
| `/admin/pricing/locations` | LocationPricingManager | Pricing |
| `/admin/telephony/*` | Calls/Numbers/Analytics/Migration/Test/Import | Telephony |
| `/admin/dashboards/*` | Overview/Sales/Operations/Finance/Customers/KPIs/Leads | Dashboards |
| `/admin/leads/settings` | LeadEngineSettings | Leads |
| `/admin/ads/*` | Overview/Campaigns/Rules/Markets/Logs | Ads |
| `/admin/docs` | InternalDocsPage | Docs |
| `/admin/calculator/logs` | CalculatorLogsPage | Calculator |
| `/admin/notifications/internal` | InternalAlertsPage | Notifications |
| `/admin/qa/*` | ControlCenter/Workflows/WorkflowGraph | QA |
| `/admin/seo/*` | Dashboard/Cities/Pages/Sitemap/GBP-Plan | SEO |
| `/admin/ai/chat` | AdminAIChat | AI |
| `/admin/marketing/*` | Visitors/Sessions/GoogleSetup/Dashboard/GA4Debug | Marketing |

### Sales Portal (`/sales`)
| Route | Component |
|-------|-----------|
| `/sales` | SalesDashboard |
| `/sales/leads` | SalesLeads |
| `/sales/leads/:id` | SalesLeadDetail |
| `/sales/quotes` | SalesQuotes |
| `/sales/quotes/new` | SalesNewQuote |
| `/sales/calls` | SalesCalls |
| `/sales/inbox` | LeadInbox |
| `/sales/lead-hub` | SalesLeadInbox |
| `/sales/order-builder` | OrderBuilder |

### CS Portal (`/cs`)
- CSLayout, CSDashboard, CSLeads, CSLeadInbox, CSOrders, CSCalls, CSMessages, CSRequests, CSTemplates

### Dispatch Portal (`/dispatch`)
- DispatchLayout, DispatchDashboard, DispatchToday, DispatchCalendar, DispatchFlags, DispatchRequests

### Driver Portal (`/driver`)
- DriverLayout, DriverHome, DriverRuns, DriverProfile
- Legacy: `/driver/legacy` → DriverApp

### Finance Portal (`/finance`)
- FinanceLayout, FinanceDashboard, FinanceInvoices/:orderId, FinancePayments/:paymentId, FinancePaymentActions
- AR Aging: Dashboard, Invoices, Customers

### Internal Tools
| Route | Component |
|-------|-----------|
| `/internal/calculator` | InternalCalculator (canonical) |
| `/ops/calculator` | InternalCalculator (alias) |
| `/sales/calculator` | InternalCalculator (alias) |
| `/cs/calculator` | InternalCalculator (alias) |
| `/dispatch/calculator` | InternalCalculator (alias) |

### Customer Portal (`/portal`)
| Route | Auth Guard | Component |
|-------|-----------|-----------|
| `/portal` | None | CustomerLogin (SMS OTP) |
| `/portal/track` | None | PortalTrack |
| `/portal/dashboard` | PortalAuthGuard | CustomerDashboard |
| `/portal/orders` | PortalAuthGuard | CustomerOrders |
| `/portal/documents` | PortalAuthGuard | CustomerDocuments |
| `/portal/order/:orderId` | PortalAuthGuard | CustomerOrderDetail |
| `/portal/orders/:orderId` | PortalAuthGuard | CustomerOrderDetail |
| `/portal/payment-complete` | PortalAuthGuard | PaymentComplete |
| `/portal/quote/:quoteId` | None (SMS link) | PortalQuoteView |
| `/portal/schedule` | None (SMS link) | PortalSchedule |
| `/portal/pay` | None (SMS link) | PortalPay |
| `/portal/pay/:paymentId` | None | PaymentRedirect |

---

## C) DB OBJECTS

### Core Tables (185+ total)
**Leads/CRM**: leads (via lead_* tables), lead_actions, lead_addresses, lead_alerts, lead_assignment_rules, lead_channels, lead_dedup_keys, lead_events, lead_export_jobs, lead_sla_rules, lead_source_metadata, lead_sources, lead_visitor_links, contacts, customers, customer_profiles, customer_sessions, crm_notes, crm_tasks, opportunities

**Quotes/Orders**: quotes, quote_site_placement, orders, order_events, order_site_placement, order_cart_items, order_cart_schedules, order_carts, order_disposal_plans

**Invoices/Payments**: invoices, invoice_line_items, payments, ar_actions

**Assets/Inventory**: assets_dumpsters, inventory, inventory_movements, dumpster_sizes, dumpster_dimensions

**Dispatch/Runs**: runs (implied via driver pages), logistics_events, logistics_pricing, dispatch_alerts, disposal_requests

**Facilities/Yards**: facilities, facility_recommendations, yards, markets, market_rates, market_size_pricing

**Telephony**: phone_numbers, call_events, call_assignments, call_tasks, call_transcripts, call_ai_events, call_ai_insights, call_followups, call_routing_rules, call_history_imports

**Messaging**: message_logs, message_queue, message_templates, message_history, ghl_messages, ghl_message_threads

**Heavy Material**: heavy_material_profiles, heavy_material_rates, heavy_material_rules, heavy_weight_rules

**AI/Automation**: ai_jobs, ai_decisions, ai_actions, chat_conversations, chat_messages

**Config**: config_settings, config_versions, config_pending_changes, manual_setup_items, missing_connections, missing_connections_log

**Ads**: ads_accounts, ads_campaigns, ads_adgroups, ads_ads, ads_keywords, ads_metrics, ads_rules, ads_sync_log, ads_alerts, ads_markets, ads_negative_keywords

**Compensation**: compensation_plans, compensation_rules, compensation_earnings, compensation_periods, compensation_adjustments, compensation_audit_log

**SEO**: seo_cities, seo_pages, seo_locations_registry (referenced in code)

**Views**: asset_inventory_summary, heavy_risk_orders_vw, overdue_assets, overdue_assets_billing_vw, yards_public

---

## D) EDGE FUNCTIONS (98 total)

### Quote/Pricing
- `save-quote`, `save-quote-draft`, `quote-ai-recommend`, `calculate-service-cost`, `calculate-operational-time`, `truck-route`, `nearest-facilities`, `seed-market-pricing`

### Messaging/Email
- `send-otp`, `verify-otp`, `send-test-email`, `send-quote-summary`, `send-outbound-quote`, `send-portal-link`, `send-payment-receipt`, `send-payment-request`, `send-schedule-confirmation`, `send-service-receipt`, `send-review-request`, `send-contract`
- `ghl-send-message`, `ghl-send-outbound`, `ghl-inbound-webhook`, `ghl-webhook-inbound`, `ghl-message-worker`, `ghl-sync-poller`
- `internal-alert-dispatcher`, `google-chat-webhook`, `google-send-email`

### Payments
- `process-payment`, `process-refund`, `create-hosted-session`, `authnet-webhook`

### Telephony
- `calls-inbound-handler`, `calls-outbound-connect`, `calls-outbound-handler`, `calls-status-callback`, `calls-voicemail-handler`, `twilio-sms-webhook`

### Leads
- `lead-capture`, `lead-omnichannel`, `lead-from-google-ads`, `lead-from-meta`, `lead-from-phone`, `lead-from-quote`, `lead-from-sms`, `lead-manual-add`, `lead-ai-classify`, `lead-sla-monitor`, `lead-export`

### AI/Chat
- `calsan-dumpster-ai`, `ai-chat-lead`, `ai-sales-chat`, `call-ai-analyze`, `call-ai-finalize`, `master-ai-admin`, `master-ai-notifier`, `master-ai-scheduler`, `master-ai-worker`, `sales-ai-analyze`, `analyze-waste`

### Ops
- `run-automations`, `overdue-billing-daily`, `update-days-out`, `customer-health-recalc`, `customer-health-update`, `review-followup-cron`, `health-collector`, `qa-runner`, `scan-missing-connections`, `search-index-backfill`

### Portal
- `validate-portal-token`, `validate-session`, `create-order-from-quote`

### Google/Ads
- `google-oauth-start`, `google-oauth-callback`, `google-create-meet`, `google-drive-folder`, `get-maps-key`, `geocode-address`
- `google-ads-sync-metrics`, `google-ads-upload-conversion`, `ads-capacity-guard`, `ads-generate-campaigns`
- `ga4-fetch`, `gbp-fetch-insights`, `gsc-fetch`

### Staff/Auth
- `invite-staff`, `validate-invite`, `global-search`, `track-event`, `generate-internal-pdf`

### Compensation
- `compensation-approval-worker`, `compensation-calc-on-payment`, `compensation-calc-on-run`, `compensation-kpi-evaluator`

### Integration
- `highlevel-webhook`

---

## E) CONFIG FLAGS (Key Settings)

### Quote Flow
- No explicit `quote_flow.v3` flag found — V3 is hardcoded

### Messaging/Email
- `email.mode` = DRY_RUN
- `email.domain_verified` = false
- `email.from_email` = noreply@calsandumpsterspro.com
- `messaging.mode` = DRY_RUN (implied)
- `messaging.sms_mode` = (check config)

### Telephony
- `telephony.mode` = DRY_RUN (implied via config)

### AI
- `call_ai.mode` = DRY_RUN
- `call_ai.enabled` = true
- `sales_ai.mode` = DRY_RUN
- `sales_ai.enabled` = true

### Google
- `google.mode` = DRY_RUN
- `google.chat_mode` = LIVE
- `google.drive_mode` = LIVE
- `google.gmail_mode` = DRY_RUN
- `google.meet_mode` = DRY_RUN

### Ads
- `tracking_mode` = GTM
- `ga4_measurement_id` = (empty)
- `gtm_container_id` = (empty)

### Dispatch
- `auto_create_delivery_run` = true
- `block_completion_without_photos` = true
- `require_asset_for_delivery` = true

### Compensation
- `compensation.mode` = DRY_RUN
- `compensation.auto_approve` = false

### Cost Engine
- `overhead_multiplier` = 1.15
- `margin_warn_threshold_pct` = 30
- `margin_critical_threshold_pct` = 20
