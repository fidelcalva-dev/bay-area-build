/**
 * Customer 360 - Service Intelligence Tab
 * Aggregates operational metrics: preferred size, material, revenue, reliability
 */
import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Package, Truck, Clock, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface ServiceMetrics {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  preferredSize: string | null;
  preferredMaterial: string | null;
  avgOrderValue: number;
  totalRevenue: number;
  onTimeDeliveryRate: number;
  dumpTicketCompliance: number;
  issueCount: number;
  avgDaysOut: number;
  heavyMaterialOrders: number;
}

interface Props {
  customerId: string;
}

export function ServiceIntelligenceTab({ customerId }: Props) {
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);

      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id, status, amount_due, payment_status,
          scheduled_delivery_date, actual_delivery_at,
          actual_pickup_at, dump_ticket_url,
          is_heavy_material, contamination_detected, overfill_flagged, wrong_material_flagged,
          quotes (material_type, user_selected_size_yards)
        `)
        .eq('customer_id', customerId);

      if (!orders || orders.length === 0) {
        setMetrics(null);
        setIsLoading(false);
        return;
      }

      const completed = orders.filter((o: any) => o.status === 'completed');
      const active = orders.filter((o: any) => !['completed', 'cancelled'].includes(o.status));
      
      // Preferred size
      const sizeCounts: Record<string, number> = {};
      const materialCounts: Record<string, number> = {};
      let totalValue = 0;
      let ticketsPresent = 0;
      let issueCount = 0;
      let heavyCount = 0;

      orders.forEach((o: any) => {
        const q = o.quotes;
        if (q?.user_selected_size_yards) {
          const size = `${q.user_selected_size_yards}yd`;
          sizeCounts[size] = (sizeCounts[size] || 0) + 1;
        }
        if (q?.material_type) {
          materialCounts[q.material_type] = (materialCounts[q.material_type] || 0) + 1;
        }
        if (o.amount_due) totalValue += o.amount_due;
        if (o.dump_ticket_url) ticketsPresent++;
        if (o.contamination_detected || o.overfill_flagged || o.wrong_material_flagged) issueCount++;
        if (o.is_heavy_material) heavyCount++;
      });

      const topSize = Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      const topMaterial = Object.entries(materialCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

      // On-time rate (simple: delivery happened on or before scheduled date)
      let onTime = 0;
      let totalScheduled = 0;
      completed.forEach((o: any) => {
        if (o.scheduled_delivery_date && o.actual_delivery_at) {
          totalScheduled++;
          if (new Date(o.actual_delivery_at).toDateString() <= new Date(o.scheduled_delivery_date).toDateString()) {
            onTime++;
          }
        }
      });

      // Avg days out (delivery to pickup)
      let daysOutTotal = 0;
      let daysOutCount = 0;
      completed.forEach((o: any) => {
        if (o.actual_delivery_at && o.actual_pickup_at) {
          const days = (new Date(o.actual_pickup_at).getTime() - new Date(o.actual_delivery_at).getTime()) / (1000 * 60 * 60 * 24);
          daysOutTotal += days;
          daysOutCount++;
        }
      });

      const pickupsNeeded = completed.length; // rough approximation

      setMetrics({
        totalOrders: orders.length,
        completedOrders: completed.length,
        activeOrders: active.length,
        preferredSize: topSize,
        preferredMaterial: topMaterial,
        avgOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
        totalRevenue: totalValue,
        onTimeDeliveryRate: totalScheduled > 0 ? (onTime / totalScheduled) * 100 : 100,
        dumpTicketCompliance: pickupsNeeded > 0 ? (ticketsPresent / pickupsNeeded) * 100 : 100,
        issueCount,
        avgDaysOut: daysOutCount > 0 ? daysOutTotal / daysOutCount : 0,
        heavyMaterialOrders: heavyCount,
      });
      setIsLoading(false);
    }
    load();
  }, [customerId]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No service data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Package className="w-4 h-4" />} label="Total Orders" value={metrics.totalOrders.toString()} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Total Revenue" value={`$${metrics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Avg Days Out" value={metrics.avgDaysOut > 0 ? `${metrics.avgDaysOut.toFixed(1)}d` : '—'} />
        <StatCard icon={<Truck className="w-4 h-4" />} label="Avg Order" value={`$${metrics.avgOrderValue.toFixed(0)}`} />
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Customer Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Preferred Size</span>
            <Badge variant="secondary">{metrics.preferredSize || '—'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Preferred Material</span>
            <Badge variant="secondary">{metrics.preferredMaterial || '—'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Heavy Material Orders</span>
            <Badge variant={metrics.heavyMaterialOrders > 0 ? 'destructive' : 'secondary'}>{metrics.heavyMaterialOrders}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Service Reliability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" />On-Time Delivery</span>
              <span className="font-medium">{metrics.onTimeDeliveryRate.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.onTimeDeliveryRate} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-600" />Dump Ticket Compliance</span>
              <span className="font-medium">{metrics.dumpTicketCompliance.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.dumpTicketCompliance} className="h-2" />
          </div>
          {metrics.issueCount > 0 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
              <span className="flex items-center gap-1.5 text-sm"><AlertTriangle className="w-3.5 h-3.5 text-destructive" />Service Issues</span>
              <Badge variant="destructive">{metrics.issueCount}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">{icon}<span className="text-[10px] uppercase tracking-wide font-medium">{label}</span></div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
