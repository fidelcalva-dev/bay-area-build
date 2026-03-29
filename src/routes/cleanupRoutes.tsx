import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { SuspenseRoute } from './shared';
import { lazyRetry } from '@/lib/lazyRetry';

const CleanupHome = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupHome')));
const CleanupServices = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupServices')));
const CleanupServiceDetail = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupServiceDetail')));
const CleanupForContractors = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupForContractors')));
const CleanupPricing = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupPricing')));
const CleanupAbout = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupAbout')));
const CleanupFAQs = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupFAQs')));
const CleanupContact = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupContact')));
const CleanupQuote = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupQuote')));
const CleanupThankYou = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupThankYou')));
const CleanupBeforeAfter = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupBeforeAfter')));
const CleanupServiceAreas = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupServiceAreas')));
const CleanupLocalPage = lazy(lazyRetry(() => import('@/pages/cleanup/CleanupLocalPage')));

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
    <Route key="cleanup-thank-you" path="/cleanup/thank-you" element={<SuspenseRoute><CleanupThankYou /></SuspenseRoute>} />,
    <Route key="cleanup-before-after" path="/cleanup/before-after" element={<SuspenseRoute><CleanupBeforeAfter /></SuspenseRoute>} />,
    <Route key="cleanup-service-areas" path="/cleanup/service-areas" element={<SuspenseRoute><CleanupServiceAreas /></SuspenseRoute>} />,
    <Route key="cleanup-oakland" path="/cleanup/oakland" element={<SuspenseRoute><CleanupLocalPage /></SuspenseRoute>} />,
    <Route key="cleanup-alameda" path="/cleanup/alameda" element={<SuspenseRoute><CleanupLocalPage /></SuspenseRoute>} />,
    <Route key="cleanup-bay-area" path="/cleanup/bay-area" element={<SuspenseRoute><CleanupLocalPage /></SuspenseRoute>} />,
    // Legacy redirects for old local page URLs
    <Route key="cleanup-oakland-redirect" path="/cleanup/oakland-construction-cleanup" element={<Navigate to="/cleanup/oakland" replace />} />,
    <Route key="cleanup-alameda-redirect" path="/cleanup/alameda-construction-cleanup" element={<Navigate to="/cleanup/alameda" replace />} />,
    <Route key="cleanup-bay-area-redirect" path="/cleanup/bay-area-construction-cleanup" element={<Navigate to="/cleanup/bay-area" replace />} />,
  ];
}
