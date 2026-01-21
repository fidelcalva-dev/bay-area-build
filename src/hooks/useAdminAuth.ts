import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'customer' | 'dispatcher' | 'finance' | 'driver' | 'sales' | 'owner_operator';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isDispatcher: boolean;
  isFinance: boolean;
  isCustomer: boolean;
  isSales: boolean;
  isDriver: boolean;
  isOwnerOperator: boolean;
  roles: AppRole[];
  isLoading: boolean;
  driverId: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isDispatcher: false,
    isFinance: false,
    isCustomer: false,
    isSales: false,
    isDriver: false,
    isOwnerOperator: false,
    roles: [],
    isLoading: true,
    driverId: null,
  });

  useEffect(() => {
    const fetchRoles = async (user: User) => {
      // Fetch all roles for this user
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const roles = (rolesData?.map((r) => r.role as AppRole) || []);

      // Check if user is linked to a driver
      let driverId: string | null = null;
      if (roles.includes('driver') || roles.includes('owner_operator')) {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        driverId = driverData?.id || null;
      }

      setState({
        user,
        isAdmin: roles.includes('admin'),
        isDispatcher: roles.includes('dispatcher'),
        isFinance: roles.includes('finance'),
        isCustomer: roles.includes('customer'),
        isSales: roles.includes('sales'),
        isDriver: roles.includes('driver'),
        isOwnerOperator: roles.includes('owner_operator'),
        roles,
        isLoading: false,
        driverId,
      });
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;

        if (user) {
          await fetchRoles(user);
        } else {
          setState({
            user: null,
            isAdmin: false,
            isDispatcher: false,
            isFinance: false,
            isCustomer: false,
            isSales: false,
            isDriver: false,
            isOwnerOperator: false,
            roles: [],
            isLoading: false,
            driverId: null,
          });
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;

      if (user) {
        await fetchRoles(user);
      } else {
        setState({
          user: null,
          isAdmin: false,
          isDispatcher: false,
          isFinance: false,
          isCustomer: false,
          isSales: false,
          isDriver: false,
          isOwnerOperator: false,
          roles: [],
          isLoading: false,
          driverId: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (...checkRoles: AppRole[]) => {
    return checkRoles.some((r) => state.roles.includes(r));
  };

  // Check if user can access admin portal (any staff role)
  const canAccessAdmin = () => {
    return state.isAdmin || state.isDispatcher || state.isFinance || state.isSales;
  };

  // Check if user can access driver app
  const canAccessDriver = () => {
    return state.isDriver || state.isOwnerOperator || state.isAdmin;
  };

  // Get primary role for routing
  const getPrimaryRole = (): AppRole | null => {
    if (state.isAdmin) return 'admin';
    if (state.isSales) return 'sales';
    if (state.isDispatcher) return 'dispatcher';
    if (state.isFinance) return 'finance';
    if (state.isOwnerOperator) return 'owner_operator';
    if (state.isDriver) return 'driver';
    if (state.isCustomer) return 'customer';
    return null;
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    hasAnyRole,
    canAccessAdmin,
    canAccessDriver,
    getPrimaryRole,
  };
}
