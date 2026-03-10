import { useMemo } from 'react';
import { Truck, ArrowDown, ArrowUp, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import type { RunLine } from '@/hooks/useControlTowerData';

interface Props {
  runs: RunLine[] | undefined;
}

export function KpiBar({ runs }: Props) {
  const stats = useMemo(() => {
    const list = runs || [];
    const deliveries = list.filter(r => r.run_type === 'DELIVERY').length;
    const pickups = list.filter(r => r.run_type === 'PICKUP').length;
    const swaps = list.filter(r => r.run_type === 'SWAP').length;
    const active = list.filter(r => ['EN_ROUTE', 'ARRIVED', 'ASSIGNED'].includes(r.status)).length;
    const completed = list.filter(r => r.status === 'COMPLETED').length;
    const unassigned = list.filter(r => !r.assigned_driver_id && r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
    return { total: list.length, deliveries, pickups, swaps, active, completed, unassigned };
  }, [runs]);

  const kpis = [
    { label: 'Total', value: stats.total, icon: Truck, color: 'text-foreground' },
    { label: 'Deliveries', value: stats.deliveries, icon: ArrowDown, color: 'text-blue-500' },
    { label: 'Pickups', value: stats.pickups, icon: ArrowUp, color: 'text-orange-500' },
    { label: 'Swaps', value: stats.swaps, icon: RefreshCw, color: 'text-violet-500' },
    { label: 'Active', value: stats.active, icon: Clock, color: 'text-amber-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Unassigned', value: stats.unassigned, icon: Truck, color: stats.unassigned > 0 ? 'text-red-500' : 'text-muted-foreground' },
  ];

  return (
    <div className="flex items-center gap-4 overflow-x-auto">
      {kpis.map(k => {
        const Icon = k.icon;
        return (
          <div key={k.label} className="flex items-center gap-1.5 shrink-0">
            <Icon className={`w-3.5 h-3.5 ${k.color}`} />
            <span className="text-lg font-bold leading-none">{k.value}</span>
            <span className="text-[11px] text-muted-foreground">{k.label}</span>
          </div>
        );
      })}
    </div>
  );
}
