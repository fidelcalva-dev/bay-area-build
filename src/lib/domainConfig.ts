/**
 * Domain Configuration
 * Canonical CRM domain and redirect logic.
 */

/** Public website domain — CRM runs on the same domain via path-based routing */
export const PUBLIC_DOMAIN = 'https://calsandumpsterspro.com';

/**
 * Enforce HTTPS and www → non-www redirect.
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
  
  // Redirect www → non-www
  if (hostname === 'www.calsandumpsterspro.com') {
    window.location.replace(
      `${PUBLIC_DOMAIN}${pathname}${search}${hash}`
    );
    return;
  }
  
  // Redirect legacy subdomains to main domain preserving path
  if (hostname === 'crm.calsandumpsterspro.com' || hostname === 'app.calsandumpsterspro.com') {
    window.location.replace(
      `${PUBLIC_DOMAIN}${pathname}${search}${hash}`
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
