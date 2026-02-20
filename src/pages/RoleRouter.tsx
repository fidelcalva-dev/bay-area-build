import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { getRoleDashboard } from '@/lib/crmLinks';

/**
 * /app — Post-login role router.
 * Fetches the user's primary role and redirects to the correct department dashboard.
 * If no role is assigned, sends user to /request-access.
 * Supports ?redirect= param for deep linking.
 */
export default function RoleRouter() {
  const { user, isLoading, getPrimaryRole, roles } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      navigate('/admin/login', { replace: true });
      return;
    }

    if (roles.length === 0) {
      navigate('/request-access', { replace: true });
      return;
    }

    // Handle ?redirect= deep link param
    const redirectPath = searchParams.get('redirect');
    if (redirectPath && redirectPath.startsWith('/') && !redirectPath.startsWith('//')) {
      navigate(redirectPath, { replace: true });
      return;
    }

    const primaryRole = getPrimaryRole();
    const dashboard = getRoleDashboard(primaryRole);
    navigate(dashboard, { replace: true });
  }, [isLoading, user, roles, getPrimaryRole, navigate, searchParams]);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Routing to your dashboard...</p>
        </div>
      </div>
    </>
  );
}
