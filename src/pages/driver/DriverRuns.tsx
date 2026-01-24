/**
 * Driver Runs Page - Mobile-optimized view for drivers to manage their runs
 */
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Loader2, Truck, Package, Construction, RefreshCw, MapPin, Phone,
  CheckCircle2, Camera, Upload, Navigation, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  getRunsForDriver,
  getRunCheckpoints,
  updateRunStatus,
  completeCheckpoint,
  type Run,
  type RunCheckpoint,
  type RunType,
  type RunStatus,
  RUN_STATUS_FLOW,
  RUN_TYPE_CONFIG,
} from "@/lib/runsService";

const RUN_TYPE_ICONS: Record<RunType, React.ReactNode> = {
  DELIVERY: <Truck className="w-5 h-5" />,
  PICKUP: <Package className="w-5 h-5" />,
  HAUL: <Construction className="w-5 h-5" />,
  SWAP: <RefreshCw className="w-5 h-5" />,
};

export default function DriverRuns() {
  const { toast } = useToast();
  const { driverId, isLoading: authLoading, isDriver, isOwnerOperator } = useAdminAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [checkpoints, setCheckpoints] = useState<RunCheckpoint[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingCheckpoint, setUploadingCheckpoint] = useState<string | null>(null);
  
  useEffect(() => {
    if (driverId) fetchRuns();
  }, [driverId]);
  
  async function fetchRuns() {
    if (!driverId) return;
    
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const data = await getRunsForDriver(driverId, today);
      setRuns(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error loading runs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function openRunDetail(run: Run) {
    setSelectedRun(run);
    try {
      const cps = await getRunCheckpoints(run.id);
      setCheckpoints(cps);
    } catch {
      setCheckpoints([]);
    }
    setDialogOpen(true);
  }
  
  async function handleStatusAction() {
    if (!selectedRun) return;
    
    const nextStatus = RUN_STATUS_FLOW[selectedRun.status].next;
    if (!nextStatus) return;
    
    // Check checkpoints for completion
    if (nextStatus === "COMPLETED") {
      const incompleteRequired = checkpoints.filter(c => c.is_required && !c.completed_at);
      if (incompleteRequired.length > 0) {
        toast({
          title: "Missing Required Photos",
          description: `Please upload: ${incompleteRequired.map(c => c.checkpoint_type.replace(/_/g, " ")).join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSaving(true);
    const result = await updateRunStatus(selectedRun.id, nextStatus);
    setIsSaving(false);
    
    if (result.success) {
      toast({ title: `Run ${nextStatus.toLowerCase()}` });
      setDialogOpen(false);
      fetchRuns();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }
  
  async function handlePhotoUpload(checkpointId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedRun) return;
    
    setUploadingCheckpoint(checkpointId);
    
    try {
      const fileName = `runs/${selectedRun.id}/${checkpointId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("dump-tickets")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from("dump-tickets")
        .getPublicUrl(fileName);
      
      const checkpoint = checkpoints.find(c => c.id === checkpointId);
      const existingPhotos = (checkpoint?.photo_urls || []) as string[];
      
      const result = await completeCheckpoint(
        checkpointId,
        [...existingPhotos, urlData.publicUrl]
      );
      
      if (!result.success) throw new Error(result.error);
      
      toast({ title: "Photo uploaded ✓" });
      
      // Refresh checkpoints
      const cps = await getRunCheckpoints(selectedRun.id);
      setCheckpoints(cps);
    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingCheckpoint(null);
    }
  }
  
  function openNavigation(address: string) {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`, "_blank");
  }
  
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isDriver && !isOwnerOperator) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have driver privileges.</p>
      </div>
    );
  }
  
  if (!driverId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Driver Not Found</h2>
        <p className="text-muted-foreground">Your account is not linked to a driver profile.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My Runs</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRuns}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Runs List */}
      {runs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium">No runs assigned</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any runs scheduled for today
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {runs.map((run) => {
            const statusConfig = RUN_STATUS_FLOW[run.status];
            return (
              <Card
                key={run.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openRunDetail(run)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0",
                      RUN_TYPE_CONFIG[run.run_type].color
                    )}>
                      {RUN_TYPE_ICONS[run.run_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{RUN_TYPE_CONFIG[run.run_type].label}</span>
                        <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                          {run.status}
                        </Badge>
                      </div>
                      {run.assets_dumpsters && (
                        <div className="text-sm font-medium text-primary">
                          {run.assets_dumpsters.asset_code}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground truncate">
                        {run.customer_name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {run.scheduled_window || "—"}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Run Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRun && (
                <>
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                    RUN_TYPE_CONFIG[selectedRun.run_type].color
                  )}>
                    {RUN_TYPE_ICONS[selectedRun.run_type]}
                  </span>
                  <span>{RUN_TYPE_CONFIG[selectedRun.run_type].label}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRun && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <div className="font-medium text-lg">{selectedRun.customer_name || "—"}</div>
                {selectedRun.customer_phone && (
                  <a
                    href={`tel:${selectedRun.customer_phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {selectedRun.customer_phone}
                  </a>
                )}
              </div>
              
              {/* Asset */}
              {selectedRun.assets_dumpsters && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Asset</div>
                  <div className="font-bold text-lg">{selectedRun.assets_dumpsters.asset_code}</div>
                </div>
              )}
              
              {/* Destination with Navigation */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {selectedRun.run_type === "DELIVERY" ? "Deliver To" : "Pickup From"}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1">
                    {selectedRun.destination_address || selectedRun.origin_address || "—"}
                  </span>
                </div>
                {(selectedRun.destination_address || selectedRun.origin_address) && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openNavigation(
                      selectedRun.destination_address || selectedRun.origin_address || ""
                    )}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                )}
              </div>
              
              <Separator />
              
              {/* Checkpoints */}
              <div>
                <div className="font-medium mb-2">Required Photos</div>
                <div className="space-y-3">
                  {checkpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        cp.completed_at ? "bg-green-50 border-green-200" : "bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {cp.completed_at ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Camera className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">
                          {cp.checkpoint_type.replace(/_/g, " ")}
                        </span>
                        {cp.is_required && !cp.completed_at && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
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
                              className="w-16 h-16 rounded border overflow-hidden"
                            >
                              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {/* Upload */}
                      {!cp.completed_at && (
                        <label className="cursor-pointer block mt-2">
                          <Input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(cp.id, e)}
                            disabled={uploadingCheckpoint === cp.id}
                          />
                          <Button
                            variant="secondary"
                            className="w-full"
                            disabled={uploadingCheckpoint === cp.id}
                            asChild
                          >
                            <span>
                              {uploadingCheckpoint === cp.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Camera className="w-4 h-4 mr-2" />
                              )}
                              Take Photo
                            </span>
                          </Button>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {selectedRun && RUN_STATUS_FLOW[selectedRun.status].next && (
              <Button
                onClick={handleStatusAction}
                disabled={isSaving}
                className="w-full"
                size="lg"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {RUN_STATUS_FLOW[selectedRun.status].action} Run
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
