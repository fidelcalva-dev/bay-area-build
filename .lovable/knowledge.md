# Calsan Dumpsters Pro — Project Knowledge

> Last updated: 2026-03-29

---

## Business Identity

| Field | Value |
|---|---|
| Legal name | Calsan Dumpsters Pro LLC |
| DBA (cleanup) | Calsan Services dba Calsan C&D Waste Removal |
| Market | San Francisco Bay Area, California |
| HQ | 1930 12th Ave, Suite 201, Oakland, CA |
| Phone | (510) 680-2150 |
| Email | info@calsandumpsterspro.com |
| Domain | https://calsandumpsterspro.com |
| Hours | Mon–Sun 6 AM – 9 PM PT |
| CSLB License | #1152237 (cleanup division) |

---

## Business Model

Local service business with two divisions:

1. **Calsan Dumpsters Pro** — Roll-off dumpster rental / debris box service for residential and commercial projects
2. **Calsan C&D Waste Removal** — Construction cleanup, post-construction cleanup, demolition debris cleanup, recurring jobsite cleanup

---

## Primary Audiences

- General contractors
- Roofers
- Remodelers / ADU builders
- Property managers
- Homeowners
- Commercial cleanout buyers

---

## Primary Goals

1. Increase qualified leads from organic search
2. Increase calls, quote requests, and booked jobs
3. Rank locally across the Bay Area for dumpster rental + debris box intent
4. Connect every SEO landing page to CRM attribution and sales workflow
5. Launch cleanup division without harming dumpster rental brand or SEO

---

## Core Services — Dumpster Rentals

- Dumpster rental / roll-off dumpsters / debris box
- Construction dumpsters
- Roofing dumpsters
- Residential dumpsters
- Commercial dumpsters
- Concrete / dirt dumpsters (heavy material, flat-fee)
- Junk / debris dumpsters
- Same-day dumpster delivery (when operationally available, $100 surcharge)

### Sizes

| Yards | Dimensions | Included Tons | Best For |
|-------|-----------|---------------|----------|
| 5 | 12'L × 5'W × 2.25'H | 0.5 | Small cleanouts, yard debris |
| 8 | 12'L × 6'W × 3'H | 0.5 | Small remodeling projects |
| 10 | 12'L × 7.5'W × 3'H | 1 | Small renovations, deck removal |
| 20 | 18'L × 7.5'W × 4'H | 2 | Full room renovations, roofing |
| 30 | 18'L × 7.5'W × 6'H | 3 | Major renovations, new construction |
| 40 | 24'L × 7.5'W × 6'H | 4 | Commercial, large demolition |
| 50 | 24'L × 7.5'W × 8'H | 5 | High-volume commercial |

### Heavy Material Flat Rates

| Yards | Flat Rate | Best For |
|-------|----------|----------|
| 5 | $495 | Small concrete, dirt, driveway work |
| 8 | $595 | Foundation demo, brick/block |
| 10 | $695.50 | Large concrete jobs, deck removal |

### Rental Policy

- Standard rental: 7 days
- Extra day: $35/day
- Overage: $165/ton beyond included tonnage (general debris)
- Heavy material: flat fee, no overage

---

## Core Services — Cleanup Division

- Construction Cleanup (from $495)
- Final / Post-Construction Cleanup ($0.35–$0.65/sqft, min $695)
- Demolition Debris Cleanup (from $695 + disposal)
- Recurring Jobsite Cleanup (from $1,200/month)
- Labor-Assisted Cleanup (from $95/hr per tech)

---

## Service Area Clusters (Priority Order)

### Tier 1 — Flagship Markets
Oakland, San Jose, San Francisco

### Tier 2 — High Priority
Berkeley, Fremont, Hayward, Milpitas, San Leandro, Santa Clara, Sunnyvale, Alameda, Emeryville

### Tier 3 — Active Coverage
Redwood City, South San Francisco, Daly City, Concord, Walnut Creek, Palo Alto, Mountain View, Richmond

### Extended (Partner)
Marin County, Sonoma County, Napa County, Solano County

### Operational Yards
- 1000 46th Ave, Oakland (East Bay hub)
- 2071 Ringwood Ave, San Jose (South Bay hub)
- SF Peninsula yard
- Tracy yard (deactivated for auto-quoting)
- Fremont yard (deactivated for auto-quoting)

---

## Brand Positioning

