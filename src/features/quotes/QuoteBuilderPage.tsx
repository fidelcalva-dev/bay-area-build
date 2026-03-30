/**
 * Canonical Quote Builder Page
 * 
 * Wraps the existing InternalCalculator (Master Calculator) with role context.
 */
import { QuoteWorkspaceProvider } from './QuoteWorkspaceContext';
import type { CrmRole } from './types';
import InternalCalculator from '@/pages/internal/InternalCalculator';

interface QuoteBuilderPageProps {
  mode: CrmRole;
}

export default function QuoteBuilderPage({ mode }: QuoteBuilderPageProps) {
  return (
    <QuoteWorkspaceProvider role={mode}>
      <InternalCalculator />
    </QuoteWorkspaceProvider>
  );
}
