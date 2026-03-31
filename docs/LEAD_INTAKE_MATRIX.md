# Lead Intake Matrix

> Last updated: 2026-03-31

## All Inbound Channels → Canonical `lead-ingest`

| # | Channel | Source Page/Module | Handler | Brand | Service Line | Lead Intent |
|---|---|---|---|---|---|---|
| 1 | Website Quote | `/quote` | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST |
| 2 | Contractor Quote | `/quote/contractor` | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST |
| 3 | Cleanup Quote | `/cleanup/quote` | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | QUOTE_REQUEST |
| 4 | Contact Form | `/contact` | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTACT_REQUEST |
| 5 | Contact Us | `/contact-us` | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTACT_REQUEST |
| 6 | Cleanup Contact | `/cleanup/contact` | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | CONTACT_REQUEST |
| 7 | Contractor App | `/contractor-application` | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTRACTOR_APPLICATION |
| 8 | Cleanup Contractors | `/cleanup/for-contractors` | lead-ingest | CALSAN_CD_WASTE_REMOVAL | CLEANUP | CONTRACTOR_APPLICATION |
| 9 | Schedule Delivery | `/schedule-delivery` | schedule-delivery | CALSAN_DUMPSTERS_PRO | DUMPSTER | SCHEDULE_REQUEST |
| 10 | AI Chat | Homepage widget | lead-ingest | Auto-detected | Auto-detected | CHAT_HANDOFF |
| 11 | Manual Staff Lead | CRM Lead Hub | lead-ingest | Selectable | Selectable | MANUAL_STAFF_LEAD |
| 12 | Phone Inbound | Call system | lead-from-phone | Auto-detected | DUMPSTER | CALLBACK_REQUEST |
| 13 | SMS Inbound | Twilio webhook | twilio-sms-webhook | Auto-detected | DUMPSTER | CONTACT_REQUEST |
| 14 | Google Ads | Landing pages | lead-from-google-ads | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST |
| 15 | Meta Ads | Facebook/IG | lead-from-meta | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST |
| 16 | Quick Order | `/quick-order` | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | SCHEDULE_REQUEST |
| 17 | Download Price List | `/download-price-list` | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | CONTACT_REQUEST |
| 18 | SEO City Pages | `/dumpster-rental/:city` CTAs | lead-ingest | CALSAN_DUMPSTERS_PRO | DUMPSTER | QUOTE_REQUEST |

## Validated Fields

| Field | Required | Source |
|---|---|---|
| brand_origin | ✅ | Auto-detected from source channel |
| service_line | ✅ | DUMPSTER / CLEANUP / BOTH |
| lead_intent | ✅ | 10 canonical intent types |
| source_channel | ✅ | Channel identifier |
| contractor_flag | Optional | From form or URL |
| recurring_service_flag | Optional | Cleanup-specific |
| bundle_opportunity_flag | Optional | Auto-detected |
| photos_uploaded_flag | Optional | Cleanup forms |
| needs_site_visit | Optional | Cleanup scope assessment |

## Destination

All leads arrive in `/sales/leads` (Lead Hub) and appear in table, pipeline board, and cleanup board views.
