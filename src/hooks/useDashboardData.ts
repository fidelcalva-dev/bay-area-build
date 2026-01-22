import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, differenceInDays } from 'date-fns';
import type { DashboardFilterValues } from '@/components/dashboard/DashboardFilters';

// Funnel metrics
export interface FunnelMetrics {
  quotes_created: number;
  quotes_saved: number;
  quotes_scheduled: number;
  orders_created: number;
  orders_completed: number;
  conversion_rate: number;
}

// AR metrics
export interface ARMetrics {
  total_invoiced: number;
  total_paid: number;
  total_balance: number;
  overdue_count: number;
  overdue_amount: number;
}

// Overage metrics
export interface OverageMetrics {
  orders_with_overage: number;
  total_overage_amount: number;
  avg_overage_per_order: number;
  prepay_adoption_rate: number;
  prepay_savings: number;
}

// Customer metrics
export interface CustomerMetrics {
  total_customers: number;
  new_customers: number;
  repeat_customers: number;
  avg_orders_per_customer: number;
  avg_ticket_value: number;
  top_customers: {
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }[];
}

// Inventory metrics
export interface InventoryMetrics {
  by_yard: {
    yard_id: string;
    yard_name: string;
    total: number;
    available: number;
    in_use: number;
    reserved: number;
    utilization: number;
  }[];
  by_size: {
    size_value: number;
    label: string;
    total: number;
    available: number;
    in_use: number;
  }[];
  low_stock_alerts: number;
}

// Schedule metrics
export interface ScheduleMetrics {
  by_day: {
    date: string;
    deliveries: number;
    pickups: number;
    capacity: number;
  }[];
  utilization_rate: number;
  avg_daily_jobs: number;
}

