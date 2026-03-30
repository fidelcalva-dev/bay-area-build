import { createContext, useContext, type ReactNode } from 'react';
import { type CrmRole, type LeadWorkspaceConfig, ROLE_CONFIGS } from './types';

const LeadWorkspaceContext = createContext<LeadWorkspaceConfig>(ROLE_CONFIGS.sales);

export function LeadWorkspaceProvider({ role, children }: { role: CrmRole; children: ReactNode }) {
  return (
    <LeadWorkspaceContext.Provider value={ROLE_CONFIGS[role]}>
      {children}
    </LeadWorkspaceContext.Provider>
  );
}

export function useLeadWorkspace() {
  return useContext(LeadWorkspaceContext);
}
