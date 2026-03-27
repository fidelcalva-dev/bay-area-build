import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tenant {
  id: string;
  tenant_code: string;
  company_name: string;
  legal_entity_name: string | null;
  brand_name: string | null;
  legacy_brand_name: string | null;
  license_number: string | null;
  license_classification: string | null;
  status: string;
  primary_domain: string | null;
  support_email: string | null;
  support_phone: string | null;
  default_timezone: string;
  settings: Record<string, unknown>;
}

export interface TenantRole {
  tenant_id: string;
  role: string;
  is_active: boolean;
}

interface TenantContextValue {
  tenant: Tenant | null;
  tenantId: string | null;
  roles: TenantRole[];
  isLoading: boolean;
  setActiveTenant: (tenantId: string) => void;
  hasRole: (role: string) => boolean;
  isPlatformAdmin: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  tenantId: null,
  roles: [],
  isLoading: true,
  setActiveTenant: () => {},
  hasRole: () => false,
  isPlatformAdmin: false,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [roles, setRoles] = useState<TenantRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);

  useEffect(() => {
    loadUserTenantRoles();
  }, []);

  useEffect(() => {
    if (activeTenantId) {
      loadTenant(activeTenantId);
    }
  }, [activeTenantId]);

  async function loadUserTenantRoles() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data: userRoles } = await supabase
        .from('user_tenant_roles')
        .select('tenant_id, role, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (userRoles && userRoles.length > 0) {
        setRoles(userRoles as TenantRole[]);
        // Auto-select first tenant or stored preference
        const stored = localStorage.getItem('active_tenant_id');
        const validStored = stored && userRoles.some(r => r.tenant_id === stored);
        setActiveTenantId(validStored ? stored : userRoles[0].tenant_id);
      }
    } catch (e) {
      console.error('Failed to load tenant roles', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTenant(tenantId: string) {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    if (data) setTenant(data as unknown as Tenant);
  }

  function setActiveTenant(tenantId: string) {
    localStorage.setItem('active_tenant_id', tenantId);
    setActiveTenantId(tenantId);
  }

  function hasRole(role: string) {
    if (!activeTenantId) return false;
    return roles.some(r => r.tenant_id === activeTenantId && r.role === role && r.is_active);
  }

  const isPlatformAdmin = roles.some(r => r.role === 'PLATFORM_ADMIN' && r.is_active);

  return (
    <TenantContext.Provider value={{
      tenant,
      tenantId: activeTenantId,
      roles,
      isLoading,
      setActiveTenant,
      hasRole,
      isPlatformAdmin,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
