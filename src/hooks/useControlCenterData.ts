import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const today = () => new Date().toISOString().split('T')[0];
const countOpts = { count: 'exact' as const, head: true };

// Safe query wrapper — catches errors from tables that may not exist
async function safeCount(queryFn: () => PromiseLike<{ count: number | null }>): Promise<{ count: number }> {
  try {
    const result = await queryFn();
    return { count: result.count ?? 0 };
  } catch {
    return { count: 0 };
  }
}

export interface ControlCenterKPI {
  newLeadsToday: number;
  hotLeads: number;
  quotesPending: number;
  contractsPending: number;
  paymentsPending: number;
  ordersReadyForDispatch: number;
  jobsToday: number;
  deliveriesToday: number;
  pickupsToday: number;
  overdueInvoices: number;
  approvalsPending: number;
  driversActive: number;
  activeCustomers: number;
  openRequests: number;
  cityPagesActive: number;
  zipPagesActive: number;
  fallbackQueueCount: number;
  alertCount: number;
}

export function useControlCenterKPIs() {
  const [data, setData] = useState<ControlCenterKPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = today();

        const [
          leads, hotLeads, quotes, contracts, runs,
          pendingInv, overdueInv, approvals, alerts,
          cityPages, zipPages, fallbackQueue,
          activeCustomers, deliveries, pickups, ordersReady,
        ] = await Promise.all([
          (supabase.from('sales_leads').select('id', countOpts) as any).gte('created_at', `${d}T00:00:00`),
          (supabase.from('sales_leads').select('id', countOpts) as any).in('lead_status', ['new', 'contacted']).gte('lead_quality_score', 70),
          (supabase.from('quotes').select('id', countOpts) as any).in('status', ['pending', 'draft']),
          (supabase.from('quotes').select('id', countOpts) as any).eq('status', 'contract_sent'),
          (supabase.from('runs').select('id', countOpts) as any).eq('scheduled_date', d),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'pending'),
          (supabase.from('invoices').select('id', countOpts) as any).eq('payment_status', 'overdue'),
          (supabase.from('approval_requests').select('id', countOpts) as any).eq('status', 'pending'),
          (supabase.from('alerts').select('id', countOpts) as any).eq('is_resolved', false),
          safeCount(() => (supabase as any).from('seo_city_pages').select('id', countOpts).eq('is_active', true)),
          safeCount(() => (supabase as any).from('seo_zip_pages').select('id', countOpts).eq('is_active', true)),
          safeCount(() => (supabase as any).from('lead_fallback_queue').select('id', countOpts).eq('status', 'pending')),
          (supabase.from('customers').select('id', countOpts) as any).eq('status', 'active'),
          safeCount(() => (supabase.from('service_requests').select('id', countOpts) as any).eq('scheduled_date', d).eq('request_type', 'delivery')),
          safeCount(() => (supabase.from('service_requests').select('id', countOpts) as any).eq('scheduled_date', d).eq('request_type', 'pickup')),
          safeCount(() => (supabase.from('orders').select('id', countOpts) as any).eq('status', 'confirmed')),
        ]);

        setData({
          newLeadsToday: leads.count ?? 0,
          hotLeads: hotLeads.count ?? 0,
          quotesPending: quotes.count ?? 0,
          contractsPending: contracts.count ?? 0,
          paymentsPending: pendingInv.count ?? 0,
          ordersReadyForDispatch: ordersReady?.count ?? 0,
          jobsToday: runs.count ?? 0,
          deliveriesToday: deliveries?.count ?? 0,
          pickupsToday: pickups?.count ?? 0,
          overdueInvoices: overdueInv.count ?? 0,
          approvalsPending: approvals.count ?? 0,
          driversActive: 0,
          activeCustomers: activeCustomers.count ?? 0,
          openRequests: 0,
          cityPagesActive: cityPages?.count ?? 0,
          zipPagesActive: zipPages?.count ?? 0,
          fallbackQueueCount: fallbackQueue?.count ?? 0,
          alertCount: alerts.count ?? 0,
        });
      } catch (err) {
        console.error('Control Center KPI load error:', err);
        setData({
          newLeadsToday: 0, hotLeads: 0, quotesPending: 0, contractsPending: 0,
          paymentsPending: 0, ordersReadyForDispatch: 0, jobsToday: 0,
          deliveriesToday: 0, pickupsToday: 0, overdueInvoices: 0,
          approvalsPending: 0, driversActive: 0, activeCustomers: 0, openRequests: 0,
          cityPagesActive: 0, zipPagesActive: 0, fallbackQueueCount: 0, alertCount: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  return { data, loading };
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  route: string;
  source: string;
  created_at: string;
}

export function useControlCenterAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('alerts')
          .select('id, title, severity, alert_type, entity_type, created_at')
          .eq('is_resolved', false)
          .order('created_at', { ascending: false })
          .limit(15);
        setAlerts((data || []).map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity === 'critical' ? 'critical' as const : a.severity === 'warning' ? 'warning' as const : 'info' as const,
          route: '/admin/alerts',
          source: a.entity_type || a.alert_type,
          created_at: a.created_at,
        })));
      } catch { setAlerts([]); }
      finally { setLoading(false); }
    }
    load();
  }, []);
  return { alerts, loading };
}

export function useControlCenterPipeline() {
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('sales_leads').select('lead_status');
        const counts: Record<string, number> = {};
        (data || []).forEach(l => { counts[l.lead_status] = (counts[l.lead_status] || 0) + 1; });
        setPipeline(counts);
      } catch { setPipeline({}); }
      finally { setLoading(false); }
    }
    load();
  }, []);
  return { pipeline, loading };
}
