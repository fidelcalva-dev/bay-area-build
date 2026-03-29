import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { SuspenseRoute } from './shared';
import { LegacySizeRedirect, LegacySubpageRedirect } from '@/components/seo/SeoLegacyRedirects';
import { lazyRetry } from '@/lib/lazyRetry';

// SEO Domination Pages
const DumpsterRentalOakland = lazy(lazyRetry(() => import("@/pages/DumpsterRentalOakland")));
const DumpsterRentalSanJose = lazy(lazyRetry(() => import("@/pages/DumpsterRentalSanJose")));
const DumpsterRentalSanFrancisco = lazy(lazyRetry(() => import("@/pages/DumpsterRentalSanFrancisco")));
const RegionalLandingPage = lazy(lazyRetry(() => import("@/pages/RegionalLandingPage")));
const CommercialLandingPage = lazy(lazyRetry(() => import("@/pages/CommercialLandingPage")));
const SizeLandingPage = lazy(lazyRetry(() => import("@/pages/SizeLandingPage")));
const MaterialLandingPage = lazy(lazyRetry(() => import("@/pages/MaterialLandingPage")));
const YardHubPage = lazy(lazyRetry(() => import("@/pages/seo/YardHubPage")));

// SEO City Engine Pages
const SeoCityPage = lazy(lazyRetry(() => import("@/pages/seo/SeoCityPage")));
const SeoCitySizePage = lazy(lazyRetry(() => import("@/pages/seo/SeoCitySizePage")));
const SeoCityMaterialPage = lazy(lazyRetry(() => import("@/pages/seo/SeoCityMaterialPage")));
const SeoZipPage = lazy(lazyRetry(() => import("@/pages/seo/SeoZipPage")));
const SeoServiceCityPage = lazy(lazyRetry(() => import("@/pages/seo/SeoServiceCityPage")));
const SeoCityJobPage = lazy(lazyRetry(() => import("@/pages/seo/SeoCityJobPage")));
const SeoCountyPage = lazy(lazyRetry(() => import("@/pages/seo/SeoCountyPage")));
const SeoUseCasePage = lazy(lazyRetry(() => import("@/pages/seo/SeoUseCasePage")));
const SeoHubPage = lazy(lazyRetry(() => import("@/pages/seo/SeoHubPage")));

