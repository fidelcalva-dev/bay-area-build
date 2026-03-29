# Public Content Architecture

Updated: 2026-03-29

## URL Strategy Decision

**Chosen: Keep existing URLs as canonical.** No URL migrations. Nav and footer reorganized to present content in logical clusters using existing canonical URLs.

---

## Route Map — Organized by Cluster

### Core Pages
| Route | Status | Component |
|---|---|---|
| `/` | ✅ Live | Homepage |
| `/about` | ✅ Live | About |
| `/why-calsan` | ✅ Live | WhyCalsan |
| `/quote` | ✅ Live | Quote (V3 flow) |
| `/blog` | ✅ Live | Blog index |
| `/blog/:articleSlug` | ✅ Live | BlogArticle |
| `/green-halo` | ✅ Live (noindex) | GreenHalo |
| `/careers` | ✅ Live | Careers |
| `/contact` | ✅ Live | Contact |
| `/contact-us` | ✅ Live | ContactUs (CRM-connected) |

### Services (existing canonical URLs)
| Route | Status | Proposed alias |
|---|---|---|
| `/construction-dumpsters` | ✅ Live | — |
| `/commercial-dumpster-rental` | ✅ Live | — |
| `/roofing-dumpster-rental` | ✅ Live | — |
| `/residential-dumpster-rental` | ✅ Live | — |
| `/concrete-dumpster-rental` | ✅ Live | — |
| `/dirt-dumpster-rental` | ✅ Live | — |
| `/warehouse-cleanout-dumpsters` | ✅ Live | — |
| `/contractors` | ✅ Live | — |

### Sizes (existing canonical URLs)
| Route | Status | Proposed alias |
|---|---|---|
| `/sizes` | ✅ Live | — |
| `/10-yard-dumpster-rental` | ✅ Live | — |
| `/20-yard-dumpster-rental` | ✅ Live | — |
| `/30-yard-dumpster-rental` | ✅ Live | — |
| `/40-yard-dumpster-rental` | ✅ Live | — |

### Locations (existing canonical URLs)
| Route | Status | Maps to proposed |
|---|---|---|
| `/dumpster-rental-oakland-ca` | ✅ Flagship | /locations/oakland-ca |
| `/dumpster-rental-san-jose-ca` | ✅ Flagship | /locations/san-jose-ca |
| `/dumpster-rental-san-francisco-ca` | ✅ Flagship | /locations/san-francisco-ca |
| `/dumpster-rental/berkeley` | ✅ Programmatic | /locations/berkeley-ca |
| `/dumpster-rental/fremont` | ✅ Programmatic | /locations/fremont-ca |
| `/dumpster-rental/hayward` | ✅ Programmatic | /locations/hayward-ca |
| `/dumpster-rental/milpitas` | ✅ Programmatic | /locations/milpitas-ca |
| `/dumpster-rental/san-leandro` | ✅ Programmatic | /locations/san-leandro-ca |
| `/dumpster-rental/santa-clara` | ✅ Programmatic | /locations/santa-clara-ca |
| `/dumpster-rental/sunnyvale` | ✅ Programmatic | /locations/sunnyvale-ca |
| `/areas` | ✅ Live | Hub page |
| `/dumpster-rental-east-bay` | ✅ Live | Regional hub |
| `/dumpster-rental-south-bay` | ✅ Live | Regional hub |

### Resources & Comparisons
| Route | Status | Notes |
|---|---|---|
| `/pricing` | ✅ Live | — |
| `/materials` | ✅ Live | Maps to "what goes in a dumpster" |
| `/permits` | ✅ **NEW** | Permit guide by city |
| `/how-it-works` | ✅ Live | — |
| `/capacity-guide` | ✅ Live | — |
| `/compare/dumpster-rental-vs-junk-removal` | ✅ **NEW** | Comparison page |
| `/compare/10-vs-20-yard-dumpster` | ✅ **NEW** | Size comparison |
| `/compare/20-vs-30-yard-dumpster` | ✅ **NEW** | Size comparison |
| `/contractor-best-practices` | ✅ Live | — |
| `/contractor-resources` | ✅ Live | Permit + planning content |

