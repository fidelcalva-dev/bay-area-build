# GO-LIVE QA CHECKLIST
Generated: 2026-02-17

---

## Pre-Flight Checks

- [ ] All P0 edge functions deployed and responding
- [ ] Config flags reviewed (all modes set correctly for go-live)
- [ ] Authorize.Net credentials configured (AUTHNET_API_LOGIN_ID, AUTHNET_TRANSACTION_KEY)
- [ ] Google Maps API key configured (GOOGLE_MAPS_API_KEY)
- [ ] Twilio credentials configured (if telephony going LIVE)
- [ ] Resend API key configured (if email going LIVE)
- [ ] No external TrashLab links remain in codebase

---

## 1. Quote Flow (/quote → Portal)

### Step 1: Location
- [ ] Enter ZIP code → matches zone, shows availability meter
- [ ] Toggle "Enter full address" → autocomplete works
- [ ] Address geocodes correctly, derives ZIP
- [ ] Out-of-service ZIP shows appropriate message

### Step 2: Customer Type
- [ ] Homeowner / Contractor / Commercial selection works
- [ ] Customer type affects subsequent steps (project options, pricing)

### Step 3: Project Type
- [ ] Correct project options shown per customer type
- [ ] Heavy material detection triggers size limits (6/8/10yd only)

### Step 4: Size Recommendation
- [ ] Hero card shows recommended size
- [ ] Smaller/larger alternatives shown
- [ ] Heavy materials properly limited

### Step 5: Price Moment
- [ ] Exact ZIP-based price displayed (not a range)
- [ ] Included tons, delivery, pickup, rental days shown
- [ ] ServiceCycleBar / availability meter renders
- [ ] Overage rate ($165/ton) disclosed

### Step 6: Confirmation
- [ ] Quote summary accurate
- [ ] "Reserve" / "Schedule" / "Call" CTAs work

### Step 7: Map Placement (Optional)
- [ ] Map loads with satellite view
- [ ] Placement can be skipped without blocking
- [ ] Geometry saves to `quote_site_placement`

### Schedule Step (/quote/schedule)
- [ ] 14-day calendar loads
- [ ] Time windows (Morning/Midday/Afternoon) selectable
- [ ] Selection persists and saves

### Payment Step (/quote/pay)
- [ ] Deposit / Full / Pay Later options visible
- [ ] If total = $0, payment step auto-skips or allows confirm
- [ ] Deposit auto-selected when amount > $0
- [ ] Pay Later path always available
- [ ] Payment session creates with Authorize.Net
- [ ] Successful payment updates order (amount_paid, balance_due)
- [ ] Failed payment shows clear error + retry

### Portal Redirect
- [ ] After payment → redirected to portal with order details
- [ ] After Pay Later → redirected to portal order view

---

## 2. Customer Portal

### Authentication
- [ ] SMS OTP login works (send-otp → verify-otp)
- [ ] Token-based magic link access works (?token=xxx)
- [ ] Invalid token shows appropriate error

### Dashboard (/portal/dashboard)
- [ ] Customer sees their orders
- [ ] Order status displayed correctly

### Order Detail (/portal/order/:orderId)
- [ ] Timeline events render (delivery scheduled, payment, etc.)
- [ ] Order details (size, dates, amounts) accurate
- [ ] Pickup request button exists and creates task

### Payment (/portal/pay)
- [ ] Can make additional payments (balance, overage)
- [ ] Payment history visible

### Documents (/portal/documents)
- [ ] Contracts/invoices accessible

---

## 3. CRM / Staff Operations

### Master Calculator (/internal/calculator)
- [ ] Accessible from /sales/calculator, /cs/calculator, /dispatch/calculator
- [ ] All service modes work (Standard, Live Load, Dump & Return)
- [ ] Discount/override functionality works for authorized roles
- [ ] PDF export generates correctly

### Lead Hub (/sales/lead-hub)
- [ ] Leads list loads with SLA timers
- [ ] Lead detail shows time since creation, last activity
- [ ] Assigned agent visible
- [ ] Follow-up scripts panel loads
- [ ] AI draft suggestions available (DRY_RUN mode shown as drafts)

### Lead SLA
- [ ] 15-minute SLA timer tracks correctly
- [ ] Alerts fire for uncontacted leads (via lead-sla-monitor)

### Orders Management (/admin/orders)
- [ ] Orders list loads
- [ ] Order detail shows full information
- [ ] Order events timeline renders

---

## 4. Dispatch / Ops

### Dispatch Calendar (/dispatch/calendar)
- [ ] Calendar loads with scheduled runs
- [ ] Run creation works

### Driver App (/driver)
- [ ] Driver sees assigned runs
- [ ] Proof-of-service photo upload works
- [ ] Run status transitions work (SCHEDULED → EN_ROUTE → ARRIVED → COMPLETED)
- [ ] Dump ticket upload attaches to order

---

## 5. RLS / Permissions

- [ ] Sales role can read/write leads, quotes, orders
- [ ] CS role can read orders, create notes
- [ ] Dispatch role can manage runs, assets
- [ ] Driver role can read assigned runs, upload photos
- [ ] Finance role can read invoices, payments
- [ ] No RLS permission errors for any standard operation
- [ ] Anon users can access public quote flow and portal (with token)

---

## 6. Edge Functions

- [ ] `save-quote` responds correctly
- [ ] `create-order-from-quote` converts quote to order
- [ ] `process-payment` processes Authorize.Net payments
- [ ] `send-otp` / `verify-otp` work for portal auth
- [ ] `geocode-address` returns Google Places results
- [ ] `truck-route` calculates service times
- [ ] `lead-capture` / `lead-omnichannel` create leads
- [ ] `internal-alert-dispatcher` fires on key events
- [ ] `calsan-dumpster-ai` responds with guided quote flow

---

## 7. SEO

- [ ] Homepage meta tags correct (<60 char title, <160 char description)
- [ ] `/dumpster-rental-oakland-ca` renders with unique content
- [ ] Dynamic city pages (`/dumpster-rental/:citySlug`) load correctly
- [ ] City+Size pages render
- [ ] City+Material pages render
- [ ] Footer location cluster shows all active cities
- [ ] Sitemap.xml includes all SEO pages
- [ ] JSON-LD schema on relevant pages

---

## 8. Feature Flags (Rollout)

| Flag | Current | Go-Live Target |
|------|---------|----------------|
| V3 Quote Flow | Hardcoded ON | ON |
| Portal | Always accessible | Accessible |
| `email.mode` | DRY_RUN | LIVE (when DNS verified) |
| `messaging.mode` | DRY_RUN | LIVE (when ready) |
| `telephony.mode` | DRY_RUN | LIVE (when webhooks configured) |
| `sales_ai.mode` | DRY_RUN | DRY_RUN (safe default) |
| `compensation.mode` | DRY_RUN | DRY_RUN (safe default) |

---

## 9. Performance

- [ ] Homepage LCP < 2.5s (currently 2.1s desktop)
- [ ] Images optimized (WebP/AVIF conversion pending — see Lighthouse report)
- [ ] Lazy loading on below-fold images
- [ ] Core bundle < 300KB gzipped

---

## Sign-Off

| Role | Name | Date | Pass? |
|------|------|------|-------|
| Engineering | | | |
| Operations | | | |
| Sales | | | |
| Executive | | | |
