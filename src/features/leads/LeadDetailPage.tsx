/**
 * Canonical Lead Detail Page
 * 
 * Wraps the existing LeadDetail component with role context.
 */
import { LeadWorkspaceProvider } from './LeadWorkspaceContext';
import type { CrmRole } from './types';
import LeadDetail from '@/pages/sales/LeadDetail';

interface LeadDetailPageProps {
  mode: CrmRole;
}

export default function LeadDetailPage({ mode }: LeadDetailPageProps) {
  return (
    <LeadWorkspaceProvider role={mode}>
      <LeadDetail />
    </LeadWorkspaceProvider>
  );
}
