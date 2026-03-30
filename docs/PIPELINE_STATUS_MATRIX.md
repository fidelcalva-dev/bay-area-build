# Pipeline Status Matrix

> Last updated: 2026-03-30

## Canonical Pipeline Stages

| Stage | Status Key | Service Lines | Trigger | SLA Target | Owner Role | Automated Tasks | Notifications |
|---|---|---|---|---|---|---|---|
| New Inbound | `new` | ALL | Lead created | 15m (Hot), 1h (High), 4h (Normal) | Sales | First follow-up task | Sales, CS |
| Contacted | `contacted` | ALL | First response sent | 24h follow-up | Sales | Schedule follow-up | Sales |
| Qualified | `qualified` | ALL | Needs confirmed | 4h | Sales | Create quote task | Sales |
| Quote Started | `quote_started` | ALL | Calculator opened | — | Sales | — | — |
| Price Shown | `price_shown` | ALL | Price displayed | — | Sales | — | — |
| Contact Captured | `contact_captured` | ALL | Contact info saved | 1h | Sales | Send quote task | Sales |
| Quote Ready | `quote_ready` | ALL | Quote finalized | 30m | Sales | Send proposal | Sales |
| Quote Sent | `quote_sent` | ALL | Quote/proposal sent | 24h follow-up | Sales | Follow-up reminder | Sales |
| Quote Accepted | `quote_accepted` | ALL | Customer accepts | 1h | Sales | Send contract | Sales, CS |
| Contract Sent | `contract_sent` | ALL | Contract delivered | 24h | Sales | Follow-up reminder | Sales |
| Contract Pending | `contract_pending` | ALL | Awaiting signature | 48h | Sales | Reminder | Sales |
| Contract Signed | `contract_signed` | ALL | Signature received | 1h | Sales/CS | Payment request | Sales, CS, Finance |
| Payment Pending | `payment_pending` | ALL | Payment link sent | 24h | Finance | Payment reminder | Finance |
| Payment Received | `payment_received` | ALL | Payment confirmed | 30m | CS/Dispatch | Create order | Finance, CS, Dispatch |
| Ready for Dispatch | `ready_for_dispatch` | DUMPSTER | Order ready | 2h | Dispatch | Schedule delivery | Dispatch |
| Order Created | `order_created` | ALL | Order generated | — | CS | — | CS |
| Converted / Won | `converted` | ALL | Service complete | — | — | Review request | Admin |
| Lost | `lost` | ALL | Lead closed lost | — | Sales | Loss reason required | Sales, Admin |
| Dormant | `dormant` | ALL | No activity 14d | — | Sales | Re-engage task | Sales |

## Service-Line Playbooks

### Dumpster Playbook
1. New → Contacted → Quoted → Contract → Payment → Dispatch → Delivered → Picked Up → Won

### Cleanup Playbook
1. New → Contacted → Photos Requested → Scope Review → Site Visit (if needed) → Estimating → Proposal Sent → Follow-Up → Scheduled → Won

### Bundle Playbook
1. New → Contacted → Scope Review → Dual Quote → Bundle Proposal → Contract → Payment → Coordinated Scheduling → Won

## SLA Monitoring

- `lead-sla-monitor` edge function runs every 5 minutes
- Alerts at 5m, reminders at 30m, escalations at 2h
- Dormant detection at 14 days
- Risk scoring adjustments for overdue SLAs
