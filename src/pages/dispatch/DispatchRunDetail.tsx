/**
 * Run Detail Page - View and manage a single run
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Loader2, ArrowLeft, Truck, Package, Construction, RefreshCw,
  User, Calendar, Clock, MapPin, Phone, Camera, FileText, CheckCircle2,
  AlertTriangle, Upload, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  getRunById,
  getRunCheckpoints,
  getRunEvents,
  updateRunStatus,
  completeCheckpoint,
  type Run,
  type RunCheckpoint,
  type RunEvent,
  type RunType,
  type RunStatus,
  RUN_STATUS_FLOW,
  RUN_TYPE_CONFIG,
} from "@/lib/runsService";
import { OperationalTimeBadge } from "@/components/operations/OperationalTimeBadge";
import type { ServiceType, MaterialCategory } from "@/types/operationalTime";

const RUN_TYPE_ICONS: Record<RunType, React.ReactNode> = {
  DELIVERY: <Truck className="w-5 h-5" />,
  PICKUP: <Package className="w-5 h-5" />,
  HAUL: <Construction className="w-5 h-5" />,
  SWAP: <RefreshCw className="w-5 h-5" />,
  DUMP_AND_RETURN: <Truck className="w-5 h-5" />,
  YARD_TRANSFER: <Truck className="w-5 h-5" />,
};

export default function DispatchRunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [run, setRun] = useState<Run | null>(null);
  const [checkpoints, setCheckpoints] = useState<RunCheckpoint[]>([]);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Photo upload
  const [uploadingCheckpoint, setUploadingCheckpoint] = useState<string | null>(null);
  
  useEffect(() => {
    if (runId) fetchData();
  }, [runId]);
  
  async function fetchData() {
    setIsLoading(true);
    try {
      const [runData, checkpointsData, eventsData] = await Promise.all([
        getRunById(runId!),
        getRunCheckpoints(runId!),
        getRunEvents(runId!),
      ]);
      
      setRun(runData);
      setCheckpoints(checkpointsData);
      setEvents(eventsData);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading run", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleStatusAction() {
    if (!run) return;
    
    const nextStatus = RUN_STATUS_FLOW[run.status].next;
    if (!nextStatus) return;
    
    // Check checkpoints for completion
    if (nextStatus === "COMPLETED") {
      const incompleteRequired = checkpoints.filter(c => c.is_required && !c.completed_at);
      if (incompleteRequired.length > 0) {
        toast({
          title: "Missing Required Checkpoints",
          description: `Please complete: ${incompleteRequired.map(c => c.checkpoint_type).join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSaving(true);
    const result = await updateRunStatus(run.id, nextStatus);
    setIsSaving(false);
    
    if (result.success) {
      toast({ title: `Run ${nextStatus.toLowerCase()}` });
      fetchData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }
  
  async function handlePhotoUpload(checkpointId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingCheckpoint(checkpointId);
    
    try {
      // Upload to storage
      const fileName = `runs/${runId}/${checkpointId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("dump-tickets")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("dump-tickets")
        .getPublicUrl(fileName);
      
      // Update checkpoint
      const checkpoint = checkpoints.find(c => c.id === checkpointId);
      const existingPhotos = (checkpoint?.photo_urls || []) as string[];
      
      const result = await completeCheckpoint(
        checkpointId,
        [...existingPhotos, urlData.publicUrl]
      );
      
      if (!result.success) throw new Error(result.error);
      
      toast({ title: "Photo uploaded" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingCheckpoint(null);
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!run) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-bold">Run Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }
  
  const statusConfig = RUN_STATUS_FLOW[run.status];
  
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-white",
              RUN_TYPE_CONFIG[run.run_type].color
            )}>
              {RUN_TYPE_ICONS[run.run_type]}
            </span>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {run.run_type} Run
                <Badge variant="outline">{run.run_number}</Badge>
              </h1>
              <p className="text-muted-foreground">
                {format(new Date(run.scheduled_date), "EEEE, MMMM d, yyyy")}
                {run.scheduled_window && ` • ${run.scheduled_window}`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {run.origin_yard?.id && (
            <OperationalTimeBadge
              yardId={run.origin_yard.id}
              destinationAddress={run.destination_address || undefined}
              serviceType={run.run_type as ServiceType}
              materialCategory="DEBRIS"
              autoCalculate={true}
            />
          )}
          <Badge className={cn("text-sm py-1 px-3", statusConfig.color)}>
            {run.status}
          </Badge>
        </div>
      </div>
      
      {/* Action Button */}
      {statusConfig.next && (
        <Card className="border-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Next Action</h3>
              <p className="text-sm text-muted-foreground">
                {statusConfig.action} this run to progress to {statusConfig.next}
              </p>
            </div>
            <Button onClick={handleStatusAction} disabled={isSaving} size="lg">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {statusConfig.action}
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Run Info */}
        <Card>
          <CardHeader>
            <CardTitle>Run Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <div className="font-medium">{run.customer_name || "—"}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <div className="font-medium flex items-center gap-1">
                  {run.customer_phone ? (
                    <a href={`tel:${run.customer_phone}`} className="text-primary hover:underline flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {run.customer_phone}
                    </a>
                  ) : "—"}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Asset</Label>
                <div className="font-medium">{run.assets_dumpsters?.asset_code || "—"}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Assigned Driver</Label>
                <div className="font-medium">
                  {run.drivers ? (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {run.drivers.name}
                      {run.drivers.is_owner_operator && (
                        <Badge variant="secondary" className="text-xs">OO</Badge>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-muted-foreground">Origin</Label>
              <div className="font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-green-600" />
                {run.origin_yard?.name || run.origin_address || `${run.origin_type}`}
              </div>
            </div>
            
            <div>
              <Label className="text-muted-foreground">Destination</Label>
              <div className="font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-600" />
                {run.destination_yard?.name || run.destination_address || `${run.destination_type}`}
              </div>
            </div>
            
            {run.notes && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <div className="text-sm">{run.notes}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Checkpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Proof of Service</CardTitle>
            <CardDescription>Required checkpoints for run completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkpoints.length === 0 ? (
              <p className="text-muted-foreground text-sm">No checkpoints required</p>
            ) : (
              checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    cp.completed_at ? "bg-green-50 border-green-200" : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {cp.completed_at ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : cp.checkpoint_type.includes("POD") ? (
                        <Camera className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">
                        {cp.checkpoint_type.replace(/_/g, " ")}
                      </span>
                      {cp.is_required && !cp.completed_at && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {cp.completed_at && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(cp.completed_at), "MMM d, h:mm a")}
                      </span>
                    )}
                  </div>
                  
                  {/* Photos */}
                  {(cp.photo_urls as string[])?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(cp.photo_urls as string[]).map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 rounded border overflow-hidden hover:opacity-80"
                        >
                          <img src={url} alt={`POD ${i + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload button */}
                  {!cp.completed_at && (
                    <div className="mt-2">
                      <label className="cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(cp.id, e)}
                          disabled={uploadingCheckpoint === cp.id}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={uploadingCheckpoint === cp.id}
                          asChild
                        >
                          <span>
                            {uploadingCheckpoint === cp.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload Photo
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">No events yet</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <div className="font-medium">{event.event_type.replace(/_/g, " ")}</div>
                    {event.from_status && event.to_status && (
                      <div className="text-muted-foreground">
                        {event.from_status} → {event.to_status}
                      </div>
                    )}
                    {event.notes && <div className="text-muted-foreground">{event.notes}</div>}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.created_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
