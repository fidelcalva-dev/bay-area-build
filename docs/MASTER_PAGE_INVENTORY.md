# MASTER PAGE INVENTORY

> Generated: 2026-03-19 | Total: 247 routes/pages identified

## Legend
- **Type**: HP=Homepage, MKT=Marketing/Public, QT=Quote, FORM=Form, DASH=Dashboard, CRM=CRM Module, CFG=Config, QA=QA/Diagnostics, AUTH=Auth, UTIL=Utility, SEO=SEO Landing, DOC=Document/PDF, LEGACY=Legacy
- **Status**: ✅ Active | ⚠️ Fragile | ❌ Broken | 🗄️ Orphaned | ↩️ Redirect

---

## PUBLIC WEBSITE ROUTES (58 mounted)

| # | Route | Component | Label | Type | Visible Nav | Mounted | SEO | Status | Notes |
|---|-------|-----------|-------|------|-------------|---------|-----|--------|-------|
| 1 | `/` | Index.tsx | Homepage | HP | ✅ | ✅ | ✅ | ✅ | Primary entry point |
| 2 | `/pricing` | Pricing.tsx | Pricing | MKT | ✅ | ✅ | ✅ | ✅ | |
| 3 | `/sizes` | Sizes.tsx | Sizes | MKT | ✅ | ✅ | ✅ | ✅ | |
| 4 | `/visualizer` | DumpsterVisualizer.tsx | Visualizer | UTIL | ✅ | ✅ | ❌ | ✅ | noindex in robots.txt |
| 5 | `/areas` | Areas.tsx | Service Areas | MKT | ✅ | ✅ | ✅ | ✅ | |
| 6 | `/materials` | Materials.tsx | Materials | MKT | ✅ | ✅ | ✅ | ✅ | |
| 7 | `/capacity-guide` | CapacityGuide.tsx | Capacity Guide | MKT | ✅ | ✅ | ✅ | ✅ | |
| 8 | `/contractors` | Contractors.tsx | Contractors | MKT | ✅ | ✅ | ✅ | ✅ | |
| 9 | `/contractor-application` | ContractorApplication.tsx | Contractor App | FORM | ❌ | ✅ | ✅ | ✅ | |
| 10 | `/schedule-delivery` | ScheduleDelivery.tsx | Schedule | FORM | ❌ | ✅ | ❌ | ✅ | noindex in robots.txt |
| 11 | `/projects/:slug` | ProjectTypePage.tsx | Project Type | SEO | ❌ | ✅ | ✅ | ✅ | Dynamic |
| 12 | `/contractor-best-practices` | ContractorBestPractices.tsx | Best Practices | MKT | ❌ | ✅ | ✅ | ✅ | |
| 13 | `/contractor-resources` | ContractorResources.tsx | Resources | MKT | ❌ | ✅ | ✅ | ✅ | |
| 14 | `/about` | About.tsx | About | MKT | ✅ | ✅ | ✅ | ✅ | |
| 15 | `/contact` | Contact.tsx | Contact | MKT | ✅ | ✅ | ✅ | ✅ | |
| 16 | `/blog` | Blog.tsx | Blog | MKT | ✅ | ✅ | ✅ | ✅ | |
| 17 | `/blog/:articleSlug` | BlogArticle.tsx | Blog Article | SEO | ❌ | ✅ | ✅ | ✅ | Dynamic |
| 18 | `/careers` | Careers.tsx | Careers | MKT | ❌ | ✅ | ✅ | ✅ | |
| 19 | `/quote` | Quote.tsx | Quote Flow | QT | ✅ | ✅ | ✅ | ✅ | Primary conversion |
| 20 | `/quote/contractor` | ContractorQuote.tsx | Contractor Quote | QT | ❌ | ✅ | ❌ | ✅ | |
| 21 | `/quote/schedule` | QuoteSchedule.tsx | Quote Schedule | QT | ❌ | ✅ | ❌ | ✅ | |
| 22 | `/quote/pay` | QuotePayment.tsx | Quote Payment | QT | ❌ | ✅ | ❌ | ✅ | |
| 23 | `/quick-order` | QuickOrder.tsx | Quick Order | QT | ❌ | ✅ | ❌ | ⚠️ | noindex, off-strategy? |
| 24 | `/thank-you` | ThankYou.tsx | Thank You | UTIL | ❌ | ✅ | ❌ | ✅ | noindex |
| 25 | `/terms` | Terms.tsx | Terms | MKT | ✅ | ✅ | ✅ | ✅ | |
| 26 | `/privacy` | Privacy.tsx | Privacy | MKT | ✅ | ✅ | ✅ | ✅ | |
| 27 | `/how-it-works` | HowItWorks.tsx | How It Works | MKT | ✅ | ✅ | ✅ | ✅ | |
| 28 | `/why-local-yards` | WhyLocalYards.tsx | Why Local Yards | MKT | ❌ | ✅ | ✅ | ✅ | |
| 29 | `/not-a-broker` | NotABroker.tsx | Not A Broker | MKT | ❌ | ✅ | ✅ | ✅ | |
| 30 | `/why-calsan` | WhyCalsan.tsx | Why CalSan | MKT | ❌ | ✅ | ✅ | ✅ | |
| 31 | `/technology` | Technology.tsx | Technology | MKT | ❌ | ✅ | ❌ | ✅ | noindex |
| 32 | `/waste-vision` | WasteVision.tsx | Waste Vision | MKT | ❌ | ✅ | ❌ | ⚠️ | noindex, demo? |
| 33 | `/green-impact` | GreenImpactMap.tsx | Green Impact | MKT | ❌ | ✅ | ❌ | ⚠️ | noindex |
| 34 | `/green-halo` | GreenHalo.tsx | Green Halo | MKT | ❌ | ✅ | ❌ | ⚠️ | noindex, demo |
| 35 | `/download-price-list` | DownloadPriceList.tsx | Price List | FORM | ❌ | ✅ | ❌ | ✅ | noindex |
| 36 | `/sitemap.xml` | SitemapPage.tsx | Sitemap | UTIL | ❌ | ✅ | N/A | ✅ | |

