/**
 * CRM Entry Link System
 * Generates correct internal CRM links for staff-only deep linking.
 * Supports login redirect flow and multiple environments.
 */

import type { AppRole } from '@/hooks/useAdminAuth';

const LOGIN_PATH = '/admin/login';

/**
 * Maps a staff role to its default dashboard path.
 */
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: '/admin',
  system_admin: '/admin',
  ops_admin: '/admin',
  sales: '/sales/calls',
  sales_admin: '/sales/calls',
  dispatcher: '/dispatch',
  finance: '/finance',
  finance_admin: '/finance',
  driver: '/driver/runs',
  owner_operator: '/driver/runs',
  customer: '/',
  read_only_admin: '/admin',
};

/**
 * Returns the default dashboard path for a given role.
 */
export function getRoleDashboard(role: AppRole | null): string {
  if (!role) return '/request-access';
  return ROLE_DASHBOARDS[role] || '/request-access';
}

/**
 * Returns the canonical base URL for the current environment.
 * Uses window.location.origin so it works in preview/staging/production automatically.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR or edge functions
  return 'https://calsandumpsterspro.com';
}

/**
 * Builds a login URL that redirects back to the target path after auth.
 */
export function buildLoginRedirect(targetPath: string): string {
  const base = getBaseUrl();
  return `${base}${LOGIN_PATH}?redirect=${encodeURIComponent(targetPath)}`;
}

/**
 * Validates a redirect path to prevent open redirects.
 * Only allows paths starting with "/" and not "//".
 */
export function isValidRedirect(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

// =====================================================
// ENTITY LINK GENERATORS (return path only)
// =====================================================

export function pathToLead(id: string): string {
  return `/admin/leads?id=${id}`;
}

export function pathToQuote(id: string): string {
  return `/admin/orders?quote=${id}`;
}

export function pathToOrder(id: string): string {
  return `/admin/orders?id=${id}`;
}

export function pathToCustomer(id: string): string {
  return `/admin/customers/${id}`;
}

export function pathToInvoice(orderId: string): string {
  return `/finance/invoices/${orderId}`;
}

export function pathToPayment(paymentId: string): string {
  return `/finance/payments/${paymentId}`;
}

export function pathToRun(runId: string): string {
  return `/dispatch/run/${runId}`;
}

export function pathToAsset(idOrCode: string): string {
  return `/admin/assets?asset=${idOrCode}`;
}

// =====================================================
// FULL URL GENERATORS (base + path)
// =====================================================

export function linkToLead(id: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToLead(id)}`;
}

export function linkToQuote(id: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToQuote(id)}`;
}

export function linkToOrder(id: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToOrder(id)}`;
}

export function linkToCustomer(id: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToCustomer(id)}`;
}

export function linkToInvoice(orderId: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToInvoice(orderId)}`;
}

export function linkToPayment(paymentId: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToPayment(paymentId)}`;
}

export function linkToRun(runId: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToRun(runId)}`;
}

export function linkToAsset(idOrCode: string, baseUrl?: string): string {
  return `${baseUrl || getBaseUrl()}${pathToAsset(idOrCode)}`;
}

// =====================================================
// EDGE FUNCTION HELPERS (server-side, needs explicit baseUrl)
// =====================================================

export type CrmEntityType = 'LEAD' | 'QUOTE' | 'ORDER' | 'CUSTOMER' | 'INVOICE' | 'PAYMENT' | 'RUN' | 'ASSET';

export interface CrmLink {
  label: string;
  url: string;
}

/**
 * Build CRM links for a given entity type/id. For use in edge functions.
 */
export function buildCrmLinks(entityType: CrmEntityType, entityId: string, baseUrl: string): CrmLink[] {
  switch (entityType) {
    case 'LEAD':
      return [{ label: 'Open Lead in CRM', url: `${baseUrl}${pathToLead(entityId)}` }];
    case 'QUOTE':
      return [{ label: 'Open Quote in CRM', url: `${baseUrl}${pathToQuote(entityId)}` }];
    case 'ORDER':
      return [{ label: 'Open Order in CRM', url: `${baseUrl}${pathToOrder(entityId)}` }];
    case 'CUSTOMER':
      return [{ label: 'Open Customer in CRM', url: `${baseUrl}${pathToCustomer(entityId)}` }];
    case 'INVOICE':
      return [{ label: 'Open Invoice in CRM', url: `${baseUrl}${pathToInvoice(entityId)}` }];
    case 'PAYMENT':
      return [{ label: 'Open Payment in CRM', url: `${baseUrl}${pathToPayment(entityId)}` }];
    case 'RUN':
      return [{ label: 'Open Run in CRM', url: `${baseUrl}${pathToRun(entityId)}` }];
    case 'ASSET':
      return [{ label: 'Open Asset in CRM', url: `${baseUrl}${pathToAsset(entityId)}` }];
    default:
      return [];
  }
}
