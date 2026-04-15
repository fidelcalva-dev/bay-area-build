import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface RoleGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

/**
 * Role-based auth guard.
 * - No session → redirect to /staff (login)
 * - Wrong role → redirect to /unauthorized
 * - Correct role → render children
 *
 * Admin-level roles (owner, admin, system_admin, executive, ops_admin)
 * are always granted access.
 */
export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, roles, isLoading, isAdmin } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/staff" replace />;
  }

  // Admin-level users always pass
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user has at least one allowed role
  const hasAccess = roles.some(r => allowedRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
