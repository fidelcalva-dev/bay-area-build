/**
 * Canonical Quote Detail Page
 * 
 * Wraps the existing SalesQuoteDetail with role context.
 */
import { QuoteWorkspaceProvider } from './QuoteWorkspaceContext';
import type { CrmRole } from './types';
import SalesQuoteDetail from '@/pages/sales/SalesQuoteDetail';

interface QuoteDetailPageProps {
  mode: CrmRole;
}

export default function QuoteDetailPage({ mode }: QuoteDetailPageProps) {
  return (
    <QuoteWorkspaceProvider role={mode}>
      <SalesQuoteDetail />
    </QuoteWorkspaceProvider>
  );
}
