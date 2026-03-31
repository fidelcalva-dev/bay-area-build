# Action Placement Audit

> Last updated: 2026-03-31

## Lead Actions

| Action | Expected Pages | Actual Pages | Missing | Duplicated | Status |
|---|---|---|---|---|---|
| Create lead | Sales Lead Hub, Admin Leads | Sales Lead Hub, Admin Leads Workspace | ❌ No | ❌ No | ✅ OK |
| Assign rep | Lead Detail (Admin) | Lead Detail via context | ❌ No | ❌ No | ✅ OK |
| Call | Lead Detail | Lead Detail (all modes) | ❌ No | ❌ No | ✅ OK |
| Text (SMS) | Lead Detail | Lead Detail (all modes) | ❌ No | ❌ No | ✅ OK |
| Email | Lead Detail | Lead Detail (all modes) | ❌ No | ❌ No | ✅ OK |
| Add note | Lead Detail | Lead Detail (all modes) | ❌ No | ❌ No | ✅ OK |
| Move stage | Lead Detail, Lead Board | Lead Detail, Board (Sales/Admin) | ❌ No | ❌ No | ✅ OK |
| Create quote | Lead Detail | Lead Detail (Sales/Admin) | ❌ No | ❌ No | ✅ OK |

## Quote Actions

| Action | Expected Pages | Actual Pages | Missing | Duplicated | Status |
|---|---|---|---|---|---|
| Save draft | Quote Builder | Quote Builder (Sales/Admin) | ❌ No | ❌ No | ✅ OK |
| Edit | Quote Detail | Quote Detail (Sales/Admin) | ❌ No | ❌ No | ✅ OK |
| Preview quote | Quote Detail | Quote Detail (all modes) | ❌ No | ❌ No | ✅ OK |
| Preview contract | Quote Detail | Quote Detail (Sales/Admin) | ❌ No | ❌ No | ✅ OK |
| Generate PDF | Quote Detail | Quote Detail (Sales/CS/Admin) | ❌ No | ❌ No | ✅ OK |
| Send quote | Quote Detail | Quote Detail (Sales/Admin + CS resend) | ❌ No | ❌ No | ✅ OK |
| Send contract | Quote Detail | Quote Detail (Sales/Admin + CS resend) | ❌ No | ❌ No | ✅ OK |
| Send payment link | Quote Detail | Quote Detail (Sales/Admin + CS resend) | ❌ No | ❌ No | ✅ OK |
| Convert to order | Quote Detail | Quote Detail (Sales/Admin) | ❌ No | ❌ No | ✅ OK |
| Duplicate quote | Quote Detail | Quote Detail (Sales/Admin) | ❌ No | ❌ No | ✅ OK |

## Customer 360 Actions

| Action | Expected Pages | Actual Pages | Missing | Duplicated | Status |
|---|---|---|---|---|---|
| Open latest quote | Customer 360 Quotes tab | Customer 360 | ❌ No | ❌ No | ✅ OK |
| Open contract | Customer 360 Contracts tab | Customer 360 | ❌ No | ❌ No | ✅ OK |
| Open signed docs | Customer 360 Documents tab | Customer 360 | ❌ No | ❌ No | ✅ OK |
| Open payments | Customer 360 Payments tab | Customer 360 | ❌ No | ❌ No | ✅ OK |
| Open orders | Customer 360 Orders tab | Customer 360 | ❌ No | ❌ No | ✅ OK |
| Send reminder | Customer 360 Comms | Customer 360 | ❌ No | ❌ No | ✅ OK |
| Call/Text/Email | Customer 360 Overview | Customer 360 | ❌ No | ❌ No | ✅ OK |

## Pricing Actions

| Action | Expected Pages | Actual Pages | Missing | Duplicated | Status |
|---|---|---|---|---|---|
| Edit prices | Master Pricing Hub | `/admin/pricing` | ❌ No | ❌ No | ✅ OK |
| Publish changes | Master Pricing Hub | `/admin/pricing` | ❌ No | ❌ No | ✅ OK |
| View health | Pricing Hub health tabs | `/admin/pricing` | ❌ No | ❌ No | ✅ OK |
| Run simulator | Pricing Hub simulator | `/admin/pricing?tab=simulator` | ❌ No | ❌ No | ✅ OK |

## Dispatch Actions

| Action | Expected Pages | Actual Pages | Missing | Duplicated | Status |
|---|---|---|---|---|---|
| Assign runs | Dispatch Dashboard | `/dispatch` | ❌ No | ❌ No | ✅ OK |
| Open order | Dispatch, Control Tower | Both available | ❌ No | ❌ No | ✅ OK |
| Open placement | Control Tower | `/dispatch/control-tower` | ❌ No | ❌ No | ✅ OK |
| Mark exception | Dispatch Flags | `/dispatch/flags` | ❌ No | ❌ No | ✅ OK |

## Driver Actions

| Action | Expected Pages | Actual Pages | Missing | Duplicated | Status |
|---|---|---|---|---|---|
| Open run | Driver Runs | `/driver/runs/:id` | ❌ No | ❌ No | ✅ OK |
| Navigate | Run Detail | Run Detail | ❌ No | ❌ No | ✅ OK |
| Mark arrived | Run Detail | Run Detail | ❌ No | ❌ No | ✅ OK |
| Upload photo | Run Detail | Run Detail | ❌ No | ❌ No | ✅ OK |
| Report issue | Run Detail + dedicated page | Both | ❌ No | ❌ No | ✅ OK |
| Complete stop | Run Detail | Run Detail | ❌ No | ❌ No | ✅ OK |

## Finance Actions

| Action | Expected Pages | Actual Pages | Missing | Duplicated | Status |
|---|---|---|---|---|---|
| Open invoice | Finance Invoices | `/finance/invoices/:orderId` | ❌ No | ❌ No | ✅ OK |
| Send payment reminder | Invoice Detail, Payment Actions | Both | ❌ No | ❌ No | ✅ OK |
| Confirm payment | Payment Detail | `/finance/payments/:paymentId` | ❌ No | ❌ No | ✅ OK |
| View AR aging | AR Aging Dashboard | `/finance/ar-aging` | ❌ No | ❌ No | ✅ OK |

## Summary

All critical actions are properly placed. No missing actions or unnecessary duplications found.
