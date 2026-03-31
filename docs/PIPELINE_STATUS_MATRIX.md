# Pipeline Status Matrix

> Last updated: 2026-03-31

## Canonical Pipeline Stages

| # | Stage | SLA | Auto-Tasks | Service Lines |
|---|---|---|---|---|
| 1 | New Inbound | 5 min alert | Score, route, follow-up | ALL |
| 2 | Pending Contact | 15m/1h/4h | First follow-up | ALL |
| 3 | Waiting on Photos | 24h reminder | Photo request | CLEANUP |
| 4 | Reviewing Scope | 4h | — | CLEANUP |
| 5 | Needs Site Visit | 48h schedule | Site visit | CLEANUP |
| 6 | Estimating | 2h | — | ALL |
| 7 | Quote/Proposal Sent | 30 min follow-up | Follow-up task | ALL |
| 8 | Follow-Up | Daily | Recurring | ALL |
| 9 | Scheduled | — | Order creation | ALL |
| 10 | Contract Pending | 24h reminder | Resend | ALL |
| 11 | Payment Pending | 24h reminder | Resend | ALL |
| 12 | Ready for Dispatch | — | Dispatch notify | ALL |
| 13 | In Progress | — | Driver updates | CLEANUP |
| 14 | Won | — | — | ALL |
| 15 | Lost | — | Require loss_reason | ALL |

## SLA Monitor

Edge function: `lead-sla-monitor` (every 5 minutes)
- 5 min: Alert
- 30 min: Reminder
- 2h: Escalation
- 7d: Dormant
- Continuous: Risk scoring

## Board Views

- Standard Pipeline: All 15 stages
- Cleanup Board: 11 columns (New Inbound → Lost)
