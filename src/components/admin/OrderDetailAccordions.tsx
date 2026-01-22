import { useState } from 'react';
import { 
  Package, Truck, Calendar, MapPin, User, Phone,
  Clock, AlertCircle, ChevronDown, DollarSign, Wrench,
  MoreHorizontal, Plus, Flag, FileEdit, Send
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrderDetailProps {
  order: {
    id: string;
    status: string;
    payment_status: string | null;
    final_total: number | null;
    amount_due: number | null;
    amount_paid: number | null;
    balance_due: number | null;
    scheduled_delivery_date: string | null;
    scheduled_delivery_window: string | null;
    scheduled_pickup_date: string | null;
    scheduled_pickup_window: string | null;
    assigned_driver_id: string | null;
    assigned_yard_id: string | null;
    inventory_id: string | null;
    route_notes: string | null;
    internal_notes: string | null;
    placement_photo_url: string | null;
    dump_ticket_url?: string | null;
    quotes?: {
      customer_name: string | null;
      customer_phone: string | null;
      customer_email: string | null;
      delivery_address: string | null;
      zip_code: string;
      material_type: string;
      subtotal: number;
      distance_miles: number | null;
      truck_duration_min: number | null;
      placement_notes: string | null;
      placement_type: string | null;
      rental_days: number;
      dumpster_sizes?: { label: string; size_value: number; id: string } | null;
    } | null;
    drivers?: { name: string; phone: string } | null;
    yards?: { name: string; market: string } | null;
  };
  drivers: Array<{ id: string; name: string; phone: string }>;
  yards: Array<{ id: string; name: string; market: string }>;
  // Form state
  status: string;
  setStatus: (s: string) => void;
  driverId: string | null;
  setDriverId: (id: string | null) => void;
  yardId: string | null;
  setYardId: (id: string | null) => void;
  deliveryDate: string;
  setDeliveryDate: (d: string) => void;
  deliveryWindow: string;
  setDeliveryWindow: (w: string) => void;
  pickupDate: string;
  setPickupDate: (d: string) => void;
  pickupWindow: string;
  setPickupWindow: (w: string) => void;
  routeNotes: string;
  setRouteNotes: (n: string) => void;
  internalNotes: string;
  setInternalNotes: (n: string) => void;
  // Actions
  onSave: () => void;
  onRecordPayment: () => void;
  isSaving: boolean;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'scheduled_requested', label: 'Schedule Requested', color: 'bg-amber-100 text-amber-800' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-purple-100 text-purple-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
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

function getStatusInfo(status: string) {
  return STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
}

function getPaymentBadge(status: string | null) {
  const config: Record<string, { color: string; label: string }> = {
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
    unpaid: { color: 'bg-red-100 text-red-800', label: 'Unpaid' },
    overdue: { color: 'bg-red-200 text-red-900', label: 'Overdue' },
  };
  const c = config[status || 'unpaid'] || config.unpaid;
  return <Badge className={c.color}>{c.label}</Badge>;
}

function getInventoryBadge(inventoryId: string | null) {
  if (inventoryId) {
    return <Badge className="bg-green-100 text-green-800">Reserved</Badge>;
  }
  return <Badge className="bg-gray-100 text-gray-600">Not Assigned</Badge>;
}

// Determine the contextual primary CTA based on order state
function getPrimaryCTA(order: OrderDetailProps['order'], onRecordPayment: () => void) {
  const status = order.status;
  const paymentStatus = order.payment_status;
  const hasDriver = !!order.assigned_driver_id;
  const hasSchedule = !!order.scheduled_delivery_date;

  // Priority order for primary action
  if (status === 'scheduled_requested' && hasSchedule) {
    return { label: 'Confirm Schedule', icon: Calendar, action: 'confirm_schedule' };
  }
  if ((status === 'scheduled' || status === 'confirmed') && !hasDriver) {
    return { label: 'Assign Driver', icon: Truck, action: 'assign_driver' };
  }
  if (status === 'picked_up' && !order.dump_ticket_url) {
    return { label: 'Upload Ticket', icon: Plus, action: 'upload_ticket' };
  }
  if (status === 'completed' && paymentStatus !== 'paid' && (order.balance_due || 0) > 0) {
    return { label: 'Request Payment', icon: Send, onClick: onRecordPayment };
  }
  if (status === 'delivered') {
    return { label: 'Schedule Pickup', icon: Calendar, action: 'schedule_pickup' };
  }
  return null;
}

export function OrderDetailAccordions(props: OrderDetailProps) {
  const { order, drivers, yards, onSave, onRecordPayment, isSaving } = props;
  const statusInfo = getStatusInfo(order.status);
  const primaryCTA = getPrimaryCTA(order, onRecordPayment);

  return (
    <div className="space-y-4">
      {/* What's Next? Guidance */}
      {primaryCTA && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            What's next?
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {order.status === 'scheduled_requested' && 'Review the requested schedule and confirm it.'}
            {order.status === 'scheduled' && !order.assigned_driver_id && 'Assign a driver to this order.'}
            {order.status === 'delivered' && 'Schedule the pickup when the customer is ready.'}
            {order.status === 'picked_up' && 'Upload the dump ticket to complete billing.'}
            {order.status === 'completed' && order.payment_status !== 'paid' && 'Send payment request to collect balance.'}
          </p>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["status"]} className="space-y-2">
        {/* 1) STATUS & NEXT ACTION */}
        <AccordionItem value="status" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold">Status & Actions</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              {getPaymentBadge(order.payment_status)}
              {getInventoryBadge(order.inventory_id)}
            </div>

            {/* Customer Quick Info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="font-medium">{order.quotes?.customer_name || 'Customer'}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> {order.quotes?.customer_phone || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {order.quotes?.delivery_address || order.quotes?.zip_code || 'N/A'}
              </p>
            </div>

            {/* Primary CTA + Secondary Actions */}
            <div className="flex gap-2">
              {primaryCTA && (
                <Button 
                  className="flex-1" 
                  onClick={primaryCTA.onClick || onSave}
                >
                  <primaryCTA.icon className="w-4 h-4 mr-2" />
                  {primaryCTA.label}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                  <DropdownMenuItem>
                    <FileEdit className="w-4 h-4 mr-2" /> Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Plus className="w-4 h-4 mr-2" /> Add Note
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" /> Flag Issue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label>Change Status</Label>
              <Select value={props.status} onValueChange={props.setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <Badge className={s.color}>{s.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2) SCHEDULE & PLACEMENT */}
        <AccordionItem value="schedule" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-semibold">Schedule & Placement</span>
              {order.scheduled_delivery_date && (
                <Badge variant="outline" className="ml-auto mr-2">
                  {new Date(order.scheduled_delivery_date).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Delivery */}
              <div className="space-y-2">
                <Label>Delivery Date</Label>
                <Input 
                  type="date" 
                  value={props.deliveryDate} 
                  onChange={(e) => props.setDeliveryDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time Window</Label>
                <Select value={props.deliveryWindow} onValueChange={props.setDeliveryWindow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select window" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {TIME_WINDOWS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Pickup */}
              <div className="space-y-2">
                <Label>Pickup Date</Label>
                <Input 
                  type="date" 
                  value={props.pickupDate} 
                  onChange={(e) => props.setPickupDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time Window</Label>
                <Select value={props.pickupWindow} onValueChange={props.setPickupWindow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select window" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {TIME_WINDOWS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Placement Info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Placement</span>
                <Badge variant="outline">{order.quotes?.placement_type || 'Driveway'}</Badge>
              </div>
              {order.quotes?.placement_notes && (
                <p className="text-sm text-muted-foreground">{order.quotes.placement_notes}</p>
              )}
              {order.placement_photo_url && (
                <a href={order.placement_photo_url} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={order.placement_photo_url} 
                    alt="Placement" 
                    className="w-20 h-20 object-cover rounded border hover:ring-2 ring-primary"
                  />
                </a>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3) OPERATIONS */}
        <AccordionItem value="operations" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-primary" />
              <span className="font-semibold">Operations</span>
              {order.drivers?.name && (
                <Badge variant="outline" className="ml-auto mr-2">
                  {order.drivers.name}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign Driver</Label>
                <Select value={props.driverId || ''} onValueChange={(v) => props.setDriverId(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dispatch Yard</Label>
                <Select value={props.yardId || ''} onValueChange={(v) => props.setYardId(v || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select yard" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    {yards.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{y.name} ({y.market})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Route Info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-medium">{order.quotes?.distance_miles?.toFixed(1) || '—'} mi</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Drive</p>
                  <p className="font-medium">{order.quotes?.truck_duration_min || '—'} min</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{order.quotes?.dumpster_sizes?.label || '—'}</p>
                </div>
              </div>
            </div>

            {/* Route Notes */}
            <div className="space-y-2">
              <Label>Route Notes (visible to driver)</Label>
              <Textarea 
                value={props.routeNotes} 
                onChange={(e) => props.setRouteNotes(e.target.value)}
                placeholder="Gate codes, directions, etc."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea 
                value={props.internalNotes} 
                onChange={(e) => props.setInternalNotes(e.target.value)}
                placeholder="Admin notes (not visible to customer)"
                rows={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4) FINANCE */}
        <AccordionItem value="finance" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-semibold">Finance</span>
              {(order.balance_due || 0) > 0 && (
                <Badge className="ml-auto mr-2 bg-red-100 text-red-800">
                  ${order.balance_due?.toFixed(2)} Due
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Invoice Total</p>
                <p className="font-medium text-lg">${(order.amount_due || order.final_total || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Paid</p>
                <p className="font-medium text-lg text-green-600">${(order.amount_paid || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Balance Due</p>
                <p className={`font-medium text-lg ${(order.balance_due || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${(order.balance_due || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRecordPayment}
                  disabled={(order.balance_due || 0) <= 0}
                >
                  <DollarSign className="w-3 h-3 mr-1" />
                  Request Payment
                </Button>
              </div>
            </div>

            {/* Overage placeholder */}
            {(order.amount_due || 0) > (order.final_total || 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Overage charges may apply based on weight/material
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={onSave} disabled={isSaving} className="min-w-[120px]">
          {isSaving ? (
            <Clock className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
