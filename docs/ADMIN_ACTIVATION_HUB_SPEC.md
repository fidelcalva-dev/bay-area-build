# Admin Activation Hub Specification

> Last updated: 2026-03-31

## Location

`/admin/configuration` — Visual command center for all platform modules.

## Module Groups

### Core CRM
- Lead Hub (`/sales/leads`) ✅
- Quote Workspace (`/sales/quotes`) ✅
- Customer 360 (`/admin/customers/:id`) ✅
- Orders (`/admin/orders`) ✅

### Pricing
- Master Pricing Hub (`/admin/pricing`) ✅ — 34 tabs

### Leads / Sales
- Lead Analytics (`/admin/leads`) ✅
- Lead Workspace (`/admin/leads/workspace`) ✅
- Lead Engine Settings (`/admin/leads/settings`) ✅
- Leads Health (`/admin/leads-health`) ✅
- Sales Performance (`/admin/sales-performance`) ✅

### Operations
- Dispatch (`/dispatch`) ✅
- Control Tower (`/dispatch/control-tower`) ✅
- Yards (`/admin/yards`) ✅
- Zones (`/admin/zones`) ✅
- Inventory (`/admin/inventory`) ✅
- Assets (`/admin/assets`) ✅
- Drivers (`/admin/drivers`) ✅
- Facilities (`/admin/facilities`) ✅
- Markets (`/admin/markets`) ✅
- Maintenance (`/admin/maintenance`) ✅

### Finance
- Finance Dashboard (`/finance`) ✅
- Invoices (`/finance/invoices`) ✅
- AR Aging (`/finance/ar-aging`) ✅
- Overdue (`/admin/overdue`) ✅
- Profitability (`/admin/profitability`) ✅

### Integrations
- GHL (`/admin/ghl`) ✅
- Telephony (`/admin/telephony/calls`) ✅
- Google Ads (`/admin/ads`) ✅
- Google Settings (`/admin/google`) ✅
- Messaging (`/admin/messaging`) ✅

### SEO / Local
- SEO Dashboard (`/admin/seo/dashboard`) ✅
- SEO Cities/Pages/Health/Audit ✅
- Local Dashboard (`/admin/local/dashboard`) ✅
- Google Business/Reviews ✅

### QA / Health
- QA Control Center (`/admin/qa/control-center`) ✅
- Config/Security/Route/Domain/Build/Env Health ✅

### AI / Automations
- AI Control Center (`/admin/ai/control-center`) ✅
- Role Copilots (Sales, CS, Dispatch, Driver, Fleet, Finance, SEO, Admin) ✅

### Marketing
- Marketing Dashboard (`/admin/marketing/dashboard`) ✅
- Visitors/Sessions ✅
- Executive/BI Dashboards ✅

## Distinction

- `/admin/configuration` = Visual Activation Hub (module cards + health)
- `/admin/config` = Raw key-value business settings
