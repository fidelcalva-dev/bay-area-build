/**
 * Customer 360 - Orders Tab
 * Shows full operational order data: status, dates, driver, truck, material, dump ticket, billing
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Truck, User, MapPin, Calendar, FileText, 
  CreditCard, AlertTriangle, Camera, CheckCircle2, Clock,
  ExternalLink, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface OperationalOrder {
  id: string;
  status: string;
  amount_due: number | null;
  payment_status: string | null;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  actual_delivery_at: string | null;
  actual_pickup_at: string | null;
  assigned_driver_id: string | null;
  truck_id: string | null;
  asset_id: string | null;
  is_heavy_material: boolean | null;
  heavy_material_code: string | null;
  dump_ticket_url: string | null;
  placement_photo_url: string | null;
  pickup_photo_url: string | null;
  contamination_detected: boolean | null;
  overfill_flagged: boolean | null;
  wrong_material_flagged: boolean | null;
  actual_weight_tons: number | null;
  created_at: string;
  quote_id: string | null;
  quotes: {
    material_type: string | null;
    user_selected_size_yards: number | null;
    delivery_address: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  pending: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  confirmed: { color: 'text-blue-700', bg: 'bg-blue-100' },
  ready_to_schedule: { color: 'text-indigo-700', bg: 'bg-indigo-100' },
  scheduled: { color: 'text-purple-700', bg: 'bg-purple-100' },
  scheduled_requested: { color: 'text-purple-700', bg: 'bg-purple-100' },
  assigned: { color: 'text-cyan-700', bg: 'bg-cyan-100' },
  en_route: { color: 'text-blue-700', bg: 'bg-blue-100' },
  delivered: { color: 'text-green-700', bg: 'bg-green-100' },
  pickup_requested: { color: 'text-orange-700', bg: 'bg-orange-100' },
  pickup_scheduled: { color: 'text-orange-700', bg: 'bg-orange-100' },
  picked_up: { color: 'text-teal-700', bg: 'bg-teal-100' },
  completed: { color: 'text-green-800', bg: 'bg-green-200' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-100' },
  paused: { color: 'text-amber-700', bg: 'bg-amber-100' },
  issue: { color: 'text-red-700', bg: 'bg-red-100' },
};

interface Props {
  customerId: string;
}

export function OrdersTab({ customerId }: Props) {
  const [orders, setOrders] = useState<OperationalOrder[]>([]);
  const [drivers, setDrivers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [ordersRes, driversRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            id, status, amount_due, payment_status,
            scheduled_delivery_date, scheduled_delivery_window,
            scheduled_pickup_date, scheduled_pickup_window,
            actual_delivery_at, actual_pickup_at,
            assigned_driver_id, truck_id, asset_id,
            is_heavy_material, heavy_material_code,
            dump_ticket_url, placement_photo_url, pickup_photo_url,
            contamination_detected, overfill_flagged, wrong_material_flagged,
            actual_weight_tons, created_at, quote_id,
            quotes (material_type, user_selected_size_yards, delivery_address)
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase.from('drivers').select('id, name'),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as unknown as OperationalOrder[]);
      
      if (driversRes.data) {
        const map: Record<string, string> = {};
        driversRes.data.forEach((d: any) => { map[d.id] = d.name; });
        setDrivers(map);
      }
      setIsLoading(false);
    }
    load();
  }, [customerId]);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm mt-1">Orders will appear here once created</p>
        </CardContent>
      </Card>
    );
  }

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniKpi label="Total Orders" value={orders.length} />
        <MiniKpi label="Active" value={activeOrders.length} accent />
        <MiniKpi label="Completed" value={pastOrders.filter(o => o.status === 'completed').length} />
        <MiniKpi label="Issues" value={orders.filter(o => o.contamination_detected || o.overfill_flagged || o.wrong_material_flagged).length} warning />
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Active Orders</h3>
          <div className="space-y-3">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} drivers={drivers} />
            ))}
          </div>
        </div>
      )}

      {/* Past Orders */}
      {pastOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Past Orders ({pastOrders.length})</h3>
          <div className="space-y-2">
            {pastOrders.map(order => (
              <OrderCard key={order.id} order={order} drivers={drivers} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, drivers, compact }: { order: OperationalOrder; drivers: Record<string, string>; compact?: boolean }) {
  const sc = STATUS_CONFIG[order.status] || { color: 'text-muted-foreground', bg: 'bg-muted' };
  const hasFlags = order.contamination_detected || order.overfill_flagged || order.wrong_material_flagged;

  return (
    <Card className={`${hasFlags ? 'border-destructive/40' : ''} ${compact ? 'opacity-80' : ''}`}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${sc.bg} ${sc.color} text-xs`}>{order.status.replace(/_/g, ' ')}</Badge>
              {order.payment_status && (
                <Badge variant="outline" className="text-xs gap-1">
                  <CreditCard className="w-3 h-3" />
                  {order.payment_status}
                </Badge>
              )}
              {hasFlags && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertTriangle className="w-3 h-3" />Issue
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Order #{order.id.slice(0, 8)} · {format(new Date(order.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link to={`/admin/orders?id=${order.id}`}>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {!compact && (
          <>
            {/* Service Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
              <DetailItem icon={<Package className="w-3 h-3" />} label="Size" value={order.quotes?.user_selected_size_yards ? `${order.quotes.user_selected_size_yards}yd` : '—'} />
              <DetailItem icon={<FileText className="w-3 h-3" />} label="Material" value={order.quotes?.material_type || order.heavy_material_code || '—'} />
              <DetailItem icon={<User className="w-3 h-3" />} label="Driver" value={order.assigned_driver_id ? drivers[order.assigned_driver_id] || 'Assigned' : 'Unassigned'} />
              <DetailItem icon={<Truck className="w-3 h-3" />} label="Truck" value={order.truck_id ? `#${order.truck_id.slice(0, 6)}` : '—'} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <DetailItem 
                icon={<Calendar className="w-3 h-3" />} 
                label="Delivery" 
                value={order.actual_delivery_at 
                  ? `✓ ${format(new Date(order.actual_delivery_at), 'MMM d')}` 
                  : order.scheduled_delivery_date 
                    ? format(new Date(order.scheduled_delivery_date), 'MMM d') 
                    : '—'} 
              />
              <DetailItem 
                icon={<Calendar className="w-3 h-3" />} 
                label="Pickup" 
                value={order.actual_pickup_at 
                  ? `✓ ${format(new Date(order.actual_pickup_at), 'MMM d')}` 
                  : order.scheduled_pickup_date 
                    ? format(new Date(order.scheduled_pickup_date), 'MMM d') 
                    : '—'} 
              />
            </div>

            {/* Proof Status */}
            <div className="flex items-center gap-3 text-xs">
              <ProofBadge label="Placement" hasProof={!!order.placement_photo_url} />
              <ProofBadge label="Pickup" hasProof={!!order.pickup_photo_url} />
              <ProofBadge label="Dump Ticket" hasProof={!!order.dump_ticket_url} />
              {order.actual_weight_tons != null && (
                <span className="text-muted-foreground">Weight: {order.actual_weight_tons}t</span>
              )}
            </div>

            {/* Flags */}
            {hasFlags && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {order.contamination_detected && <Badge variant="destructive" className="text-xs">Contamination</Badge>}
                {order.overfill_flagged && <Badge variant="destructive" className="text-xs">Overfill</Badge>}
                {order.wrong_material_flagged && <Badge variant="destructive" className="text-xs">Wrong Material</Badge>}
              </div>
            )}
          </>
        )}

        {compact && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{order.quotes?.user_selected_size_yards}yd</span>
            <span>{order.quotes?.material_type || '—'}</span>
            {order.amount_due != null && <span className="ml-auto font-medium">${order.amount_due.toFixed(2)}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}

function ProofBadge({ label, hasProof }: { label: string; hasProof: boolean }) {
  return (
    <span className={`flex items-center gap-1 ${hasProof ? 'text-green-600' : 'text-muted-foreground/50'}`}>
      {hasProof ? <CheckCircle2 className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
      {label}
    </span>
  );
}

function MiniKpi({ label, value, accent, warning }: { label: string; value: number; accent?: boolean; warning?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${warning && value > 0 ? 'border-destructive/30 bg-destructive/5' : accent ? 'border-primary/30 bg-primary/5' : ''}`}>
      <p className={`text-xl font-bold ${warning && value > 0 ? 'text-destructive' : accent ? 'text-primary' : ''}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
