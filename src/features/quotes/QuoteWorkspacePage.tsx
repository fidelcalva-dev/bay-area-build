/**
 * Canonical Quote Workspace Page
 * 
 * Uses the existing SalesQuotes as the canonical quote list.
 */
import { QuoteWorkspaceProvider } from './QuoteWorkspaceContext';
import type { CrmRole } from './types';
import SalesQuotes from '@/pages/sales/SalesQuotes';

interface QuoteWorkspacePageProps {
  mode: CrmRole;
}

export default function QuoteWorkspacePage({ mode }: QuoteWorkspacePageProps) {
  return (
    <QuoteWorkspaceProvider role={mode}>
      <SalesQuotes />
    </QuoteWorkspaceProvider>
  );
}
