import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Truck, Clock, MapPin, User, Loader2, Phone, 
  MessageSquare, ChevronRight, Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMobileMode } from '@/hooks/useMobileMode';
import { MobileQuickActions } from '@/components/mobile';

interface Order {
  id: string;
  status: string;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  assigned_driver_id: string | null;
  assigned_yard_id: string | null;
  quotes: {
    customer_name: string | null;
    customer_phone: string | null;
    delivery_address: string | null;
    zip_code: string;
    material_type: string;
    user_selected_size_yards: number | null;
  } | null;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
}

const TIME_WINDOWS = [
  { value: 'morning', label: 'Morning', time: '7–11 AM' },
  { value: 'midday', label: 'Midday', time: '11 AM–3 PM' },
  { value: 'afternoon', label: 'Afternoon', time: '3–6 PM' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  pickup_scheduled: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function DispatchToday() {
  const { toast } = useToast();
  const { mobileMode } = useMobileMode();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filterWindow, setFilterWindow] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDriverId, setAssignDriverId] = useState<string>('');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [ordersRes, driversRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            id, status, scheduled_delivery_date, scheduled_delivery_window,
            scheduled_pickup_date, scheduled_pickup_window,
            assigned_driver_id, assigned_yard_id,
            quotes (
              customer_name, customer_phone, delivery_address, zip_code,
              material_type, user_selected_size_yards
            )
          `)
          .or(`scheduled_delivery_date.eq.${today},scheduled_pickup_date.eq.${today}`)
          .not('status', 'in', '("completed","cancelled")'),
        supabase.from('drivers').select('id, name, phone').eq('is_active', true),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      if (driversRes.data) setDrivers(driversRes.data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const getJobType = (order: Order): 'delivery' | 'pickup' => {
    if (order.scheduled_delivery_date === today) return 'delivery';
    return 'pickup';
  };

  const getWindow = (order: Order): string | null => {
    const type = getJobType(order);
    return type === 'delivery' 
      ? order.scheduled_delivery_window 
      : order.scheduled_pickup_window;
  };

  const filteredOrders = orders.filter((order) => {
    const jobType = getJobType(order);
    const window = getWindow(order);
    
    if (filterType !== 'all' && jobType !== filterType) return false;
    if (filterWindow !== 'all' && window !== filterWindow) return false;
    
    return true;
  });

  // Group by window
  const groupedOrders = TIME_WINDOWS.map(w => ({
    ...w,
    orders: filteredOrders.filter(o => getWindow(o) === w.value),
  }));

  const openAssignDialog = (order: Order) => {
    setSelectedOrder(order);
    setAssignDriverId(order.assigned_driver_id || '');
    setDialogOpen(true);
  };

  async function handleAssign() {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ assigned_driver_id: assignDriverId || null })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast({ title: 'Driver assigned' });
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error assigning driver', variant: 'destructive' });
    }
  }

  const getDriverName = (id: string | null) => 
    drivers.find(d => d.id === id)?.name || 'Unassigned';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={mobileMode ? 'pb-20' : 'p-6'}>
      <div className={mobileMode ? 'p-4' : 'mb-6'}>
        <h1 className={mobileMode ? 'text-xl font-bold' : 'text-2xl font-bold'}>
          Today's Jobs
        </h1>
        <p className="text-muted-foreground text-sm">
          {format(new Date(), 'EEEE, MMMM d')} • {filteredOrders.length} jobs
        </p>
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-2 ${mobileMode ? 'px-4 pb-4' : 'mb-4'}`}>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-32 min-h-[44px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="delivery">Deliveries</SelectItem>
            <SelectItem value="pickup">Pickups</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterWindow} onValueChange={setFilterWindow}>
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-32 min-h-[44px]">
            <SelectValue placeholder="All Windows" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Windows</SelectItem>
            {TIME_WINDOWS.map(w => (
              <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grouped by Window */}
      <div className={`space-y-6 ${mobileMode ? 'px-4' : ''}`}>
        {groupedOrders.map(group => (
          <div key={group.value}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{group.label}</span>
              <span className="text-muted-foreground text-sm">({group.time})</span>
              <Badge variant="secondary" className="ml-auto">
                {group.orders.length}
              </Badge>
            </div>
            
            {group.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground pl-6">No jobs scheduled</p>
            ) : (
              <div className="space-y-2">
                {group.orders.map(order => {
                  const jobType = getJobType(order);
                  const isDelivery = jobType === 'delivery';
                  
                  return (
                    <Card 
                      key={order.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        isDelivery ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-orange-500'
                      }`}
                      onClick={() => openAssignDialog(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={isDelivery ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}>
                                {isDelivery ? 'Delivery' : 'Pickup'}
                              </Badge>
                              <Badge variant="outline" className={STATUS_COLORS[order.status] || ''}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="font-medium truncate">
                              {order.quotes?.customer_name || 'Customer'}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.quotes?.zip_code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.quotes?.user_selected_size_yards}yd • {order.quotes?.material_type}
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <Badge 
                              variant={order.assigned_driver_id ? 'default' : 'destructive'}
                              className="mb-2"
                            >
                              <User className="w-3 h-3 mr-1" />
                              {getDriverName(order.assigned_driver_id)}
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assign Driver Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="font-medium">{selectedOrder.quotes?.customer_name || 'Customer'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedOrder.quotes?.delivery_address || selectedOrder.quotes?.zip_code}
                </p>
                <div className="flex gap-2 mt-2">
                  {selectedOrder.quotes?.customer_phone && (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${selectedOrder.quotes.customer_phone}`}>
                          <Phone className="w-3 h-3 mr-1" /> Call
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`sms:${selectedOrder.quotes.customer_phone}`}>
                          <MessageSquare className="w-3 h-3 mr-1" /> Text
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assign Driver</Label>
                <Select value={assignDriverId} onValueChange={setAssignDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Quick Actions */}
      {mobileMode && selectedOrder && (
        <MobileQuickActions
          customerPhone={selectedOrder.quotes?.customer_phone}
          address={selectedOrder.quotes?.delivery_address}
          orderId={selectedOrder.id}
        />
      )}
    </div>
  );
}
