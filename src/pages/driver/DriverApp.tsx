import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Truck, MapPin, Phone, Navigation, Camera, Clock, 
  CheckCircle2, Play, Loader2, Upload, FileText, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";
import logoCalsan from "@/assets/logo-calsan.jpeg";

interface Job {
  id: string;
  status: string;
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
    truck_duration_max: number | null;
  } | null;
}

const STATUS_FLOW = {
  scheduled: { next: "delivered", action: "Start Delivery", icon: Play },
  delivered: { next: "pickup_scheduled", action: "Complete Delivery", icon: CheckCircle2 },
  pickup_scheduled: { next: "completed", action: "Complete Pickup", icon: CheckCircle2 },
};

const JOB_TYPE_CONFIG = {
  delivery: { label: "Delivery", color: "bg-blue-100 text-blue-800", icon: Truck },
  pickup: { label: "Pickup", color: "bg-orange-100 text-orange-800", icon: Truck },
};

export default function DriverApp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, hasAnyRole } = useAdminAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoType, setPhotoType] = useState<"delivery" | "pickup" | "ticket">("delivery");
  const [driverNotes, setDriverNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, status, scheduled_delivery_date, scheduled_delivery_window,
          scheduled_pickup_date, scheduled_pickup_window,
          route_notes, driver_notes, text_before_arrival,
          quotes (
            customer_name, customer_phone, delivery_address, placement_notes,
            zip_code, material_type, yard_name, distance_miles,
            truck_duration_min, truck_duration_max
          )
        `)
        .or(`scheduled_delivery_date.eq.${today},scheduled_pickup_date.eq.${today}`)
        .not("status", "eq", "completed")
        .not("status", "eq", "cancelled")
        .order("scheduled_delivery_date");

      if (error) throw error;
      setJobs(data as Job[]);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading jobs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  function openJobDetail(job: Job) {
    setSelectedJob(job);
    setDriverNotes(job.driver_notes || "");
    setDetailOpen(true);
  }

  async function updateJobStatus(newStatus: string) {
    if (!selectedJob) return;
    
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === "delivered") {
        updates.delivery_completed_at = new Date().toISOString();
      } else if (newStatus === "completed") {
        updates.pickup_completed_at = new Date().toISOString();
      }
      
      if (driverNotes !== selectedJob.driver_notes) {
        updates.driver_notes = driverNotes;
      }
      
      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", selectedJob.id);

      if (error) throw error;
      
      toast({ title: `Status updated to ${newStatus}` });
      setDetailOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast({ title: "Error updating status", variant: "destructive" });
    }
  }

  function openPhotoUpload(type: "delivery" | "pickup" | "ticket") {
    setPhotoType(type);
    setPhotoDialogOpen(true);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0] || !selectedJob) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedJob.id}/${photoType}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("dump-tickets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from("dump-tickets")
        .getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;
      
      // Update order with photo URL
      const updateField = photoType === "delivery" 
        ? "placement_photo_url" 
        : photoType === "pickup" 
          ? "pickup_photo_url" 
          : "dump_ticket_url";
      
      const { error: updateError } = await supabase
        .from("orders")
        .update({ [updateField]: photoUrl })
        .eq("id", selectedJob.id);

      if (updateError) throw updateError;
      
      toast({ title: "Photo uploaded successfully" });
      setPhotoDialogOpen(false);
    } catch (err) {
      console.error(err);
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCalsan} alt="Calsan" className="h-10 w-auto rounded-lg" />
            <div>
              <p className="font-bold">Driver App</p>
              <p className="text-xs text-amber-100">{format(new Date(), "EEEE, MMM d")}</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white">
            {jobs.length} Jobs Today
          </Badge>
        </div>
      </header>

      <main className="p-4 space-y-4 pb-20">
        {jobs.length === 0 ? (
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
            const JobIcon = config.icon;
            
            return (
              <Card 
                key={job.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openJobDetail(job)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={config.color}>
                          <JobIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {jobType === "delivery" 
                            ? job.scheduled_delivery_window 
                            : job.scheduled_pickup_window}
                        </Badge>
                      </div>
                      
                      <p className="font-semibold text-lg">
                        {job.quotes?.customer_name || "Customer"}
                      </p>
                      
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {job.quotes?.delivery_address || job.quotes?.zip_code}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span>{job.quotes?.material_type}</span>
                        {job.quotes?.distance_miles && (
                          <span>• {job.quotes.distance_miles.toFixed(1)} mi</span>
                        )}
                        {job.quotes?.truck_duration_min && (
                          <span>• ~{job.quotes.truck_duration_min} min</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={
                        job.status === "scheduled" ? "bg-purple-100 text-purple-800" :
                        job.status === "delivered" ? "bg-green-100 text-green-800" :
                        "bg-yellow-100 text-yellow-800"
                      }>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      {/* Job Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              {/* Customer Info */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-lg">
                    {selectedJob.quotes?.customer_name || "Customer"}
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {selectedJob.quotes?.delivery_address || selectedJob.quotes?.zip_code}
                  </p>
                  {selectedJob.quotes?.customer_phone && (
                    <a 
                      href={`tel:${selectedJob.quotes.customer_phone}`}
                      className="text-sm flex items-center gap-2 text-blue-600"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedJob.quotes.customer_phone}
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Route Info */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-medium flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Route Details
                  </p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Yard: {selectedJob.quotes?.yard_name || "Not set"}</p>
                    <p>Distance: {selectedJob.quotes?.distance_miles?.toFixed(1) || "—"} miles</p>
                    <p>Drive Time: {selectedJob.quotes?.truck_duration_min || "—"} min</p>
                  </div>
                  {selectedJob.route_notes && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-sm">
                      <strong>Notes:</strong> {selectedJob.route_notes}
                    </div>
                  )}
                  {selectedJob.quotes?.placement_notes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm">
                      <strong>Placement:</strong> {selectedJob.quotes.placement_notes}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Photo Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => openPhotoUpload("delivery")}>
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-xs">Delivery Photo</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => openPhotoUpload("pickup")}>
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-xs">Pickup Photo</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col" onClick={() => openPhotoUpload("ticket")}>
                  <FileText className="w-5 h-5 mb-1" />
                  <span className="text-xs">Dump Ticket</span>
                </Button>
              </div>

              {/* Driver Notes */}
              <div className="space-y-2">
                <Label>Driver Notes</Label>
                <Textarea
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  placeholder="Any notes about the job..."
                  rows={3}
                />
              </div>

              {/* Action Button */}
              {STATUS_FLOW[selectedJob.status as keyof typeof STATUS_FLOW] && (
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={() => updateJobStatus(STATUS_FLOW[selectedJob.status as keyof typeof STATUS_FLOW].next)}
                >
                  {STATUS_FLOW[selectedJob.status as keyof typeof STATUS_FLOW].action}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upload {photoType === "ticket" ? "Dump Ticket" : `${photoType} Photo`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={isUploading}
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground">
                  {isUploading ? "Uploading..." : "Tap to take photo or choose file"}
                </p>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
