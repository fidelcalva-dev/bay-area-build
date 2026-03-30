/**
 * Canonical Lead Workspace Page
 * 
 * This is the ONE lead workspace used by Sales, CS, and Admin.
 * The underlying component is the existing SalesLeads page, which already has:
 * - Table view, Pipeline board, Cleanup board
 * - All saved views, filters, badges, SLA
 * - Add Lead, Export PDF
 * 
 * Role-specific behavior is controlled via LeadWorkspaceContext.
 */
import { LeadWorkspaceProvider } from './LeadWorkspaceContext';
import type { CrmRole } from './types';
import SalesLeads from '@/pages/sales/SalesLeads';

interface LeadWorkspacePageProps {
  mode: CrmRole;
}

export default function LeadWorkspacePage({ mode }: LeadWorkspacePageProps) {
  return (
    <LeadWorkspaceProvider role={mode}>
      <SalesLeads />
    </LeadWorkspaceProvider>
  );
}
