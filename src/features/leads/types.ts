// Canonical Lead Feature Types

export type CrmRole = 'sales' | 'cs' | 'admin';

export interface LeadWorkspaceConfig {
  /** Current CRM role viewing the workspace */
  role: CrmRole;
  /** Whether the user can create new leads */
  canCreate: boolean;
  /** Whether the user can edit lead data */
  canEdit: boolean;
  /** Whether the user can move pipeline stages */
  canMoveStages: boolean;
  /** Whether the user can reassign leads */
  canReassign: boolean;
  /** Whether the user can export data */
  canExport: boolean;
  /** Whether the user can view metrics/analytics */
  canViewMetrics: boolean;
  /** Whether to show admin-level override controls */
  showOverrides: boolean;
}

export const ROLE_CONFIGS: Record<CrmRole, LeadWorkspaceConfig> = {
  sales: {
    role: 'sales',
    canCreate: true,
    canEdit: true,
    canMoveStages: true,
    canReassign: false,
    canExport: true,
    canViewMetrics: false,
    showOverrides: false,
  },
  cs: {
    role: 'cs',
    canCreate: false,
    canEdit: false, // limited edits handled inline
    canMoveStages: false,
    canReassign: false,
    canExport: false,
    canViewMetrics: false,
    showOverrides: false,
  },
  admin: {
    role: 'admin',
    canCreate: true,
    canEdit: true,
    canMoveStages: true,
    canReassign: true,
    canExport: true,
    canViewMetrics: true,
    showOverrides: true,
  },
};