### SEO Domination Pages (3)
| 37 | `/dumpster-rental-oakland-ca` | DumpsterRentalOakland.tsx | Oakland Domination | SEO | ❌ | ✅ | ✅ | ✅ | Self-canonical |
| 38 | `/dumpster-rental-san-jose-ca` | DumpsterRentalSanJose.tsx | San Jose Domination | SEO | ❌ | ✅ | ✅ | ✅ | Self-canonical |
| 39 | `/dumpster-rental-san-francisco-ca` | DumpsterRentalSanFrancisco.tsx | SF Domination | SEO | ❌ | ✅ | ✅ | ✅ | Self-canonical |

### SEO Regional/Commercial Pages (5)
| 40 | `/dumpster-rental-east-bay` | RegionalLandingPage.tsx | East Bay | SEO | ❌ | ✅ | ✅ | ✅ | |
| 41 | `/dumpster-rental-south-bay` | RegionalLandingPage.tsx | South Bay | SEO | ❌ | ✅ | ✅ | ✅ | |
| 42 | `/commercial-dumpster-rental` | CommercialLandingPage.tsx | Commercial | SEO | ❌ | ✅ | ✅ | ✅ | |
| 43 | `/construction-dumpsters` | CommercialLandingPage.tsx | Construction | SEO | ❌ | ✅ | ✅ | ✅ | |
| 44 | `/warehouse-cleanout-dumpsters` | CommercialLandingPage.tsx | Warehouse | SEO | ❌ | ✅ | ✅ | ✅ | |

### SEO Size Intent Pages (4)
| 45 | `/10-yard-dumpster-rental` | SizeLandingPage.tsx | 10-Yard | SEO | ❌ | ✅ | ✅ | ✅ | |
| 46 | `/20-yard-dumpster-rental` | SizeLandingPage.tsx | 20-Yard | SEO | ❌ | ✅ | ✅ | ✅ | |
| 47 | `/30-yard-dumpster-rental` | SizeLandingPage.tsx | 30-Yard | SEO | ❌ | ✅ | ✅ | ✅ | |
| 48 | `/40-yard-dumpster-rental` | SizeLandingPage.tsx | 40-Yard | SEO | ❌ | ✅ | ✅ | ✅ | |

### SEO Material Intent Pages (5)
| 49 | `/concrete-dumpster-rental` | MaterialLandingPage.tsx | Concrete | SEO | ❌ | ✅ | ✅ | ✅ | |
| 50 | `/dirt-dumpster-rental` | MaterialLandingPage.tsx | Dirt | SEO | ❌ | ✅ | ✅ | ✅ | |
| 51 | `/roofing-dumpster-rental` | MaterialLandingPage.tsx | Roofing | SEO | ❌ | ✅ | ✅ | ✅ | |
| 52 | `/construction-debris-dumpster-rental` | MaterialLandingPage.tsx | Debris | SEO | ❌ | ✅ | ✅ | ✅ | |
| 53 | `/residential-dumpster-rental` | MaterialLandingPage.tsx | Residential | SEO | ❌ | ✅ | ✅ | ✅ | |

