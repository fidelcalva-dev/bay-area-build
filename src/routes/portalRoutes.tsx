import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { SuspenseRoute } from './shared';
import { PortalAuthGuard } from '@/components/portal/PortalAuthGuard';

// Customer Portal pages
const CustomerLogin = lazy(() => import("@/pages/portal/CustomerLogin"));
const CustomerDashboard = lazy(() => import("@/pages/portal/CustomerDashboard"));
const CustomerOrders = lazy(() => import("@/pages/portal/CustomerOrders"));
const CustomerDocuments = lazy(() => import("@/pages/portal/CustomerDocuments"));
const CustomerOrderDetail = lazy(() => import("@/pages/portal/CustomerOrderDetail"));
const PaymentComplete = lazy(() => import("@/pages/portal/PaymentComplete"));
const PortalTrack = lazy(() => import("@/pages/portal/PortalTrack"));
const PortalQuoteView = lazy(() => import("@/pages/portal/PortalQuoteView"));
const PortalSchedule = lazy(() => import("@/pages/portal/PortalSchedule"));
const PortalPay = lazy(() => import("@/pages/portal/PortalPay"));
const SignQuoteContract = lazy(() => import("@/pages/portal/SignQuoteContract"));
const PortalActivate = lazy(() => import("@/pages/portal/PortalActivate"));
const ContractSignPage = lazy(() => import("@/pages/contract/ContractSignPage"));
const PaymentRedirect = lazy(() => import("@/pages/portal/PaymentRedirect"));

// Green Halo Portal pages (demo)
const PortalLogin = lazy(() => import("@/pages/portal/PortalLogin"));
const PortalDashboard = lazy(() => import("@/pages/portal/PortalDashboard"));
const ProjectDetail = lazy(() => import("@/pages/portal/ProjectDetail"));
const SustainabilityReport = lazy(() => import("@/pages/portal/SustainabilityReport"));

export function getPortalRoutes() {
  return [
    // Customer Portal (SMS OTP Auth)
    <Route key="portal" path="/portal" element={<SuspenseRoute><CustomerLogin /></SuspenseRoute>} />,
    <Route key="portal-track" path="/portal/track" element={<SuspenseRoute><PortalTrack /></SuspenseRoute>} />,
    <Route key="portal-dashboard" path="/portal/dashboard" element={
      <PortalAuthGuard><SuspenseRoute><CustomerDashboard /></SuspenseRoute></PortalAuthGuard>
    } />,
    <Route key="portal-orders" path="/portal/orders" element={
      <PortalAuthGuard><SuspenseRoute><CustomerOrders /></SuspenseRoute></PortalAuthGuard>
    } />,
    <Route key="portal-documents" path="/portal/documents" element={
      <PortalAuthGuard><SuspenseRoute><CustomerDocuments /></SuspenseRoute></PortalAuthGuard>
    } />,
    <Route key="portal-order-legacy" path="/portal/order/:orderId" element={
      <PortalAuthGuard><SuspenseRoute><CustomerOrderDetail /></SuspenseRoute></PortalAuthGuard>
    } />,
    <Route key="portal-order" path="/portal/orders/:orderId" element={
      <PortalAuthGuard><SuspenseRoute><CustomerOrderDetail /></SuspenseRoute></PortalAuthGuard>
    } />,
    <Route key="portal-payment-complete" path="/portal/payment-complete" element={
      <PortalAuthGuard><SuspenseRoute><PaymentComplete /></SuspenseRoute></PortalAuthGuard>
    } />,
    // SMS-accessible (no OTP required)
    <Route key="portal-quote" path="/portal/quote/:quoteId" element={<SuspenseRoute><PortalQuoteView /></SuspenseRoute>} />,
    <Route key="portal-schedule" path="/portal/schedule" element={<SuspenseRoute><PortalSchedule /></SuspenseRoute>} />,
    <Route key="portal-pay" path="/portal/pay" element={<SuspenseRoute><PortalPay /></SuspenseRoute>} />,
    <Route key="portal-sign" path="/portal/sign-quote-contract" element={<SuspenseRoute><SignQuoteContract /></SuspenseRoute>} />,
    <Route key="contract-sign" path="/contract/:token" element={<SuspenseRoute><ContractSignPage /></SuspenseRoute>} />,
    <Route key="portal-activate" path="/portal/activate" element={<SuspenseRoute><PortalActivate /></SuspenseRoute>} />,
    <Route key="portal-pay-redirect" path="/portal/pay/:paymentId" element={<SuspenseRoute><PaymentRedirect /></SuspenseRoute>} />,
    // Green Halo Client Portal
    <Route key="gh-portal" path="/green-halo/portal" element={<SuspenseRoute><PortalLogin /></SuspenseRoute>} />,
    <Route key="gh-dashboard" path="/green-halo/portal/dashboard" element={<SuspenseRoute><PortalDashboard /></SuspenseRoute>} />,
    <Route key="gh-project" path="/green-halo/portal/project/:projectId" element={<SuspenseRoute><ProjectDetail /></SuspenseRoute>} />,
    <Route key="gh-report" path="/green-halo/portal/report" element={<SuspenseRoute><SustainabilityReport /></SuspenseRoute>} />,
  ];
}
