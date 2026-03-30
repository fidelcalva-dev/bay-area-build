# CRM Field Matrix — Canonical Column Mapping

> Last updated: 2026-03-30

## Legend

- ✅ = Column exists with exact or equivalent name
- 🔗 = Column exists under a different name (alias noted)
- 🆕 = Column added in this sprint

---

## 1. Lead (`sales_leads`)

| Matrix Field | DB Column | Status |
|---|---|---|
| brand_origin | `brand` | ✅ (default `CALSAN_DUMPSTERS_PRO`) |
| service_line | `service_line` | ✅ (default `DUMPSTER`) |
| service_type | `cleanup_service_type` | ✅ |
| source_channel | `source_channel` | ✅ |
| source_page | `source_page` | ✅ |
| source_module | `source_module` | ✅ |
| project_type | `project_category` | 🔗 alias |
| project_scope | `project_scope` | ✅ |
| material_type | `material_category` | 🔗 alias |
| material_class | `material_category` | 🔗 (same column, finer grain via `raw_payload_json`) |
| heavy_group | `latest_heavy_flag` + `raw_payload_json.heavy_group` | 🔗 composite |
| selected_size_yd | `selected_size` | 🔗 alias (integer) |
| quote_amount | `quote_amount` | ✅ |
| contractor_flag | `contractor_flag` | ✅ |
| recurring_service_flag | `recurring_service_flag` | ✅ |
| recurring_frequency | `recurring_frequency` | ✅ |
| photos_uploaded_flag | `photos_uploaded_flag` | ✅ |
| needs_site_visit | `needs_site_visit` | ✅ |
| need_dumpster_too | `need_dumpster_too` | ✅ |
| bundle_opportunity_flag | `bundle_opportunity_flag` | ✅ |
| requested_timeline | `requested_timeline` | ✅ |
| requested_start_date | `requested_start_date` | ✅ |
| address_line1 | `address` | 🔗 alias |
| city | `city` | ✅ |
| state | `state` | 🆕 |
| zip | `zip` | ✅ |
| full_name | `customer_name` | 🔗 alias |
| phone | `customer_phone` | 🔗 alias |
| email | `customer_email` | 🔗 alias |
| normalized_phone | `normalized_phone` | ✅ |
| normalized_email | `normalized_email` | ✅ |
| next_best_action | `next_best_action` | ✅ |
| readiness_state | `readiness_state` | 🆕 (default `raw`) |

---

## 2. Quote Session (`quote_sessions`) 🆕

| Matrix Field | DB Column | Status |
|---|---|---|
| lead_id | `lead_id` | 🆕 |
| customer_id | `customer_id` | 🆕 |
| quote_id | `quote_id` | 🆕 |
| current_step | `current_step` | 🆕 |
| completed_steps_json | `completed_steps_json` | 🆕 |
| project_type | `project_type` | 🆕 |
| material_type | `material_type` | 🆕 |
| material_class | `material_class` | 🆕 |
| heavy_group | `heavy_group` | 🆕 |
| selected_size_yd | `selected_size_yd` | 🆕 |
| quantity | `quantity` | 🆕 |
| rental_days | `rental_days` | 🆕 |
| extras_json | `extras_json` | 🆕 |
| requested_delivery_date | `requested_delivery_date` | 🆕 |
| requested_time_window | `requested_time_window` | 🆕 |
| placement_type_requested | `placement_type_requested` | 🆕 |
| placement_notes | `placement_notes` | 🆕 |
| access_notes | `access_notes` | 🆕 |
| gate_code | `gate_code` | 🆕 |
| permit_required | `permit_required` | 🆕 |
| customer_required_dump_flag | `customer_required_dump_flag` | 🆕 |
| requested_dump_site_name | `requested_dump_site_name` | 🆕 |
| requested_dump_site_notes | `requested_dump_site_notes` | 🆕 |
| quote_notes_customer | `quote_notes_customer` | 🆕 |
| last_saved_at | `last_saved_at` | 🆕 |

