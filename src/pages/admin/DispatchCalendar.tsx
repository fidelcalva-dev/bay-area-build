import { useState, useEffect, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from "date-fns";
import { 
  ChevronLeft, ChevronRight, Truck, Calendar as CalendarIcon, 
  Clock, MapPin, User, Loader2, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  status: string;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  assigned_driver_id: string | null;
  assigned_yard_id: string | null;
  route_notes: string | null;
  text_before_arrival: boolean;
  quotes: {
    customer_name: string | null;
    customer_phone: string | null;
    delivery_address: string | null;
    zip_code: string;
    material_type: string;
    yard_name: string | null;
  } | null;
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

const TIME_WINDOWS = [
  { value: "morning", label: "Morning", time: "7–11 AM" },
  { value: "midday", label: "Midday", time: "11 AM–3 PM" },
  { value: "afternoon", label: "Afternoon", time: "3–6 PM" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  pickup_scheduled: "bg-orange-100 text-orange-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function DispatchCalendar() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDriver, setFilterDriver] = useState<string>("all");
  const [filterYard, setFilterYard] = useState<string>("all");
  
  const [assignForm, setAssignForm] = useState({
    assigned_driver_id: "",
    assigned_yard_id: "",
    route_notes: "",
    text_before_arrival: false,
  });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  useEffect(() => {
    fetchData();
  }, [currentWeek]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const weekEnd = addDays(currentWeek, 7);
      
      const [ordersRes, driversRes, yardsRes] = await Promise.all([
        supabase
          .from("orders")
          .select(`
            id, status, scheduled_delivery_date, scheduled_delivery_window,
            scheduled_pickup_date, scheduled_pickup_window,
            assigned_driver_id, assigned_yard_id, route_notes, text_before_arrival,
            quotes (
              customer_name, customer_phone, delivery_address, zip_code,
              material_type, yard_name
            )
          `)
          .or(`scheduled_delivery_date.gte.${format(currentWeek, "yyyy-MM-dd")},scheduled_pickup_date.gte.${format(currentWeek, "yyyy-MM-dd")}`)
          .or(`scheduled_delivery_date.lte.${format(weekEnd, "yyyy-MM-dd")},scheduled_pickup_date.lte.${format(weekEnd, "yyyy-MM-dd")}`)
          .not("status", "eq", "completed")
          .not("status", "eq", "cancelled"),
        supabase.from("drivers").select("id, name, phone").eq("is_active", true),
        supabase.from("yards").select("id, name, market").eq("is_active", true),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      if (driversRes.data) setDrivers(driversRes.data);
      if (yardsRes.data) setYards(yardsRes.data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading calendar", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function getOrdersForDay(date: Date, type: "delivery" | "pickup") {
    const dateStr = format(date, "yyyy-MM-dd");
    return orders.filter((order) => {
      const orderDate = type === "delivery" 
        ? order.scheduled_delivery_date 
        : order.scheduled_pickup_date;
      
      if (!orderDate) return false;
      
      // Apply filters
      if (filterDriver !== "all" && order.assigned_driver_id !== filterDriver) return false;
      if (filterYard !== "all" && order.assigned_yard_id !== filterYard) return false;
      
      return orderDate === dateStr;
    });
  }

  function openAssignDialog(order: Order) {
    setSelectedOrder(order);
    setAssignForm({
      assigned_driver_id: order.assigned_driver_id || "",
      assigned_yard_id: order.assigned_yard_id || "",
      route_notes: order.route_notes || "",
      text_before_arrival: order.text_before_arrival || false,
    });
    setDialogOpen(true);
  }

  async function handleAssign() {
    if (!selectedOrder) return;
    
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          assigned_driver_id: assignForm.assigned_driver_id || null,
          assigned_yard_id: assignForm.assigned_yard_id || null,
          route_notes: assignForm.route_notes || null,
          text_before_arrival: assignForm.text_before_arrival,
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;
      
      toast({ title: "Assignment saved" });
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving", variant: "destructive" });
    }
  }

  const getDriverName = (id: string | null) => drivers.find((d) => d.id === id)?.name || "Unassigned";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dispatch Calendar</h1>
          <p className="text-muted-foreground">
            Week of {format(currentWeek, "MMM d")} – {format(addDays(currentWeek, 6), "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        <Select value={filterDriver} onValueChange={setFilterDriver}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Drivers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {drivers.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterYard} onValueChange={setFilterYard}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Yards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Yards</SelectItem>
            {yards.map((y) => (
              <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="min-h-[300px]">
            <div className={`text-center p-2 rounded-t-lg font-medium ${
              isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              <div className="text-xs">{format(day, "EEE")}</div>
              <div className="text-lg">{format(day, "d")}</div>
            </div>
            <div className="border border-t-0 rounded-b-lg p-1 space-y-1 min-h-[250px] bg-background">
              {/* Deliveries */}
              {getOrdersForDay(day, "delivery").map((order) => (
                <div
                  key={`del-${order.id}`}
                  onClick={() => openAssignDialog(order)}
                  className="p-2 rounded-lg bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-1 text-xs font-medium text-blue-700">
                    <Truck className="w-3 h-3" /> Delivery
                  </div>
                  <p className="text-xs font-medium truncate">
                    {order.quotes?.customer_name || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.quotes?.zip_code}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs py-0">
                      {order.scheduled_delivery_window || "TBD"}
                    </Badge>
                    {order.assigned_driver_id && (
                      <Badge variant="secondary" className="text-xs py-0">
                        <User className="w-2 h-2 mr-1" />
                        {getDriverName(order.assigned_driver_id).split(" ")[0]}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Pickups */}
              {getOrdersForDay(day, "pickup").map((order) => (
                <div
                  key={`pick-${order.id}`}
                  onClick={() => openAssignDialog(order)}
                  className="p-2 rounded-lg bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-1 text-xs font-medium text-orange-700">
                    <Truck className="w-3 h-3 rotate-180" /> Pickup
                  </div>
                  <p className="text-xs font-medium truncate">
                    {order.quotes?.customer_name || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.quotes?.zip_code}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs py-0">
                      {order.scheduled_pickup_window || "TBD"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Driver & Route</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* Order Summary */}
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="font-medium">{selectedOrder.quotes?.customer_name || "Customer"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedOrder.quotes?.delivery_address || selectedOrder.quotes?.zip_code}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.quotes?.material_type} • {selectedOrder.quotes?.yard_name}
                </p>
                <Badge className={STATUS_COLORS[selectedOrder.status]}>
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Assign Driver</Label>
                <Select 
                  value={assignForm.assigned_driver_id} 
                  onValueChange={(v) => setAssignForm({ ...assignForm, assigned_driver_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dispatch Yard</Label>
                <Select 
                  value={assignForm.assigned_yard_id} 
                  onValueChange={(v) => setAssignForm({ ...assignForm, assigned_yard_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select yard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not set</SelectItem>
                    {yards.map((y) => (
                      <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Route Notes (for driver)</Label>
                <Textarea
                  value={assignForm.route_notes}
                  onChange={(e) => setAssignForm({ ...assignForm, route_notes: e.target.value })}
                  placeholder="Gate code, parking instructions, etc."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={assignForm.text_before_arrival}
                  onCheckedChange={(v) => setAssignForm({ ...assignForm, text_before_arrival: v })}
                />
                <Label>Text customer before arrival</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Save Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
