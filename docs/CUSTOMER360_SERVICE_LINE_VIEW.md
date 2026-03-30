# Customer 360 Service Line View

> Last updated: 2026-03-30

## Architecture

There is **one canonical Customer 360** (`/admin/customers/:id`). The `service_line` field on the customer record indicates their primary relationship type.

## Service Line Summary Card

A new `ServiceLineSummary` component is rendered at the top of the Overview tab, showing:

1. **Service line badge**: Dumpster (blue), Cleanup (green), or Bundle (purple)
2. **Order count**: Total orders across all service lines
3. **Quote count**: Total quotes across all service lines

## Customer Header Enhancement

The customer header now displays service line badges:
- **Cleanup** badge (green) when `service_line = 'CLEANUP'`
- **Bundle** badge (purple) when `service_line = 'BOTH'`
- No extra badge for dumpster-only (default)

## Unified Data

All tabs in Customer 360 show data across both service lines:
- **Quotes**: Shows dumpster and cleanup quotes together
- **Orders**: Shows all service orders
- **Documents**: Shows all contracts, proposals, and agreements
- **Timeline**: Logs events from both service lines
- **Payments**: Unified payment history
- **Communications**: All messages regardless of service line

## Customer Type Detection

When a customer has both dumpster and cleanup records, the system should eventually auto-upgrade `service_line` to `BOTH`. This is currently manual but can be automated via a database trigger in a future phase.