---

## 3. Quote Header (`quotes`)

| Matrix Field | DB Column | Status |
|---|---|---|
| quote_number | `display_id` | 🔗 alias |
| quote_type | `quote_type` | 🆕 (default `DUMPSTER_RENTAL`) |
| service_line | `service_line` | ✅ |
| subtotal | `subtotal` | ✅ |
| discounts_total | `discounts_total` | 🆕 |
| extras_total | `extras_total` | 🆕 |
| taxes_total | `taxes_total` | 🆕 |
| grand_total | `grand_total` | 🆕 |
| contract_required | `contract_required` | 🆕 |
| addendum_required | `addendum_required` | 🆕 |
| payment_required | `payment_required` | 🆕 |
| notes_customer | `notes_customer` | 🆕 |
| notes_internal | `notes_internal` | 🆕 |
| assigned_rep_id | `assigned_rep_id` | 🆕 |
| preview_html | `preview_html` | 🆕 |
| pdf_url | `pdf_url` | 🆕 |
| signed_pdf_url | `signed_pdf_url` | 🆕 |
| lead_id | `lead_id` | 🆕 |

---

## 4. Quote Line Item (`quote_line_items`) 🆕

| Matrix Field | DB Column | Status |
|---|---|---|
| line_type | `line_type` | 🆕 (DUMPSTER, LABOR, DISPOSAL, TRUCK, MATERIAL_HANDLING, CLEANUP, SWAP, SURCHARGE, OTHER) |
| dumpster_size_yd | `dumpster_size_yd` | 🆕 |
| material_type | `material_type` | 🆕 |
| material_class | `material_class` | 🆕 |
| heavy_group | `heavy_group` | 🆕 |
| quantity | `quantity` | 🆕 |
| rental_days | `rental_days` | 🆕 |
| included_tons | `included_tons` | 🆕 |
| overage_rate | `overage_rate` | 🆕 |
| unit_price | `unit_price` | 🆕 |
| line_total | `line_total` | 🆕 |
| notes_customer | `notes_customer` | 🆕 |
| notes_internal | `notes_internal` | 🆕 |

---

## 5. Customer 360 Summary (computed, not stored)

| Field | Source |
|---|---|
| active service lines | `quotes.service_line` + `orders.service_line` DISTINCT |
| latest dumpster quote | `quotes` WHERE `service_line = 'DUMPSTER'` ORDER BY `created_at` DESC LIMIT 1 |
| latest cleanup quote | `quotes` WHERE `service_line = 'CLEANUP_SERVICE'` ORDER BY `created_at` DESC LIMIT 1 |
| latest order | `orders` ORDER BY `created_at` DESC LIMIT 1 |
| latest contract | `document_versions` WHERE type = contract ORDER BY `created_at` DESC LIMIT 1 |
| payment status | `invoices.payment_status` aggregate |
| recurring cleanup status | `sales_leads` WHERE `recurring_service_flag = true` |
| bundle opportunity status | `sales_leads` WHERE `bundle_opportunity_flag = true` |

---

## 6. Tasks / Automations (CRM workflow, no table needed)

| Task | Trigger |
|---|---|
| Request Photos | `photos_uploaded_flag = false` AND status IN (contacted, qualified) |
| Review Scope | `lead_status = 'qualified'` AND `service_line IN ('CLEANUP','BOTH')` |
| Schedule Site Visit | `needs_site_visit = true` |
| Prepare Proposal | `lead_status IN ('quote_started','price_shown')` |
| Bundle Review | `bundle_opportunity_flag = true` |
| Send Contract | `lead_status = 'quote_sent'` AND `contract_required = true` |
| Send Payment Request | `contract_signed = true` AND `payment_required = true` |
| Follow-Up Reminder | `followup_count > 0` AND SLA exceeded |
