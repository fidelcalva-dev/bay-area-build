import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare, FileText, Users, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  DepartmentDashboardTable,
  TimeInStageCell,
  SlaCell,
  DepartmentBadge,
  StageBadge,
  RiskBadge,
  type DashboardColumn,
  type DashboardFilter,
} from '@/components/lifecycle';
import { getEntitiesByDepartment, getAllStages, getDepartmentAlerts, type LifecycleEntity, type LifecycleStage, type LifecycleAlert } from '@/lib/lifecycleService';
import { format } from 'date-fns';

interface LeadRow {
  id: string;
  name: string;
  phone: string;
  source: string;
  stageName: string;
  stageKey: string;
  enteredAt: string;
  slaMinutes: number | null;
  owner: string;
  quality: string;
  lastAction: string;
}

export default function SalesLifecycleDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [alerts, setAlerts] = useState<LifecycleAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({ total: 0, newLeads: 0, breached: 0, quotesSent: 0 });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entities, stages, salesAlerts, leadsRes] = await Promise.all([
        getEntitiesByDepartment('SALES'),
        getAllStages(),
        getDepartmentAlerts('SALES'),
        supabase.from('sales_leads').select('id, customer_name, customer_phone, lead_source, lead_quality_label, last_activity_at').limit(500),
      ]);

      const stageMap = new Map(stages.map(s => [s.stage_key, s]));
      const leadMap = new Map((leadsRes.data || []).map((l: any) => [l.id, l]));

      const mapped: LeadRow[] = entities
        .filter(e => e.entity_type === 'LEAD')
        .map(e => {
          const stage = stageMap.get(e.current_stage_key);
          const lead = leadMap.get(e.entity_id);
          return {
            id: e.entity_id,
            name: lead?.customer_name || 'Unknown',
            phone: lead?.customer_phone || '--',
            source: lead?.lead_source || '--',
            stageName: stage?.stage_name || e.current_stage_key,
            stageKey: e.current_stage_key,
            enteredAt: e.entered_stage_at,
            slaMinutes: stage?.sla_minutes || null,
            owner: e.owner_user_id?.slice(0, 8) || 'Unassigned',
            quality: lead?.lead_quality_label || 'GREEN',
            lastAction: lead?.last_activity_at ? format(new Date(lead.last_activity_at), 'MMM d, h:mm a') : '--',
          };
        });

      const now = Date.now();
      const breached = mapped.filter(r => r.slaMinutes && (now - new Date(r.enteredAt).getTime()) / 60000 > r.slaMinutes);

      setRows(mapped);
      setAlerts(salesAlerts);
      setStats({
        total: mapped.length,
        newLeads: mapped.filter(r => r.stageKey === 'LEAD_NEW').length,
        breached: breached.length,
        quotesSent: mapped.filter(r => r.stageKey === 'QUOTE_SENT').length,
      });
    } catch (err) {
      console.error('Sales dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter logic
  const filteredRows = rows.filter(r => {
    if (searchValue && !r.name.toLowerCase().includes(searchValue.toLowerCase()) && !r.phone.includes(searchValue)) return false;
    switch (activeFilter) {
      case 'new': return r.stageKey === 'LEAD_NEW';
      case 'breached': return r.slaMinutes ? (Date.now() - new Date(r.enteredAt).getTime()) / 60000 > r.slaMinutes : false;
      case 'quote_sent': return r.stageKey === 'QUOTE_SENT' || r.stageKey === 'FOLLOW_UP_PENDING';
      case 'high_quality': return r.quality === 'GREEN';
      case 'needs_verification': return r.quality === 'AMBER' || r.quality === 'RED';
      default: return true;
    }
  });

  const filters: DashboardFilter[] = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'new', label: 'New (No Contact)', count: stats.newLeads },
    { key: 'breached', label: 'SLA Breached', count: stats.breached },
    { key: 'quote_sent', label: 'Quote Sent (No Response)', count: stats.quotesSent },
    { key: 'high_quality', label: 'High Quality' },
    { key: 'needs_verification', label: 'Needs Verification' },
  ];

  const columns: DashboardColumn<LeadRow>[] = [
    { key: 'name', header: 'Lead Name', render: (r) => (
      <button className="text-sm font-medium text-primary hover:underline" onClick={() => navigate(`/sales/leads/${r.id}`)}>
        {r.name}
      </button>
    )},
    { key: 'phone', header: 'Phone', render: (r) => <span className="text-xs font-mono">{r.phone}</span> },
    { key: 'source', header: 'Source', render: (r) => <span className="text-xs">{r.source}</span> },
    { key: 'stage', header: 'Current Stage', render: (r) => <StageBadge stageName={r.stageName} /> },
    { key: 'time', header: 'Time in Stage', render: (r) => <TimeInStageCell enteredAt={r.enteredAt} /> },
    { key: 'owner', header: 'Owner', render: (r) => <span className="text-xs">{r.owner}</span> },
    { key: 'sla', header: 'SLA', render: (r) => <SlaCell enteredAt={r.enteredAt} slaMinutes={r.slaMinutes} /> },
    { key: 'quality', header: 'Quality', render: (r) => <RiskBadge band={r.quality as any} /> },
    { key: 'lastAction', header: 'Last Action', render: (r) => <span className="text-xs text-muted-foreground">{r.lastAction}</span> },
    { key: 'actions', header: 'Actions', align: 'right', render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { if (r.phone !== '--') window.open(`tel:${r.phone}`); }}>
          <Phone className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { if (r.phone !== '--') window.open(`sms:${r.phone}`); }}>
          <MessageSquare className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate(`/sales/quotes/new?lead_id=${r.id}`)}>
          <FileText className="w-3.5 h-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <p className="text-sm text-muted-foreground">Lead lifecycle control - {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Active Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.newLeads}</p>
                <p className="text-xs text-muted-foreground">New (No Contact)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.breached > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.breached}</p>
                <p className="text-xs text-muted-foreground">SLA Breached</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.quotesSent}</p>
                <p className="text-xs text-muted-foreground">Quotes Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              {alerts.length} Active Alert(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {alerts.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs p-2 rounded bg-destructive/5">
                  <span>{a.alert_type} - {a.stage_key}</span>
                  <Badge variant="outline" className="text-[10px]">{a.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <DepartmentDashboardTable
        title="Lead Pipeline"
        subtitle="All active leads by lifecycle stage"
        data={filteredRows}
        columns={columns}
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        loading={isLoading}
        emptyMessage="No leads match this filter"
      />
    </div>
  );
}
