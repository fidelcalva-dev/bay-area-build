import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { KPIMetric } from '@/hooks/useKPIData';

interface KPITargetEditorProps {
  kpi: KPIMetric | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (kpiKey: string, target: number, warning?: number) => Promise<void>;
}

export function KPITargetEditor({ kpi, open, onOpenChange, onSave }: KPITargetEditorProps) {
  const [target, setTarget] = useState(kpi?.target ?? 0);
  const [warning, setWarning] = useState(kpi?.warningThreshold ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!kpi) return;
    
    setSaving(true);
    try {
      await onSave(kpi.key, target, warning);
      toast.success('Target updated successfully');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to update target');
    } finally {
      setSaving(false);
    }
  };

  if (!kpi) return null;

  const formatValue = (value: number) => {
    switch (kpi.unit) {
      case '$': return `$${value.toLocaleString()}`;
      case '%': return `${value}%`;
      case 'days': return `${value} days`;
      case 'hours': return `${value} hours`;
      default: return value.toString();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit KPI Target: {kpi.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Current Value</span>
            <span className="text-lg font-bold">{formatValue(kpi.actual)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Value ({kpi.unit})</Label>
            <Input
              id="target"
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {kpi.higherIsBetter 
                ? 'Higher values are better. Status will be green when actual ≥ target.'
                : 'Lower values are better. Status will be green when actual ≤ target.'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warning">Warning Threshold ({kpi.unit})</Label>
            <Input
              id="warning"
              type="number"
              value={warning}
              onChange={(e) => setWarning(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {kpi.higherIsBetter
                ? 'Status will be yellow when actual is between warning and target.'
                : 'Status will be yellow when actual is between target and warning.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Target'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
