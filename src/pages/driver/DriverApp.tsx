import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Truck, MapPin, Phone, Navigation, Camera, Clock, 
  CheckCircle2, Loader2, Upload, FileText,
  DollarSign, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format, startOfMonth, endOfMonth } from "date-fns";
import logoCalsan from "@/assets/logo-calsan.jpeg";
import { FilledLocationSelector } from "@/components/logistics/FilledLocationSelector";
import { ExceptionFlags } from "@/components/logistics/ExceptionFlags";
import { LogisticsTypeBadge } from "@/components/logistics/LogisticsTypeSelector";
import { 
  LOGISTICS_CONFIG, 
  getNextStatus, 
  getStatusActionLabel,
  logLogisticsEvent,
  type LogisticsType,
  type FilledLocation
} from "@/lib/logisticsService";

interface Job {
  id: string;
  status: string;
  logistics_type: string;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  scheduled_pickup_window: string | null;
  route_notes: string | null;
  driver_notes: string | null;
  text_before_arrival: boolean;
  quotes: {
    customer_name: string | null;
    customer_phone: string | null;
    delivery_address: string | null;
    placement_notes: string | null;
    zip_code: string;
    material_type: string;
    yard_name: string | null;
    distance_miles: number | null;
    truck_duration_min: number | null;
  } | null;
}

interface Payout {
  id: string;
  job_type: string;
  base_payout: number;
  mileage_payout: number | null;
  bonus: number | null;
  total_payout: number;
  status: string;
  created_at: string;
}

const JOB_TYPE_CONFIG = {
  delivery: { label: "Delivery", color: "bg-green-100 text-green-800" },
  pickup: { label: "Pickup", color: "bg-blue-100 text-blue-800" },
  swap: { label: "Swap", color: "bg-purple-100 text-purple-800" },
  live_load: { label: "Live Load", color: "bg-orange-100 text-orange-800" },
  dump_and_return: { label: "Dump & Return", color: "bg-amber-100 text-amber-800" },
  relocation: { label: "Relocation", color: "bg-cyan-100 text-cyan-800" },
  dry_run: { label: "Dry Run", color: "bg-red-100 text-red-800" },
} as const;

const STATUS_FLOW: Record<string, { next: string; action: string }> = {
  scheduled: { next: "en_route", action: "Start Route" },
  en_route: { next: "on_site", action: "Arrived On Site" },
  on_site: { next: "delivered", action: "Mark Delivered" },
  delivered: { next: "pickup_scheduled", action: "Schedule Pickup" },
  pickup_scheduled: { next: "picked_up", action: "Mark Picked Up" },
  picked_up: { next: "completed", action: "Complete Job" },
};

