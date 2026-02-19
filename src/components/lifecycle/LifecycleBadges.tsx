import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ============================================
// UNIFIED BADGE SYSTEM
// Consistent across all department dashboards
// ============================================

// --- Department Badges ---
const DEPARTMENT_STYLES: Record<string, string> = {
  SALES: 'bg-blue-50 text-blue-700 border-blue-200',
  BILLING: 'bg-purple-50 text-purple-700 border-purple-200',
  LOGISTICS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRIVER: 'bg-slate-100 text-slate-700 border-slate-300',
  ADMIN: 'bg-foreground text-background border-foreground',
  VERIFICATION: 'bg-violet-50 text-violet-700 border-violet-200',
  DUMP: 'bg-amber-50 text-amber-700 border-amber-200',
  CLOSING: 'bg-teal-50 text-teal-700 border-teal-200',
};

export function DepartmentBadge({ department, className }: { department: string; className?: string }) {
  const style = DEPARTMENT_STYLES[department] || DEPARTMENT_STYLES.ADMIN;
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium uppercase tracking-wide', style, className)}>
      {department}
    </Badge>
  );
}

// --- SLA Status Badges ---
export type SlaStatus = 'on_track' | 'at_risk' | 'breached';

const SLA_STYLES: Record<SlaStatus, string> = {
  on_track: 'bg-muted text-muted-foreground border-border',
  at_risk: 'bg-amber-50 text-amber-700 border-amber-200',
  breached: 'bg-destructive/10 text-destructive border-destructive/30',
};

const SLA_LABELS: Record<SlaStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  breached: 'Breached',
};

export function SlaBadge({ status, className }: { status: SlaStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', SLA_STYLES[status], className)}>
      {SLA_LABELS[status]}
    </Badge>
  );
}

export function getSlaStatus(enteredAt: string, slaMinutes: number | null): SlaStatus {
  if (!slaMinutes) return 'on_track';
  const elapsed = (Date.now() - new Date(enteredAt).getTime()) / 60000;
  if (elapsed > slaMinutes) return 'breached';
  if (elapsed > slaMinutes * 0.75) return 'at_risk';
  return 'on_track';
}

// --- Risk Band Badges ---
export type RiskBand = 'GREEN' | 'AMBER' | 'RED';

const RISK_STYLES: Record<RiskBand, string> = {
  GREEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AMBER: 'bg-amber-50 text-amber-700 border-amber-200',
  RED: 'bg-destructive/10 text-destructive border-destructive/30',
};

const RISK_LABELS: Record<RiskBand, string> = {
  GREEN: 'Good Lead',
  AMBER: 'Verification',
  RED: 'Manual Review',
};

export function RiskBadge({ band, className }: { band: RiskBand; className?: string }) {
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', RISK_STYLES[band], className)}>
      {RISK_LABELS[band]}
    </Badge>
  );
}

// --- Payment Badges ---
export type PaymentStatus = 'PAID' | 'DEPOSIT_DUE' | 'BALANCE_DUE' | 'FAILED' | 'UNPAID';

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DEPOSIT_DUE: 'bg-amber-50 text-amber-700 border-amber-200',
  BALANCE_DUE: 'bg-orange-50 text-orange-700 border-orange-200',
  FAILED: 'bg-destructive/10 text-destructive border-destructive/30',
  UNPAID: 'bg-slate-100 text-slate-600 border-slate-300',
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  PAID: 'Paid',
  DEPOSIT_DUE: 'Deposit Due',
  BALANCE_DUE: 'Balance Due',
  FAILED: 'Failed',
  UNPAID: 'Unpaid',
};

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-medium', PAYMENT_STYLES[status], className)}>
      {PAYMENT_LABELS[status]}
    </Badge>
  );
}

// --- Stage Badge (generic) ---
export function StageBadge({ stageName, className }: { stageName: string; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('text-xs font-medium', className)}>
      {stageName}
    </Badge>
  );
}
