/**
 * Dispatch Runs List - Table view for runs management
 */
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, Search, Filter, Truck, Package, Construction, RefreshCw,
  User, Calendar, Clock, ExternalLink, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  getRunsForDateRange,
  updateRunStatus,
  type Run,
  type RunType,
  type RunStatus,
  RUN_STATUS_FLOW,
  RUN_TYPE_CONFIG,
} from "@/lib/runsService";

const RUN_TYPE_ICONS: Record<RunType, React.ReactNode> = {
  DELIVERY: <Truck className="w-4 h-4" />,
  PICKUP: <Package className="w-4 h-4" />,
  HAUL: <Construction className="w-4 h-4" />,
  SWAP: <RefreshCw className="w-4 h-4" />,
  DUMP_AND_RETURN: <Truck className="w-4 h-4" />,
  YARD_TRANSFER: <Truck className="w-4 h-4" />,
};

export default function DispatchRunsList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [runs, setRuns] = useState<Run[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">("week");
  
  useEffect(() => {
    fetchRuns();
  }, [dateRange]);
  
  async function fetchRuns() {
    setIsLoading(true);
    try {
      const today = new Date();
      let startDate: string;
      let endDate: string;
      
      switch (dateRange) {
        case "today":
          startDate = format(today, "yyyy-MM-dd");
          endDate = startDate;
          break;
        case "week":
          startDate = format(today, "yyyy-MM-dd");
          endDate = format(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
          break;
        case "month":
          startDate = format(today, "yyyy-MM-dd");
          endDate = format(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
          break;
      }
      
      const data = await getRunsForDateRange(startDate, endDate);
      setRuns(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading runs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  const filteredRuns = runs.filter(run => {
    // Status filter
    if (filterStatus === "active" && ["COMPLETED", "CANCELLED"].includes(run.status)) return false;
    if (filterStatus !== "all" && filterStatus !== "active" && run.status !== filterStatus) return false;
    
    // Type filter
    if (filterType !== "all" && run.run_type !== filterType) return false;
    
    // Search
    if (search) {
      const s = search.toLowerCase();
      return (
        run.run_number?.toLowerCase().includes(s) ||
        run.customer_name?.toLowerCase().includes(s) ||
        run.customer_phone?.includes(s) ||
        run.assets_dumpsters?.asset_code?.toLowerCase().includes(s) ||
        run.drivers?.name?.toLowerCase().includes(s)
      );
    }
    
    return true;
  });
  
  async function handleStatusChange(run: Run, newStatus: RunStatus) {
    const result = await updateRunStatus(run.id, newStatus);
    if (result.success) {
      toast({ title: `Run ${newStatus.toLowerCase()}` });
      fetchRuns();
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
  
  // Stats
  const stats = {
    total: runs.length,
    unassigned: runs.filter(r => !r.assigned_driver_id && !["COMPLETED", "CANCELLED"].includes(r.status)).length,
    inProgress: runs.filter(r => ["ASSIGNED", "ACCEPTED", "EN_ROUTE"].includes(r.status)).length,
    completed: runs.filter(r => r.status === "COMPLETED").length,
  };
  
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
          <h1 className="text-2xl font-bold text-foreground">Runs Manager</h1>
          <p className="text-muted-foreground">View and manage all dispatch runs</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRuns}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate("/dispatch/calendar")}>
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Runs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.unassigned}</div>
            <div className="text-sm text-muted-foreground">Unassigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search runs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={dateRange} onValueChange={(v: "today" | "week" | "month") => setDateRange(v)}>
          <SelectTrigger className="w-[130px]">
            <Clock className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Next 7 Days</SelectItem>
            <SelectItem value="month">Next 30 Days</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            {Object.keys(RUN_STATUS_FLOW).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <Truck className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(RUN_TYPE_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRuns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No runs found
                </TableCell>
              </TableRow>
            ) : (
              filteredRuns.map(run => (
                <TableRow key={run.id}>
                  <TableCell>
                    <div className="font-medium">{run.run_number}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-white",
                        RUN_TYPE_CONFIG[run.run_type].color
                      )}>
                        {RUN_TYPE_ICONS[run.run_type]}
                      </span>
                      <span>{RUN_TYPE_CONFIG[run.run_type].label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {run.assets_dumpsters?.asset_code || "—"}
                  </TableCell>
                  <TableCell>
                    <div>{run.customer_name || "—"}</div>
                    {run.customer_phone && (
                      <div className="text-xs text-muted-foreground">{run.customer_phone}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{format(new Date(run.scheduled_date), "MMM d")}</div>
                    {run.scheduled_window && (
                      <div className="text-xs text-muted-foreground capitalize">{run.scheduled_window}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {run.drivers ? (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{run.drivers.name}</span>
                        {run.drivers.is_owner_operator && (
                          <Badge variant="outline" className="text-xs">OO</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/dispatch/run/${run.id}`)}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {RUN_STATUS_FLOW[run.status].next && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(run, RUN_STATUS_FLOW[run.status].next!)}
                          >
                            {RUN_STATUS_FLOW[run.status].action}
                          </DropdownMenuItem>
                        )}
                        {run.status !== "CANCELLED" && run.status !== "COMPLETED" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(run, "CANCELLED")}
                            className="text-destructive"
                          >
                            Cancel Run
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
