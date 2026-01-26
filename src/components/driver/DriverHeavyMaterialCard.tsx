// Driver Heavy Material Card Component
// Phase 5: Driver app enforcement for heavy orders

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Weight,
  Camera,
  Leaf,
  CheckCircle,
  X,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DriverHeavyMaterialCardProps {
  orderId: string;
  materialCode: string;
  materialName: string;
  estimatedWeightMin: number;
  estimatedWeightMax: number;
  riskLevel: 'LOW' | 'MED' | 'HIGH';
  requiresFillLine: boolean;
  requiresPrePickupPhotos: boolean;
  requestedGreenHalo: boolean;
  contaminationDetected: boolean;
  onContaminationMarked?: () => void;
}

export function DriverHeavyMaterialCard({
  orderId,
  materialCode,
  materialName,
  estimatedWeightMin,
  estimatedWeightMax,
  riskLevel,
  requiresFillLine,
  requiresPrePickupPhotos,
  requestedGreenHalo,
  contaminationDetected,
  onContaminationMarked,
}: DriverHeavyMaterialCardProps) {
  const [showContaminationDialog, setShowContaminationDialog] = useState(false);
  const [contaminationNotes, setContaminationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleMarkContamination() {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('mark_order_contaminated', {
        p_order_id: orderId,
        p_notes: contaminationNotes || null,
      });

      if (error) throw error;

      toast.success('Contamination recorded', {
        description: 'Order has been reclassified to debris pricing.',
      });
      setShowContaminationDialog(false);
      onContaminationMarked?.();
    } catch (err) {
      console.error('Error marking contamination:', err);
      toast.error('Failed to record contamination');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card className={cn(
        "border-2",
        riskLevel === 'HIGH' && "border-destructive",
        riskLevel === 'MED' && "border-amber-500",
        riskLevel === 'LOW' && "border-success"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Weight className="w-5 h-5" />
              Heavy Material Load
            </CardTitle>
            <RiskBadge level={riskLevel} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Material Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Material</p>
              <p className="font-semibold">{materialName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Est. Weight</p>
              <p className="font-bold text-lg">
                {estimatedWeightMin.toFixed(1)}–{estimatedWeightMax.toFixed(1)}T
              </p>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-2">
            {requiresFillLine && (
              <Badge variant="outline" className="bg-amber-50 border-amber-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Fill Line Required
              </Badge>
            )}
            {requiresPrePickupPhotos && (
              <Badge variant="outline" className="bg-blue-50 border-blue-300">
                <Camera className="w-3 h-3 mr-1" />
                Photos Required
              </Badge>
            )}
            {requestedGreenHalo && !contaminationDetected && (
              <Badge variant="outline" className="bg-success/10 border-success text-success">
                <Leaf className="w-3 h-3 mr-1" />
                Green Halo Requested
              </Badge>
            )}
            {contaminationDetected && (
              <Badge variant="destructive">
                <X className="w-3 h-3 mr-1" />
                Contaminated
              </Badge>
            )}
          </div>

          {/* Warnings */}
          {riskLevel === 'HIGH' && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">High Weight Risk</p>
                  <p className="text-sm text-destructive/80">
                    Check fill level before pickup. May need on-site adjustment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {requiresFillLine && !contaminationDetected && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Check:</strong> Material should be at or below the fill line.
                If overfilled, take photos and contact dispatch.
              </p>
            </div>
          )}

          {/* Photo Requirements */}
          {requiresPrePickupPhotos && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Required Photos:</p>
              <div className="grid grid-cols-2 gap-2">
                <PhotoRequirement
                  label="Wide Shot"
                  description="Full dumpster showing fill level"
                />
                <PhotoRequirement
                  label="Material Close-up"
                  description="Clear view of material type"
                />
              </div>
            </div>
          )}

          {/* Contamination Button */}
          {!contaminationDetected && (
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setShowContaminationDialog(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Contamination / Mixed Materials
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Contamination Dialog */}
      <Dialog open={showContaminationDialog} onOpenChange={setShowContaminationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Report Contamination
            </DialogTitle>
            <DialogDescription>
              This will reclassify the order from flat-rate heavy pricing to debris-by-ton pricing.
              Green Halo certification will be voided.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description of Contamination</label>
              <Textarea
                value={contaminationNotes}
                onChange={(e) => setContaminationNotes(e.target.value)}
                placeholder="Describe what contaminants were found (e.g., trash mixed with concrete, wood debris, etc.)"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Don't forget to take photos of the contamination!
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                These photos will be used for billing documentation.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowContaminationDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleMarkContamination}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Recording...' : 'Confirm Contamination'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RiskBadge({ level }: { level: 'LOW' | 'MED' | 'HIGH' }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        level === 'HIGH' && "bg-destructive/20 border-destructive text-destructive",
        level === 'MED' && "bg-amber-100 border-amber-500 text-amber-700",
        level === 'LOW' && "bg-success/20 border-success text-success"
      )}
    >
      {level === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1" />}
      {level === 'LOW' && <CheckCircle className="w-3 h-3 mr-1" />}
      {level}
    </Badge>
  );
}

function PhotoRequirement({ label, description }: { label: string; description: string }) {
  return (
    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Camera className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{label}</span>
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-300">{description}</p>
    </div>
  );
}
