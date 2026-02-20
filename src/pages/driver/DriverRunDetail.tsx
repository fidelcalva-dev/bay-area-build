/**
 * Driver Run Detail — Steps checklist, call/navigate, enforcement
 * /driver/runs/:id
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Phone, Navigation, Clock, MapPin, Truck, Package,
  RefreshCw, Loader2, Camera, FileText, CheckCircle2, AlertTriangle,
  Timer, ChevronDown, ChevronUp, User, StickyNote, Pause, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  getRunById,
  getRunCheckpoints,
  updateRunStatus,
  completeCheckpoint,
  pauseRun,
  resumeRun,
  type Run,
  type RunCheckpoint,
  type RunType,
  RUN_STATUS_FLOW,
  RUN_TYPE_CONFIG,
} from '@/lib/runsService';
import { DriverProofCamera } from '@/components/driver/DriverProofCamera';
import { DriverLiveLoadTimer } from '@/components/driver/DriverLiveLoadTimer';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const TYPE_ICONS: Record<RunType, React.ReactNode> = {
  DELIVERY: <Truck className="w-5 h-5" />,
  PICKUP: <Package className="w-5 h-5" />,
  HAUL: <Truck className="w-5 h-5" />,
  SWAP: <RefreshCw className="w-5 h-5" />,
  DUMP_AND_RETURN: <Truck className="w-5 h-5" />,
  YARD_TRANSFER: <Truck className="w-5 h-5" />,
};

// Step definitions per run type
interface StepDef {
  key: string;
  label: string;
  icon: React.ReactNode;
  action: 'status' | 'photo' | 'ticket' | 'timer' | 'navigate_facility';
  statusTarget?: string;
  checkpointType?: string;
  required?: boolean;
}

function getStepsForRunType(runType: RunType, isHeavy: boolean): StepDef[] {
  const steps: StepDef[] = [];

  // Common: Accept + Start
  steps.push(
    { key: 'accept', label: 'Accept Run', icon: <CheckCircle2 className="w-5 h-5" />, action: 'status', statusTarget: 'ACCEPTED' },
    { key: 'enroute', label: 'Start Driving', icon: <Navigation className="w-5 h-5" />, action: 'status', statusTarget: 'EN_ROUTE' },
    { key: 'arrived', label: 'Arrived at Site', icon: <MapPin className="w-5 h-5" />, action: 'status', statusTarget: 'ARRIVED' },
  );

  if (runType === 'DELIVERY') {
    steps.push(
      { key: 'delivery_photo', label: 'Placement Photo', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'DELIVERY_POD', required: true },
    );
  }

  if (runType === 'PICKUP') {
    steps.push(
      { key: 'pickup_photo', label: 'Full Dumpster Photo', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'PICKUP_POD', required: true },
      { key: 'material_photo', label: 'Material Close-up', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'MATERIAL_CLOSEUP', required: true },
      { key: 'nav_facility', label: 'Navigate to Facility', icon: <Navigation className="w-5 h-5" />, action: 'navigate_facility' },
      { key: 'dump_ticket', label: 'Upload Dump Ticket', icon: <FileText className="w-5 h-5" />, action: 'ticket', checkpointType: 'DUMP_TICKET', required: true },
    );
  }

  if (runType === 'SWAP') {
    steps.push(
      { key: 'swap_pickup_photo', label: 'Pickup Photo (Full)', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'SWAP_PICKUP_POD', required: true },
      { key: 'swap_delivery_photo', label: 'Drop Photo (Empty)', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'SWAP_DELIVERY_POD', required: true },
      { key: 'nav_facility', label: 'Navigate to Facility', icon: <Navigation className="w-5 h-5" />, action: 'navigate_facility' },
      { key: 'dump_ticket', label: 'Upload Dump Ticket', icon: <FileText className="w-5 h-5" />, action: 'ticket', checkpointType: 'DUMP_TICKET', required: true },
    );
  }

  if (runType === 'DUMP_AND_RETURN') {
    steps.push(
      { key: 'pickup_photo', label: 'Full Dumpster Photo', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'PICKUP_POD', required: true },
      { key: 'live_load', label: 'Live Load Timer', icon: <Timer className="w-5 h-5" />, action: 'timer' },
      { key: 'nav_facility', label: 'Navigate to Facility', icon: <Navigation className="w-5 h-5" />, action: 'navigate_facility' },
      { key: 'dump_ticket', label: 'Upload Dump Ticket', icon: <FileText className="w-5 h-5" />, action: 'ticket', checkpointType: 'DUMP_TICKET', required: true },
      { key: 'return_photo', label: 'Return Placement Photo', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'DELIVERY_POD', required: true },
    );
  }

  if (runType === 'YARD_TRANSFER' || runType === 'HAUL') {
    steps.push(
      { key: 'delivery_photo', label: 'Placement Photo', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'DELIVERY_POD', required: false },
    );
  }

  // Heavy material extras
  if (isHeavy) {
    steps.push(
      { key: 'fill_line', label: 'Fill Line Compliance Photo', icon: <Camera className="w-5 h-5" />, action: 'photo', checkpointType: 'FILL_LINE_PHOTO', required: true },
    );
  }

  // Always ends with complete
  steps.push(
    { key: 'complete', label: 'Complete Run', icon: <CheckCircle2 className="w-5 h-5" />, action: 'status', statusTarget: 'COMPLETED' },
  );

  return steps;
}

export default function DriverRunDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAdminAuth();

  const [run, setRun] = useState<Run | null>(null);
  const [checkpoints, setCheckpoints] = useState<RunCheckpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraCheckpointType, setCameraCheckpointType] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');

  const PAUSE_REASONS = [
    'Customer not home',
    'Gate locked / no access',
    'Waiting for customer',
    'Truck issue',
    'Weather delay',
    'Other',
  ];

  const fetchRun = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [runData, cps] = await Promise.all([
        getRunById(id),
        getRunCheckpoints(id),
      ]);
      setRun(runData);
      setCheckpoints(cps);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading run', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchRun(); }, [fetchRun]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Run not found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/driver')}>
          ← Back
        </Button>
      </div>
    );
  }

  const steps = getStepsForRunType(run.run_type, run.is_heavy_material);

  // Check if a status step is done
  const statusOrder = ['DRAFT', 'SCHEDULED', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PAUSED', 'COMPLETED'];
  const currentStatusIndex = statusOrder.indexOf(run.status);
  const isPaused = run.status === 'PAUSED';
  const canPause = ['EN_ROUTE', 'ARRIVED'].includes(run.status);

  function isStepDone(step: StepDef): boolean {
    if (step.action === 'status' && step.statusTarget) {
      const targetIdx = statusOrder.indexOf(step.statusTarget);
      return currentStatusIndex >= targetIdx;
    }
    if (step.action === 'photo' || step.action === 'ticket') {
      const cp = checkpoints.find(c => c.checkpoint_type === step.checkpointType);
      return !!cp?.completed_at;
    }
    if (step.action === 'navigate_facility') return currentStatusIndex >= statusOrder.indexOf('ARRIVED');
    if (step.action === 'timer') return false; // Timer is optional
    return false;
  }

  function isStepAvailable(step: StepDef): boolean {
    if (step.action === 'status' && step.statusTarget) {
      const nextValid = RUN_STATUS_FLOW[run!.status].next;
      return step.statusTarget === nextValid;
    }
    if (step.action === 'photo' || step.action === 'ticket') {
      return currentStatusIndex >= statusOrder.indexOf('ARRIVED') || currentStatusIndex >= statusOrder.indexOf('EN_ROUTE');
    }
    if (step.action === 'navigate_facility') return currentStatusIndex >= statusOrder.indexOf('ARRIVED');
    if (step.action === 'timer') return currentStatusIndex >= statusOrder.indexOf('ARRIVED');
    return false;
  }

  async function handleStatusAction(targetStatus: string) {
    if (!run) return;

    // Enforce checkpoint completion for COMPLETED
    if (targetStatus === 'COMPLETED') {
      const requiredCheckpoints = steps.filter(s => s.required && (s.action === 'photo' || s.action === 'ticket'));
      const missing = requiredCheckpoints.filter(s => {
        const cp = checkpoints.find(c => c.checkpoint_type === s.checkpointType);
        return !cp?.completed_at;
      });
      if (missing.length > 0) {
        toast({
          title: 'Missing Required Items',
          description: missing.map(m => m.label).join(', '),
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSaving(true);
    const result = await updateRunStatus(run.id, targetStatus as any);
    setIsSaving(false);

    if (result.success) {
      toast({ title: `${targetStatus.replace(/_/g, ' ')} ✓` });
      fetchRun();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  function openCamera(checkpointType: string) {
    setCameraCheckpointType(checkpointType);
    setCameraOpen(true);
  }

  async function handlePhotoUploaded(photoUrl: string) {
    if (!run) return;
    // Find or create checkpoint
    let cp = checkpoints.find(c => c.checkpoint_type === cameraCheckpointType);
    if (!cp) {
      // Create checkpoint on the fly
      const { data } = await supabase
        .from('run_checkpoints' as 'orders')
        .insert({
          run_id: run.id,
          checkpoint_type: cameraCheckpointType,
          is_required: true,
        } as never)
        .select('*')
        .single();
      if (data) cp = data as unknown as RunCheckpoint;
    }

    if (cp) {
      const existing = (cp.photo_urls || []) as string[];
      await completeCheckpoint(cp.id, [...existing, photoUrl]);

      // Log event
      await supabase.from('run_events' as 'orders').insert({
        run_id: run.id,
        event_type: cameraCheckpointType === 'DUMP_TICKET' ? 'DUMP_TICKET_UPLOADED' : `${cameraCheckpointType}_UPLOADED`,
        actor_id: user?.id || null,
        metadata: { photo_url: photoUrl },
      } as never);
    }

    toast({ title: 'Photo uploaded ✓' });
    setCameraOpen(false);
    fetchRun();
  }

  function openNavigation(address: string) {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`, '_blank');
  }

  function handleStepAction(step: StepDef) {
    if (step.action === 'status' && step.statusTarget) {
      handleStatusAction(step.statusTarget);
    } else if (step.action === 'photo' || step.action === 'ticket') {
      openCamera(step.checkpointType || '');
    } else if (step.action === 'navigate_facility') {
      const facilityAddr = run?.destination_facility?.name || run?.destination_address;
      if (facilityAddr) openNavigation(facilityAddr);
      else toast({ title: 'No facility address available', variant: 'destructive' });
    } else if (step.action === 'timer') {
      setShowTimer(true);
    }
  }

  async function handlePause() {
    if (!run || !pauseReason) return;
    setIsSaving(true);
    const result = await pauseRun(run.id, pauseReason);
    setIsSaving(false);
    if (result.success) {
      toast({ title: 'Service paused ✓' });
      setPauseDialogOpen(false);
      setPauseReason('');
      fetchRun();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  async function handleResume() {
    if (!run) return;
    setIsSaving(true);
    const result = await resumeRun(run.id);
    setIsSaving(false);
    if (result.success) {
      toast({ title: 'Service resumed ✓' });
      fetchRun();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  const customerAddr = run.destination_address || run.origin_address || '';

  return (
    <div className="min-h-screen bg-muted/30 pb-8">
      {/* Header */}
      <div className={cn('p-4 text-white', RUN_TYPE_CONFIG[run.run_type].color)}>
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 -ml-2" onClick={() => navigate('/driver')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {TYPE_ICONS[run.run_type]}
              <span className="text-lg font-bold">{RUN_TYPE_CONFIG[run.run_type].label}</span>
            </div>
            <p className="text-sm text-white/80 mt-0.5">Run #{run.run_number}</p>
          </div>
          <Badge className="bg-white/20 text-white font-bold">
            {run.status.replace(/_/g, ' ')}
          </Badge>
        </div>

        {/* Customer + Quick Actions */}
        <div className="bg-white/10 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-semibold text-base">{run.customer_name || 'Customer'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{customerAddr || '—'}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{run.scheduled_window || 'TBD'} • {format(new Date(run.scheduled_date), 'MMM d')}</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-2">
            {run.customer_phone && (
              <a href={`tel:${run.customer_phone}`} className="flex-1">
                <Button size="lg" className="w-full bg-white/20 hover:bg-white/30 text-white gap-2 h-12">
                  <Phone className="w-5 h-5" /> Call
                </Button>
              </a>
            )}
            {customerAddr && (
              <Button
                size="lg"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white gap-2 h-12"
                onClick={() => openNavigation(customerAddr)}
              >
                <Navigation className="w-5 h-5" /> Navigate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pause / Resume Banner */}
      {isPaused && (
        <div className="mx-4 mt-3 p-4 rounded-xl bg-amber-100 border-2 border-amber-300">
          <div className="flex items-center gap-2 mb-2">
            <Pause className="w-5 h-5 text-amber-700" />
            <span className="font-bold text-amber-800">Service Paused</span>
          </div>
          <p className="text-sm text-amber-700 mb-3">Reason: {run.pause_reason || 'Unknown'}</p>
          <Button
            onClick={handleResume}
            disabled={isSaving}
            className="w-full h-12 gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            Resume Service
          </Button>
        </div>
      )}
      {canPause && !isPaused && (
        <div className="mx-4 mt-3">
          <Button
            variant="outline"
            className="w-full h-10 gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => setPauseDialogOpen(true)}
          >
            <Pause className="w-4 h-4" /> Pause Service
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="steps" className="px-4 mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="steps" className="flex-1 font-bold">Steps</TabsTrigger>
          <TabsTrigger value="details" className="flex-1 font-bold">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="mt-4 space-y-3">
          {steps.map((step) => {
            const done = isStepDone(step);
            const available = isStepAvailable(step);
            const isComplete = step.key === 'complete';

            return (
              <button
                key={step.key}
                disabled={done || (!available && !done) || isSaving}
                onClick={() => handleStepAction(step)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                  done
                    ? 'bg-green-50 border-green-200 opacity-70'
                    : available
                      ? isComplete
                        ? 'bg-green-500 border-green-500 text-white shadow-lg active:scale-[0.98]'
                        : 'bg-card border-primary shadow-md active:scale-[0.98]'
                      : 'bg-muted/50 border-muted opacity-50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  done ? 'bg-green-500 text-white' : available ? (isComplete ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary') : 'bg-muted text-muted-foreground'
                )}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                </div>
                <div className="flex-1">
                  <span className={cn('font-bold text-base', isComplete && available && !done && 'text-white')}>
                    {step.label}
                  </span>
                  {step.required && !done && (
                    <span className={cn('text-xs ml-2', isComplete && available ? 'text-white/70' : 'text-red-500')}>Required</span>
                  )}
                </div>
                {isSaving && available && !done && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
              </button>
            );
          })}
        </TabsContent>

        <TabsContent value="details" className="mt-4 space-y-4">
          {/* Asset */}
          {run.assets_dumpsters && (
            <div className="p-4 bg-card rounded-2xl border">
              <p className="text-xs text-muted-foreground font-medium mb-1">Asset</p>
              <p className="text-xl font-bold font-mono">{run.assets_dumpsters.asset_code}</p>
            </div>
          )}

          {/* Notes */}
          {(run.dispatcher_notes || run.notes) && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-sm text-amber-800">Dispatch Notes</span>
              </div>
              <p className="text-sm text-amber-900">{run.dispatcher_notes || run.notes}</p>
            </div>
          )}

          {/* Heavy Material */}
          {run.is_heavy_material && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-bold text-sm text-red-800">Heavy Material</span>
              </div>
              <p className="text-sm text-red-700">Fill line compliance photo required</p>
              {run.actual_weight_tons && (
                <p className="text-sm font-medium mt-1">Weight: {run.actual_weight_tons} tons</p>
              )}
            </div>
          )}

          {/* Addresses */}
          <div className="p-4 bg-card rounded-2xl border space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Origin</p>
              <p className="text-sm font-medium">{run.origin_yard?.name || run.origin_address || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Destination</p>
              <p className="text-sm font-medium">{run.destination_address || run.destination_yard?.name || '—'}</p>
            </div>
          </div>

          {/* Uploaded photos */}
          {checkpoints.filter(cp => (cp.photo_urls as string[])?.length > 0).length > 0 && (
            <div className="p-4 bg-card rounded-2xl border">
              <p className="text-xs text-muted-foreground font-medium mb-3">Uploaded Photos</p>
              <div className="space-y-3">
                {checkpoints.filter(cp => (cp.photo_urls as string[])?.length > 0).map(cp => (
                  <div key={cp.id}>
                    <p className="text-xs font-semibold mb-1">{cp.checkpoint_type.replace(/_/g, ' ')}</p>
                    <div className="flex gap-2 flex-wrap">
                      {(cp.photo_urls as string[]).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="w-16 h-16 rounded-lg border overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Proof Camera Modal */}
      {cameraOpen && (
        <DriverProofCamera
          runId={run.id}
          checkpointType={cameraCheckpointType}
          onUpload={handlePhotoUploaded}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Live Load Timer Modal */}
      {showTimer && (
        <DriverLiveLoadTimer
          runId={run.id}
          userId={user?.id || ''}
          onClose={() => setShowTimer(false)}
        />
      )}

      {/* Pause Reason Dialog */}
      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Service</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-3">Select a reason:</p>
            <RadioGroup value={pauseReason} onValueChange={setPauseReason} className="space-y-2">
              {PAUSE_REASONS.map(reason => (
                <div key={reason} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="flex-1 cursor-pointer font-medium">{reason}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePause}
              disabled={!pauseReason || isSaving}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              Pause Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
