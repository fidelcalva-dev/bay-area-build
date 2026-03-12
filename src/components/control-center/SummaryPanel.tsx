import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Section Header ──────────────────────────
export function SectionHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: { label: string; route: string };
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <Button asChild variant="ghost" size="sm" className="text-[11px] gap-1 h-7 text-muted-foreground hover:text-foreground">
          <Link to={action.route}>{action.label} <ArrowRight className="w-3 h-3" /></Link>
        </Button>
      )}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────
export function KPICard({ label, value, helper, icon: Icon, route, danger, loading }: {
  label: string; value: number | string; helper?: string;
  icon: React.ComponentType<{ className?: string }>; route: string;
  danger?: boolean; loading?: boolean;
}) {
  return (
    <Link to={route} className="block group">
      <div className={cn(
        'rounded-2xl border bg-card p-3 transition-all h-full',
        danger ? 'border-destructive/30 hover:border-destructive/50' : 'border-border/60 hover:border-primary/30',
        'hover:shadow-lg hover:-translate-y-0.5'
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center',
            danger ? 'bg-destructive/10' : 'bg-muted'
          )}>
            <Icon className={cn('w-3.5 h-3.5', danger ? 'text-destructive' : 'text-muted-foreground')} />
          </div>
          <ArrowUpRight className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
        </div>
        {loading ? (
          <Skeleton className="h-7 w-14 rounded-lg" />
        ) : (
          <div className={cn('text-xl font-bold tracking-tight', danger ? 'text-destructive' : 'text-foreground')}>
            {value}
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-1 font-medium leading-tight">{label}</p>
        {helper && <p className="text-[9px] text-muted-foreground/60 mt-0.5 hidden md:block">{helper}</p>}
      </div>
    </Link>
  );
}

// ─── Snapshot Card ───────────────────────────
export function SnapshotCard({ label, value, icon: Icon, route }: {
  label: string; value: string | number;
  icon: React.ComponentType<{ className?: string }>; route: string | null;
}) {
  const inner = (
    <div className={cn(
      'rounded-xl border border-border/60 bg-card p-3 flex items-center gap-3 transition-all h-full',
      route && 'hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 cursor-pointer'
    )}>
      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
      </div>
    </div>
  );
  if (!route) return inner;
  return <Link to={route} className="block">{inner}</Link>;
}

// ─── Quick Action Button ─────────────────────
export function QuickAction({ label, route, icon: Icon }: {
  label: string; route: string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-xl shrink-0 gap-1.5">
      <Link to={route}><Icon className="w-3 h-3" />{label}</Link>
    </Button>
  );
}

// ─── Quick Access Grid Card ──────────────────
export function QuickAccessCard({ label, icon: Icon, route, description }: {
  label: string; icon: React.ComponentType<{ className?: string }>; route: string; description: string;
}) {
  return (
    <Link to={route} className="block group">
      <div className="rounded-2xl border border-border/60 bg-card p-3 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20 transition-all h-full text-center">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10 transition-colors">
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{description}</p>
      </div>
    </Link>
  );
}

// ─── Alert Row ───────────────────────────────
export function AlertRow({ alert }: {
  alert: { id: string; title: string; severity: 'critical' | 'warning' | 'info'; route: string; source: string };
}) {
  const colors = {
    critical: 'border-l-destructive bg-destructive/5',
    warning: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    info: 'border-l-muted-foreground/30 bg-muted/20',
  };
  return (
    <Link to={alert.route} className="block">
      <div className={cn('border-l-[3px] rounded-r-xl px-4 py-2.5 hover:shadow-sm transition-all', colors[alert.severity])}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground truncate font-medium">{alert.title}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 font-medium uppercase tracking-wide">{alert.source}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Module Status Row ───────────────────────
type ModuleStatus = 'LIVE' | 'DRY_RUN' | 'OFF' | 'ERROR' | 'NEEDS_SETUP' | 'NOT_BUILT' | 'NO_DATA';

export function ModuleRow({ name, status, route }: { name: string; status: ModuleStatus; route: string | null }) {
  const styles: Record<ModuleStatus, string> = {
    LIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    DRY_RUN: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    OFF: 'bg-muted text-muted-foreground border-border',
    ERROR: 'bg-destructive/10 text-destructive border-destructive/20',
    NEEDS_SETUP: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
    NOT_BUILT: 'bg-muted/50 text-muted-foreground/60 border-border/50',
    NO_DATA: 'bg-muted/50 text-muted-foreground/60 border-border/50',
  };
  const inner = (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/50 transition-colors group">
      <span className="text-sm text-foreground">{name}</span>
      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', styles[status])}>
        {status.replace(/_/g, ' ')}
      </span>
    </div>
  );
  if (!route) return inner;
  return <Link to={route} className="block">{inner}</Link>;
}

// ─── Pipeline Bar ────────────────────────────
export function PipelineBar({ stages, loading }: {
  stages: { label: string; count: number; color: string }[]; loading?: boolean;
}) {
  const total = stages.reduce((s, st) => s + st.count, 0) || 1;
  if (loading) return <Skeleton className="h-9 w-full rounded-xl" />;
  const hasData = stages.some(s => s.count > 0);
  return (
    <div className="space-y-3">
      {hasData ? (
        <div className="flex rounded-xl overflow-hidden h-8 bg-muted">
          {stages.map(st => st.count > 0 && (
            <div
              key={st.label}
              className={cn('flex items-center justify-center text-[10px] font-bold text-white transition-all', st.color)}
              style={{ width: `${Math.max((st.count / total) * 100, 8)}%` }}
            >
              {st.count}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-8 bg-muted rounded-xl flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No data yet</span>
        </div>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
        {stages.map(st => (
          <div key={st.label} className="text-center">
            <div className="text-base font-bold text-foreground">{st.count}</div>
            <p className="text-[9px] text-muted-foreground leading-tight">{st.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
