import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  MapPin, Car, Building2, TreePine, ArrowRight, Lock,
  AlertTriangle, CheckCircle, Save, Loader2,
} from 'lucide-react';

export interface PlacementData {
  placement_type: string;
  placement_notes: string;
  gate_code: string;
  permit_needed: boolean;
  access_notes: string;
  address: string;
}

interface DumpsterPlacementSelectorProps {
  address?: string;
  selectedSize?: number;
  value?: Partial<PlacementData>;
  onChange: (data: PlacementData) => void;
  onSave?: (data: PlacementData) => Promise<void>;
  compact?: boolean;
}

const PLACEMENT_TYPES = [
  { id: 'driveway', label: 'Driveway', icon: Car, desc: 'Standard placement on concrete or asphalt driveway' },
  { id: 'street', label: 'Street', icon: MapPin, desc: 'Curbside or street placement (may require permit)' },
  { id: 'construction_site', label: 'Construction Site', icon: Building2, desc: 'Open lot or active job site' },
  { id: 'side_yard', label: 'Side Yard', icon: TreePine, desc: 'Side of property with adequate clearance' },
  { id: 'rear_access', label: 'Rear Access', icon: ArrowRight, desc: 'Behind property via alley or rear driveway' },
];

const SIZE_FOOTPRINTS: Record<number, { length: string; width: string }> = {
  5: { length: "12'", width: "5'" },
  8: { length: "12'", width: "6'" },
  10: { length: "14'", width: "7.5'" },
  20: { length: "22'", width: "7.5'" },
  30: { length: "22'", width: "7.5'" },
  40: { length: "22'", width: "8'" },
  50: { length: "22'", width: "8'" },
};

export function DumpsterPlacementSelector({
  address,
  selectedSize,
  value,
  onChange,
  onSave,
  compact,
}: DumpsterPlacementSelectorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [placementType, setPlacementType] = useState(value?.placement_type || '');
  const [placementNotes, setPlacementNotes] = useState(value?.placement_notes || '');
  const [gateCode, setGateCode] = useState(value?.gate_code || '');
  const [permitNeeded, setPermitNeeded] = useState(value?.permit_needed || false);
  const [accessNotes, setAccessNotes] = useState(value?.access_notes || '');

  const footprint = selectedSize ? SIZE_FOOTPRINTS[selectedSize] : null;

  const buildData = (): PlacementData => ({
    placement_type: placementType,
    placement_notes: placementNotes,
    gate_code: gateCode,
    permit_needed: permitNeeded,
    access_notes: accessNotes,
    address: address || '',
  });

  const handleTypeSelect = (typeId: string) => {
    setPlacementType(typeId);
    const needsPermit = typeId === 'street';
    setPermitNeeded(needsPermit);
    onChange({ ...buildData(), placement_type: typeId, permit_needed: needsPermit });
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(buildData());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className={compact ? 'pb-3' : undefined}>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Dumpster Placement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address display */}
        {address && (
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
            {address}
          </div>
        )}

        {/* Size footprint */}
        {footprint && selectedSize && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <div className="text-xs text-muted-foreground mb-1">Container Footprint ({selectedSize} yd)</div>
            <div className="text-sm font-semibold text-foreground">
              {footprint.length} × {footprint.width}
            </div>
            {/* Visual footprint */}
            <div className="mt-2 relative">
              <div
                className="bg-primary/20 border-2 border-dashed border-primary/40 rounded flex items-center justify-center"
                style={{
                  width: `${Math.min(100, (parseInt(footprint.length) / 22) * 100)}%`,
                  height: `${Math.max(24, (parseInt(footprint.width) / 8) * 40)}px`,
                }}
              >
                <span className="text-[10px] font-mono text-primary">
                  {footprint.length} × {footprint.width}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Placement type selector */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Where should we place it?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PLACEMENT_TYPES.map(type => {
              const Icon = type.icon;
              const isSelected = placementType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all',
                    isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/30'
                  )}
                >
                  <Icon className={cn('w-4 h-4 mb-1.5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="text-xs font-semibold text-foreground">{type.label}</div>
                  {!compact && <div className="text-[10px] text-muted-foreground mt-0.5">{type.desc}</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Street permit warning */}
        {placementType === 'street' && (
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">Street placement may require a permit.</strong> Our team will confirm local requirements for your area.
            </div>
          </div>
        )}

        {/* Permit toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPermitNeeded(!permitNeeded);
              onChange({ ...buildData(), permit_needed: !permitNeeded });
            }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
              permitNeeded ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Permit needed
          </button>
        </div>

        {/* Gate code */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Gate Code</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={gateCode}
                onChange={e => {
                  setGateCode(e.target.value);
                  onChange({ ...buildData(), gate_code: e.target.value });
                }}
                placeholder="Optional"
                className="pl-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Placement notes */}
        <div>
          <Label className="text-xs">Placement Instructions</Label>
          <Textarea
            value={placementNotes}
            onChange={e => {
              setPlacementNotes(e.target.value);
              onChange({ ...buildData(), placement_notes: e.target.value });
            }}
            placeholder="E.g., Place on left side of driveway, leave 3ft clearance from garage..."
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Access notes */}
        <div>
          <Label className="text-xs">Access Notes</Label>
          <Textarea
            value={accessNotes}
            onChange={e => {
              setAccessNotes(e.target.value);
              onChange({ ...buildData(), access_notes: e.target.value });
            }}
            placeholder="Narrow street, low-hanging wires, hillside, construction equipment on site..."
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Save button */}
        {onSave && (
          <Button onClick={handleSave} disabled={isSaving || !placementType} className="w-full">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Placement
          </Button>
        )}

        {/* Summary badge */}
        {placementType && (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              {PLACEMENT_TYPES.find(t => t.id === placementType)?.label}
            </Badge>
            {permitNeeded && <Badge variant="outline" className="text-xs">Permit Required</Badge>}
            {gateCode && <Badge variant="outline" className="text-xs">Gate Code Set</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
