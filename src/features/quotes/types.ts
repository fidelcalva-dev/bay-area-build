// Canonical Quote Feature Types

export type CrmRole = 'sales' | 'cs' | 'admin';

export interface QuoteWorkspaceConfig {
  role: CrmRole;
  canCreate: boolean;
  canEdit: boolean;
  canSend: boolean;
  canGeneratePdf: boolean;
  canConvertToOrder: boolean;
  canDuplicate: boolean;
  canOverridePrice: boolean;
  canViewMetrics: boolean;
  canResend: boolean;
  showOverrides: boolean;
}

export const QUOTE_ROLE_CONFIGS: Record<CrmRole, QuoteWorkspaceConfig> = {
  sales: {
    role: 'sales',
    canCreate: true,
    canEdit: true,
    canSend: true,
    canGeneratePdf: true,
    canConvertToOrder: true,
    canDuplicate: true,
    canOverridePrice: false,
    canViewMetrics: false,
    canResend: true,
    showOverrides: false,
  },
  cs: {
    role: 'cs',
    canCreate: false,
    canEdit: false,
    canSend: false,
    canGeneratePdf: true,
    canConvertToOrder: false,
    canDuplicate: false,
    canOverridePrice: false,
    canViewMetrics: false,
    canResend: true, // CS can resend existing quotes/contracts/payments
    showOverrides: false,
  },
  admin: {
    role: 'admin',
    canCreate: true,
    canEdit: true,
    canSend: true,
    canGeneratePdf: true,
    canConvertToOrder: true,
    canDuplicate: true,
    canOverridePrice: true,
    canViewMetrics: true,
    canResend: true,
    showOverrides: true,
  },
};
