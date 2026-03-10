import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, ArrowRight, Clock, User, MapPin } from 'lucide-react';
import type { RunLine } from '@/hooks/useControlTowerData';

const RUN_COLORS: Record<string, string> = {
  DELIVERY: '#3b82f6',
  PICKUP: '#f97316',
  SWAP: '#8b5cf6',
  DUMP_RETURN: '#6b7280',
  DUMP_AND_RETURN: '#6b7280',
  YARD_TRANSFER: '#10b981',
};

const STATUS_ORDER: Record<string, number> = {
  EN_ROUTE: 0, ARRIVED: 1, ASSIGNED: 2, DRAFT: 3, SCHEDULED: 4, PAUSED: 5, COMPLETED: 6, CANCELLED: 7,
};

interface Props {
  runs: RunLine[] | undefined;
  selectedRunId: string | null;
  onSelectRun: (run: RunLine) => void;
}

export function JobQueuePanel({ runs, selectedRunId, onSelectRun }: Props) {
  const [filterStatus, setFilterStatus] = useState('__all__');
  const [filterType, setFilterType] = useState('__all__');

  const filtered = useMemo(() => {
    let list = runs || [];
    if (filterStatus !== '__all__') list = list.filter(r => r.status === filterStatus);
    if (filterType !== '__all__') list = list.filter(r => r.run_type === filterType);
    return list.sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99));
  }, [runs, filterStatus, filterType]);

  const statuses = useMemo(() => {
    const s = new Set((runs || []).map(r => r.status));
    return Array.from(s).sort();
  }, [runs]);

  const types = useMemo(() => {
    const s = new Set((runs || []).map(r => r.run_type));
    return Array.from(s).sort();
  }, [runs]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (runs || []).forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [runs]);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Job Queue
          </h2>
          <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
        </div>

        {/* Quick status chips */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(counts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? '__all__' : status)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status} ({count})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Run list */}
      <ScrollArea className="flex-1">
        {!filtered.length ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No jobs match filters</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(run => {
              const isSelected = selectedRunId === run.id;
              return (
                <button
                  key={run.id}
                  onClick={() => onSelectRun(run)}
                  className={`w-full text-left p-3 transition-colors ${
                    isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RUN_COLORS[run.run_type] || '#6b7280' }} />
                      <span className="text-xs font-mono font-medium">{run.run_number || run.id.slice(0, 8)}</span>
                    </div>
                    <StatusBadge status={run.status} />
                  </div>

                  <div className="text-xs font-medium truncate">
                    {run.run_type.replace(/_/g, ' ')}
                    {run.customer_name && <span className="text-muted-foreground"> — {run.customer_name}</span>}
                  </div>

                  {run.destination_address && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {run.destination_address}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    {run.estimated_miles != null && (
                      <span>{run.estimated_miles.toFixed(1)} mi</span>
                    )}
                    {run.estimated_duration_mins != null && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />{run.estimated_duration_mins} min
                      </span>
                    )}
                    {run.assigned_driver_id && (
                      <span className="flex items-center gap-0.5">
                        <User className="w-3 h-3" />Assigned
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = (() => {
    switch (status) {
      case 'COMPLETED': return 'default' as const;
      case 'EN_ROUTE': case 'ARRIVED': return 'secondary' as const;
      case 'CANCELLED': case 'FAILED': return 'destructive' as const;
      default: return 'outline' as const;
    }
  })();
  return <Badge variant={variant} className="text-[10px] px-1.5 py-0">{status}</Badge>;
}
