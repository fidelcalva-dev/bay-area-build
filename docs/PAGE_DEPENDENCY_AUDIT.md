# PAGE DEPENDENCY AUDIT

> Generated: 2026-03-19

## Critical Dependencies by Module

### Public Website
| Module | Tables | RPCs | Edge Functions | External |
|--------|--------|------|----------------|----------|
| Homepage | config_settings, social_links, reviews | — | — | Google Maps |
| Quote Flow | sales_leads, quotes, pricing_rules, zones, dumpster_sizes | calculate_price RPC | — | — |
| SEO City Engine | seo_cities, seo_city_content, dumpster_sizes, zones | — | — | — |
| Blog | blog_posts, blog_categories | — | — | — |
| AI Chat Widget | ai_chat_sessions, ai_chat_messages | — | ai-chat edge fn | Lovable AI |
| Contact | sales_leads | — | — | — |

### Customer Portal
| Module | Tables | External |
|--------|--------|----------|
| Portal Auth | customers, activation_tokens | SMS provider |
| Orders | orders, order_items | — |
| Documents | contracts, invoices | — |
| Payments | payments, invoices | Payment processor |

### Sales CRM
| Module | Tables | Notes |
|--------|--------|-------|
| Leads | sales_leads | Core module |
| Quotes | quotes, quote_items | Linked to pricing engine |
| Order Builder | orders, order_items | Creates orders from quotes |
| Calls | call_events | Telephony integration |

### Admin CRM
| Module | Tables |
|--------|--------|
| Orders | orders, order_items, invoices |
| Customers | customers, profiles |
| Pricing | pricing_rules, zone_pricing, heavy_material_pricing |
| Inventory | assets_dumpsters, yards, dumpster_sizes |
| Dispatch | runs, run_stops, orders |
| Finance | invoices, payments, ar_actions |
| Users | user_roles, profiles, access_requests |
| Alerts | alerts, ads_alerts |
| Audit | audit_logs |
| Config | config_settings |
| Ads | ads_campaigns, ads_metrics, ads_markets |
| SEO Admin | seo_cities, seo_city_content |
| AI | ai_control_sessions, ai_control_messages, ai_decisions |

---

## Missing Dependency Risks

| Area | Risk | Details |
|------|------|---------|
| Telephony | 🟡 | Depends on external telephony provider — may fail silently |
| Google Ads | 🟡 | Depends on Google Ads API credentials |
| Local Search | 🟡 | GBP, Bing, Apple APIs — may be placeholder |
| Marketing/GA4 | 🟡 | Depends on GA4 setup |
| AI Copilots | 🟡 | Depend on edge functions + AI model access |
| Green Halo | 🟢 | Demo data only |