### Cleanup Division (separate brand)
| Route | Status |
|---|---|
| `/cleanup` | ✅ Live |
| `/cleanup/services` | ✅ Live |
| `/cleanup/construction-cleanup` | ✅ Live |
| `/cleanup/post-construction-cleanup` | ✅ Live |
| `/cleanup/demolition-debris-cleanup` | ✅ Live |
| `/cleanup/recurring-jobsite-cleanup` | ✅ Live |
| `/cleanup/for-contractors` | ✅ Live |
| `/cleanup/pricing` | ✅ Live |
| `/cleanup/quote` | ✅ Live |
| `/cleanup/oakland` | ✅ Live |
| `/cleanup/alameda` | ✅ Live |
| `/cleanup/bay-area` | ✅ Live |

---

## Navigation Structure

### Header Nav (4 dropdowns + Quote CTA)
```
Services          Sizes & Pricing      Service Areas       Resources
├ Construction    ├ All Sizes           ├ Oakland           ├ What Goes in a Dumpster
├ Commercial      ├ 10 Yard            ├ San Jose          ├ Permits & Rules
├ Roofing         ├ 20 Yard            ├ San Francisco     ├ How It Works
├ Residential     ├ 30 Yard            ├ East Bay          ├ Blog & Guides
├ Concrete/Dirt   ├ 40 Yard            ├ South Bay         └ About Calsan
└ Contractor      └ Pricing            └ All Service Areas
  Programs

                                                    [Get Quote] [Call CTA]
```

### Footer Nav (6 columns)
```
Brand/NAP     Services          Sizes & Pricing    Locations       Resources        Contact/Hours
├ Address     ├ Construction    ├ All Sizes        ├ Oakland       ├ Materials      ├ Sales phone
├ Phone       ├ Commercial     ├ 10 Yard          ├ San Jose      ├ Permits        ├ Support phone
├ Email       ├ Roofing        ├ 20 Yard          ├ San Francisco ├ How It Works   ├ Office status
├ Hablamos    ├ Residential    ├ 30 Yard          ├ Berkeley      ├ Blog           ├ Hours
│ Español     ├ Concrete/Dirt  ├ 40 Yard          ├ Fremont       ├ Best Practices │
│             ├ Contractors    ├ Pricing           ├ Hayward       ├ Resources      │ Company:
│             └ Contractor     └ Capacity Guide    ├ Milpitas      │                ├ About
│               Pricing                            ├ San Leandro   │                ├ Why Calsan
│                                                  ├ Santa Clara   │                ├ Why Local Yards
│                                                  ├ Sunnyvale     │                ├ Not a Broker
│                                                  └ All Areas →   │                ├ Careers
│                                                                                   ├ Contact
│                                                                                   └ Get Quote
```

---

## Redirect / Alias Recommendations

No redirects needed now since we preserved all existing canonical URLs. Future considerations:

| If you want... | Recommendation |
|---|---|
| `/services/construction-dumpsters` | Alias → `/construction-dumpsters` (optional, low priority) |
| `/locations/oakland-ca` | Alias → `/dumpster-rental-oakland-ca` (optional, low priority) |
| `/sizes/10-yard-dumpster` | Alias → `/10-yard-dumpster-rental` (optional, low priority) |
| `/what-can-you-put-in-a-dumpster` | Alias → `/materials` (good for long-tail SEO) |
| `/what-cannot-go-in-a-dumpster` | Alias → `/materials` (good for long-tail SEO) |

---

## Pages Still Missing (future content)

| Page | Priority | Notes |
|---|---|---|
| `/services/same-day-dumpster-rental` | P1 | High search intent, no existing equivalent |
| `/services/junk-debris-dumpsters` | P2 | Could be alias to existing material page |
| `/what-can-you-put-in-a-dumpster` | P2 | Long-tail alias to `/materials` |
| `/what-cannot-go-in-a-dumpster` | P2 | Long-tail alias to `/materials` |
| `/compare/dumpster-rental-vs-bagster` | P3 | Comparison content |
| `/compare/local-vs-national-dumpster` | P3 | Aligns with "not a broker" positioning |
