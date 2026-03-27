import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { SuspenseRoute } from './shared';

const PlatformLayout = lazy(() => import('@/pages/platform/PlatformLayout'));
const PlatformDashboard = lazy(() => import('@/pages/platform/PlatformDashboard'));
const TenantsPage = lazy(() => import('@/pages/platform/TenantsPage'));
const ProvidersPage = lazy(() => import('@/pages/platform/ProvidersPage'));
const SubscriptionsPage = lazy(() => import('@/pages/platform/SubscriptionsPage'));
const LeadRouterPage = lazy(() => import('@/pages/platform/LeadRouterPage'));
const RoutingRulesPage = lazy(() => import('@/pages/platform/RoutingRulesPage'));
const BillingPage = lazy(() => import('@/pages/platform/BillingPage'));
const PlatformQAPage = lazy(() => import('@/pages/platform/PlatformQAPage'));
const AuditLogPage = lazy(() => import('@/pages/platform/AuditLogPage'));

export function getPlatformRoutes() {
  return [
    <Route key="platform" path="/platform" element={<SuspenseRoute><PlatformLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><PlatformDashboard /></SuspenseRoute>} />
      <Route path="tenants" element={<SuspenseRoute><TenantsPage /></SuspenseRoute>} />
      <Route path="providers" element={<SuspenseRoute><ProvidersPage /></SuspenseRoute>} />
      <Route path="subscriptions" element={<SuspenseRoute><SubscriptionsPage /></SuspenseRoute>} />
      <Route path="lead-router" element={<SuspenseRoute><LeadRouterPage /></SuspenseRoute>} />
      <Route path="routing-rules" element={<SuspenseRoute><RoutingRulesPage /></SuspenseRoute>} />
      <Route path="billing" element={<SuspenseRoute><BillingPage /></SuspenseRoute>} />
      <Route path="qa" element={<SuspenseRoute><PlatformQAPage /></SuspenseRoute>} />
      <Route path="audit" element={<SuspenseRoute><AuditLogPage /></SuspenseRoute>} />
    </Route>,
  ];
}
