import { AlertTriangle, AlertOctagon, XCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ExceptionFlagsProps {
  isDryRun: boolean;
  dryRunReason: string;
  overfillFlagged: boolean;
  wrongMaterialFlagged: boolean;
  onDryRunChange: (value: boolean) => void;
  onDryRunReasonChange: (value: string) => void;
  onOverfillChange: (value: boolean) => void;
  onWrongMaterialChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ExceptionFlags({
  isDryRun,
  dryRunReason,
  overfillFlagged,
  wrongMaterialFlagged,
  onDryRunChange,
  onDryRunReasonChange,
  onOverfillChange,
  onWrongMaterialChange,
  disabled = false,
}: ExceptionFlagsProps) {
  return (
    <div className="space-y-4 p-4 bg-red-50/50 rounded-lg border border-red-100">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <Label className="font-semibold text-red-800">Exception Flags</Label>
      </div>

      <div className="space-y-4">
        {/* Dry Run */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <Label htmlFor="dry-run" className="text-sm">Dry Run</Label>
            </div>
            <Switch
              id="dry-run"
              checked={isDryRun}
              onCheckedChange={onDryRunChange}
              disabled={disabled}
            />
          </div>
          {isDryRun && (
            <Textarea
              placeholder="Reason for dry run (e.g., gate locked, customer not home)..."
              value={dryRunReason}
              onChange={(e) => onDryRunReasonChange(e.target.value)}
              className="text-sm"
              rows={2}
              disabled={disabled}
            />
          )}
        </div>

        {/* Overfill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-orange-500" />
            <Label htmlFor="overfill" className="text-sm">Overfill Flagged</Label>
          </div>
          <Switch
            id="overfill"
            checked={overfillFlagged}
            onCheckedChange={onOverfillChange}
            disabled={disabled}
          />
        </div>

        {/* Wrong Material */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <Label htmlFor="wrong-material" className="text-sm">Wrong Material Flagged</Label>
          </div>
          <Switch
            id="wrong-material"
            checked={wrongMaterialFlagged}
            onCheckedChange={onWrongMaterialChange}
            disabled={disabled}
          />
        </div>
      </div>

      {(isDryRun || overfillFlagged || wrongMaterialFlagged) && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          This order will be flagged for manual review
        </p>
      )}
    </div>
  );
}
