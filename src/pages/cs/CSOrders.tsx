import { useEffect, useState } from 'react';
import { Loader2, Search, CheckCircle2, Phone, MessageSquare, MapPin, Calendar, Clock, AlertCircle, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { ScheduleConfirmationDialog } from '@/components/cs/ScheduleConfirmationDialog';
import { useOfficeStatus } from '@/hooks/useOfficeStatus';
import { OperationalTimeCalculator } from '@/components/operations/OperationalTimeCalculator';
import type { MaterialCategory } from '@/types/operationalTime';

interface Order {
  id: string;
  status: string;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  created_at: string;
  assigned_yard_id: string | null;
  quotes?: {
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    delivery_address: string | null;
    delivery_lat: number | null;
    delivery_lng: number | null;
    user_selected_size_yards: number | null;
    material_type: string | null;
    rental_days?: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  scheduled_requested: { label: 'Schedule Requested', color: 'bg-orange-100 text-orange-800', icon: <Clock className="w-3 h-3" /> },
  scheduled_confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3" /> },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  en_route: { label: 'En Route', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  pickup_scheduled: { label: 'Pickup Scheduled', color: 'bg-orange-100 text-orange-800' },
  picked_up: { label: 'Picked Up', color: 'bg-teal-100 text-teal-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function CSOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const { isOpen: isOfficeOpen } = useOfficeStatus();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        quotes (
          customer_name,
          customer_phone,
          customer_email,
          delivery_address,
          delivery_lat,
          delivery_lng,
          user_selected_size_yards,
          material_type,
          rental_days
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: 'Error loading orders', description: error.message, variant: 'destructive' });
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  }

  // Count orders needing confirmation
  const pendingConfirmationCount = orders.filter(
    (o) => o.status === 'scheduled_requested' || o.status === 'pending'
  ).length;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.quotes?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.quotes?.customer_phone?.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      statusFilter === 'needs_confirm' 
        ? (statusFilter === 'all' || order.status === 'scheduled_requested' || order.status === 'pending')
        : order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Can this order be confirmed?
  const canConfirm = (order: Order) => 
    order.status === 'scheduled_requested' || order.status === 'pending';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            View orders and confirm schedules
          </p>
        </div>
        {pendingConfirmationCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-800">
              {pendingConfirmationCount} awaiting confirmation
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="needs_confirm">
              ⚡ Needs Confirmation
            </SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow 
                key={order.id}
                className={canConfirm(order) ? 'bg-orange-50/50' : ''}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{order.quotes?.customer_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{order.quotes?.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.quotes?.user_selected_size_yards} yd</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.quotes?.material_type?.replace('_', ' ')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {order.scheduled_delivery_date ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p>{format(new Date(order.scheduled_delivery_date), 'MMM d')}</p>
                        {order.scheduled_delivery_window && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {order.scheduled_delivery_window}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not scheduled</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`${STATUS_CONFIG[order.status]?.color || 'bg-gray-100'} flex items-center gap-1 w-fit`}>
                    {STATUS_CONFIG[order.status]?.icon}
                    {STATUS_CONFIG[order.status]?.label || order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canConfirm(order) && (
                      <Button
                        size="sm"
                        onClick={() => setConfirmingOrder(order)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${STATUS_CONFIG[selectedOrder.status]?.color || 'bg-gray-100'} flex items-center gap-1`}>
                  {STATUS_CONFIG[selectedOrder.status]?.icon}
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
                <span className="text-sm text-muted-foreground font-mono">
                  {selectedOrder.id.slice(0, 8)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="font-medium">{selectedOrder.quotes?.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{selectedOrder.quotes?.customer_phone}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </label>
                <p className="mt-1">{selectedOrder.quotes?.delivery_address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Size</label>
                  <p className="font-medium">{selectedOrder.quotes?.user_selected_size_yards} yard</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Material</label>
                  <p className="font-medium capitalize">
                    {selectedOrder.quotes?.material_type?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {selectedOrder.scheduled_delivery_date && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Delivery:</span>
                    <span>{format(new Date(selectedOrder.scheduled_delivery_date), 'EEEE, MMM d')}</span>
                    {selectedOrder.scheduled_delivery_window && (
                      <Badge variant="outline" className="capitalize">
                        {selectedOrder.scheduled_delivery_window}
                      </Badge>
                    )}
                  </div>
                  {selectedOrder.scheduled_pickup_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Pickup:</span>
                      <span>{format(new Date(selectedOrder.scheduled_pickup_date), 'EEEE, MMM d')}</span>
                      {selectedOrder.scheduled_pickup_window && (
                        <Badge variant="outline" className="capitalize">
                          {selectedOrder.scheduled_pickup_window}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Operational Time (Internal) */}
              {selectedOrder.assigned_yard_id && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Service Duration (Internal)
                        </span>
                        <span className="text-xs text-muted-foreground">Click to expand</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <OperationalTimeCalculator
                        initialYardId={selectedOrder.assigned_yard_id}
                        initialAddress={selectedOrder.quotes?.delivery_address || undefined}
                        initialLat={selectedOrder.quotes?.delivery_lat || undefined}
                        initialLng={selectedOrder.quotes?.delivery_lng || undefined}
                        initialServiceType="DELIVERY"
                        initialMaterialCategory={
                          (selectedOrder.quotes?.material_type?.toUpperCase() as MaterialCategory) || 'DEBRIS'
                        }
                        compact={true}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`tel:${selectedOrder.quotes?.customer_phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`sms:${selectedOrder.quotes?.customer_phone}`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Text
                  </a>
                </Button>
              </div>

              {canConfirm(selectedOrder) && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedOrder(null);
                    setConfirmingOrder(selectedOrder);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Schedule
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Confirmation Dialog */}
      {confirmingOrder && (
        <ScheduleConfirmationDialog
          order={confirmingOrder}
          open={!!confirmingOrder}
          onOpenChange={(open) => !open && setConfirmingOrder(null)}
          onConfirmed={() => {
            setConfirmingOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
