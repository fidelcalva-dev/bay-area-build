/**
 * Dispatch Runs Calendar - Week view of runs (not orders)
 */
import { useState, useEffect, useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { 
  ChevronLeft, ChevronRight, Calendar, Plus, Loader2, 
  Truck, Package, Construction, RefreshCw, Filter, User, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  getRunsForDateRange,
  assignRun,
  updateRunStatus,
  suggestDriversForRun,
  type Run,
  type RunType,
  type RunStatus,
  type DriverSuggestion,
  RUN_STATUS_FLOW,
  RUN_TYPE_CONFIG,
} from "@/lib/runsService";

interface Driver {
  id: string;
  name: string;
  phone: string;
  is_owner_operator: boolean;
}

interface Truck {
  id: string;
  truck_number: string;
  truck_type: string;
}

const TIME_WINDOWS = [
  { value: 'morning', label: 'Morning', time: '7am-10am' },
  { value: 'midday', label: 'Midday', time: '10am-2pm' },
  { value: 'afternoon', label: 'Afternoon', time: '2pm-6pm' },
];

const RUN_TYPE_ICONS: Record<RunType, React.ReactNode> = {
  DELIVERY: <Truck className="w-3 h-3" />,
  PICKUP: <Package className="w-3 h-3" />,
  HAUL: <Construction className="w-3 h-3" />,
  SWAP: <RefreshCw className="w-3 h-3" />,
};

export default function DispatchRunsCalendar() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [runs, setRuns] = useState<Run[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  
  // Filters
  const [filterDriver, setFilterDriver] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Assignment dialog
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assigned_driver_id: "",
    assigned_truck_id: "",
    assignment_type: "IN_HOUSE" as "IN_HOUSE" | "CARRIER",
    notes: "",
  });
  const [suggestions, setSuggestions] = useState<DriverSuggestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  }, [currentWeek]);
  
  useEffect(() => {
    fetchData();
  }, [currentWeek]);
  
  async function fetchData() {
    setIsLoading(true);
    try {
      const weekEnd = addDays(currentWeek, 6);
      const startStr = format(currentWeek, "yyyy-MM-dd");
      const endStr = format(weekEnd, "yyyy-MM-dd");
      
      const [runsData, driversRes, trucksRes] = await Promise.all([
        getRunsForDateRange(startStr, endStr),
        supabase.from("drivers").select("id, name, phone, is_owner_operator").eq("is_active", true),
        supabase.from("trucks").select("id, truck_number, truck_type").eq("is_active", true),
      ]);
      
      setRuns(runsData);
      if (driversRes.data) setDrivers(driversRes.data as Driver[]);
      if (trucksRes.data) setTrucks(trucksRes.data as Truck[]);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading runs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  function getRunsForDayWindow(date: Date, window: string) {
    const dateStr = format(date, "yyyy-MM-dd");
    return runs.filter((run) => {
      if (run.scheduled_date !== dateStr) return false;
      if (run.scheduled_window !== window) return false;
      if (filterDriver !== "all" && run.assigned_driver_id !== filterDriver) return false;
      if (filterStatus !== "all" && run.status !== filterStatus) return false;
      if (filterType !== "all" && run.run_type !== filterType) return false;
      return true;
    });
  }
  
  async function openAssignDialog(run: Run) {
    setSelectedRun(run);
    setAssignForm({
      assigned_driver_id: run.assigned_driver_id || "",
      assigned_truck_id: run.assigned_truck_id || "",
      assignment_type: run.assignment_type || "IN_HOUSE",
      notes: run.dispatcher_notes || "",
    });
    
    // Get suggestions
    try {
      const sugg = await suggestDriversForRun(run.id);
      setSuggestions(sugg);
    } catch {
      setSuggestions([]);
    }
    
    setDialogOpen(true);
  }
  
  async function handleAssign() {
    if (!selectedRun) return;
    if (!assignForm.assigned_driver_id) {
      toast({ title: "Please select a driver", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await assignRun(
        selectedRun.id,
        assignForm.assigned_driver_id,
        assignForm.assigned_truck_id || undefined,
        assignForm.assignment_type
      );
      
      if (!result.success) throw new Error(result.error);
      
      // Update dispatcher notes if provided
      if (assignForm.notes) {
        await supabase
          .from("runs" as "orders")
          .update({ dispatcher_notes: assignForm.notes } as never)
          .eq("id", selectedRun.id);
      }
      
      toast({ title: "Run assigned successfully" });
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast({ title: "Error assigning run", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }
  
  async function handleQuickStatusUpdate(run: Run, newStatus: RunStatus) {
    const result = await updateRunStatus(run.id, newStatus);
    if (result.success) {
      toast({ title: `Run ${newStatus.toLowerCase()}` });
      fetchData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }
  
  function getStatusBadge(status: RunStatus) {
    const config = RUN_STATUS_FLOW[status];
    return (
      <Badge variant="outline" className={cn("text-xs", config.color)}>
        {status}
      </Badge>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Runs Calendar</h1>
          <p className="text-muted-foreground">
            {format(currentWeek, "MMMM d")} - {format(addDays(currentWeek, 6), "MMMM d, yyyy")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(prev => addDays(prev, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(prev => addDays(prev, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterDriver} onValueChange={setFilterDriver}>
          <SelectTrigger className="w-[180px]">
            <User className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Drivers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {drivers.map(d => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} {d.is_owner_operator && "(OO)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.keys(RUN_STATUS_FLOW).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <Truck className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(RUN_TYPE_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-1" />
        
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "text-center py-2 rounded-lg font-medium",
              isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <div className="text-xs">{format(day, "EEE")}</div>
            <div className="text-lg">{format(day, "d")}</div>
          </div>
        ))}
        
        {/* Time Windows */}
        {TIME_WINDOWS.map((window) => (
          weekDays.map((day) => {
            const dayRuns = getRunsForDayWindow(day, window.value);
            return (
              <Card
                key={`${day.toISOString()}-${window.value}`}
                className="min-h-[120px] p-1"
              >
                <div className="text-xs text-muted-foreground px-1 py-0.5 border-b mb-1">
                  {window.label}
                </div>
                <div className="space-y-1 max-h-[180px] overflow-y-auto">
                  {dayRuns.map((run) => (
                    <div
                      key={run.id}
                      onClick={() => openAssignDialog(run)}
                      className={cn(
                        "p-1.5 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity",
                        RUN_TYPE_CONFIG[run.run_type].color,
                        "text-white"
                      )}
                    >
                      <div className="flex items-center gap-1 font-medium">
                        {RUN_TYPE_ICONS[run.run_type]}
                        <span>{run.run_type}</span>
                      </div>
                      {run.assets_dumpsters && (
                        <div className="opacity-90">{run.assets_dumpsters.asset_code}</div>
                      )}
                      {run.customer_name && (
                        <div className="truncate opacity-90">{run.customer_name}</div>
                      )}
                      {run.drivers ? (
                        <div className="opacity-80 flex items-center gap-1">
                          <User className="w-2 h-2" />
                          {run.drivers.name}
                        </div>
                      ) : (
                        <div className="opacity-60 italic">Unassigned</div>
                      )}
                    </div>
                  ))}
                  {dayRuns.length === 0 && (
                    <div className="text-muted-foreground text-center py-4 text-xs">—</div>
                  )}
                </div>
              </Card>
            );
          })
        ))}
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{runs.length}</div>
            <div className="text-sm text-muted-foreground">Total Runs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {runs.filter(r => !r.assigned_driver_id).length}
            </div>
            <div className="text-sm text-muted-foreground">Unassigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {runs.filter(r => r.run_type === 'DELIVERY').length}
            </div>
            <div className="text-sm text-muted-foreground">Deliveries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {runs.filter(r => r.run_type === 'PICKUP').length}
            </div>
            <div className="text-sm text-muted-foreground">Pickups</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRun && (
                <>
                  <span className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-white",
                    RUN_TYPE_CONFIG[selectedRun.run_type].color
                  )}>
                    {RUN_TYPE_ICONS[selectedRun.run_type]}
                  </span>
                  <span>{selectedRun.run_type} Run</span>
                  {selectedRun.run_number && (
                    <Badge variant="outline" className="ml-2">{selectedRun.run_number}</Badge>
                  )}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRun && (
            <div className="space-y-4">
              {/* Run Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <div className="font-medium">{selectedRun.customer_name || "—"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <div className="font-medium">{selectedRun.customer_phone || "—"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Asset</Label>
                  <div className="font-medium">{selectedRun.assets_dumpsters?.asset_code || "—"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedRun.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Destination</Label>
                  <div className="font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedRun.destination_address || selectedRun.destination_yard?.name || "—"}
                  </div>
                </div>
              </div>
              
              {/* Suggestions */}
              {suggestions.length > 0 && !selectedRun.assigned_driver_id && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Suggested Drivers</Label>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <div
                        key={s.driver.id}
                        onClick={() => setAssignForm(prev => ({ ...prev, assigned_driver_id: s.driver.id }))}
                        className={cn(
                          "p-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors",
                          assignForm.assigned_driver_id === s.driver.id && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{s.driver.name}</span>
                          <Badge variant="secondary">{s.score}pt</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.reasons.join(" • ")}
                          {s.driver.is_owner_operator && " • Owner Operator"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Assignment Form */}
              <div className="space-y-3">
                <div>
                  <Label>Driver</Label>
                  <Select
                    value={assignForm.assigned_driver_id}
                    onValueChange={(v) => setAssignForm(prev => ({ ...prev, assigned_driver_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} {d.is_owner_operator && "(OO)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Truck (optional)</Label>
                  <Select
                    value={assignForm.assigned_truck_id}
                    onValueChange={(v) => setAssignForm(prev => ({ ...prev, assigned_truck_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No truck assigned</SelectItem>
                      {trucks.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.truck_number} ({t.truck_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Assignment Type</Label>
                  <Select
                    value={assignForm.assignment_type}
                    onValueChange={(v: "IN_HOUSE" | "CARRIER") => setAssignForm(prev => ({ ...prev, assignment_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_HOUSE">In-House</SelectItem>
                      <SelectItem value="CARRIER">Carrier (Owner Operator)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Dispatcher Notes</Label>
                  <Textarea
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes for driver..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Assign & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
