import { useState, useEffect } from 'react';
import { 
  Package, Truck, Calendar, MapPin, User, Phone,
  Clock, Warehouse, AlertCircle, Loader2, AlertTriangle, FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { logStatusChange } from '@/lib/auditLog';
import {
  reserveInventory,
  deployInventory,
  releaseInventory,
  cancelReservation,
  checkInventoryAvailability,
} from '@/lib/inventoryService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderDetail {
  id: string;
  status: string;
  payment_status: string | null;
  final_total: number | null;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  assigned_driver_id: string | null;
  assigned_yard_id: string | null;
  inventory_id: string | null;
  route_notes: string | null;
  driver_notes: string | null;
  internal_notes: string | null;
  text_before_arrival: boolean | null;
  placement_photo_url: string | null;
  pickup_photo_url: string | null;
  dump_ticket_url: string | null;
  created_at: string;
  quotes?: {
    id: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    delivery_address: string | null;
    zip_code: string;
    material_type: string;
    subtotal: number;
    estimated_min: number;
    estimated_max: number;
    yard_name: string | null;
    distance_miles: number | null;
    truck_duration_min: number | null;
    placement_notes: string | null;
    rental_days: number;
    size_id: string | null;
    dumpster_sizes?: { label: string; size_value: number; id: string } | null;
  } | null;
  drivers?: { name: string; phone: string } | null;
  yards?: { name: string; market: string } | null;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
}

interface Yard {
  id: string;
  name: string;
  market: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'scheduled_requested', label: 'Schedule Requested', color: 'bg-amber-100 text-amber-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'en_route', label: 'En Route', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'picked_up', label: 'Picked Up', color: 'bg-teal-100 text-teal-800' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const TIME_WINDOWS = [
  { value: 'morning', label: 'Morning (7–11 AM)' },
  { value: 'midday', label: 'Midday (11 AM–3 PM)' },
  { value: 'afternoon', label: 'Afternoon (3–6 PM)' },
];

interface Props {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function OrderDetailDialog({ orderId, open, onOpenChange, onUpdate }: Props) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Inventory state
  const [inventoryWarning, setInventoryWarning] = useState<string | null>(null);
  const [lowStockWarning, setLowStockWarning] = useState<boolean>(false);
  
