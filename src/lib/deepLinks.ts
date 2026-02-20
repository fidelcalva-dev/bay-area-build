/**
 * Deep link handler for Capacitor native apps.
 * Maps custom URL scheme to web routes.
 *
 * Scheme: calsancrm://
 * Examples:
 *   calsancrm://lead/abc123      → /sales/leads/abc123
 *   calsancrm://run/abc123       → /dispatch/runs/abc123
 *   calsancrm://order/abc123     → /admin/orders (with filter)
 *   calsancrm://maintenance/issue/abc123 → /admin/maintenance/issues
 */

export function resolveDeepLink(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname || parsed.pathname.split('/')[0];
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    // Handle calsancrm:// scheme
    if (parsed.protocol === 'calsancrm:') {
      const entity = host || pathParts[0];
      const id = pathParts[0] === entity ? pathParts[1] : pathParts[0];

      switch (entity) {
        case 'lead':
          return id ? `/sales/leads/${id}` : '/sales/leads';
        case 'run':
          return id ? `/dispatch/runs/${id}` : '/dispatch/runs';
        case 'order':
          return id ? `/admin/orders?id=${id}` : '/admin/orders';
        case 'maintenance':
          if (pathParts.includes('issue')) {
            const issueId = pathParts[pathParts.indexOf('issue') + 1];
            return issueId ? `/admin/maintenance/issues?id=${issueId}` : '/admin/maintenance/issues';
          }
          return '/admin/maintenance';
        case 'invoice':
          return id ? `/finance/invoices/${id}` : '/finance/invoices';
        default:
          return '/app';
      }
    }

    // Handle https:// universal links
    return parsed.pathname || '/app';
  } catch {
    return '/app';
  }
}

/**
 * Initialize deep link listener for Capacitor.
 * Call this once in App component.
 */
export function initDeepLinkListener(navigate: (path: string) => void) {
  // Listen for custom URL scheme opens
  if (typeof window !== 'undefined') {
    // Capacitor App plugin would be used here:
    // import { App as CapApp } from '@capacitor/app';
    // CapApp.addListener('appUrlOpen', ({ url }) => {
    //   const route = resolveDeepLink(url);
    //   navigate(route);
    // });

    // For web, handle window.location changes
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        const route = resolveDeepLink(`calsancrm://${hash.slice(2)}`);
        navigate(route);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }
}
