/**
 * Create Run Dialog - allows dispatchers to create new runs from the UI
 */
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  createManualRun,
  checkConflicts,
  type RunType,
  type ConflictResult,
  RUN_TYPE_CONFIG,
} from "@/lib/runsService";

interface CreateRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultDate?: string;
  defaultWindow?: string;
}

interface Yard {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  asset_code: string;
}

export function CreateRunDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultDate,
  defaultWindow,
}: CreateRunDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [yards, setYards] = useState<Yard[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResult | null>(null);

  const [form, setForm] = useState({
    runType: "DELIVERY" as RunType,
    scheduledDate: defaultDate || format(new Date(), "yyyy-MM-dd"),
    scheduledWindow: defaultWindow || "morning",
    originYardId: "",
    destinationAddress: "",
    assetId: "",
    customerName: "",
    customerPhone: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      // Reset form
      setForm((prev) => ({
        ...prev,
        scheduledDate: defaultDate || format(new Date(), "yyyy-MM-dd"),
        scheduledWindow: defaultWindow || prev.scheduledWindow,
      }));
      setConflicts(null);
      fetchRefs();
    }
  }, [open, defaultDate, defaultWindow]);

  async function fetchRefs() {
    const [yardsRes, assetsRes] = await Promise.all([
      supabase
        .from("yards")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("assets_dumpsters")
        .select("id, asset_code")
        .eq("asset_status", "available")
        .order("asset_code")
        .limit(100),
    ]);
    if (yardsRes.data) setYards(yardsRes.data as Yard[]);
    if (assetsRes.data) setAssets(assetsRes.data as Asset[]);
  }

  // Check conflicts when asset changes
  useEffect(() => {
    if (form.assetId && form.scheduledDate) {
      checkConflicts({
        date: form.scheduledDate,
        window: form.scheduledWindow,
        assetId: form.assetId,
      }).then(setConflicts);
    } else {
      setConflicts(null);
    }
  }, [form.assetId, form.scheduledDate, form.scheduledWindow]);

  async function handleCreate() {
    if (!form.runType || !form.scheduledDate) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const result = await createManualRun({
        runType: form.runType,
        scheduledDate: form.scheduledDate,
        scheduledWindow: form.scheduledWindow || undefined,
        originYardId: form.originYardId || undefined,
        destinationAddress: form.destinationAddress || undefined,
        assetId: form.assetId || undefined,
        customerName: form.customerName || undefined,
        customerPhone: form.customerPhone || undefined,
        notes: form.notes || undefined,
      });

      if (!result.success) throw new Error(result.error);

      toast({ title: "Run created successfully" });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        title: "Error creating run",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Run</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Run Type */}
          <div className="space-y-2">
            <Label>Run Type *</Label>
            <Select
              value={form.runType}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, runType: v as RunType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RUN_TYPE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.icon} {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Window */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    scheduledDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Window</Label>
              <Select
                value={form.scheduledWindow}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, scheduledWindow: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (7-10am)</SelectItem>
                  <SelectItem value="midday">Midday (10am-2pm)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2-6pm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Origin Yard */}
          <div className="space-y-2">
            <Label>Origin Yard</Label>
            <Select
              value={form.originYardId}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, originYardId: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select yard" />
              </SelectTrigger>
              <SelectContent>
                {yards.map((y) => (
                  <SelectItem key={y.id} value={y.id}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset */}
          <div className="space-y-2">
            <Label>Asset (Dumpster)</Label>
            <Select
              value={form.assetId}
              onValueChange={(v) =>
                setForm((prev) => ({ ...prev, assetId: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.asset_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conflict Warning */}
          {conflicts?.hasConflict && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                <AlertTriangle className="w-4 h-4" />
                Scheduling Conflicts Detected
              </div>
              <div className="space-y-1">
                {conflicts.conflicts.map((c, i) => (
                  <div key={i} className="text-xs text-destructive/80">
                    {c.type} conflict with run{" "}
                    <Badge variant="outline" className="text-xs">
                      {c.conflictingRunNumber ||
                        c.conflictingRunId.slice(0, 8)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination */}
          <div className="space-y-2">
            <Label>Destination Address</Label>
            <Input
              value={form.destinationAddress}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  destinationAddress: e.target.value,
                }))
              }
              placeholder="123 Main St, Oakland, CA"
            />
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={form.customerName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Customer Phone</Label>
              <Input
                value={form.customerPhone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    customerPhone: e.target.value,
                  }))
                }
                placeholder="+1..."
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Special instructions..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