export function useDashboardData(filters: DashboardFilterValues) {
  const [loading, setLoading] = useState(true);
  const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetrics | null>(null);
  const [arMetrics, setARMetrics] = useState<ARMetrics | null>(null);
  const [overageMetrics, setOverageMetrics] = useState<OverageMetrics | null>(null);
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics | null>(null);
  const [scheduleMetrics, setScheduleMetrics] = useState<ScheduleMetrics | null>(null);
  const [dailyTrend, setDailyTrend] = useState<{ date: string; quotes: number; orders: number; revenue: number }[]>([]);
  const [revenueByMaterial, setRevenueByMaterial] = useState<{ name: string; value: number }[]>([]);

  const startDate = format(filters.startDate, 'yyyy-MM-dd');
  const endDate = format(filters.endDate, 'yyyy-MM-dd');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        // Fetch quotes data
        const { data: quotes } = await supabase
          .from('quotes')
          .select('id, status, material_type, estimated_min, estimated_max, created_at, extra_tons_prepurchased, customer_id')
          .gte('created_at', `${startDate}T00:00:00`)
          .lte('created_at', `${endDate}T23:59:59`);

        // Fetch orders data
        const { data: orders } = await supabase
          .from('orders')
          .select('id, status, amount_due, amount_paid, balance_due, created_at, scheduled_delivery_date, scheduled_pickup_date, customer_id, quote_id')
          .gte('created_at', `${startDate}T00:00:00`)
          .lte('created_at', `${endDate}T23:59:59`);

        // Fetch invoices
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, amount_due, amount_paid, balance_due, payment_status, due_date, created_at')
          .gte('created_at', `${startDate}T00:00:00`)
          .lte('created_at', `${endDate}T23:59:59`);

        // Fetch invoice line items for overages
        const { data: lineItems } = await (supabase as any)
          .from('invoice_line_items')
          .select('id, line_type, amount, order_id, created_at')
          .eq('line_type', 'overage')
          .gte('created_at', `${startDate}T00:00:00`)
          .lte('created_at', `${endDate}T23:59:59`);

        // Fetch inventory
        const { data: inventory } = await supabase
          .from('inventory')
          .select(`
            id,
            yard_id,
            size_id,
            total_count,
            available_count,
            in_use_count,
            reserved_count,
            low_stock_threshold
          `);

        // Fetch yards
        const { data: yards } = await supabase
          .from('yards')
          .select('id, name')
          .eq('is_active', true);

        // Fetch sizes
        const { data: sizes } = await supabase
          .from('dumpster_sizes')
          .select('id, label, size_value')
          .eq('is_active', true);

        // Calculate funnel metrics
        const quotesArr = quotes || [];
        const ordersArr = orders || [];
        
        const funnel: FunnelMetrics = {
          quotes_created: quotesArr.length,
          quotes_saved: quotesArr.filter(q => ['saved', 'pinned', 'scheduled', 'converted'].includes(q.status)).length,
          quotes_scheduled: quotesArr.filter(q => ['scheduled', 'converted'].includes(q.status)).length,
          orders_created: ordersArr.length,
          orders_completed: ordersArr.filter(o => o.status === 'completed').length,
          conversion_rate: quotesArr.length > 0 ? (ordersArr.length / quotesArr.length) * 100 : 0,
        };
        setFunnelMetrics(funnel);

        // Calculate AR metrics
        const invoicesArr = invoices || [];
        const now = new Date();
        const overdue = invoicesArr.filter(i => 
          i.payment_status !== 'paid' && 
          i.due_date && 
          new Date(i.due_date) < now
        );
        
        const ar: ARMetrics = {
          total_invoiced: invoicesArr.reduce((sum, i) => sum + (i.amount_due || 0), 0),
          total_paid: invoicesArr.reduce((sum, i) => sum + (i.amount_paid || 0), 0),
          total_balance: invoicesArr.reduce((sum, i) => sum + (i.balance_due || 0), 0),
          overdue_count: overdue.length,
          overdue_amount: overdue.reduce((sum, i) => sum + (i.balance_due || 0), 0),
        };
        setARMetrics(ar);

        // Calculate overage metrics
        const overageItems = lineItems || [];
        const ordersWithOverage = new Set(overageItems.map((l: any) => l.order_id));
        const prepayQuotes = quotesArr.filter(q => (q.extra_tons_prepurchased || 0) > 0);
        
        const overage: OverageMetrics = {
          orders_with_overage: ordersWithOverage.size,
          total_overage_amount: overageItems.reduce((sum: number, l: any) => sum + (l.amount || 0), 0),
          avg_overage_per_order: ordersWithOverage.size > 0 
            ? overageItems.reduce((sum: number, l: any) => sum + (l.amount || 0), 0) / ordersWithOverage.size 
            : 0,
          prepay_adoption_rate: quotesArr.length > 0 ? (prepayQuotes.length / quotesArr.length) * 100 : 0,
          prepay_savings: prepayQuotes.reduce((sum, q) => sum + ((q.extra_tons_prepurchased || 0) * 8.25), 0), // 5% of ~$165
        };
        setOverageMetrics(overage);

        // Calculate customer metrics
        const customerOrders = new Map<string, number>();
        const customerRevenue = new Map<string, number>();
        ordersArr.forEach(o => {
          if (o.customer_id) {
            customerOrders.set(o.customer_id, (customerOrders.get(o.customer_id) || 0) + 1);
            customerRevenue.set(o.customer_id, (customerRevenue.get(o.customer_id) || 0) + (o.amount_due || 0));
          }
        });

        const repeatCustomers = Array.from(customerOrders.values()).filter(c => c > 1).length;
        const totalRevenue = ordersArr.reduce((sum, o) => sum + (o.amount_due || 0), 0);
        
        const topCustomersList = Array.from(customerOrders.entries())
          .map(([id, orders]) => ({
            id,
            name: `Customer ${id.slice(0, 8)}`,
            orders,
            revenue: customerRevenue.get(id) || 0,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        const customer: CustomerMetrics = {
          total_customers: customerOrders.size,
          new_customers: customerOrders.size, // simplified
          repeat_customers: repeatCustomers,
          avg_orders_per_customer: customerOrders.size > 0 ? ordersArr.length / customerOrders.size : 0,
          avg_ticket_value: ordersArr.length > 0 ? totalRevenue / ordersArr.length : 0,
          top_customers: topCustomersList,
        };
        setCustomerMetrics(customer);

        // Calculate inventory metrics
        const yardsMap = new Map((yards || []).map(y => [y.id, y.name]));
        const sizesMap = new Map((sizes || []).map(s => [s.id, { label: s.label, value: s.size_value }]));
        
        const inventoryArr = inventory || [];
        const byYard = new Map<string, { total: number; available: number; in_use: number; reserved: number }>();
        const bySize = new Map<string, { total: number; available: number; in_use: number }>();
        let lowStockCount = 0;

        inventoryArr.forEach(inv => {
          // By yard
          const yardStats = byYard.get(inv.yard_id) || { total: 0, available: 0, in_use: 0, reserved: 0 };
          yardStats.total += inv.total_count;
          yardStats.available += inv.available_count;
          yardStats.in_use += inv.in_use_count;
          yardStats.reserved += inv.reserved_count;
          byYard.set(inv.yard_id, yardStats);

          // By size
          const sizeStats = bySize.get(inv.size_id) || { total: 0, available: 0, in_use: 0 };
          sizeStats.total += inv.total_count;
          sizeStats.available += inv.available_count;
          sizeStats.in_use += inv.in_use_count;
          bySize.set(inv.size_id, sizeStats);

          // Low stock
          if (inv.available_count <= inv.low_stock_threshold) {
            lowStockCount++;
          }
        });

        const inventoryResult: InventoryMetrics = {
          by_yard: Array.from(byYard.entries()).map(([id, stats]) => ({
            yard_id: id,
            yard_name: yardsMap.get(id) || 'Unknown',
            ...stats,
            utilization: stats.total > 0 ? (stats.in_use / stats.total) * 100 : 0,
          })),
          by_size: Array.from(bySize.entries()).map(([id, stats]) => ({
            size_value: sizesMap.get(id)?.value || 0,
            label: sizesMap.get(id)?.label || 'Unknown',
            ...stats,
          })).sort((a, b) => a.size_value - b.size_value),
          low_stock_alerts: lowStockCount,
        };
        setInventoryMetrics(inventoryResult);

        // Calculate schedule metrics
        const dayCount = differenceInDays(filters.endDate, filters.startDate) + 1;
        const scheduleByDay = new Map<string, { deliveries: number; pickups: number }>();
        
        ordersArr.forEach(o => {
          if (o.scheduled_delivery_date) {
            const dateKey = o.scheduled_delivery_date;
            const dayStats = scheduleByDay.get(dateKey) || { deliveries: 0, pickups: 0 };
            dayStats.deliveries++;
            scheduleByDay.set(dateKey, dayStats);
          }
          if (o.scheduled_pickup_date) {
            const dateKey = o.scheduled_pickup_date;
            const dayStats = scheduleByDay.get(dateKey) || { deliveries: 0, pickups: 0 };
            dayStats.pickups++;
            scheduleByDay.set(dateKey, dayStats);
          }
        });

        const schedule: ScheduleMetrics = {
          by_day: Array.from(scheduleByDay.entries())
            .map(([date, stats]) => ({
              date,
              deliveries: stats.deliveries,
              pickups: stats.pickups,
              capacity: 20, // assumed daily capacity
            }))
            .sort((a, b) => a.date.localeCompare(b.date)),
          utilization_rate: 0, // calculate based on capacity
          avg_daily_jobs: dayCount > 0 ? ordersArr.length / dayCount : 0,
        };
        setScheduleMetrics(schedule);

        // Calculate daily trend
        const trendByDay = new Map<string, { quotes: number; orders: number; revenue: number }>();
        quotesArr.forEach(q => {
          const dateKey = format(new Date(q.created_at), 'MMM d');
          const dayStats = trendByDay.get(dateKey) || { quotes: 0, orders: 0, revenue: 0 };
          dayStats.quotes++;
          trendByDay.set(dateKey, dayStats);
        });
        ordersArr.forEach(o => {
          const dateKey = format(new Date(o.created_at), 'MMM d');
          const dayStats = trendByDay.get(dateKey) || { quotes: 0, orders: 0, revenue: 0 };
          dayStats.orders++;
          dayStats.revenue += o.amount_due || 0;
          trendByDay.set(dateKey, dayStats);
        });
        setDailyTrend(
          Array.from(trendByDay.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date))
        );

        // Calculate revenue by material
        const materialRevenue = new Map<string, number>();
        quotesArr.forEach(q => {
          const material = q.material_type || 'other';
          const avg = ((q.estimated_min || 0) + (q.estimated_max || 0)) / 2;
          materialRevenue.set(material, (materialRevenue.get(material) || 0) + avg);
        });
        setRevenueByMaterial(
          Array.from(materialRevenue.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
        );

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate, filters.yardId, filters.customerType]);

  return {
    loading,
    funnelMetrics,
    arMetrics,
    overageMetrics,
    customerMetrics,
    inventoryMetrics,
    scheduleMetrics,
    dailyTrend,
    revenueByMaterial,
  };
}

// Export CSV helper
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(h => {
        const val = row[h];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
}