### SEO City Engine (dynamic — 9 route patterns)
| 54 | `/dumpster-rental/:citySlug` | SeoCityPage.tsx | City Page | SEO | ❌ | ✅ | ✅ | ✅ | |
| 55 | `/dumpster-rental/:citySlug/:sizeSlug-yard` | SeoCitySizePage.tsx | City+Size | SEO | ❌ | ✅ | ✅ | ✅ | |
| 56 | `/dumpster-rental/:citySlug/:materialSlug` | SeoCityMaterialPage.tsx | City+Material | SEO | ❌ | ✅ | ✅ | ⚠️ | Conflicts with size route |
| 57 | `/service-area/:zip/dumpster-rental` | SeoZipPage.tsx | ZIP Page | SEO | ❌ | ✅ | ✅ | ✅ | |
| 58 | `/concrete-disposal/:citySlug` | SeoServiceCityPage.tsx | Service City | SEO | ❌ | ✅ | ✅ | ✅ | |
| 59 | `/yard-waste-removal/:citySlug` | SeoServiceCityPage.tsx | Service City | SEO | ❌ | ✅ | ✅ | ✅ | |
| 60 | `/debris-removal/:citySlug` | SeoServiceCityPage.tsx | Service City | SEO | ❌ | ✅ | ✅ | ✅ | |
| 61 | `/construction-debris/:citySlug` | SeoServiceCityPage.tsx | Service City | SEO | ❌ | ✅ | ✅ | ✅ | |
| 62 | `/yard-waste-disposal/:citySlug` | SeoServiceCityPage.tsx | Service City | SEO | ❌ | ✅ | ✅ | ✅ | |
| 63 | `/county/:countySlug/dumpster-rental` | SeoCountyPage.tsx | County Page | SEO | ❌ | ✅ | ✅ | ✅ | |
| 64 | `/use-cases/:useCaseSlug` | SeoUseCasePage.tsx | Use Case | SEO | ❌ | ✅ | ✅ | ✅ | |
| 65 | `/yards/:yardSlug` | YardHubPage.tsx | Yard Hub | SEO | ❌ | ✅ | ✅ | ✅ | |

### SEO Hub Pages (5)
| 66 | `/california-dumpster-rental` | SeoHubPage.tsx | CA Hub | SEO | ❌ | ✅ | ✅ | ✅ | |
| 67 | `/bay-area-dumpster-rental` | SeoHubPage.tsx | Bay Area Hub | SEO | ❌ | ✅ | ✅ | ✅ | |
| 68 | `/southern-california-dumpster-rental` | SeoHubPage.tsx | SoCal Hub | SEO | ❌ | ✅ | ✅ | ✅ | |
| 69 | `/central-valley-dumpster-rental` | SeoHubPage.tsx | Central Valley | SEO | ❌ | ✅ | ✅ | ✅ | |
| 70 | `/north-bay-dumpster-rental` | SeoHubPage.tsx | North Bay | SEO | ❌ | ✅ | ✅ | ✅ | |

### Redirects (5 public)
| 71 | `/locations` | → `/areas` | Redirect | ↩️ | ❌ | ✅ | N/A | ✅ | |
| 72 | `/ai-dumpster-assistant` | → `/` | Redirect | ↩️ | ❌ | ✅ | N/A | ✅ | |
| 73 | `/preview/quote` | → `/quote` | Redirect | ↩️ | ❌ | ✅ | N/A | ✅ | |
| 74 | `/preview/home` | → `/` | Redirect | ↩️ | ❌ | ✅ | N/A | ✅ | |
| 75 | `/:citySlug/:sizeSlug-yard-dumpster` | LegacySizeRedirect | Redirect | ↩️ | ❌ | ✅ | N/A | ✅ | |
| 76 | `/:citySlug/:subSlug` | LegacySubpageRedirect | Redirect | ↩️ | ❌ | ✅ | N/A | ⚠️ | Catch-all risk |

---

## AUTH ROUTES (4)

| # | Route | Component | Type | Status |
|---|-------|-----------|------|--------|
| 77 | `/staff` | StaffLogin.tsx | AUTH | ✅ |
| 78 | `/app` | RoleRouter.tsx | AUTH | ✅ |
| 79 | `/request-access` | RequestAccess.tsx | AUTH | ✅ |
| 80 | `/set-password` | SetPassword.tsx | AUTH | ✅ |
| 81 | `/admin/login` | AdminLogin.tsx | AUTH | ✅ |

---

## ADMIN CRM ROUTES (155 mounted under `/admin`)

### Control Center & Overview
| # | Route | Component | Type | Status |
|---|-------|-----------|------|--------|
| 82 | `/admin` (index) | CalsanControlCenter.tsx | DASH | ✅ |
| 83 | `/admin/control-center` | CalsanControlCenter.tsx | DASH | ✅ | Duplicate of index |
| 84 | `/admin/modules` | ControlCenter.tsx | DASH | ✅ |
| 85 | `/admin/legacy-dashboard` | AdminDashboard.tsx | DASH | ✅ | Legacy |

### Operations
| 86 | `/admin/orders` | OrdersManager.tsx | CRM | ✅ |
| 87 | `/admin/customers` | CustomersManager.tsx | CRM | ✅ |
| 88 | `/admin/customers/new` | CustomerForm.tsx | FORM | ✅ |
| 89 | `/admin/customers/:id` | CustomerDetail.tsx | CRM | ✅ |
| 90 | `/admin/customers/:id/edit` | CustomerForm.tsx | FORM | ✅ |
| 91 | `/admin/customer-health` | CustomerHealthDashboard.tsx | DASH | ✅ |
| 92 | `/admin/yards` | YardsManager.tsx | CFG | ✅ |
| 93 | `/admin/zones` | ZonesManager.tsx | CFG | ✅ |
| 94 | `/admin/drivers` | DriversManager.tsx | CFG | ✅ |
| 95 | `/admin/dispatch` | DispatchCalendar.tsx | CRM | ✅ |
| 96 | `/admin/tickets` | TicketsManager.tsx | CRM | ✅ |
| 97 | `/admin/inventory` | InventoryManager.tsx | CRM | ✅ |
| 98 | `/admin/assets` | AssetsControlTower.tsx | CRM | ✅ |
| 99 | `/admin/fleet/cameras` | FleetCamerasManager.tsx | CRM | ✅ |
| 100 | `/admin/movements` | MovementsLog.tsx | CRM | ✅ |