export function getSeoRoutes() {
  return [
    // Domination pages
    <Route key="oakland" path="/dumpster-rental-oakland-ca" element={<SuspenseRoute><DumpsterRentalOakland /></SuspenseRoute>} />,
    <Route key="san-jose" path="/dumpster-rental-san-jose-ca" element={<SuspenseRoute><DumpsterRentalSanJose /></SuspenseRoute>} />,
    <Route key="san-francisco" path="/dumpster-rental-san-francisco-ca" element={<SuspenseRoute><DumpsterRentalSanFrancisco /></SuspenseRoute>} />,
    
    // Regional & Commercial
    <Route key="east-bay" path="/dumpster-rental-east-bay" element={<SuspenseRoute><RegionalLandingPage /></SuspenseRoute>} />,
    <Route key="south-bay" path="/dumpster-rental-south-bay" element={<SuspenseRoute><RegionalLandingPage /></SuspenseRoute>} />,
    <Route key="commercial" path="/commercial-dumpster-rental" element={<SuspenseRoute><CommercialLandingPage /></SuspenseRoute>} />,
    <Route key="construction" path="/construction-dumpsters" element={<SuspenseRoute><CommercialLandingPage /></SuspenseRoute>} />,
    <Route key="warehouse" path="/warehouse-cleanout-dumpsters" element={<SuspenseRoute><CommercialLandingPage /></SuspenseRoute>} />,
    
    // Size intent pages
    <Route key="10yd" path="/10-yard-dumpster-rental" element={<SuspenseRoute><SizeLandingPage /></SuspenseRoute>} />,
    <Route key="20yd" path="/20-yard-dumpster-rental" element={<SuspenseRoute><SizeLandingPage /></SuspenseRoute>} />,
    <Route key="30yd" path="/30-yard-dumpster-rental" element={<SuspenseRoute><SizeLandingPage /></SuspenseRoute>} />,
    <Route key="40yd" path="/40-yard-dumpster-rental" element={<SuspenseRoute><SizeLandingPage /></SuspenseRoute>} />,
    
    // Material intent pages
    <Route key="concrete" path="/concrete-dumpster-rental" element={<SuspenseRoute><MaterialLandingPage /></SuspenseRoute>} />,
    <Route key="dirt" path="/dirt-dumpster-rental" element={<SuspenseRoute><MaterialLandingPage /></SuspenseRoute>} />,
    <Route key="roofing" path="/roofing-dumpster-rental" element={<SuspenseRoute><MaterialLandingPage /></SuspenseRoute>} />,
    <Route key="debris" path="/construction-debris-dumpster-rental" element={<SuspenseRoute><MaterialLandingPage /></SuspenseRoute>} />,
    <Route key="residential" path="/residential-dumpster-rental" element={<SuspenseRoute><MaterialLandingPage /></SuspenseRoute>} />,
    
    // Yard hub pages
    <Route key="yard-hub" path="/yards/:yardSlug" element={<SuspenseRoute><YardHubPage /></SuspenseRoute>} />,
    
    // SEO City Engine
    <Route key="city" path="/dumpster-rental/:citySlug" element={<SuspenseRoute><SeoCityPage /></SuspenseRoute>} />,
    <Route key="city-size" path="/dumpster-rental/:citySlug/:sizeSlug-yard" element={<SuspenseRoute><SeoCitySizePage /></SuspenseRoute>} />,
    <Route key="city-material" path="/dumpster-rental/:citySlug/:materialSlug" element={<SuspenseRoute><SeoCityMaterialPage /></SuspenseRoute>} />,
    
    // ZIP pages
    <Route key="zip" path="/service-area/:zip/dumpster-rental" element={<SuspenseRoute><SeoZipPage /></SuspenseRoute>} />,
    
    // Service-specific SEO
    <Route key="concrete-disposal" path="/concrete-disposal/:citySlug" element={<SuspenseRoute><SeoServiceCityPage /></SuspenseRoute>} />,
    <Route key="yard-waste" path="/yard-waste-removal/:citySlug" element={<SuspenseRoute><SeoServiceCityPage /></SuspenseRoute>} />,
    <Route key="debris-removal" path="/debris-removal/:citySlug" element={<SuspenseRoute><SeoServiceCityPage /></SuspenseRoute>} />,
    <Route key="construction-debris-city" path="/construction-debris/:citySlug" element={<SuspenseRoute><SeoServiceCityPage /></SuspenseRoute>} />,
    <Route key="yard-waste-disposal" path="/yard-waste-disposal/:citySlug" element={<SuspenseRoute><SeoServiceCityPage /></SuspenseRoute>} />,
    
    // County pages
    <Route key="county" path="/county/:countySlug/dumpster-rental" element={<SuspenseRoute><SeoCountyPage /></SuspenseRoute>} />,
    
    // Use case pages
    <Route key="use-cases" path="/use-cases/:useCaseSlug" element={<SuspenseRoute><SeoUseCasePage /></SuspenseRoute>} />,
    
    // Hub pages
    <Route key="california" path="/california-dumpster-rental" element={<SuspenseRoute><SeoHubPage /></SuspenseRoute>} />,
    <Route key="bay-area" path="/bay-area-dumpster-rental" element={<SuspenseRoute><SeoHubPage /></SuspenseRoute>} />,
    <Route key="north-bay" path="/north-bay-dumpster-rental" element={<SuspenseRoute><SeoHubPage /></SuspenseRoute>} />,
    
    // Out-of-area hubs redirect to Bay Area hub
    <Route key="socal-redirect" path="/southern-california-dumpster-rental" element={<Navigate to="/bay-area-dumpster-rental" replace />} />,
    <Route key="central-valley-redirect" path="/central-valley-dumpster-rental" element={<Navigate to="/bay-area-dumpster-rental" replace />} />,
    
    // Top 3 city programmatic to domination page redirects
    <Route key="oakland-redirect" path="/dumpster-rental/oakland" element={<Navigate to="/dumpster-rental-oakland-ca" replace />} />,
    <Route key="san-jose-redirect" path="/dumpster-rental/san-jose" element={<Navigate to="/dumpster-rental-san-jose-ca" replace />} />,
    <Route key="san-francisco-redirect" path="/dumpster-rental/san-francisco" element={<Navigate to="/dumpster-rental-san-francisco-ca" replace />} />,
    
    // Legacy URL redirects
    <Route key="legacy-size" path="/:citySlug/:sizeSlug-yard-dumpster" element={<LegacySizeRedirect />} />,
    <Route key="legacy-subpage" path="/:citySlug/:subSlug" element={<LegacySubpageRedirect />} />,
  ];
}
