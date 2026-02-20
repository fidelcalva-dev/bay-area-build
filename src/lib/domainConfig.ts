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
  
  const { hostname, pathname, search, hash } = window.location;
  
  // If on legacy crm subdomain, redirect to app subdomain
  if (hostname === 'crm.calsandumpsterspro.com') {
    window.location.replace(
      `${CANONICAL_CRM_DOMAIN}${pathname}${search}${hash}`
    );
  }
}

/**
 * Get the staff login URL for the public website footer.
 */
export function getStaffLoginUrl(): string {
  return `${CANONICAL_CRM_DOMAIN}/app`;
}