### Pricing Module (17 routes)
| 101 | `/admin/pricing` | PricingManager.tsx | CFG | ✅ |
| 102 | `/admin/pricing/locations` | LocationPricingManager.tsx | CFG | ✅ |
| 103 | `/admin/pricing/simulator` | PricingSimulator.tsx | UTIL | ✅ |
| 104 | `/admin/pricing/yard-health` | YardHealthDashboard.tsx | DASH | ✅ |
| 105 | `/admin/pricing/zip-health` | ZipHealthDashboard.tsx | DASH | ✅ |
| 106 | `/admin/pricing/facility-costs` | FacilityCostDashboard.tsx | DASH | ✅ |
| 107 | `/admin/pricing/material-rules` | MaterialRulesDashboard.tsx | DASH | ✅ |
| 108 | `/admin/pricing/zone-surcharges` | ZoneSurchargesConfig.tsx | CFG | ✅ |
| 109 | `/admin/pricing/rush-delivery` | RushDeliveryConfig.tsx | CFG | ✅ |
| 110 | `/admin/pricing/contractor-pricing` | ContractorPricingConfig.tsx | CFG | ✅ |
| 111 | `/admin/pricing/extras-catalog` | ExtrasCatalogConfig.tsx | CFG | ✅ |
| 112 | `/admin/pricing/city-display-zips` | CityDisplayZips.tsx | CFG | ✅ |
| 113 | `/admin/pricing/rush-health` | RushHealthDashboard.tsx | DASH | ✅ |
| 114 | `/admin/pricing/contractor-rules` | ContractorRulesHealth.tsx | DASH | ✅ |
| 115 | `/admin/pricing/extras-health` | ExtrasHealthDashboard.tsx | DASH | ✅ |
| 116 | `/admin/pricing/readiness` | PricingReadinessDashboard.tsx | DASH | ✅ |
| 117 | `/admin/pricing-engine` | PricingEngineDashboard.tsx | DASH | ✅ |

### Finance & Billing
| 118 | `/admin/heavy-risk` | HeavyRiskDashboard.tsx | DASH | ✅ |
| 119 | `/admin/heavy-pricing` | HeavyPricingManager.tsx | CFG | ✅ |
| 120 | `/admin/mixed-rules` | MixedRulesManager.tsx | CFG | ✅ |
| 121 | `/admin/warnings-caps` | WarningsCapsManager.tsx | CFG | ✅ |
| 122 | `/admin/overdue` | OverdueBillingPage.tsx | CRM | ✅ |
| 123 | `/admin/profitability` | ProfitabilityDashboard.tsx | DASH | ✅ |
| 124 | `/admin/approval-queue` | ApprovalQueuePage.tsx | CRM | ✅ |
| 125 | `/admin/compensation` | CompensationPage.tsx | CFG | ✅ |

### Users & Access
| 126 | `/admin/users` | UsersManager.tsx | CRM | ✅ |
| 127 | `/admin/access-requests` | AccessRequestsPage.tsx | CRM | ✅ |

### Alerts & Risk
| 128 | `/admin/alerts` | AlertsPage.tsx | CRM | ✅ |
| 129 | `/admin/fraud-flags` | FraudFlagsPage.tsx | CRM | ✅ |
| 130 | `/admin/risk` | RiskReviewPage.tsx | CRM | ✅ |

### Markets & Facilities
| 131 | `/admin/markets` | MarketsManager.tsx | CFG | ✅ |
| 132 | `/admin/markets/new-location` | NewLocationWizard.tsx | FORM | ✅ |
| 133 | `/admin/markets/new` | → new-location | ↩️ | ✅ |
| 134 | `/admin/facilities` | FacilitiesManager.tsx | CFG | ✅ |
| 135 | `/admin/disposal-search` | DisposalSearchPage.tsx | UTIL | ✅ |
| 136 | `/admin/facilities/finder` | FacilitiesFinder.tsx | UTIL | ✅ |

