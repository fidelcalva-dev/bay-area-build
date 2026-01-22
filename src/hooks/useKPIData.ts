import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, differenceInDays } from 'date-fns';

export interface KPITarget {
  id: string;
  kpi_key: string;
  kpi_category: string;
  kpi_name: string;
  target_value: number;
  warning_threshold: number | null;
  unit: string;
  higher_is_better: boolean;
}

export interface KPISnapshot {
  snapshot_date: string;
  kpi_key: string;
  actual_value: number;
  target_value: number | null;
  status: string | null;
}

export interface KPIMetric {
  key: string;
  name: string;
  category: string;
  actual: number;
  target: number;
  warningThreshold: number;
  unit: string;
  higherIsBetter: boolean;
  status: 'green' | 'yellow' | 'red';
  trend7d: number | null;
  trend30d: number | null;
  trend90d: number | null;
  sparklineData: { date: string; value: number }[];
}

export interface KPIData {
  sales: KPIMetric[];
  ops: KPIMetric[];
  finance: KPIMetric[];
  customer: KPIMetric[];
}

interface KPIFilters {
  startDate: Date;
  endDate: Date;
  yardId?: string;
  customerType?: string;
}

function calculateStatus(
  actual: number,
  target: number,
  warningThreshold: number,
  higherIsBetter: boolean
): 'green' | 'yellow' | 'red' {
  if (higherIsBetter) {
    if (actual >= target) return 'green';
    if (actual >= warningThreshold) return 'yellow';
    return 'red';
  } else {
    if (actual <= target) return 'green';
    if (actual <= warningThreshold) return 'yellow';
    return 'red';
  }
}

function calculateTrend(
  currentValue: number,
  historicalData: KPISnapshot[],
  daysAgo: number
): number | null {
  const targetDate = format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
  const pastSnapshot = historicalData.find(s => s.snapshot_date === targetDate);
  
  if (!pastSnapshot || pastSnapshot.actual_value === 0) return null;
  
  const percentChange = ((currentValue - pastSnapshot.actual_value) / pastSnapshot.actual_value) * 100;
  return Math.round(percentChange * 10) / 10;
}

