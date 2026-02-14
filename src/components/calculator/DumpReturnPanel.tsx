// Dump & Return Panel — Customer-Owned Dumpster Hauling
// Internal calculator panel for quoting Dump & Return services

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Truck, AlertTriangle, FileText, Info } from 'lucide-react';
import {
  estimateDumpReturn,
  DUMP_RETURN_DEFAULTS,
  type DumpReturnEstimate,
  type DumpReturnConfig,
} from '@/lib/logistics/dumpReturnEngine';

export interface DumpReturnState {
  enabled: boolean;
  estimatedDriveMinutes: number;
  estimatedDumpFee: number;
  materialStream: string;
  notes: string;
  estimate: DumpReturnEstimate | null;
}

interface DumpReturnPanelProps {
  onStateChange: (state: DumpReturnState) => void;
}

const MATERIAL_STREAMS = [
  { value: 'general', label: 'General Debris / C&D' },
  { value: 'heavy', label: 'Heavy (Concrete, Dirt, Asphalt)' },
  { value: 'green', label: 'Green Waste / Clean Wood' },
  { value: 'mixed', label: 'Mixed / Unknown' },
];

export function DumpReturnPanel({ onStateChange }: DumpReturnPanelProps) {
  const [enabled, setEnabled] = useState(false);
  const [estimatedDriveMinutes, setEstimatedDriveMinutes] = useState(60);
  const [estimatedDumpFee, setEstimatedDumpFee] = useState(350);
  const [materialStream, setMaterialStream] = useState('general');
  const [notes, setNotes] = useState('');

  const estimate = enabled
    ? estimateDumpReturn({ estimatedDriveMinutes, estimatedDumpFee })
    : null;

  useEffect(() => {
    onStateChange({
      enabled,
      estimatedDriveMinutes,
      estimatedDumpFee,
      materialStream,
      notes,
      estimate,
    });
  }, [enabled, estimatedDriveMinutes, estimatedDumpFee, materialStream, notes]);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
  };

  return (
    <Card className={enabled ? 'border-primary/40 bg-primary/[0.02]' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5" />
            Dump & Return
          </CardTitle>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Customer-owned dumpster: pickup, dump & return
        </p>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4 pt-0">
          {/* Service description */}
          <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
            <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Service Details
            </p>
            <p className="text-xs text-muted-foreground">
              We haul the customer's container to the disposal facility and return it.
              Pricing is based on total truck time plus actual dump fee.
            </p>
          </div>

          {/* Pricing rules */}
          <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
            <p className="text-xs font-medium text-foreground">Pricing Rules</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">--</span>
                Hourly rate: ${DUMP_RETURN_DEFAULTS.hourlyRate}/hr
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">--</span>
                Minimum: {DUMP_RETURN_DEFAULTS.minimumHours} hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">--</span>
                Billed in {DUMP_RETURN_DEFAULTS.billingIncrementMinutes}-minute increments
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">--</span>
                Dump fee pass-through + {(DUMP_RETURN_DEFAULTS.dumpFeeMarkupPct * 100).toFixed(0)}% environmental handling
              </li>
            </ul>
          </div>

          {/* Material stream */}
          <div className="space-y-1.5">
            <Label className="text-xs">Material / Disposal Stream</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {MATERIAL_STREAMS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setMaterialStream(s.value)}
                  className={`p-2 rounded-lg border text-xs text-left transition-all ${
                    materialStream === s.value
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/40 text-muted-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drive time estimate */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Est. Drive Time (min)</Label>
              <Input
                type="number"
                min={15}
                max={300}
                value={estimatedDriveMinutes}
                onChange={e => setEstimatedDriveMinutes(Number(e.target.value) || 60)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Est. Dump Fee ($)</Label>
              <Input
                type="number"
                min={0}
                step={25}
                value={estimatedDumpFee}
                onChange={e => setEstimatedDumpFee(Number(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              placeholder="Container type, access details, special requirements..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <Separator />

          {/* Estimate breakdown */}
          {estimate && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">Estimated Pricing</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operational Time</span>
                  <span className="font-medium">{estimate.estimatedMinutesTotal} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billed Time (min {estimate.config.minimumHours}h)</span>
                  <span className="font-medium">
                    {estimate.billedIncrements} x {estimate.config.billingIncrementMinutes} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Truck Time Charge</span>
                  <span className="font-medium">${estimate.hourlyCharge.toFixed(0)}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Dump Fee</span>
                  <span className="font-medium">${estimate.estimatedDumpFee.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environmental Handling (30%)</span>
                  <span className="font-medium">${estimate.dumpFeeMarkup.toFixed(0)}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold">Estimated Total</span>
                  <Badge variant="outline" className="text-sm font-bold">
                    ${estimate.estimatedTotal.toFixed(0)}
                  </Badge>
                </div>
              </div>

              {/* Auto-billing note */}
              <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 border">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Final price reconciled from driver clock and actual scale ticket.
                  Adjustments over ${DUMP_RETURN_DEFAULTS.autoBillAdjustmentMax} require approval.
                </p>
              </div>
            </div>
          )}

          {/* Customer-facing language */}
          <div className="p-3 rounded-lg border border-dashed bg-background text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Customer Disclosure</p>
            <p>
              Pricing is based on total truck time at ${DUMP_RETURN_DEFAULTS.hourlyRate}/hr
              ({DUMP_RETURN_DEFAULTS.minimumHours}-hour minimum) plus actual disposal fees from the
              scale ticket. A {(DUMP_RETURN_DEFAULTS.dumpFeeMarkupPct * 100).toFixed(0)}% environmental
              handling fee applies to disposal costs. Final dump fee is based on actual scale ticket.
            </p>
          </div>

          {estimatedDriveMinutes >= 120 && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Extended drive time ({estimatedDriveMinutes} min). This service may exceed typical
                scheduling windows. Consider confirming with dispatch.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