### Configuration
| 137 | `/admin/config` | ConfigManager.tsx | CFG | ✅ |
| 138 | `/admin/configuration` | ConfigurationHub.tsx | CFG | ✅ | Overlap with /admin/config? |
| 139 | `/admin/config/health` | ConfigHealthPage.tsx | DASH | ✅ |
| 140 | `/admin/config/locations` | LocationsConfig.tsx | CFG | ✅ |
| 141 | `/admin/config/social` | SocialLinksConfig.tsx | CFG | ✅ |
| 142 | `/admin/config/ai-estimator-templates` | AIEstimatorTemplates.tsx | CFG | ✅ |
| 143 | `/admin/vendors` | VendorsManager.tsx | CFG | ✅ |
| 144 | `/admin/extras` | ExtrasManager.tsx | CFG | ✅ |
| 145 | `/admin/volume-commitments` | VolumeCommitmentsManager.tsx | CFG | ✅ |
| 146 | `/admin/toll-surcharges` | TollSurchargesManager.tsx | CFG | ✅ |
| 147 | `/admin/city-rates` | CityRatesManager.tsx | CFG | ✅ |
| 148 | `/admin/customer-type-rules` | CustomerTypeRulesPage.tsx | CFG | ✅ |
| 149 | `/admin/quick-links` | QuickLinksManager.tsx | CFG | ✅ |
| 150 | `/admin/notifications-config` | NotificationConfigPage.tsx | CFG | ✅ |
| 151 | `/admin/email-config` | EmailConfigPanel.tsx | CFG | ✅ |
| 152 | `/admin/email-test` | AdminEmailTest.tsx | UTIL | ✅ |
| 153 | `/admin/security` | SecurityHealthPage.tsx | DASH | ✅ |

### Integrations
| 154 | `/admin/google` | AdminGoogleSettings.tsx | CFG | ✅ |
| 155 | `/admin/google/setup` | AdminGoogleSetup.tsx | CFG | ✅ |
| 156 | `/admin/google/logs` | AdminGoogleLogs.tsx | CRM | ✅ |
| 157 | `/admin/messaging` | AdminMessaging.tsx | CFG | ✅ |
| 158 | `/admin/ghl` | GHLIntegrationPage.tsx | CFG | ✅ |
| 159 | `/admin/setup/functions` | IntegrationFunctionsMap.tsx | UTIL | ✅ |
| 160 | `/admin/setup/what-missing` | WhatsMissingPage.tsx | UTIL | ✅ |
| 161 | `/admin/setup/search-index` | SearchIndexManager.tsx | CFG | ✅ |

### Materials Admin
| 162 | `/admin/materials/catalog` | MaterialCatalogPage.tsx | CFG | ✅ |
| 163 | `/admin/materials/categories` | ProjectCategoriesPage.tsx | CFG | ✅ |
| 164 | `/admin/materials/offers` | MaterialOffersPage.tsx | CFG | ✅ |

### Telephony (6)
| 165 | `/admin/telephony/calls` | CallsManager.tsx | CRM | ✅ |
| 166 | `/admin/telephony/numbers` | PhoneNumbersManager.tsx | CFG | ✅ |
| 167 | `/admin/telephony/analytics` | CallAnalyticsPage.tsx | DASH | ✅ |
| 168 | `/admin/telephony/migration` | TelephonyMigration.tsx | UTIL | ✅ |
| 169 | `/admin/telephony/test` | TelephonyTestCall.tsx | UTIL | ✅ |
| 170 | `/admin/telephony/import` | TelephonyImport.tsx | UTIL | ✅ |

### Google Ads (5 + 1 redirect)
| 171 | `/admin/ads` | AdsOverview.tsx | DASH | ✅ |
| 172 | `/admin/ads/overview` | → /admin/ads | ↩️ | ✅ |
| 173 | `/admin/ads/campaigns` | AdsCampaigns.tsx | CRM | ✅ |
| 174 | `/admin/ads/rules` | AdsRules.tsx | CFG | ✅ |
| 175 | `/admin/ads/markets` | AdsMarketsPage.tsx | CFG | ✅ |
| 176 | `/admin/ads/logs` | AdsLogsPage.tsx | CRM | ✅ |

### SEO Admin (14 + 1 redirect)
| 177 | `/admin/seo` | → /admin/seo/dashboard | ↩️ | ✅ |
| 178 | `/admin/seo/dashboard` | SeoAdminDashboard.tsx | DASH | ✅ |
| 179 | `/admin/seo/cities` | SeoAdminCities.tsx | CRM | ✅ |
| 180 | `/admin/seo/pages` | SeoAdminPages.tsx | CRM | ✅ |
| 181 | `/admin/seo/sitemap` | SeoAdminSitemap.tsx | UTIL | ✅ |
| 182 | `/admin/seo/gbp-plan` | GbpDominationPlan.tsx | DASH | ✅ |
| 183 | `/admin/seo/health` | SeoHealthPage.tsx | DASH | ✅ |
| 184 | `/admin/seo/repair` | SeoRepairPage.tsx | UTIL | ✅ |
| 185 | `/admin/seo/indexing` | SeoIndexingPage.tsx | CRM | ✅ |
| 186 | `/admin/seo/queue` | SeoQueuePage.tsx | CRM | ✅ |
| 187 | `/admin/seo/rules` | SeoRulesPage.tsx | CFG | ✅ |
| 188 | `/admin/seo/metrics` | SeoMetricsPage.tsx | DASH | ✅ |
| 189 | `/admin/seo/generate` | SeoGeneratePage.tsx | UTIL | ✅ |
| 190 | `/admin/seo/grid` | SeoGridPage.tsx | CRM | ✅ |
| 191 | `/admin/seo/audit` | SeoAuditDashboard.tsx | DASH | ✅ |

