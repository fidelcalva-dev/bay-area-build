import { cn } from '@/lib/utils';
import { Globe, Users, Truck, DollarSign, Search, Link2, Brain, Bell, BarChart3 } from 'lucide-react';

export type SystemStatus = 'LIVE' | 'WARNING' | 'ERROR' | 'NEEDS_SETUP' | 'NO_DATA';

interface StatusItem {
  label: string;
  status: SystemStatus;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_STYLES: Record<SystemStatus, string> = {
  LIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  WARNING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  ERROR: 'bg-destructive/10 text-destructive border-destructive/30',
  NEEDS_SETUP: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  NO_DATA: 'bg-muted text-muted-foreground border-border',
};

const DOT_STYLES: Record<SystemStatus, string> = {
  LIVE: 'bg-emerald-500',
  WARNING: 'bg-amber-500',
  ERROR: 'bg-destructive',
  NEEDS_SETUP: 'bg-orange-500',
  NO_DATA: 'bg-muted-foreground/40',
};

interface StatusStripProps {
  statuses: StatusItem[];
}

export function StatusStrip({ statuses }: StatusStripProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-1.5 w-max md:w-auto md:flex-wrap">
        {statuses.map(s => (
          <div
            key={s.label}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold shrink-0',
              STATUS_STYLES[s.status]
            )}
          >
            <div className={cn('w-1.5 h-1.5 rounded-full', DOT_STYLES[s.status])} />
            <s.icon className="w-3 h-3" />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function buildSystemStatuses(kpi: any): StatusItem[] {
  return [
    { label: 'Website', status: 'LIVE', icon: Globe },
    { label: 'CRM', status: 'LIVE', icon: BarChart3 },
    { label: 'Leads', status: kpi?.newLeadsToday > 0 || kpi?.hotLeads > 0 ? 'LIVE' : 'NO_DATA', icon: Users },
    { label: 'Dispatch', status: kpi?.jobsToday > 0 ? 'LIVE' : 'NO_DATA', icon: Truck },
    { label: 'Finance', status: 'LIVE', icon: DollarSign },
    { label: 'SEO', status: 'LIVE', icon: Search },
    { label: 'Integrations', status: 'LIVE', icon: Link2 },
    { label: 'AI', status: 'LIVE', icon: Brain },
    { label: 'Alerts', status: kpi?.alertCount > 0 ? 'WARNING' : 'LIVE', icon: Bell },
  ];
}
