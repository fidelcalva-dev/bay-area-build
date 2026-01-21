import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

type AppRole = 'admin' | 'customer' | 'dispatcher' | 'finance';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isDispatcher: boolean;
  isFinance: boolean;
  isCustomer: boolean;
  roles: AppRole[];
  isLoading: boolean;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isDispatcher: false,
    isFinance: false,
    isCustomer: false,
    roles: [],
    isLoading: true,
  });

  useEffect(() => {
    const fetchRoles = async (user: User) => {
      // Fetch all roles for this user
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const roles = (rolesData?.map((r) => r.role as AppRole) || []);

      setState({
        user,
        isAdmin: roles.includes('admin'),
        isDispatcher: roles.includes('dispatcher'),
        isFinance: roles.includes('finance'),
        isCustomer: roles.includes('customer'),
        roles,
        isLoading: false,
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
            roles: [],
            isLoading: false,
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
          roles: [],
          isLoading: false,
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
    return state.isAdmin || state.isDispatcher || state.isFinance;
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    hasAnyRole,
    canAccessAdmin,
  };
}