export default function DriverApp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isDriver, isOwnerOperator, isAdmin, driverId } = useAdminAuth();
  
  const canAccess = isDriver || isOwnerOperator || isAdmin;
  
  const [activeTab, setActiveTab] = useState("jobs");
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoType, setPhotoType] = useState<"delivery" | "pickup" | "ticket">("delivery");
  const [driverNotes, setDriverNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Logistics-specific state
  const [filledLocation, setFilledLocation] = useState<FilledLocation | null>(null);
  const [isDryRun, setIsDryRun] = useState(false);
  const [dryRunReason, setDryRunReason] = useState("");
  const [overfillFlagged, setOverfillFlagged] = useState(false);
  const [wrongMaterialFlagged, setWrongMaterialFlagged] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    } else if (!authLoading && user && !canAccess) {
      navigate("/admin");
    }
  }, [authLoading, user, canAccess, navigate]);

  useEffect(() => {
    if (user && canAccess) {
      fetchJobs();
      if (isOwnerOperator && driverId) {
        fetchPayouts();
      }
    }
  }, [user, canAccess, isOwnerOperator, driverId]);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, status, logistics_type, scheduled_delivery_date, scheduled_delivery_window,
          scheduled_pickup_date, scheduled_pickup_window,
          route_notes, driver_notes, text_before_arrival,
          quotes (
            customer_name, customer_phone, delivery_address, placement_notes,
            zip_code, material_type, yard_name, distance_miles, truck_duration_min
          )
        `)
        .or(`scheduled_delivery_date.eq.${today},scheduled_pickup_date.eq.${today}`)
        .not("status", "eq", "completed")
        .not("status", "eq", "cancelled")
        .order("scheduled_delivery_date");

      if (error) throw error;
      setJobs((data || []).map(d => ({ 
        ...d, 
        logistics_type: (d as Record<string, unknown>).logistics_type as string || 'delivery' 
      })) as Job[]);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading jobs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPayouts() {
    if (!driverId) return;
    try {
      const { data, error } = await supabase
        .from("driver_payouts")
        .select("*")
        .eq("driver_id", driverId)
        .gte("created_at", format(startOfMonth(new Date()), "yyyy-MM-dd"))
        .lte("created_at", format(endOfMonth(new Date()), "yyyy-MM-dd"))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayouts(data as Payout[]);
    } catch (err) {
      console.error("Error fetching payouts:", err);
    }
  }

  function openJobDetail(job: Job) {
    setSelectedJob(job);
    setDriverNotes(job.driver_notes || "");
    setFilledLocation(null);
    setIsDryRun(false);
    setDryRunReason("");
    setOverfillFlagged(false);
    setWrongMaterialFlagged(false);
    setDetailOpen(true);
  }

  async function updateJobStatus(newStatus: string) {
    if (!selectedJob) return;
    const logisticsType = (selectedJob.logistics_type || 'delivery') as LogisticsType;
    
    try {
      const updates: Record<string, unknown> = { 
        status: newStatus, 
        driver_notes: driverNotes,
        is_dry_run: isDryRun,
        dry_run_reason: dryRunReason,
        overfill_flagged: overfillFlagged,
        wrong_material_flagged: wrongMaterialFlagged,
        filled_location: filledLocation,
        requires_manual_review: isDryRun || overfillFlagged || wrongMaterialFlagged,
      };
      
      const { error } = await supabase.from("orders").update(updates).eq("id", selectedJob.id);
      if (error) throw error;
      
      // Log logistics event
      await logLogisticsEvent({
        orderId: selectedJob.id,
        eventType: 'status_change',
        logisticsType,
        fromStatus: selectedJob.status,
        toStatus: newStatus,
        filledLocation: filledLocation || undefined,
        notes: driverNotes || undefined,
      });
      
      toast({ title: `Status updated to ${newStatus}` });
      setDetailOpen(false);
      fetchJobs();
    } catch (err) {
      toast({ title: "Error updating status", variant: "destructive" });
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0] || !selectedJob) return;
    setIsUploading(true);
    const file = e.target.files[0];
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedJob.id}/${photoType}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("dump-tickets").upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from("dump-tickets").getPublicUrl(fileName);
      const photoUrl = urlData.publicUrl;
      const updateField = photoType === "delivery" ? "placement_photo_url" : photoType === "pickup" ? "pickup_photo_url" : "dump_ticket_url";
      
      await supabase.from("orders").update({ [updateField]: photoUrl }).eq("id", selectedJob.id);
      toast({ title: "Photo uploaded successfully" });
      setPhotoDialogOpen(false);
    } catch (err) {
      toast({ title: "Error uploading photo", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  function getJobType(job: Job): "delivery" | "pickup" {
    const today = format(new Date(), "yyyy-MM-dd");
    if (job.scheduled_pickup_date === today && ["delivered", "pickup_scheduled"].includes(job.status)) {
      return "pickup";
    }
    return "delivery";
  }

  const payoutStats = {
    total: payouts.reduce((sum, p) => sum + p.total_payout, 0),
    pending: payouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.total_payout, 0),
    jobCount: payouts.length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCalsan} alt="Calsan" className="h-10 w-auto rounded-lg" />
            <div>
              <p className="font-bold">{isOwnerOperator ? "Owner Operator" : "Driver App"}</p>
              <p className="text-xs text-amber-100">{format(new Date(), "EEEE, MMM d")}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white">{jobs.length} Jobs</Badge>
        </div>
        {isOwnerOperator && (
          <div className="px-4 pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-white/10">
                <TabsTrigger value="jobs" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-amber-600">
                  <Truck className="w-4 h-4 mr-1" /> Jobs
                </TabsTrigger>
                <TabsTrigger value="payouts" className="flex-1 text-white data-[state=active]:bg-white data-[state=active]:text-amber-600">
                  <DollarSign className="w-4 h-4 mr-1" /> Payouts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </header>

      <main className="p-4 space-y-4 pb-20">
        {activeTab === "jobs" ? (
          jobs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No jobs scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => {
              const jobType = getJobType(job);
              const config = JOB_TYPE_CONFIG[jobType];
              return (
                <Card key={job.id} className="cursor-pointer hover:shadow-md" onClick={() => openJobDetail(job)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={config.color}><Truck className="w-3 h-3 mr-1" />{config.label}</Badge>
                      <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{jobType === "delivery" ? job.scheduled_delivery_window : job.scheduled_pickup_window}</Badge>
                    </div>
                    <p className="font-semibold">{job.quotes?.customer_name || "Customer"}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-4 h-4" />{job.quotes?.delivery_address || job.quotes?.zip_code}</p>
                  </CardContent>
                </Card>
              );
            })
          )
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-green-600">${payoutStats.total.toFixed(0)}</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Jobs</p><p className="text-2xl font-bold">{payoutStats.jobCount}</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Payouts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {payouts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No payouts this month</p>
                ) : (
                  payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{payout.job_type}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(payout.created_at), "MMM d")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${payout.total_payout.toFixed(2)}</p>
                        <Badge variant="outline">{payout.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Job Details</DialogTitle></DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-lg">{selectedJob.quotes?.customer_name || "Customer"}</p>
                  <p className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4" />{selectedJob.quotes?.delivery_address || selectedJob.quotes?.zip_code}</p>
                  {selectedJob.quotes?.customer_phone && (
                    <a href={`tel:${selectedJob.quotes.customer_phone}`} className="text-sm flex items-center gap-2 text-blue-600">
                      <Phone className="w-4 h-4" />{selectedJob.quotes.customer_phone}
                    </a>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium flex items-center gap-2"><Navigation className="w-4 h-4" />Route</p>
                  <p className="text-sm text-muted-foreground">Yard: {selectedJob.quotes?.yard_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">Distance: {selectedJob.quotes?.distance_miles?.toFixed(1) || "—"} mi</p>
                  {selectedJob.route_notes && <div className="p-2 bg-yellow-50 rounded-lg text-sm"><strong>Notes:</strong> {selectedJob.route_notes}</div>}
                </CardContent>
              </Card>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => { setPhotoType("delivery"); setPhotoDialogOpen(true); }}>
                  <Camera className="w-5 h-5 mb-1" /><span className="text-xs">Delivery</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => { setPhotoType("pickup"); setPhotoDialogOpen(true); }}>
                  <Camera className="w-5 h-5 mb-1" /><span className="text-xs">Pickup</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => { setPhotoType("ticket"); setPhotoDialogOpen(true); }}>
                  <FileText className="w-5 h-5 mb-1" /><span className="text-xs">Ticket</span>
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Driver Notes</Label>
                <Textarea value={driverNotes} onChange={(e) => setDriverNotes(e.target.value)} rows={3} />
              </div>
              {STATUS_FLOW[selectedJob.status] && (
                <Button className="w-full" size="lg" onClick={() => updateJobStatus(STATUS_FLOW[selectedJob.status].next)}>
                  {STATUS_FLOW[selectedJob.status].action}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload {photoType === "ticket" ? "Dump Ticket" : `${photoType} Photo`}</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" id="photo-upload" disabled={isUploading} />
              <label htmlFor="photo-upload" className="cursor-pointer">
                {isUploading ? <Loader2 className="w-12 h-12 mx-auto animate-spin" /> : <Upload className="w-12 h-12 mx-auto text-muted-foreground" />}
                <p className="text-sm text-muted-foreground mt-2">{isUploading ? "Uploading..." : "Tap to take photo"}</p>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}