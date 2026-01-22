import { ReactNode } from 'react';
import { Shield, Lock } from 'lucide-react';
import { useAdminPermissions, type AdminModule, type PermissionAction } from '@/hooks/useAdminPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PermissionGateProps {
  module: AdminModule;
  action?: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

/**
 * Gates content based on admin permissions for a specific module
 */
export function PermissionGate({
  module,
  action = 'read',
  children,
  fallback,
  showAccessDenied = true,
}: PermissionGateProps) {
  const { hasPermission, isLoading, canAccessConfig } = useAdminPermissions();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Checking permissions...</div>
      </div>
    );
  }

  // First check if user can access config at all
  if (!canAccessConfig()) {
    if (!showAccessDenied) return fallback || null;
    
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access the configuration area.
            Contact your system administrator for access.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check specific module permission
  if (!hasPermission(module, action)) {
    if (!showAccessDenied) return fallback || null;

    const actionLabel = {
      read: 'view',
      write: 'edit',
      approve: 'approve changes to',
      delete: 'delete from',
    }[action];

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle>Permission Required</CardTitle>
          <CardDescription>
            You don't have permission to {actionLabel} this module.
            Your role may have read-only access.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" onClick={() => navigate('/admin/configuration')}>
            Back to Configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

interface WriteProtectedProps {
  module: AdminModule;
  children: ReactNode;
  readOnlyFallback?: ReactNode;
}

/**
 * Shows content if user has write access, otherwise shows read-only fallback
 */
export function WriteProtected({ module, children, readOnlyFallback }: WriteProtectedProps) {
  const { hasPermission } = useAdminPermissions();

  if (!hasPermission(module, 'write')) {
    return readOnlyFallback ? <>{readOnlyFallback}</> : null;
  }

  return <>{children}</>;
}

interface ApprovalRequiredProps {
  module: AdminModule;
  children: ReactNode;
  onRequiresApproval: () => void;
}

/**
 * Checks if changes require approval workflow
 */
export function ApprovalRequired({ module, children, onRequiresApproval }: ApprovalRequiredProps) {
  const { requiresApproval, hasPermission } = useAdminPermissions();

  if (!hasPermission(module, 'write')) {
    return null;
  }

  if (requiresApproval(module) && !hasPermission(module, 'approve')) {
    // User can write but changes need approval
    return (
      <div onClick={onRequiresApproval}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
