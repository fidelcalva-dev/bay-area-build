import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { SuspenseRoute } from './shared';

// Driver App
const DriverLayout = lazy(() => import("@/pages/driver/DriverLayout"));
const DriverHome = lazy(() => import("@/pages/driver/DriverHome"));
const DriverRunDetail = lazy(() => import("@/pages/driver/DriverRunDetail"));
const DriverRuns = lazy(() => import("@/pages/driver/DriverRuns"));
const DriverProfile = lazy(() => import("@/pages/driver/DriverProfile"));
const DriverTruckSelect = lazy(() => import("@/pages/driver/DriverTruckSelect"));
const DriverPreTrip = lazy(() => import("@/pages/driver/DriverPreTrip"));
const DriverReportIssue = lazy(() => import("@/pages/driver/DriverReportIssue"));

// CS Portal
const CSLayout = lazy(() => import("@/pages/cs/CSLayout"));
const CSDashboard = lazy(() => import("@/pages/cs/CSDashboard"));
const CSOrders = lazy(() => import("@/pages/cs/CSOrders"));
const CSRequests = lazy(() => import("@/pages/cs/CSRequests"));
const CSTemplates = lazy(() => import("@/pages/cs/CSTemplates"));
const CSMessages = lazy(() => import("@/pages/cs/CSMessages"));
const CSCalls = lazy(() => import("@/pages/cs/CSCalls"));
const CSLeads = lazy(() => import("@/pages/cs/CSLeads"));
const CSLeadInbox = lazy(() => import("@/pages/cs/CSLeadInbox"));

// Sales Portal
const SalesLayout = lazy(() => import("@/pages/sales/SalesLayout"));
const SalesDashboard = lazy(() => import("@/pages/sales/SalesDashboard"));
const SalesLeads = lazy(() => import("@/pages/sales/SalesLeads"));
const SalesLeadDetail = lazy(() => import("@/pages/sales/LeadDetail"));
const SalesQuotes = lazy(() => import("@/pages/sales/SalesQuotes"));
const SalesQuoteDetail = lazy(() => import("@/pages/sales/SalesQuoteDetail"));
const SalesNewQuote = lazy(() => import("@/pages/internal/InternalCalculator"));
const SalesCalls = lazy(() => import("@/pages/sales/SalesCalls"));
const OrderBuilder = lazy(() => import("@/pages/sales/OrderBuilder"));

// Dispatch Portal
const DispatchLayout = lazy(() => import("@/pages/dispatch/DispatchLayout"));
const DispatchDashboard = lazy(() => import("@/pages/dispatch/DispatchDashboard"));
const DispatchToday = lazy(() => import("@/pages/dispatch/DispatchToday"));
const DispatchCalendarPage = lazy(() => import("@/pages/dispatch/DispatchCalendarPage"));
const DispatchFlags = lazy(() => import("@/pages/dispatch/DispatchFlags"));
const DispatchRequests = lazy(() => import("@/pages/dispatch/DispatchRequests"));
const ControlTower = lazy(() => import("@/pages/dispatch/ControlTower"));
const RouteHistory = lazy(() => import("@/pages/dispatch/RouteHistory"));
const FacilitiesFinder = lazy(() => import("@/pages/dispatch/FacilitiesFinder"));
const YardHoldBoard = lazy(() => import("@/pages/dispatch/YardHoldBoard"));
const TruckCameras = lazy(() => import("@/pages/dispatch/TruckCameras"));

// Finance Portal
const FinanceLayout = lazy(() => import("@/pages/finance/FinanceLayout"));
const FinanceDashboard = lazy(() => import("@/pages/finance/FinanceDashboard"));
const FinanceInvoices = lazy(() => import("@/pages/finance/FinanceInvoices"));
const FinanceInvoiceDetail = lazy(() => import("@/pages/finance/FinanceInvoiceDetail"));
const FinancePayments = lazy(() => import("@/pages/finance/FinancePayments"));
const FinancePaymentDetail = lazy(() => import("@/pages/finance/FinancePaymentDetail"));
const FinancePaymentActions = lazy(() => import("@/pages/finance/FinancePaymentActions"));
const ARAgingDashboard = lazy(() => import("@/pages/finance/ARAgingDashboard"));
const ARAgingInvoices = lazy(() => import("@/pages/finance/ARAgingInvoices"));
const ARAgingCustomers = lazy(() => import("@/pages/finance/ARAgingCustomers"));

// Internal Calculator
const InternalCalculator = lazy(() => import("@/pages/internal/InternalCalculator"));

export function getDriverRoutes() {
  return [
    <Route key="driver" path="/driver" element={<SuspenseRoute><DriverLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><DriverHome /></SuspenseRoute>} />
      <Route path="runs/:id" element={<SuspenseRoute><DriverRunDetail /></SuspenseRoute>} />
      <Route path="runs" element={<SuspenseRoute><DriverRuns /></SuspenseRoute>} />
      <Route path="profile" element={<SuspenseRoute><DriverProfile /></SuspenseRoute>} />
      <Route path="truck-select" element={<SuspenseRoute><DriverTruckSelect /></SuspenseRoute>} />
      <Route path="inspect" element={<SuspenseRoute><DriverPreTrip /></SuspenseRoute>} />
      <Route path="report-issue" element={<SuspenseRoute><DriverReportIssue /></SuspenseRoute>} />
    </Route>,
    <Route key="driver-legacy" path="/driver/legacy" element={<Navigate to="/driver" replace />} />,
  ];
}

