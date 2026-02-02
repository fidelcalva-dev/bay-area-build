// Portal Authentication Guard Component
// Protects customer portal routes by requiring SMS OTP authentication OR valid portal token

import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useValidatePortalToken } from '@/hooks/usePortalLink';
import { Loader2 } from 'lucide-react';

interface PortalAuthGuardProps {
  children: ReactNode;
  allowToken?: boolean; // Whether to allow token-based access for this route
}

/**
 * Guards portal routes - allows access via:
 * 1. SMS OTP authentication (standard)
 * 2. Valid portal token (for magic links)
 */
export function PortalAuthGuard({ children, allowToken = true }: PortalAuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams<{ orderId?: string }>();
  
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth();
  
  // Check for token in URL
  const token = searchParams.get('token');
  const orderId = params.orderId;
  
  // Token validation (only runs if token is present)
  const { 
    data: tokenValidation, 
    isLoading: tokenLoading,
    error: tokenError 
  } = useValidatePortalToken(orderId || '', allowToken ? token : null);
  
  // Local state for token-based session
  const [tokenVerified, setTokenVerified] = useState(false);

  // Handle token validation result
  useEffect(() => {
    if (tokenValidation?.valid) {
      setTokenVerified(true);
      // Store token validation in session for subsequent pages
      sessionStorage.setItem('portal_token_order', orderId || '');
      sessionStorage.setItem('portal_token_valid', 'true');
    }
  }, [tokenValidation, orderId]);

  // Check if we have a previously validated token session
  useEffect(() => {
    if (orderId && !token) {
      const storedOrder = sessionStorage.getItem('portal_token_order');
      const storedValid = sessionStorage.getItem('portal_token_valid');
      if (storedOrder === orderId && storedValid === 'true') {
        setTokenVerified(true);
      }
    }
  }, [orderId, token]);

  // Redirect to login if neither authenticated nor token-verified
  useEffect(() => {
    // Wait for loading states to complete
    if (authLoading || (token && tokenLoading)) {
      return;
    }
    
    // Has valid authentication via either method
    if (isAuthenticated || tokenVerified || tokenValidation?.valid) {
      return;
    }
    
    // Token was provided but invalid
    if (token && tokenError) {
      console.error('Token validation failed:', tokenError);
    }
    
    // No valid auth method - redirect to login
    const returnTo = location.pathname + location.search;
    navigate(`/portal?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
  }, [isAuthenticated, tokenVerified, tokenValidation, authLoading, tokenLoading, token, tokenError, navigate, location]);

  // Show loading state while checking auth
  const isLoading = authLoading || (token && tokenLoading);
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

  // Don't render children if not authenticated or token-verified
  const hasAccess = isAuthenticated || tokenVerified || tokenValidation?.valid;
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

export default PortalAuthGuard;
