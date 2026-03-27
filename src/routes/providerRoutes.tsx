import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { SuspenseRoute } from './shared';

const ProviderJoin = lazy(() => import('@/pages/providers/ProviderJoin'));
const ProviderPricing = lazy(() => import('@/pages/providers/ProviderPricing'));
const ProviderFAQ = lazy(() => import('@/pages/providers/ProviderFAQ'));
const ProviderLogin = lazy(() => import('@/pages/providers/ProviderLogin'));
const ProviderDashboard = lazy(() => import('@/pages/providers/ProviderDashboard'));

export function getProviderRoutes() {
  return [
    <Route key="provider-join" path="/providers/join" element={<SuspenseRoute><ProviderJoin /></SuspenseRoute>} />,
    <Route key="provider-pricing" path="/providers/pricing" element={<SuspenseRoute><ProviderPricing /></SuspenseRoute>} />,
    <Route key="provider-faq" path="/providers/faq" element={<SuspenseRoute><ProviderFAQ /></SuspenseRoute>} />,
    <Route key="provider-login" path="/providers/login" element={<SuspenseRoute><ProviderLogin /></SuspenseRoute>} />,
    <Route key="provider-dashboard" path="/providers/dashboard" element={<SuspenseRoute><ProviderDashboard /></SuspenseRoute>} />,
  ];
}