export function getCsRoutes() {
  return [
    <Route key="cs" path="/cs" element={<SuspenseRoute><CSLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><CSDashboard /></SuspenseRoute>} />
      <Route path="orders" element={<SuspenseRoute><CSOrders /></SuspenseRoute>} />
      <Route path="requests" element={<SuspenseRoute><CSRequests /></SuspenseRoute>} />
      <Route path="templates" element={<SuspenseRoute><CSTemplates /></SuspenseRoute>} />
      <Route path="messages" element={<SuspenseRoute><CSMessages /></SuspenseRoute>} />
      <Route path="calls" element={<SuspenseRoute><CSCalls /></SuspenseRoute>} />
      <Route path="leads" element={<SuspenseRoute><CSLeads /></SuspenseRoute>} />
      <Route path="lead-inbox" element={<SuspenseRoute><CSLeadInbox /></SuspenseRoute>} />
    </Route>,
  ];
}

export function getSalesRoutes() {
  return [
    <Route key="sales" path="/sales" element={<SuspenseRoute><SalesLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><SalesDashboard /></SuspenseRoute>} />
      <Route path="leads" element={<SuspenseRoute><SalesLeads /></SuspenseRoute>} />
      <Route path="leads/:id" element={<SuspenseRoute><SalesLeadDetail /></SuspenseRoute>} />
      <Route path="quotes" element={<SuspenseRoute><SalesQuotes /></SuspenseRoute>} />
      <Route path="quotes/:id" element={<SuspenseRoute><SalesQuoteDetail /></SuspenseRoute>} />
      <Route path="quotes/new" element={<SuspenseRoute><SalesNewQuote /></SuspenseRoute>} />
      <Route path="calls" element={<SuspenseRoute><SalesCalls /></SuspenseRoute>} />
      <Route path="inbox" element={<Navigate to="/sales/leads" replace />} />
      <Route path="lead-hub" element={<Navigate to="/sales/leads" replace />} />
      <Route path="order-builder" element={<SuspenseRoute><OrderBuilder /></SuspenseRoute>} />
    </Route>,
  ];
}

export function getDispatchRoutes() {
  return [
    <Route key="dispatch" path="/dispatch" element={<SuspenseRoute><DispatchLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><DispatchDashboard /></SuspenseRoute>} />
      <Route path="today" element={<SuspenseRoute><DispatchToday /></SuspenseRoute>} />
      <Route path="calendar" element={<SuspenseRoute><DispatchCalendarPage /></SuspenseRoute>} />
      <Route path="flags" element={<SuspenseRoute><DispatchFlags /></SuspenseRoute>} />
      <Route path="requests" element={<SuspenseRoute><DispatchRequests /></SuspenseRoute>} />
      <Route path="control-tower" element={<SuspenseRoute><ControlTower /></SuspenseRoute>} />
      <Route path="history" element={<SuspenseRoute><RouteHistory /></SuspenseRoute>} />
      <Route path="facilities" element={<SuspenseRoute><FacilitiesFinder /></SuspenseRoute>} />
      <Route path="yard-hold" element={<SuspenseRoute><YardHoldBoard /></SuspenseRoute>} />
      <Route path="truck-cameras/:truckId" element={<SuspenseRoute><TruckCameras /></SuspenseRoute>} />
    </Route>,
  ];
}

export function getFinanceRoutes() {
  return [
    <Route key="finance" path="/finance" element={<SuspenseRoute><FinanceLayout /></SuspenseRoute>}>
      <Route index element={<SuspenseRoute><FinanceDashboard /></SuspenseRoute>} />
      <Route path="invoices" element={<SuspenseRoute><FinanceInvoices /></SuspenseRoute>} />
      <Route path="invoices/:orderId" element={<SuspenseRoute><FinanceInvoiceDetail /></SuspenseRoute>} />
      <Route path="payments" element={<SuspenseRoute><FinancePayments /></SuspenseRoute>} />
      <Route path="payments/:paymentId" element={<SuspenseRoute><FinancePaymentDetail /></SuspenseRoute>} />
      <Route path="payment-actions" element={<SuspenseRoute><FinancePaymentActions /></SuspenseRoute>} />
      <Route path="ar-aging" element={<SuspenseRoute><ARAgingDashboard /></SuspenseRoute>} />
      <Route path="ar-aging/invoices" element={<SuspenseRoute><ARAgingInvoices /></SuspenseRoute>} />
      <Route path="ar-aging/customers" element={<SuspenseRoute><ARAgingCustomers /></SuspenseRoute>} />
    </Route>,
  ];
}

export function getCalculatorRoutes() {
  return [
    <Route key="internal-calc" path="/internal/calculator" element={<SuspenseRoute><InternalCalculator /></SuspenseRoute>} />,
    <Route key="ops-calc" path="/ops/calculator" element={<SuspenseRoute><InternalCalculator /></SuspenseRoute>} />,
    <Route key="sales-calc" path="/sales/calculator" element={<SuspenseRoute><InternalCalculator /></SuspenseRoute>} />,
    <Route key="cs-calc" path="/cs/calculator" element={<SuspenseRoute><InternalCalculator /></SuspenseRoute>} />,
    <Route key="dispatch-calc" path="/dispatch/calculator" element={<SuspenseRoute><InternalCalculator /></SuspenseRoute>} />,
  ];
}
