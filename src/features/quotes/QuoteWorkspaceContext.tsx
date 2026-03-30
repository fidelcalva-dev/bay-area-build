import { createContext, useContext, type ReactNode } from 'react';
import { type CrmRole, type QuoteWorkspaceConfig, QUOTE_ROLE_CONFIGS } from './types';

const QuoteWorkspaceContext = createContext<QuoteWorkspaceConfig>(QUOTE_ROLE_CONFIGS.sales);

export function QuoteWorkspaceProvider({ role, children }: { role: CrmRole; children: ReactNode }) {
  return (
    <QuoteWorkspaceContext.Provider value={QUOTE_ROLE_CONFIGS[role]}>
      {children}
    </QuoteWorkspaceContext.Provider>
  );
}

export function useQuoteWorkspace() {
  return useContext(QuoteWorkspaceContext);
}
