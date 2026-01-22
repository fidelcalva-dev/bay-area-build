// Portal Authentication Guard Component
// Protects customer portal routes by requiring SMS OTP authentication

import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Loader2 } from 'lucide-react';

interface PortalAuthGuardProps {
  children: ReactNode;
}

/**
 * Guards portal routes - redirects to login if not authenticated
 */
export function PortalAuthGuard({ children }: PortalAuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useCustomerAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store intended destination for redirect after login
      const returnTo = location.pathname + location.search;
      navigate(`/portal?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default PortalAuthGuard;
