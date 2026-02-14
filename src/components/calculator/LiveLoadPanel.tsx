// Live Load (Time-Based Billing) Panel for Master Calculator

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertTriangle } from 'lucide-react';

// ── Constants ──────────────────────────────────────────
const LIVE_LOAD_CONFIG = {
  graceMinutes: 30,
  hourlyRate: 180,
  incrementMinutes: 15,
} as const;

const DURATION_OPTIONS = [
  { value: '30', label: '30 min (included)', extra: 0 },
  { value: '45', label: '45 min', extra: 15 },
  { value: '60', label: '60 min', extra: 30 },
  { value: '90', label: '90 min', extra: 60 },
  { value: '120', label: '120 min', extra: 90 },
];

export interface LiveLoadState {
  enabled: boolean;
  estimatedMinutes: number;
  extraCharge: number;
  billableIncrements: number;
}

interface LiveLoadPanelProps {
  onStateChange: (state: LiveLoadState) => void;
}

function computeLiveLoadCharge(estimatedMinutes: number): { extraCharge: number; billableIncrements: number } {
  const billableMinutes = Math.max(0, estimatedMinutes - LIVE_LOAD_CONFIG.graceMinutes);
  const billableIncrements = Math.ceil(billableMinutes / LIVE_LOAD_CONFIG.incrementMinutes);
  const ratePerIncrement = LIVE_LOAD_CONFIG.hourlyRate / 4; // 15-min increments
  const extraCharge = billableIncrements * ratePerIncrement;
  return { extraCharge, billableIncrements };
}

export function LiveLoadPanel({ onStateChange }: LiveLoadPanelProps) {
  const [enabled, setEnabled] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  const { extraCharge, billableIncrements } = computeLiveLoadCharge(estimatedMinutes);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    const { extraCharge: charge, billableIncrements: increments } = computeLiveLoadCharge(estimatedMinutes);
    onStateChange({
      enabled: checked,
      estimatedMinutes,
      extraCharge: checked ? charge : 0,
      billableIncrements: checked ? increments : 0,
    });
  };

  const handleDurationChange = (value: string) => {
    const mins = parseInt(value, 10);
    setEstimatedMinutes(mins);
    const { extraCharge: charge, billableIncrements: increments } = computeLiveLoadCharge(mins);
    onStateChange({
      enabled,
      estimatedMinutes: mins,
      extraCharge: enabled ? charge : 0,
      billableIncrements: enabled ? increments : 0,
    });
  };

  return (
    <Card className={enabled ? 'border-primary/40 bg-primary/[0.02]' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Live Load (Wait on Site)
          </CardTitle>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4 pt-0">
          {/* Rules disclosure */}
          <div className="p-3 rounded-lg bg-muted/50 border space-y-1.5">
            <p className="text-xs font-medium text-foreground">Live Load Rules</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">--</span>
                Includes {LIVE_LOAD_CONFIG.graceMinutes} minutes on site
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">--</span>
                After {LIVE_LOAD_CONFIG.graceMinutes} min, billed at ${LIVE_LOAD_CONFIG.hourlyRate}/hour
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">--</span>
                Time billed in {LIVE_LOAD_CONFIG.incrementMinutes}-minute increments
              </li>
            </ul>
          </div>

          {/* Duration selector */}
          <div className="space-y-1.5">
            <Label className="text-xs">Estimated Duration</Label>
            <Select value={String(estimatedMinutes)} onValueChange={handleDurationChange}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Pricing breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Included Time</span>
              <span className="font-medium">{LIVE_LOAD_CONFIG.graceMinutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">${LIVE_LOAD_CONFIG.hourlyRate}/hr ({LIVE_LOAD_CONFIG.incrementMinutes}-min increments)</span>
            </div>
            {billableIncrements > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Extra Time</span>
                  <span className="font-medium">
                    {billableIncrements} x {LIVE_LOAD_CONFIG.incrementMinutes} min
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Estimated Extra Charge</span>
                  <Badge variant="outline" className="text-sm font-semibold">
                    +${extraCharge.toFixed(0)}
                  </Badge>
                </div>
              </>
            )}
            {billableIncrements === 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Extra Charge</span>
                <Badge className="bg-primary/10 text-primary border-0 text-sm">
                  Included
                </Badge>
              </div>
            )}
          </div>

          {/* Customer-facing language */}
          <div className="p-3 rounded-lg border border-dashed bg-background text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Customer Disclosure</p>
            <p>
              Live Load includes {LIVE_LOAD_CONFIG.graceMinutes} minutes on site. Additional time is billed
              at ${LIVE_LOAD_CONFIG.hourlyRate}/hr in {LIVE_LOAD_CONFIG.incrementMinutes}-minute increments.
            </p>
          </div>

          {estimatedMinutes >= 90 && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Extended live loads ({estimatedMinutes} min) may impact daily dispatch capacity.
                Consider scheduling during low-demand windows.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export { LIVE_LOAD_CONFIG, computeLiveLoadCharge };
