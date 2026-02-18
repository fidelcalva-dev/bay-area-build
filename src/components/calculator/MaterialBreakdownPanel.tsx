/**
 * Material Breakdown Panel — Phase 6
 * Itemized material weight/cost estimation for the Master Calculator
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, Scale, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getMaterialWeights, calculateMaterialBreakdown } from '@/services/disposalCostEngine';
import type { MaterialBreakdownItem } from '@/types/disposal';

interface MaterialSelection {
  id: string;
  material_name: string;
  cubic_yards: number;
}

interface Props {
  dumpsterSizeYd: number;
  disposalRatePerTon?: number;
  onBreakdownChange?: (items: MaterialBreakdownItem[]) => void;
}

export function MaterialBreakdownPanel({ dumpsterSizeYd, disposalRatePerTon = 115, onBreakdownChange }: Props) {
  const [selections, setSelections] = useState<MaterialSelection[]>([
    { id: '1', material_name: '', cubic_yards: 0 },
  ]);

  const { data: materials = [] } = useQuery({
    queryKey: ['material-weights'],
    queryFn: getMaterialWeights,
  });

  const breakdown = useMemo(() => {
    const valid = selections.filter((s) => s.material_name && s.cubic_yards > 0);
    if (valid.length === 0) return [];
    const items = calculateMaterialBreakdown(materials, valid, disposalRatePerTon);
    onBreakdownChange?.(items);
    return items;
  }, [selections, materials, disposalRatePerTon, onBreakdownChange]);

  const totalTons = breakdown.reduce((sum, b) => sum + b.estimated_tons, 0);
  const totalDisposalCost = breakdown.reduce((sum, b) => sum + b.estimated_disposal_cost, 0);
  const hasHeavy = breakdown.some((b) => b.is_heavy);
  const totalCubicYards = selections.reduce((sum, s) => sum + s.cubic_yards, 0);
  const overCapacity = totalCubicYards > dumpsterSizeYd;

  const addRow = () => {
    setSelections((prev) => [...prev, { id: String(Date.now()), material_name: '', cubic_yards: 0 }]);
  };

  const removeRow = (id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
  };

  const updateRow = (id: string, field: keyof MaterialSelection, value: string | number) => {
    setSelections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4" />
          Material Breakdown Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Material rows */}
        {selections.map((sel) => (
          <div key={sel.id} className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                value={sel.material_name}
                onValueChange={(v) => updateRow(sel.id, 'material_name', v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.material_name}>
                      {m.material_name}
                      {m.heavy_only && ' (Heavy)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input
                type="number"
                min={0}
                max={dumpsterSizeYd}
                value={sel.cubic_yards || ''}
                onChange={(e) => updateRow(sel.id, 'cubic_yards', Number(e.target.value))}
                placeholder="CY"
                className="h-9"
              />
            </div>
            {selections.length > 1 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={() => removeRow(sel.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}

        <Button size="sm" variant="outline" onClick={addRow} className="w-full">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Material
        </Button>

        {/* Results */}
        {breakdown.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{item.material_name}</span>
                    {item.is_heavy && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Heavy</Badge>
                    )}
                    {item.requires_separation && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Separated</Badge>
                    )}
                  </div>
                  <div className="text-right text-muted-foreground">
                    {item.estimated_tons.toFixed(2)}T / ${item.estimated_disposal_cost.toFixed(0)}
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" />
                  Estimated Total Weight
                </span>
                <span>{totalTons.toFixed(2)} tons</span>
              </div>

              <div className="flex justify-between font-medium">
                <span>Estimated Disposal Cost</span>
                <span>${totalDisposalCost.toFixed(0)}</span>
              </div>

              {/* Warnings */}
              {overCapacity && (
                <div className="flex items-center gap-2 p-2 rounded bg-destructive/10 text-destructive text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Total volume ({totalCubicYards} CY) exceeds container capacity ({dumpsterSizeYd} CY)
                </div>
              )}

              {hasHeavy && (
                <div className="flex items-center gap-2 p-2 rounded bg-amber-500/10 text-amber-700 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Heavy materials detected. Container size restricted to 10yd max. Fill-line compliance required.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
