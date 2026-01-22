import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth, type AppRole } from './useAdminAuth';

export type AdminModule = 
  | 'yards' | 'zones' | 'city_rates' | 'toll_surcharges' 
  | 'heavy_pricing' | 'mixed_rules' | 'extras' | 'warnings_caps'
  | 'config' | 'users' | 'audit' | 'contracts' | 'notifications' 
  | 'programs' | 'fraud';

export type PermissionAction = 'read' | 'write' | 'approve' | 'delete';

interface ModulePermission {
  module: AdminModule;
  canRead: boolean;
  canWrite: boolean;
  canApprove: boolean;
  canDelete: boolean;
}

interface AdminPermissionsState {
  permissions: ModulePermission[];
  isLoading: boolean;
  error: string | null;
}

// Admin roles that can access config
const ADMIN_ROLES: AppRole[] = ['admin', 'system_admin', 'ops_admin', 'finance_admin', 'sales_admin', 'read_only_admin'];

// Critical modules that require approval workflow
export const CRITICAL_MODULES: AdminModule[] = ['city_rates', 'heavy_pricing', 'toll_surcharges', 'programs'];

export function useAdminPermissions() {
  const { user, roles, isLoading: authLoading } = useAdminAuth();
  const [state, setState] = useState<AdminPermissionsState>({
    permissions: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState({ permissions: [], isLoading: false, error: null });
      return;
    }

    const fetchPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_permissions')
          .select('*')
          .in('role', roles);

        if (error) throw error;

        // Merge permissions from all roles (highest permission wins)
        const permissionMap = new Map<AdminModule, ModulePermission>();

        data?.forEach((p) => {
          const module = p.module as AdminModule;
          const existing = permissionMap.get(module);
          
          if (existing) {
            permissionMap.set(module, {
              module,
              canRead: existing.canRead || p.can_read,
              canWrite: existing.canWrite || p.can_write,
              canApprove: existing.canApprove || p.can_approve,
              canDelete: existing.canDelete || p.can_delete,
            });
          } else {
            permissionMap.set(module, {
              module,
              canRead: p.can_read,
              canWrite: p.can_write,
              canApprove: p.can_approve,
              canDelete: p.can_delete,
            });
          }
        });

        setState({
          permissions: Array.from(permissionMap.values()),
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState({
          permissions: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load permissions',
        });
      }
    };

    fetchPermissions();
  }, [user, roles, authLoading]);

  const hasPermission = useCallback((module: AdminModule, action: PermissionAction): boolean => {
    const permission = state.permissions.find((p) => p.module === module);
    if (!permission) return false;

    switch (action) {
      case 'read': return permission.canRead;
      case 'write': return permission.canWrite;
      case 'approve': return permission.canApprove;
      case 'delete': return permission.canDelete;
      default: return false;
    }
  }, [state.permissions]);

  const canAccessConfig = useCallback((): boolean => {
    return roles.some((r) => ADMIN_ROLES.includes(r));
  }, [roles]);

  const canAccessUsers = useCallback((): boolean => {
    return roles.includes('admin') || roles.includes('system_admin');
  }, [roles]);

  const canAccessAudit = useCallback((): boolean => {
    return roles.some((r) => ADMIN_ROLES.includes(r));
  }, [roles]);

  const isSystemAdmin = useCallback((): boolean => {
    return roles.includes('admin') || roles.includes('system_admin');
  }, [roles]);

  const requiresApproval = useCallback((module: AdminModule): boolean => {
    return CRITICAL_MODULES.includes(module) && !isSystemAdmin();
  }, [isSystemAdmin]);

  const getModulePermissions = useCallback((module: AdminModule): ModulePermission | null => {
    return state.permissions.find((p) => p.module === module) || null;
  }, [state.permissions]);

  return {
    ...state,
    hasPermission,
    canAccessConfig,
    canAccessUsers,
    canAccessAudit,
    isSystemAdmin,
    requiresApproval,
    getModulePermissions,
  };
}