  // Editable fields
  const [status, setStatus] = useState('');
  const [driverId, setDriverId] = useState<string | null>(null);
  const [yardId, setYardId] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupWindow, setPickupWindow] = useState('');
  const [routeNotes, setRouteNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    if (open && orderId) {
      fetchOrder();
      fetchDriversAndYards();
    }
  }, [open, orderId]);

  async function fetchOrder() {
    if (!orderId) return;
    setIsLoading(true);
    setInventoryWarning(null);
    setLowStockWarning(false);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        quotes (
          id, customer_name, customer_phone, customer_email,
          delivery_address, zip_code, material_type, subtotal,
          estimated_min, estimated_max, yard_name, distance_miles,
          truck_duration_min, placement_notes, rental_days, size_id,
          dumpster_sizes (id, label, size_value)
        ),
        drivers (name, phone),
        yards (name, market)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      toast({ title: 'Error loading order', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const orderData = data as unknown as OrderDetail;
    setOrder(orderData);
    setStatus(orderData.status);
    setDriverId(orderData.assigned_driver_id);
    setYardId(orderData.assigned_yard_id);
    setDeliveryDate(orderData.scheduled_delivery_date || '');
    setDeliveryWindow(orderData.scheduled_delivery_window || '');
    setPickupDate(orderData.scheduled_pickup_date || '');
    setPickupWindow(orderData.scheduled_pickup_window || '');
    setRouteNotes(orderData.route_notes || '');
    setInternalNotes(orderData.internal_notes || '');
    setIsLoading(false);
  }

  async function fetchDriversAndYards() {
    const [driversRes, yardsRes] = await Promise.all([
      supabase.from('drivers').select('id, name, phone').eq('is_active', true),
      supabase.from('yards').select('id, name, market').eq('is_active', true),
    ]);
    setDrivers(driversRes.data || []);
    setYards(yardsRes.data || []);
  }

  async function handleSave() {
    if (!order) return;
    setIsSaving(true);
    setInventoryWarning(null);

    const oldStatus = order.status;
    const newStatus = status;
    const statusChanged = oldStatus !== newStatus;
    const effectiveYardId = yardId || order.assigned_yard_id;
    const sizeId = order.quotes?.size_id || order.quotes?.dumpster_sizes?.id;

    // ========== INVENTORY LOGIC ==========
    
    // RESERVE: scheduled_requested/pending → scheduled (confirmation)
    if (statusChanged && ['scheduled_requested', 'pending', 'confirmed'].includes(oldStatus) && newStatus === 'scheduled') {
      if (!effectiveYardId || !sizeId) {
        toast({ 
          title: 'Cannot confirm schedule', 
          description: 'Yard and dumpster size must be assigned before confirming', 
          variant: 'destructive' 
        });
        setIsSaving(false);
        return;
      }

      // Check availability before proceeding
      const availability = await checkInventoryAvailability(effectiveYardId, sizeId);
      if (!availability.available) {
        setInventoryWarning(`No available inventory at ${availability.inventory?.yards?.name || 'selected yard'} for ${availability.inventory?.dumpster_sizes?.label || 'selected size'}`);
        toast({ 
          title: 'No inventory available', 
          description: 'Cannot confirm schedule - no dumpsters available at this yard/size', 
          variant: 'destructive' 
        });
        setIsSaving(false);
        return;
      }

      // Reserve the inventory
      const reserveResult = await reserveInventory(order.id, effectiveYardId, sizeId);
      if (!reserveResult.success) {
        toast({ 
          title: 'Inventory reservation failed', 
          description: reserveResult.error, 
          variant: 'destructive' 
        });
        setIsSaving(false);
        return;
      }

      if (reserveResult.lowStock) {
        setLowStockWarning(true);
        toast({ 
          title: 'Low stock alert', 
          description: `Only ${reserveResult.availableCount} units remaining at this yard/size`, 
          variant: 'default' 
        });
      }

      toast({ title: 'Inventory reserved', description: 'Dumpster allocated for this order' });
    }

    // DEPLOY: scheduled/en_route → delivered
    if (statusChanged && ['scheduled', 'en_route'].includes(oldStatus) && newStatus === 'delivered') {
      if (order.inventory_id) {
        const deployResult = await deployInventory(order.id, order.inventory_id);
        if (!deployResult.success) {
          toast({ title: 'Warning', description: deployResult.error, variant: 'default' });
        }
      }
    }

    // RELEASE: delivered/pickup_scheduled → picked_up OR any → completed
    if (statusChanged && (
      (['delivered', 'pickup_scheduled'].includes(oldStatus) && newStatus === 'picked_up') ||
      (newStatus === 'completed' && order.inventory_id)
    )) {
      if (order.inventory_id) {
        const releaseResult = await releaseInventory(order.id, order.inventory_id);
        if (!releaseResult.success) {
          toast({ title: 'Warning', description: releaseResult.error, variant: 'default' });
        } else {
          toast({ title: 'Inventory released', description: 'Dumpster returned to available stock' });
        }
      }
    }

    // CANCEL: If order cancelled before delivery, release reservation
    if (statusChanged && newStatus === 'cancelled' && order.inventory_id) {
      if (['scheduled', 'en_route'].includes(oldStatus)) {
        // Still reserved, not deployed
        const cancelResult = await cancelReservation(order.id, order.inventory_id);
        if (cancelResult.success) {
          toast({ title: 'Reservation cancelled', description: 'Inventory returned to available' });
        }
      } else if (['delivered', 'pickup_scheduled'].includes(oldStatus)) {
        // Already deployed, need to release
        const releaseResult = await releaseInventory(order.id, order.inventory_id);
        if (releaseResult.success) {
          toast({ title: 'Inventory released', description: 'Dumpster returned to available stock' });
        }
      }
    }

    // ========== SAVE ORDER ==========
    const updates = {
      status,
      assigned_driver_id: driverId,
      assigned_yard_id: yardId,
      scheduled_delivery_date: deliveryDate || null,
      scheduled_delivery_window: deliveryWindow || null,
      scheduled_pickup_date: pickupDate || null,
      scheduled_pickup_window: pickupWindow || null,
      route_notes: routeNotes || null,
      internal_notes: internalNotes || null,
    };

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id);

    if (error) {
      toast({ title: 'Error saving order', variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    // Log status change if it changed
    if (statusChanged) {
      await logStatusChange('order', order.id, oldStatus, newStatus);
    }

    toast({ title: 'Order updated successfully' });
    setIsSaving(false);
    onUpdate?.();
    onOpenChange(false);
  }

  const getStatusInfo = (s: string) => STATUS_OPTIONS.find(o => o.value === s) || STATUS_OPTIONS[0];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Details
            {order && (
              <Badge className={getStatusInfo(order.status).color}>
                {getStatusInfo(order.status).label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Inventory Warnings */}
            {inventoryWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Inventory Unavailable</AlertTitle>
                <AlertDescription>{inventoryWarning}</AlertDescription>
              </Alert>
            )}
            {lowStockWarning && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Low Stock Alert</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Inventory is running low at this yard/size combination. Consider restocking.
                </AlertDescription>
              </Alert>
            )}
            {/* Customer Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{order.quotes?.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {order.quotes?.customer_phone || 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Delivery Address</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order.quotes?.delivery_address || order.quotes?.zip_code || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4" />
                Service Details
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Dumpster Size</p>
                  <p className="font-medium">{order.quotes?.dumpster_sizes?.label || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Material Type</p>
                  <p className="font-medium capitalize">{order.quotes?.material_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rental Days</p>
                  <p className="font-medium">{order.quotes?.rental_days || 7} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-medium">{order.quotes?.distance_miles?.toFixed(1) || 'N/A'} mi</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ETA</p>
                  <p className="font-medium">{order.quotes?.truck_duration_min || 'N/A'} min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quote Total</p>
                  <p className="font-medium text-primary">${order.quotes?.subtotal?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              {order.quotes?.placement_notes && (
                <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                  <strong>Placement Notes:</strong> {order.quotes.placement_notes}
                </div>
              )}
            </div>

            <Separator />

            {/* Scheduling */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Delivery Schedule
                </h3>
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Input 
                    type="date" 
                    value={deliveryDate} 
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Window</Label>
                  <Select value={deliveryWindow} onValueChange={setDeliveryWindow}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select window" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_WINDOWS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pickup Schedule
                </h3>
                <div className="space-y-2">
                  <Label>Pickup Date</Label>
                  <Input 
                    type="date" 
                    value={pickupDate} 
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Window</Label>
                  <Select value={pickupWindow} onValueChange={setPickupWindow}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select window" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_WINDOWS.map((w) => (
                        <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Assign Driver</Label>
                <Select value={driverId || ''} onValueChange={(v) => setDriverId(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dispatch Yard</Label>
                <Select value={yardId || ''} onValueChange={(v) => setYardId(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select yard" />
                  </SelectTrigger>
                  <SelectContent>
                    {yards.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{y.name} ({y.market})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <Badge className={s.color}>{s.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Route Notes (visible to driver)</Label>
                <Textarea 
                  value={routeNotes} 
                  onChange={(e) => setRouteNotes(e.target.value)}
                  placeholder="Directions, gate codes, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Internal Notes</Label>
                <Textarea 
                  value={internalNotes} 
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Admin notes (not visible to customer)"
                  rows={3}
                />
              </div>
            </div>

            {/* Photos */}
            {(order.placement_photo_url || order.pickup_photo_url || order.dump_ticket_url) && (
              <div className="space-y-2">
                <Label>Photos & Documents</Label>
                <div className="flex gap-4">
                  {order.placement_photo_url && (
                    <a href={order.placement_photo_url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="w-24 h-24 rounded-lg border overflow-hidden hover:ring-2 ring-primary">
                        <img src={order.placement_photo_url} alt="Placement" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-center mt-1 text-muted-foreground">Delivery</p>
                    </a>
                  )}
                  {order.pickup_photo_url && (
                    <a href={order.pickup_photo_url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="w-24 h-24 rounded-lg border overflow-hidden hover:ring-2 ring-primary">
                        <img src={order.pickup_photo_url} alt="Pickup" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-center mt-1 text-muted-foreground">Pickup</p>
                    </a>
                  )}
                  {order.dump_ticket_url && (
                    <a href={order.dump_ticket_url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="w-24 h-24 rounded-lg border overflow-hidden hover:ring-2 ring-primary flex items-center justify-center bg-muted">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-center mt-1 text-muted-foreground">Ticket</p>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Order not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
