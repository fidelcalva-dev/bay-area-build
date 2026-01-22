// Protected Portal Route wrapper for lazy-loaded components
import { Suspense, lazy, ComponentType } from 'react';
import { PortalAuthGuard } from './PortalAuthGuard';

interface ProtectedPortalRouteProps {
  component: ComponentType;
}

// Page loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * Wraps a portal route component with auth protection
 */
export function ProtectedPortalRoute({ component: Component }: ProtectedPortalRouteProps) {
  return (
    <PortalAuthGuard>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </PortalAuthGuard>
  );
}

export default ProtectedPortalRoute;