### Local Search (7)
| 192 | `/admin/local/dashboard` | LocalDashboard.tsx | DASH | ✅ |
| 193 | `/admin/local/google-business` | GoogleBusinessPage.tsx | CRM | ✅ |
| 194 | `/admin/local/bing-places` | BingPlacesPage.tsx | CRM | ✅ |
| 195 | `/admin/local/apple-business` | AppleBusinessPage.tsx | CRM | ✅ |
| 196 | `/admin/local/reviews` | ReviewsEnginePage.tsx | CRM | ✅ |
| 197 | `/admin/local/photos` | PhotosEnginePage.tsx | CRM | ✅ |
| 198 | `/admin/local/citations` | CitationsPage.tsx | CRM | ✅ |

### Marketing/Analytics (5)
| 199 | `/admin/marketing/visitors` | VisitorsDashboard.tsx | DASH | ✅ |
| 200 | `/admin/marketing/sessions` | SessionsDashboard.tsx | DASH | ✅ |
| 201 | `/admin/marketing/google-setup` | GoogleSetupWizard.tsx | CFG | ✅ |
| 202 | `/admin/marketing/dashboard` | MarketingDashboard.tsx | DASH | ✅ |
| 203 | `/admin/marketing/ga4-debug` | GA4DebugPanel.tsx | UTIL | ✅ |

### AI (12)
| 204 | `/admin/ai/chat` | AdminAIChat.tsx | CRM | ✅ |
| 205 | `/admin/ai/performance` | AIPerformanceDashboard.tsx | DASH | ✅ |
| 206 | `/admin/ai/control-center` | AIControlCenter.tsx | DASH | ✅ |
| 207 | `/admin/ai/sales` | AISalesCopilot.tsx | CRM | ✅ |
| 208 | `/admin/ai/customer-service` | AICsCopilot.tsx | CRM | ✅ |
| 209 | `/admin/ai/dispatch` | AIDispatchCopilot.tsx | CRM | ✅ |
| 210 | `/admin/ai/driver` | AIDriverCopilot.tsx | CRM | ✅ |
| 211 | `/admin/ai/fleet` | AIFleetCopilot.tsx | CRM | ✅ |
| 212 | `/admin/ai/finance` | AIFinanceCopilot.tsx | CRM | ✅ |
| 213 | `/admin/ai/seo` | AISeoCopilot.tsx | CRM | ✅ |
| 214 | `/admin/ai/admin` | AIAdminCopilot.tsx | CRM | ✅ |

### Dashboards (7)
| 215 | `/admin/dashboards/overview` | DashboardOverview.tsx | DASH | ✅ |
| 216 | `/admin/dashboards/sales` | SalesDashboard.tsx | DASH | ✅ |
| 217 | `/admin/dashboards/operations` | OperationsDashboard.tsx | DASH | ✅ |
| 218 | `/admin/dashboards/finance` | FinanceDashboardPage.tsx | DASH | ✅ |
| 219 | `/admin/dashboards/customers` | CustomersDashboard.tsx | DASH | ✅ |
| 220 | `/admin/dashboards/kpis` | KPIDashboard.tsx | DASH | ✅ |
| 221 | `/admin/dashboards/leads` | LeadPerformanceDashboard.tsx | DASH | ✅ |

### Leads & Sales Performance
| 222 | `/admin/leads/settings` | LeadEngineSettings.tsx | CFG | ✅ |
| 223 | `/admin/leads` | AdminLeadsHub.tsx | CRM | ✅ |
| 224 | `/admin/leads-health` | LeadsHealthDashboard.tsx | DASH | ✅ |
| 225 | `/admin/activation` | ActivationDashboard.tsx | DASH | ✅ |
| 226 | `/admin/executive` | ExecutiveDashboard.tsx | DASH | ✅ |
| 227 | `/admin/intelligence` | BusinessIntelligenceDashboard.tsx | DASH | ✅ |
| 228 | `/admin/sales-performance` | SalesPerformanceDashboard.tsx | DASH | ✅ |

### QA/Diagnostics (12)
| 229 | `/admin/qa/control-center` | QaControlCenter.tsx | QA | ✅ |
| 230 | `/admin/qa/workflows` | WorkflowsExplorer.tsx | QA | ✅ |
| 231 | `/admin/qa/workflow-graph` | WorkflowGraph.tsx | QA | ✅ |
| 232 | `/admin/qa/photo-ai-test` | PhotoAITest.tsx | QA | ✅ |
| 233 | `/admin/qa/build-info` | BuildInfo.tsx | QA | ✅ |
| 234 | `/admin/qa/env-health` | EnvHealth.tsx | QA | ✅ |
| 235 | `/admin/qa/build-health` | BuildHealth.tsx | QA | ✅ |
| 236 | `/admin/qa/seo-health` | SeoHealthDashboard.tsx | QA | ✅ |
| 237 | `/admin/qa/route-health` | RouteHealthPage.tsx | QA | ✅ |
| 238 | `/admin/qa/duplicate-pages` | DuplicatePagesPage.tsx | QA | ✅ |
| 239 | `/admin/qa/public-vs-crm` | PublicVsCrmPage.tsx | QA | ✅ |
| 240 | `/admin/qa/page-organization` | PageOrganizationPage.tsx | QA | ✅ |
| 241 | `/admin/qa/domain-health` | DomainHealth.tsx | QA | ✅ |

