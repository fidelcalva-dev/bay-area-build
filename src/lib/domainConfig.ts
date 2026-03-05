/**
 * Domain Configuration
 * Canonical CRM domain and redirect logic.
 */

/** Canonical CRM domain — all CRM routes should resolve here */
export const CANONICAL_CRM_DOMAIN = 'https://app.calsandumpsterspro.com';

/** Legacy CRM domain — should 301 redirect to canonical */
export const LEGACY_CRM_DOMAIN = 'https://crm.calsandumpsterspro.com';

/** Public website domain */
export const PUBLIC_DOMAIN = 'https://calsandumpsterspro.com';

/**
 * Check if current hostname is the legacy CRM domain and redirect to canonical.
 * Call once at app startup.
 */
export function enforceCrmDomainRedirect(): void {
  if (typeof window === 'undefined') return;
  
  const { hostname, pathname, search, hash, protocol } = window.location;
  
  // Enforce HTTPS
  if (protocol === 'http:' && hostname !== 'localhost') {
    window.location.replace(
      `https://${hostname}${pathname}${search}${hash}`
    );
    return;
  }
  
  // Redirect www → non-www for public domain
  if (hostname === 'www.calsandumpsterspro.com') {
    window.location.replace(
      `${PUBLIC_DOMAIN}${pathname}${search}${hash}`
    );
    return;
  }
  
  // If on legacy crm subdomain, redirect to app subdomain
  if (hostname === 'crm.calsandumpsterspro.com') {
    window.location.replace(
      `${CANONICAL_CRM_DOMAIN}${pathname}${search}${hash}`
    );
  }
}

/**
 * Get the staff login URL for the public website footer.
 * In preview/localhost environments, returns a relative path so the link works.
 * In production, points to the canonical CRM domain.
 */
export function getStaffLoginUrl(): string {
  if (typeof window === 'undefined') return `${CANONICAL_CRM_DOMAIN}/app`;
  const { hostname } = window.location;
  // In preview or local dev, use relative path so it doesn't break
  if (hostname === 'localhost' || hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) {
    return '/app';
  }
  return `${CANONICAL_CRM_DOMAIN}/app`;
}

/**
 * Get the portal base URL for links sent in emails/SMS.
 * Uses window.location.origin when available, falls back to public domain.
 */
export function getPortalBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return PUBLIC_DOMAIN;
}