export function useKPIData(filters: KPIFilters) {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKPIData] = useState<KPIData>({
    sales: [],
    ops: [],
    finance: [],
    customer: [],
  });
  const [targets, setTargets] = useState<KPITarget[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startDate = format(filters.startDate, 'yyyy-MM-dd');
  const endDate = format(filters.endDate, 'yyyy-MM-dd');

  useEffect(() => {
    async function fetchKPIData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch KPI targets
        const { data: targetsData, error: targetsError } = await (supabase as any)
          .from('kpi_targets')
          .select('*');

        if (targetsError) throw targetsError;
        setTargets(targetsData || []);

        // Fetch historical snapshots for trends (last 90 days)
        const ninetyDaysAgo = format(subDays(new Date(), 90), 'yyyy-MM-dd');
        const { data: snapshotsData } = await (supabase as any)
          .from('kpi_snapshots')
          .select('*')
          .gte('snapshot_date', ninetyDaysAgo)
          .order('snapshot_date', { ascending: true });

        const snapshots: KPISnapshot[] = snapshotsData || [];

        // Fetch real data to calculate current KPIs
        const [quotesRes, ordersRes, invoicesRes, inventoryRes, lineItemsRes] = await Promise.all([
          supabase
            .from('quotes')
            .select('id, status, created_at, customer_id, extra_tons_prepurchased, converted_at, user_type')
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`),
          supabase
            .from('orders')
            .select('id, status, amount_due, amount_paid, balance_due, created_at, scheduled_delivery_date, actual_delivery_at, scheduled_pickup_date, actual_pickup_at, customer_id')
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`),
          supabase
            .from('invoices')
            .select('id, amount_due, amount_paid, balance_due, payment_status, due_date, created_at')
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`),
          supabase
            .from('inventory')
            .select('id, total_count, available_count, in_use_count'),
          (supabase as any)
            .from('invoice_line_items')
            .select('id, line_type, amount, order_id')
            .eq('line_type', 'overage')
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`),
        ]);

        const quotes = quotesRes.data || [];
        const orders = ordersRes.data || [];
        const invoices = invoicesRes.data || [];
        const inventory = inventoryRes.data || [];
        const lineItems = lineItemsRes.data || [];

        // Calculate actual KPI values
        const dayCount = differenceInDays(filters.endDate, filters.startDate) + 1;
        
        // Sales KPIs
        const conversionRate = quotes.length > 0 ? (orders.length / quotes.length) * 100 : 0;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.amount_due || 0), 0);
        const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
        const avgTimeToBook = quotes.filter(q => q.converted_at).length > 0
          ? quotes.filter(q => q.converted_at).reduce((sum, q) => {
              const created = new Date(q.created_at);
              const converted = new Date(q.converted_at!);
              return sum + (converted.getTime() - created.getTime()) / (1000 * 60 * 60);
            }, 0) / quotes.filter(q => q.converted_at).length
          : 0;
        const quotesPerDay = dayCount > 0 ? quotes.length / dayCount : 0;

        // Ops KPIs
        const totalInventory = inventory.reduce((sum, i) => sum + (i.total_count || 0), 0);
        const inUseInventory = inventory.reduce((sum, i) => sum + (i.in_use_count || 0), 0);
        const inventoryUtilization = totalInventory > 0 ? (inUseInventory / totalInventory) * 100 : 0;
        
        const scheduleCapacity = dayCount * 20; // 20 jobs per day assumed
        const totalJobs = orders.length * 2; // delivery + pickup
        const scheduleLoad = scheduleCapacity > 0 ? (totalJobs / scheduleCapacity) * 100 : 0;
        
        const onTimeDeliveries = orders.filter(o => {
          if (!o.scheduled_delivery_date || !o.actual_delivery_at) return false;
          const scheduled = new Date(o.scheduled_delivery_date);
          const actual = new Date(o.actual_delivery_at);
          return actual <= new Date(scheduled.getTime() + 24 * 60 * 60 * 1000); // within 24h
        }).length;
        const completedDeliveries = orders.filter(o => o.actual_delivery_at).length;
        const onTimeDeliveryRate = completedDeliveries > 0 ? (onTimeDeliveries / completedDeliveries) * 100 : 100;
        
        const onTimePickups = orders.filter(o => {
          if (!o.scheduled_pickup_date || !o.actual_pickup_at) return false;
          const scheduled = new Date(o.scheduled_pickup_date);
          const actual = new Date(o.actual_pickup_at);
          return actual <= new Date(scheduled.getTime() + 24 * 60 * 60 * 1000);
        }).length;
        const completedPickups = orders.filter(o => o.actual_pickup_at).length;
        const onTimePickupRate = completedPickups > 0 ? (onTimePickups / completedPickups) * 100 : 100;

        // Finance KPIs
        const now = new Date();
        const paidInvoices = invoices.filter(i => i.payment_status === 'paid');
        const arDays = paidInvoices.length > 0
          ? paidInvoices.reduce((sum, i) => {
              const created = new Date(i.created_at);
              return sum + differenceInDays(now, created);
            }, 0) / paidInvoices.length
          : 0;
        
        const totalInvoiced = invoices.reduce((sum, i) => sum + (i.amount_due || 0), 0);
        const totalPaid = invoices.reduce((sum, i) => sum + (i.amount_paid || 0), 0);
        const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 100;
        
        const ordersWithOverage = new Set(lineItems.map((l: any) => l.order_id)).size;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const overageRate = completedOrders > 0 ? (ordersWithOverage / completedOrders) * 100 : 0;
        
        const prepayQuotes = quotes.filter(q => (q.extra_tons_prepurchased || 0) > 0).length;
        const prepayAdoption = quotes.length > 0 ? (prepayQuotes / quotes.length) * 100 : 0;

        // Customer KPIs
        const customerOrders = new Map<string, number>();
        orders.forEach(o => {
          if (o.customer_id) {
            customerOrders.set(o.customer_id, (customerOrders.get(o.customer_id) || 0) + 1);
          }
        });
        const repeatCustomers = Array.from(customerOrders.values()).filter(c => c > 1).length;
        const repeatRate = customerOrders.size > 0 ? (repeatCustomers / customerOrders.size) * 100 : 0;
        
        const contractorQuotes = quotes.filter(q => q.user_type === 'contractor').length;
        const contractorShare = quotes.length > 0 ? (contractorQuotes / quotes.length) * 100 : 0;

        // Map calculated values to KPIs
        const kpiValues: Record<string, number> = {
          conversion_rate: Math.round(conversionRate * 10) / 10,
          avg_ticket: Math.round(avgTicket),
          time_to_book: Math.round(avgTimeToBook * 10) / 10,
          quotes_per_day: Math.round(quotesPerDay * 10) / 10,
          inventory_utilization: Math.round(inventoryUtilization * 10) / 10,
          schedule_load: Math.round(scheduleLoad * 10) / 10,
          on_time_delivery: Math.round(onTimeDeliveryRate * 10) / 10,
          on_time_pickup: Math.round(onTimePickupRate * 10) / 10,
          ar_days: Math.round(arDays * 10) / 10,
          collection_rate: Math.round(collectionRate * 10) / 10,
          overage_rate: Math.round(overageRate * 10) / 10,
          prepay_adoption: Math.round(prepayAdoption * 10) / 10,
          repeat_rate: Math.round(repeatRate * 10) / 10,
          contractor_share: Math.round(contractorShare * 10) / 10,
          nps_score: 75, // Placeholder - would come from survey data
        };

        // Build KPI metrics with targets and trends
        const buildMetric = (target: KPITarget): KPIMetric => {
          const actual = kpiValues[target.kpi_key] ?? 0;
          const kpiSnapshots = snapshots.filter(s => s.kpi_key === target.kpi_key);
          
          return {
            key: target.kpi_key,
            name: target.kpi_name,
            category: target.kpi_category,
            actual,
            target: target.target_value,
            warningThreshold: target.warning_threshold ?? target.target_value * 0.7,
            unit: target.unit,
            higherIsBetter: target.higher_is_better,
            status: calculateStatus(
              actual,
              target.target_value,
              target.warning_threshold ?? target.target_value * 0.7,
              target.higher_is_better
            ),
            trend7d: calculateTrend(actual, kpiSnapshots, 7),
            trend30d: calculateTrend(actual, kpiSnapshots, 30),
            trend90d: calculateTrend(actual, kpiSnapshots, 90),
            sparklineData: kpiSnapshots.slice(-30).map(s => ({
              date: s.snapshot_date,
              value: s.actual_value,
            })),
          };
        };

        const targetsList = targetsData || [];
        setKPIData({
          sales: targetsList.filter((t: KPITarget) => t.kpi_category === 'sales').map(buildMetric),
          ops: targetsList.filter((t: KPITarget) => t.kpi_category === 'ops').map(buildMetric),
          finance: targetsList.filter((t: KPITarget) => t.kpi_category === 'finance').map(buildMetric),
          customer: targetsList.filter((t: KPITarget) => t.kpi_category === 'customer').map(buildMetric),
        });

      } catch (err) {
        console.error('KPI data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load KPI data');
      } finally {
        setLoading(false);
      }
    }

    fetchKPIData();
  }, [startDate, endDate, filters.yardId, filters.customerType]);

  // Save daily snapshot
  const saveSnapshot = useCallback(async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const allKPIs = [...kpiData.sales, ...kpiData.ops, ...kpiData.finance, ...kpiData.customer];
    
    for (const kpi of allKPIs) {
      try {
        await (supabase as any)
          .from('kpi_snapshots')
          .upsert({
            snapshot_date: today,
            kpi_key: kpi.key,
            actual_value: kpi.actual,
            target_value: kpi.target,
            status: kpi.status,
          }, {
            onConflict: 'snapshot_date,kpi_key',
          });
      } catch (err) {
        console.error(`Failed to save snapshot for ${kpi.key}:`, err);
      }
    }
  }, [kpiData]);

  // Update target
  const updateTarget = useCallback(async (kpiKey: string, newTarget: number, newWarning?: number) => {
    const { error } = await (supabase as any)
      .from('kpi_targets')
      .update({
        target_value: newTarget,
        warning_threshold: newWarning,
        updated_at: new Date().toISOString(),
      })
      .eq('kpi_key', kpiKey);

    if (error) throw error;
  }, []);

  return {
    loading,
    kpiData,
    targets,
    error,
    saveSnapshot,
    updateTarget,
  };
}