### Maintenance (4)
| 242 | `/admin/maintenance` | MaintenanceDashboard.tsx | DASH | ✅ |
| 243 | `/admin/maintenance/trucks` | MaintenanceTrucks.tsx | CRM | ✅ |
| 244 | `/admin/maintenance/issues` | MaintenanceIssues.tsx | CRM | ✅ |
| 245 | `/admin/maintenance/work-orders` | MaintenanceWorkOrders.tsx | CRM | ✅ |
| 246 | `/admin/vehicles/:id` | VehicleProfile.tsx | CRM | ✅ |

### System
| 247 | `/admin/system/reset` | SystemResetPage.tsx | UTIL | ✅ |
| 248 | `/admin/audit-logs` | AuditLogsPage.tsx | CRM | ✅ |
| 249 | `/admin/activity` | AdminActivityFeed.tsx | CRM | ✅ |
| 250 | `/admin/docs` | InternalDocsPage.tsx | UTIL | ✅ |
| 251 | `/admin/calculator/logs` | CalculatorLogsPage.tsx | CRM | ✅ |
| 252 | `/admin/notifications/internal` | InternalAlertsPage.tsx | CRM | ✅ |

---

## CUSTOMER PORTAL ROUTES (15 mounted)

| # | Route | Component | Auth | Status |
|---|-------|-----------|------|--------|
| 253 | `/portal` | CustomerLogin.tsx | ❌ | ✅ |
| 254 | `/portal/track` | PortalTrack.tsx | ❌ | ✅ |
| 255 | `/portal/dashboard` | CustomerDashboard.tsx | OTP | ✅ |
| 256 | `/portal/orders` | CustomerOrders.tsx | OTP | ✅ |
| 257 | `/portal/documents` | CustomerDocuments.tsx | OTP | ✅ |
| 258 | `/portal/order/:orderId` | CustomerOrderDetail.tsx | OTP | ✅ | Legacy alias |
| 259 | `/portal/orders/:orderId` | CustomerOrderDetail.tsx | OTP | ✅ | Canonical |
| 260 | `/portal/payment-complete` | PaymentComplete.tsx | OTP | ✅ |
| 261 | `/portal/quote/:quoteId` | PortalQuoteView.tsx | ❌ | ✅ | SMS link |
| 262 | `/portal/schedule` | PortalSchedule.tsx | ❌ | ✅ | |
| 263 | `/portal/pay` | PortalPay.tsx | ❌ | ✅ | |
| 264 | `/portal/pay/:paymentId` | PaymentRedirect.tsx | ❌ | ✅ | |
| 265 | `/portal/sign-quote-contract` | SignQuoteContract.tsx | ❌ | ✅ | |
| 266 | `/contract/:token` | ContractSignPage.tsx | ❌ | ✅ | |
| 267 | `/portal/activate` | PortalActivate.tsx | ❌ | ✅ | |

---

## GREEN HALO PORTAL (4 mounted — demo)

| # | Route | Component | Status |
|---|-------|-----------|--------|
| 268 | `/green-halo/portal` | PortalLogin.tsx | ✅ Demo |
| 269 | `/green-halo/portal/dashboard` | PortalDashboard.tsx | ✅ Demo |
| 270 | `/green-halo/portal/project/:projectId` | ProjectDetail.tsx | ✅ Demo |
| 271 | `/green-halo/portal/report` | SustainabilityReport.tsx | ✅ Demo |

---

## DEPARTMENT PORTALS

### Sales Portal (9 + 2 redirects)
| # | Route | Component | Status |
|---|-------|-----------|--------|
| 272 | `/sales` (index) | SalesDashboard.tsx | ✅ |
| 273 | `/sales/leads` | SalesLeads.tsx | ✅ |
| 274 | `/sales/leads/:id` | LeadDetail.tsx | ✅ |
| 275 | `/sales/quotes` | SalesQuotes.tsx | ✅ |
| 276 | `/sales/quotes/:id` | SalesQuoteDetail.tsx | ✅ |
| 277 | `/sales/quotes/new` | InternalCalculator.tsx | ✅ |
| 278 | `/sales/calls` | SalesCalls.tsx | ✅ |
| 279 | `/sales/order-builder` | OrderBuilder.tsx | ✅ |
| 280 | `/sales/inbox` | → /sales/leads | ↩️ | ✅ |
| 281 | `/sales/lead-hub` | → /sales/leads | ↩️ | ✅ |

### CS Portal (8)
| 282 | `/cs` (index) | CSDashboard.tsx | ✅ |
| 283 | `/cs/orders` | CSOrders.tsx | ✅ |
| 284 | `/cs/requests` | CSRequests.tsx | ✅ |
| 285 | `/cs/templates` | CSTemplates.tsx | ✅ |
| 286 | `/cs/messages` | CSMessages.tsx | ✅ |
| 287 | `/cs/calls` | CSCalls.tsx | ✅ |
| 288 | `/cs/leads` | CSLeads.tsx | ✅ |
| 289 | `/cs/lead-inbox` | CSLeadInbox.tsx | ✅ |

