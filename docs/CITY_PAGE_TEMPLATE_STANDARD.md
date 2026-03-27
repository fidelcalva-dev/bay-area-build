# City Page Template Standard

Last updated: 2026-03-27

## Template Component

`src/pages/seo/SeoCityPage.tsx` — Single template for all Tier 2/3 programmatic city pages.

## Required Sections (in order)

### 1. Hero / H1
```
H1: Dumpster Rental in {City}, CA
Subtext: Same-day delivery from our {YardCity} yard • Serving {City} and {County}
```

### 2. Local Introduction
- Unique city-specific paragraph (not boilerplate)
- References neighborhoods, landmarks, or local industry
- Source: `seo_cities.local_intro` or `serviceAreas.ts` description

### 3. CTA Block (Above Fold)
- "Get Your Exact Price" button → /quote
- ZIP code pre-fill from principal ZIP
- Phone number link

### 4. Representative Pricing Block
- CityPricingBlock component
- Shows "From $X" for each common size
- Pulled from Smart Pricing Engine via principal ZIP
- Falls back to generic CTA if pricing unavailable

### 5. Popular Dumpster Sizes
- Grid of common sizes (10, 20, 30, 40 yard)
- Each links to `/dumpster-rental/{citySlug}/{size}-yard`
- Dimensions, capacity, ideal projects

### 6. Common Materials
- Accepted material types
- Each links to `/dumpster-rental/{citySlug}/{materialSlug}`
- Weight/restriction notes

### 7. How It Works
- 3-step process (Quote → Deliver → Pickup)
- Standard across all cities

### 8. Local FAQ
- Minimum 2 city-specific FAQs
- Permit info, delivery times, popular sizes
- FAQ schema markup

### 9. Nearby Markets
- Links to 3-5 adjacent Bay Area city pages
- Source: `seo_cities.nearby_cities_json`

### 10. Bottom CTA
- Full conversion block
- "Get Exact Price" + "Call Now" + "Upload Photo"

## Required Metadata

| Field | Template |
|-------|----------|
| Title | Dumpster Rental in {City}, CA - Same-Day Delivery \| Calsan |
| Meta Description | Affordable dumpster rental in {City}, CA. 10-40 yard sizes, same-day delivery from our local yard. Get instant pricing for your project. |
| Canonical | https://calsandumpsterspro.com/dumpster-rental/{citySlug} |
| H1 | Dumpster Rental in {City}, CA |

## Required Schema

- BreadcrumbList (Home → Areas → {City})
- LocalBusiness (with yard address and service area)
- FAQPage (from FAQ section)

## Internal Links (Required)

- /quote — Primary conversion
- /pricing — Price transparency
- /sizes — Size guide
- /materials — Material guide
- /contractors — Contractor info (when relevant)
- 3-5 nearby city pages
- Parent regional hub

## Content Quality Rules

1. No thin pages — minimum 800 words of content
2. No city-name-only swaps — each city needs unique local wording
3. Current pricing references only — no hardcoded prices
4. All FAQs must be city-relevant
5. Every page must have a strong CTA path to /quote