> Fast Bay Area dumpster and debris box delivery from real local operations with transparent pricing, responsive service, permit-aware guidance, and high-trust customer experience.

### Voice Rules
- Clear, fast, local, professional, helpful
- No hype, no fluff, no emojis in professional copy
- Conversion-oriented, trust-first, operationally realistic
- Use both "dumpster rental" and "debris box" naturally
- Never use "cheapest" or "budget" — position as premium local operator

### Trust Signals
- BBB A+ Accredited
- Google reviews (linked)
- Facebook reviews (linked)
- CSLB #1152237 (cleanup)
- Real local yards (not a broker)
- ZIP-based pricing from local infrastructure

---

## Website Architecture

### Route Ownership

| Cluster | Prefix | Brand |
|---------|--------|-------|
| Public marketing | / | Calsan Dumpsters Pro |
| SEO city pages | /dumpster-rental/* | Calsan Dumpsters Pro |
| Cleanup division | /cleanup/* | Calsan C&D Waste Removal |
| Quote flow | /quote | Calsan Dumpsters Pro |
| Customer portal | /portal/* | Shared |
| Admin/CRM | /admin/* | Internal |
| Sales | /sales/* | Internal |
| Departments | /cs/*, /dispatch/*, /driver/*, /finance/* | Internal |

### Preserved Public Routes
- `/` — Homepage (two-path gateway)
- `/about`
- `/why-calsan`
- `/quote`
- `/pricing`
- `/sizes`
- `/materials`
- `/areas`
- `/contact`
- `/blog`
- `/contractors`
- `/how-it-works`
- `/capacity-guide`

### Homepage Strategy
Two-path service gateway: Dumpster Rentals → /quote, Construction Cleanup → /cleanup/quote

---

## CRM & Lead System

### Intake
- Unified `lead-ingest` Edge Function
- Progressive capture at milestones (address_saved, price_shown, contact_captured)
- Identity resolution via normalized phone/email

### Source Channels
QUOTE_FLOW, AI_CHAT, PHOTO_UPLOAD, SCHEDULE_DELIVERY, CONTRACTOR_APPLICATION, CALLBACK_REQUEST, CONTACT_FORM, CLICK_TO_CALL, CLICK_TO_TEXT, CLEANUP_WEBSITE, OTHER_WEBSITE_CTA

### Pipeline Stages
new → contacted → quoted → qualified → booked → lost / spam

### Required Capture Fields
- source_channel, source_page, landing_url
- city intent, service intent, size intent
- urgency (same-day flag)
- UTM params + gclid
- Commercial value indicators

### Lead Scoring Factors
- City tier (T1 > T2 > T3)
- Service type
- Same-day urgency
- Commercial vs residential
- Contractor flag

---

## SEO Strategy

### Rules
- One canonical page per intent (no cannibalization)
- Every location page must be useful and locally differentiated
- No thin pages, no doorway pages, no duplicate city content
- Every money page needs a commercial CTA
- Use "dumpster rental" and "debris box" naturally
- Domination pages (hand-crafted) for T1 markets
- Programmatic pages for T2/T3 with redirect to domination where applicable

### Page Types
- City landing pages (/dumpster-rental/{city})
- City + size pages (/dumpster-rental/{city}/{size}-yard)
- City + material pages
- County hub pages (/county/{county}/dumpster-rental)
- Regional hubs (/dumpster-rental-east-bay, etc.)
- Size intent pages
- Material intent pages
- ZIP pages (/service-area/{zip}/dumpster-rental)
- Use-case pages
- Blog articles

### Indexation Control
- Only public marketing, city hubs, 9 core county pages, size/material pages, and blog are indexable
- All internal routes (admin, portal, sales, etc.) blocked
- County pages outside 9-county Bay Area are noindex

---

## Conversion Strategy

- Sticky mobile call CTA
- Fast quote CTA above the fold
- Short forms
- Trust badges (BBB, reviews, license)
- Review proof with links to Google/Facebook
- Clear pricing framing ("From $X" anchors, not exact binding)
- Permit guidance on relevant pages
- Materials allowed / prohibited guidance
- Photo upload for size recommendations

---

## Engineering Constraints

- Do not break production
- Prefer refactoring over rewriting
- Work in small, testable chunks
- Use reusable components
- Centralized content registry for SEO pages
- Clean routing and metadata for every public page
- Never edit auto-generated files (client.ts, types.ts, .env)
- Mobile-first design required
- Semantic design tokens only (no raw color classes)