### Dispatch Portal (10)
| 290 | `/dispatch` (index) | DispatchDashboard.tsx | ✅ |
| 291 | `/dispatch/today` | DispatchToday.tsx | ✅ |
| 292 | `/dispatch/calendar` | DispatchCalendarPage.tsx | ✅ |
| 293 | `/dispatch/flags` | DispatchFlags.tsx | ✅ |
| 294 | `/dispatch/requests` | DispatchRequests.tsx | ✅ |
| 295 | `/dispatch/control-tower` | ControlTower.tsx | ✅ |
| 296 | `/dispatch/history` | RouteHistory.tsx | ✅ |
| 297 | `/dispatch/facilities` | FacilitiesFinder.tsx | ✅ |
| 298 | `/dispatch/yard-hold` | YardHoldBoard.tsx | ✅ |
| 299 | `/dispatch/truck-cameras/:truckId` | TruckCameras.tsx | ✅ |

### Driver App (8 + 1 legacy)
| 300 | `/driver` (index) | DriverHome.tsx | ✅ |
| 301 | `/driver/runs/:id` | DriverRunDetail.tsx | ✅ |
| 302 | `/driver/runs` | DriverRuns.tsx | ✅ |
| 303 | `/driver/profile` | DriverProfile.tsx | ✅ |
| 304 | `/driver/truck-select` | DriverTruckSelect.tsx | ✅ |
| 305 | `/driver/inspect` | DriverPreTrip.tsx | ✅ |
| 306 | `/driver/report-issue` | DriverReportIssue.tsx | ✅ |
| 307 | `/driver/legacy` | DriverApp.tsx | ✅ Legacy |

### Finance Portal (9)
| 308 | `/finance` (index) | FinanceDashboard.tsx | ✅ |
| 309 | `/finance/invoices` | FinanceInvoices.tsx | ✅ |
| 310 | `/finance/invoices/:orderId` | FinanceInvoiceDetail.tsx | ✅ |
| 311 | `/finance/payments` | FinancePayments.tsx | ✅ |
| 312 | `/finance/payments/:paymentId` | FinancePaymentDetail.tsx | ✅ |
| 313 | `/finance/payment-actions` | FinancePaymentActions.tsx | ✅ |
| 314 | `/finance/ar-aging` | ARAgingDashboard.tsx | ✅ |
| 315 | `/finance/ar-aging/invoices` | ARAgingInvoices.tsx | ✅ |
| 316 | `/finance/ar-aging/customers` | ARAgingCustomers.tsx | ✅ |

### Internal Calculator (5 — 1 canonical + 4 aliases)
| 317 | `/internal/calculator` | InternalCalculator.tsx | ✅ Canonical |
| 318 | `/ops/calculator` | InternalCalculator.tsx | ✅ Alias |
| 319 | `/sales/calculator` | InternalCalculator.tsx | ✅ Alias |
| 320 | `/cs/calculator` | InternalCalculator.tsx | ✅ Alias |
| 321 | `/dispatch/calculator` | InternalCalculator.tsx | ✅ Alias |

### Catch-all
| 322 | `*` | NotFound.tsx | ✅ |

---

## ORPHANED FILES (Not mounted in any route)

| File | Reason |
|------|--------|
| `src/pages/admin/MasterAIDashboard.tsx` | Not imported in App.tsx |
| `src/pages/admin/MasterAIDecisions.tsx` | Not imported in App.tsx |
| `src/pages/admin/MasterAIJobs.tsx` | Not imported in App.tsx |
| `src/pages/admin/MasterAINotifications.tsx` | Not imported in App.tsx |
| `src/pages/admin/AuditLogsViewer.tsx` | Not imported (AuditLogsPage used instead) |
| `src/pages/admin/UserRolesManager.tsx` | Not imported in App.tsx |
| `src/pages/admin/pricing/MasterPricingDashboard.tsx` | Not imported in App.tsx |
| `src/pages/CityLandingPage.tsx` | Not imported (SeoCityPage used instead) |
| `src/pages/Locations.tsx` | Not imported (redirect to /areas) |
| `src/pages/preview/PreviewHome.tsx` | Not imported (redirected) |
| `src/pages/preview/PreviewQuote.tsx` | Not imported (redirected) |
| `src/pages/dispatch/DispatchRunsCalendar.tsx` | Explicitly removed per comment |
| `src/pages/dispatch/DispatchRunsList.tsx` | Explicitly removed per comment |
| `src/pages/dispatch/DispatchRunDetail.tsx` | Explicitly removed per comment |
| `src/pages/sales/SalesNewQuote.tsx` | File exists but import points to InternalCalculator |
| `src/pages/sales/LeadInbox.tsx` | Imported but never mounted in any route |
| `src/pages/sales/SalesLeadInbox.tsx` | Imported but never mounted in any route |

**Total orphaned: 17 files**
