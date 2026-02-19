import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, AlertTriangle, Clock, Send, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  DepartmentDashboardTable,
  TimeInStageCell,
  SlaCell,
  StageBadge,
  type DashboardColumn,
  type DashboardFilter,
} from '@/components/lifecycle';
import { getEntitiesByDepartment, getAllStages, getDepartmentAlerts, type LifecycleAlert } from '@/lib/lifecycleService';
import { format } from 'date-fns';

interface DispatchRow {
  id: string;
  orderId: string;
  address: string;
  size: string;
  material: string;
  scheduledWindow: string;
  stageName: string;
  stageKey: string;
  enteredAt: string;
  slaMinutes: number | null;
  driver: string;
  alertFlag: string;
}

export default function DispatchLifecycleDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<DispatchRow[]>([]);
  const [alerts, setAlerts] = useState<LifecycleAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({ total: 0, deliveriesToday: 0, pickupsTomorrow: 0, dumpMissing: 0 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entities, stages, logisticsAlerts, ordersRes] = await Promise.all([
        getEntitiesByDepartment('LOGISTICS'),
        getAllStages(),
        getDepartmentAlerts('LOGISTICS'),
        supabase.from('orders').select('id, scheduled_delivery_date, scheduled_delivery_window, scheduled_pickup_date, status, assigned_driver_id, dump_ticket_url').limit(500),
      ]);

      const stageMap = new Map(stages.map(s => [s.stage_key, s]));
      const orderMap = new Map((ordersRes.data || []).map((o: any) => [o.id, o]));
      const today = format(new Date(), 'yyyy-MM-dd');

      const mapped: DispatchRow[] = entities
        .filter(e => e.entity_type === 'ORDER')
        .map(e => {
          const stage = stageMap.get(e.current_stage_key);
          const order = orderMap.get(e.entity_id);
          const alertFlag = order && !order.dump_ticket_url && ['PICKED_UP', 'AT_DISPOSAL_SITE'].includes(e.current_stage_key)
            ? 'Dump ticket missing' : '';
          return {
            id: e.entity_id,
            orderId: e.entity_id.slice(0, 8),
            address: '--',
            size: '--',
            material: '--',
            scheduledWindow: order?.scheduled_delivery_window || '--',
            stageName: stage?.stage_name || e.current_stage_key,
            stageKey: e.current_stage_key,
            enteredAt: e.entered_stage_at,
            slaMinutes: stage?.sla_minutes || null,
            driver: order?.assigned_driver_id?.slice(0, 8) || 'Unassigned',
            alertFlag,
          };
        });

      setRows(mapped);
      setAlerts(logisticsAlerts);
      setStats({
        total: mapped.length,
        deliveriesToday: mapped.filter(r => {
          const order = orderMap.get(r.id);
          return order?.scheduled_delivery_date === today;
        }).length,
        pickupsTomorrow: mapped.filter(r => r.stageKey === 'PICKUP_SCHEDULED').length,
        dumpMissing: mapped.filter(r => r.alertFlag).length,
      });
    } catch (err) {
      console.error('Dispatch dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRows = rows.filter(r => {
    if (searchValue && !r.orderId.includes(searchValue)) return false;
    switch (activeFilter) {
      case 'deliveries_today': return r.stageKey === 'SCHEDULED' || r.stageKey === 'DELIVERY_EN_ROUTE';
      case 'pickups_tomorrow': return r.stageKey === 'PICKUP_SCHEDULED';
      case 'swaps': return r.stageKey === 'SWAP_REQUESTED' || r.stageKey === 'SWAP_SCHEDULED';
      case 'dump_missing': return !!r.alertFlag;
      default: return true;
    }
  });

  const filters: DashboardFilter[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'deliveries_today', label: 'Deliveries Today', count: stats.deliveriesToday },
    { key: 'pickups_tomorrow', label: 'Pickups Pending', count: stats.pickupsTomorrow },
    { key: 'swaps', label: 'Swaps Pending' },
    { key: 'dump_missing', label: 'Dump Ticket Missing', count: stats.dumpMissing },
  ];

  const columns: DashboardColumn<DispatchRow>[] = [
    { key: 'orderId', header: 'Order ID', render: (r) => <span className="text-xs font-mono">{r.orderId}</span> },
    { key: 'address', header: 'Address', render: (r) => <span className="text-xs">{r.address}</span> },
    { key: 'size', header: 'Size', render: (r) => <span className="text-xs">{r.size}</span> },
    { key: 'material', header: 'Material', render: (r) => <span className="text-xs">{r.material}</span> },
    { key: 'window', header: 'Scheduled', render: (r) => <span className="text-xs">{r.scheduledWindow}</span> },
    { key: 'stage', header: 'Current Stage', render: (r) => <StageBadge stageName={r.stageName} /> },
    { key: 'time', header: 'Time in Stage', render: (r) => <TimeInStageCell enteredAt={r.enteredAt} /> },
    { key: 'driver', header: 'Driver', render: (r) => <span className="text-xs">{r.driver}</span> },
    { key: 'alerts', header: 'Alerts', render: (r) => r.alertFlag ? (
      <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">{r.alertFlag}</Badge>
    ) : <span className="text-xs text-muted-foreground">--</span> },
    { key: 'actions', header: 'Actions', align: 'right', render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Create Run" onClick={() => navigate('/dispatch/runs')}>
          <Truck className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Assign Driver">
          <UserPlus className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Message Driver">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dispatch Dashboard</h1>
        <p className="text-sm text-muted-foreground">Operations lifecycle control - {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.deliveriesToday}</p>
                <p className="text-xs text-muted-foreground">Deliveries Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.pickupsTomorrow}</p>
                <p className="text-xs text-muted-foreground">Pickups Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.dumpMissing > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.dumpMissing}</p>
                <p className="text-xs text-muted-foreground">Dump Ticket Missing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DepartmentDashboardTable
        title="Operations Pipeline"
        subtitle="All active orders by logistics stage"
        data={filteredRows}
        columns={columns}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        loading={isLoading}
        emptyMessage="No orders match this filter"
      />
    </div>
  );
}
