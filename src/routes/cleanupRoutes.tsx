import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { SuspenseRoute } from './shared';

const CleanupHome = lazy(() => import('@/pages/cleanup/CleanupHome'));
const CleanupServices = lazy(() => import('@/pages/cleanup/CleanupServices'));
const CleanupServiceDetail = lazy(() => import('@/pages/cleanup/CleanupServiceDetail'));
const CleanupForContractors = lazy(() => import('@/pages/cleanup/CleanupForContractors'));
const CleanupPricing = lazy(() => import('@/pages/cleanup/CleanupPricing'));
const CleanupAbout = lazy(() => import('@/pages/cleanup/CleanupAbout'));
const CleanupFAQs = lazy(() => import('@/pages/cleanup/CleanupFAQs'));
const CleanupContact = lazy(() => import('@/pages/cleanup/CleanupContact'));
const CleanupQuote = lazy(() => import('@/pages/cleanup/CleanupQuote'));
const CleanupBeforeAfter = lazy(() => import('@/pages/cleanup/CleanupBeforeAfter'));
const CleanupServiceAreas = lazy(() => import('@/pages/cleanup/CleanupServiceAreas'));
const CleanupLocalPage = lazy(() => import('@/pages/cleanup/CleanupLocalPage'));

export function getCleanupRoutes() {
  return [
    <Route key="cleanup-home" path="/cleanup" element={<SuspenseRoute><CleanupHome /></SuspenseRoute>} />,
    <Route key="cleanup-services" path="/cleanup/services" element={<SuspenseRoute><CleanupServices /></SuspenseRoute>} />,
    <Route key="cleanup-construction" path="/cleanup/construction-cleanup" element={<SuspenseRoute><CleanupServiceDetail /></SuspenseRoute>} />,
    <Route key="cleanup-post-construction" path="/cleanup/post-construction-cleanup" element={<SuspenseRoute><CleanupServiceDetail /></SuspenseRoute>} />,
    <Route key="cleanup-demolition" path="/cleanup/demolition-debris-cleanup" element={<SuspenseRoute><CleanupServiceDetail /></SuspenseRoute>} />,
    <Route key="cleanup-recurring" path="/cleanup/recurring-jobsite-cleanup" element={<SuspenseRoute><CleanupServiceDetail /></SuspenseRoute>} />,
    <Route key="cleanup-contractors" path="/cleanup/for-contractors" element={<SuspenseRoute><CleanupForContractors /></SuspenseRoute>} />,
    <Route key="cleanup-pricing" path="/cleanup/pricing" element={<SuspenseRoute><CleanupPricing /></SuspenseRoute>} />,
    <Route key="cleanup-about" path="/cleanup/about" element={<SuspenseRoute><CleanupAbout /></SuspenseRoute>} />,
    <Route key="cleanup-faqs" path="/cleanup/faqs" element={<SuspenseRoute><CleanupFAQs /></SuspenseRoute>} />,
    <Route key="cleanup-contact" path="/cleanup/contact" element={<SuspenseRoute><CleanupContact /></SuspenseRoute>} />,
    <Route key="cleanup-quote" path="/cleanup/quote" element={<SuspenseRoute><CleanupQuote /></SuspenseRoute>} />,
    <Route key="cleanup-before-after" path="/cleanup/before-after" element={<SuspenseRoute><CleanupBeforeAfter /></SuspenseRoute>} />,
    <Route key="cleanup-service-areas" path="/cleanup/service-areas" element={<SuspenseRoute><CleanupServiceAreas /></SuspenseRoute>} />,
    <Route key="cleanup-oakland" path="/cleanup/oakland-construction-cleanup" element={<SuspenseRoute><CleanupLocalPage /></SuspenseRoute>} />,
    <Route key="cleanup-alameda" path="/cleanup/alameda-construction-cleanup" element={<SuspenseRoute><CleanupLocalPage /></SuspenseRoute>} />,
    <Route key="cleanup-bay-area" path="/cleanup/bay-area-construction-cleanup" element={<SuspenseRoute><CleanupLocalPage /></SuspenseRoute>} />,
  ];
}
