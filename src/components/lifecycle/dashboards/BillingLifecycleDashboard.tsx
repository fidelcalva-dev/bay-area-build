import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Phone, Send, CheckCircle2, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  DepartmentDashboardTable,
  TimeInStageCell,
  SlaCell,
  PaymentBadge,
  StageBadge,
  type DashboardColumn,
  type DashboardFilter,
  type PaymentStatus,
} from '@/components/lifecycle';
import { getEntitiesByDepartment, getAllStages, getDepartmentAlerts, type LifecycleEntity, type LifecycleAlert } from '@/lib/lifecycleService';
import { format } from 'date-fns';

interface BillingRow {
  id: string;
  orderId: string;
  customer: string;
  stageName: string;
  stageKey: string;
  paymentStatus: PaymentStatus;
  amountDue: number;
  enteredAt: string;
  slaMinutes: number | null;
  owner: string;
  lastPaymentAttempt: string;
}

export default function BillingLifecycleDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [alerts, setAlerts] = useState<LifecycleAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({ total: 0, depositDue: 0, failed: 0, overdue: 0 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entities, stages, billingAlerts, ordersRes] = await Promise.all([
        getEntitiesByDepartment('BILLING'),
        getAllStages(),
        getDepartmentAlerts('BILLING'),
        supabase.from('orders').select('id, payment_status, amount_due, balance_due, status').limit(500),
      ]);

      const stageMap = new Map(stages.map(s => [s.stage_key, s]));
      const orderMap = new Map((ordersRes.data || []).map((o: any) => [o.id, o]));

      const mapPaymentStatus = (stageKey: string, orderPayStatus: string | null): PaymentStatus => {
        if (stageKey === 'PAYMENT_FAILED') return 'FAILED';
        if (stageKey === 'PAYMENT_OVERDUE') return 'BALANCE_DUE';
        if (stageKey === 'DEPOSIT_REQUESTED' || stageKey === 'DEPOSIT_PAID') return 'DEPOSIT_DUE';
        if (stageKey === 'PAYMENT_RECEIVED' || stageKey === 'FINAL_PAYMENT_COLLECTED') return 'PAID';
        if (orderPayStatus === 'paid') return 'PAID';
        return 'UNPAID';
      };

      const mapped: BillingRow[] = entities
        .filter(e => e.entity_type === 'ORDER' || e.entity_type === 'QUOTE')
        .map(e => {
          const stage = stageMap.get(e.current_stage_key);
          const order = orderMap.get(e.entity_id);
          return {
            id: e.entity_id,
            orderId: e.entity_id.slice(0, 8),
            customer: 'Customer',
            stageName: stage?.stage_name || e.current_stage_key,
            stageKey: e.current_stage_key,
            paymentStatus: mapPaymentStatus(e.current_stage_key, order?.payment_status),
            amountDue: order?.balance_due || order?.amount_due || 0,
            enteredAt: e.entered_stage_at,
            slaMinutes: stage?.sla_minutes || null,
            owner: e.owner_user_id?.slice(0, 8) || 'Unassigned',
            lastPaymentAttempt: '--',
          };
        });

      setRows(mapped);
      setAlerts(billingAlerts);
      setStats({
        total: mapped.length,
        depositDue: mapped.filter(r => r.stageKey === 'DEPOSIT_REQUESTED').length,
        failed: mapped.filter(r => r.stageKey === 'PAYMENT_FAILED').length,
        overdue: mapped.filter(r => r.stageKey === 'PAYMENT_OVERDUE').length,
      });
    } catch (err) {
      console.error('Billing dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredRows = rows.filter(r => {
    if (searchValue && !r.customer.toLowerCase().includes(searchValue.toLowerCase()) && !r.orderId.includes(searchValue)) return false;
    switch (activeFilter) {
      case 'deposit_due': return r.stageKey === 'DEPOSIT_REQUESTED';
      case 'balance_due': return r.stageKey === 'FINAL_PAYMENT_REQUIRED';
      case 'failed': return r.stageKey === 'PAYMENT_FAILED';
      case 'overdue': return r.stageKey === 'PAYMENT_OVERDUE';
      default: return true;
    }
  });

  const filters: DashboardFilter[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'deposit_due', label: 'Deposit Due', count: stats.depositDue },
    { key: 'balance_due', label: 'Balance Due' },
    { key: 'failed', label: 'Failed Payments', count: stats.failed },
    { key: 'overdue', label: 'Overdue', count: stats.overdue },
  ];

  const columns: DashboardColumn<BillingRow>[] = [
    { key: 'customer', header: 'Customer', render: (r) => <span className="text-sm font-medium">{r.customer}</span> },
    { key: 'orderId', header: 'Order ID', render: (r) => <span className="text-xs font-mono">{r.orderId}</span> },
    { key: 'stage', header: 'Current Stage', render: (r) => <StageBadge stageName={r.stageName} /> },
    { key: 'payment', header: 'Payment Status', render: (r) => <PaymentBadge status={r.paymentStatus} /> },
    { key: 'amount', header: 'Amount Due', align: 'right', render: (r) => (
      <span className="text-sm font-medium tabular-nums">${r.amountDue.toFixed(2)}</span>
    )},
    { key: 'time', header: 'Time in Stage', render: (r) => <TimeInStageCell enteredAt={r.enteredAt} /> },
    { key: 'owner', header: 'Owner', render: (r) => <span className="text-xs">{r.owner}</span> },
    { key: 'lastAttempt', header: 'Last Payment', render: (r) => <span className="text-xs text-muted-foreground">{r.lastPaymentAttempt}</span> },
    { key: 'actions', header: 'Actions', align: 'right', render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Send Payment Link">
          <Send className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Call">
          <Phone className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Mark Paid">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing Dashboard</h1>
        <p className="text-sm text-muted-foreground">Payment lifecycle control - {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Active Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.depositDue}</p>
                <p className="text-xs text-muted-foreground">Deposit Due</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.failed > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.overdue > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DepartmentDashboardTable
        title="Billing Pipeline"
        subtitle="All active billing items by lifecycle stage"
        data={filteredRows}
        columns={columns}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        loading={isLoading}
        emptyMessage="No billing items match this filter"
      />
    </div>
  );
}
